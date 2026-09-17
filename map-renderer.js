/* Viewport-sized atlas renderer. At full resolution, tiles contain the original
   pixels; a phone never has to decode or composite an entire 8K map. */
class TiledMap {
  constructor(surface, definition) {
    this.surface = surface;
    this.definition = definition;
    this.tiles = new Map();
    this.active = false;
    this.loading = 0;
    this.wanted = new Set();
    this.preview = document.createElement('div');
    this.preview.className = 'map-preview';
    this.preview.style.backgroundImage = `url("${definition.tiny}")`;
    this.layer = document.createElement('div');
    this.layer.className = 'map-tiles';
    this.layer.setAttribute('aria-hidden', 'true');
    surface.prepend(this.preview, this.layer);
  }

  prepare() {
    if (this.ready) return this.ready;
    this.ready = new Promise(resolve => {
      const image = new Image();
      let finished = false;
      const finish = loaded => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        if (!loaded) this.ready = null;
        resolve(loaded);
      };
      const timeout = setTimeout(() => finish(false), 12000);
      image.decoding = 'async';
      image.onload = () => {
        this.preview.style.backgroundImage = `url("${this.definition.preview}")`;
        this.previewLoaded = true;
        finish(true);
      };
      image.onerror = () => finish(false);
      image.src = this.definition.preview;
    });
    return this.ready;
  }

  setActive(active) {
    this.active = active;
    if (active) {
      this.prepare();
      if (this.view) this.paint(this.view);
    } else {
      // Release decoded tile surfaces from the hidden map. The HTTP cache keeps
      // their bytes available for a later return.
      for (const tile of this.tiles.values()) tile.image.remove();
      this.tiles.clear();
      this.wanted.clear();
    }
  }

  paint(view) {
    this.view = { ...view };
    const { width, height, levels, tileSize } = this.definition;
    const viewportWidth = this.surface.clientWidth || innerWidth;
    const viewportHeight = this.surface.clientHeight || innerHeight;
    const left = viewportWidth / 2 - view.x * view.zoom;
    const top = viewportHeight / 2 - view.y * view.zoom;
    this.preview.style.backgroundSize = `${width * view.zoom}px ${height * view.zoom}px`;
    this.preview.style.backgroundPosition = `${left}px ${top}px`;
    if (!this.active) return;

    // Request only detail useful at this scale. Full-resolution tiles are used
    // as the user approaches; a wide overview starts with the smaller levels.
    const density = view.zoom * Math.min(devicePixelRatio || 1, 2);
    const level = levels.find(item => item.scale >= density * .95) || levels[levels.length - 1];
    this.level = level;
    const step = tileSize / level.scale;
    const minX = Math.max(0, Math.floor(-left / (step * view.zoom)));
    const maxX = Math.min(level.cols - 1, Math.floor((viewportWidth - left) / (step * view.zoom)));
    const minY = Math.max(0, Math.floor(-top / (step * view.zoom)));
    const maxY = Math.min(level.rows - 1, Math.floor((viewportHeight - top) / (step * view.zoom)));
    this.wanted = new Set();
    this.queue = [];
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
      const key = `${level.width}/${x}-${y}`;
      this.wanted.add(key);
      if (!this.tiles.has(key)) this.queue.push({ key, x, y, level,
        distance: Math.abs(x - (minX + maxX) / 2) + Math.abs(y - (minY + maxY) / 2) });
    }
    this.queue.sort((a, b) => a.distance - b.distance);
    for (const [key, tile] of this.tiles) {
      const scale = view.zoom / tile.level.scale;
      const x = left + tile.x * tileSize * scale;
      const y = top + tile.y * tileSize * scale;
      const w = tile.width * scale, h = tile.height * scale;
      const visible = x < viewportWidth && y < viewportHeight && x + w > 0 && y + h > 0;
      if (!visible || (tile.level !== level && this.hasCoverage())) {
        tile.image.remove(); this.tiles.delete(key); continue;
      }
      tile.image.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      tile.image.style.zIndex = tile.level === level ? '2' : '1';
    }
    this.pump();
  }

  hasCoverage() {
    return this.wanted.size > 0 && [...this.wanted].every(key => this.tiles.get(key)?.loaded);
  }

  pump() {
    if (!this.active || !this.queue) return;
    while (this.loading < 8 && this.queue.length) {
      const item = this.queue.shift();
      if (!this.wanted.has(item.key) || this.tiles.has(item.key)) continue;
      const size = this.definition.tileSize;
      const image = new Image();
      const tile = { ...item, image, loaded: false,
        width: Math.min(size, item.level.width - item.x * size),
        height: Math.min(size, item.level.height - item.y * size) };
      image.className = 'map-tile';
      image.alt = ''; image.draggable = false; image.decoding = 'async';
      image.width = tile.width; image.height = tile.height;
      this.tiles.set(item.key, tile);
      this.layer.append(image);
      this.loading++;
      const settle = loaded => {
        this.loading--;
        tile.loaded = loaded;
        if (loaded) image.classList.add('is-loaded');
        if (this.active) {
          this.positionTile(tile);
          if (this.hasCoverage()) {
            for (const [key, old] of this.tiles) if (old.level !== this.level) {
              old.image.remove(); this.tiles.delete(key);
            }
          }
          this.pump();
        }
      };
      image.onload = () => settle(true);
      image.onerror = () => settle(false);
      image.src = `${item.level.url}${item.x}-${item.y}.webp`;
      this.positionTile(tile);
    }
  }

  positionTile(tile) {
    if (!this.view) return;
    const { x, y, zoom } = this.view;
    const scale = zoom / tile.level.scale;
    const left = (this.surface.clientWidth || innerWidth) / 2 - x * zoom;
    const top = (this.surface.clientHeight || innerHeight) / 2 - y * zoom;
    tile.image.style.transform = `translate(${left + tile.x * 512 * scale}px, ${top + tile.y * 512 * scale}px) scale(${scale})`;
    tile.image.style.zIndex = tile.level === this.level ? '2' : '1';
  }
}
