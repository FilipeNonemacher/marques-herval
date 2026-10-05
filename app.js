const $ = (selector) => document.querySelector(selector);

const cover = $('#cover');
const coverMapStage = $('.cover-map-stage');
const validationPage = $('#validationPage');
const validationMapStage = $('.validation-map-stage');
const validationContinue = $('#validationContinue');
const costPage = $('#costPage');
const costMapStage = $('.cost-map-stage');
const costContinue = $('#costContinue');
const mapScene = $('#mapScene');
const modernScene = $('#modernScene');
const mapTransition = $('#mapTransition');
const transitionSeconds = $('#transitionSeconds');
const MAP_TRANSITION_DURATION = 5000;
const MAP_REVEAL_DURATION = 1300;
const modernMapButton = $('#modernMapButton');
const historicMapButton = $('#historicMapButton');
const modernZoomValue = $('#modernZoomValue');
const modernStageKicker = $('#modernStageKicker');
const modernStageTitle = $('#modernStageTitle');
const modernTitleCard = $('.modern-title-card');
const modernDots = $('#modernDots');
const modernPortoMarker = $('#modernPortoMarker');
const modernCerroMarker = $('#modernCerroMarker');
const modernLucenaMarker = $('#modernLucenaMarker');
const modernVeraCruzMarker = $('#modernVeraCruzMarker');
const modernPortoMauaMarker = $('#modernPortoMauaMarker');
const modernComandai = $('#modernComandai');
const modernAmandau = $('#modernAmandau');
const modernSantoCristo = $('#modernSantoCristo');
const modernComandaiPath = $('#modernComandaiPath');
const modernAmandauPath = $('#modernAmandauPath');
const modernSantoCristoPath = $('#modernSantoCristoPath');
const modernCamera = $('#modernCamera');
const modernWorld = $('#modernWorld');
const modernOverlay = $('.modern-map-canvas');
const mapWorld = $('.map-world');
const historicRasterWorld = $('#historicRasterWorld');
const historicOverlay = $('.routes');
const begin = $('#begin');
const dots = $('#dots');
const historicalInfo = $('#historicalInfo');
const historyMenuToggle = $('#historyMenuToggle');
const historyMenuPanel = $('#historyMenuPanel');
const historyCollapse = $('#historyCollapse');
const historyDetail = $('#historyDetail');
const historyDetailTitle = $('#historyDetailTitle');
const historyDetailText = $('#historyDetailText');
const historyDetailCopy = $('.history-detail-copy');
const historyBack = $('#historyBack');
const historyTopicButtons = [...document.querySelectorAll('[data-history-topic]')];
const routeElements = [$('#route1'), $('#route2'), $('#route3'), $('#route4')];
const arrivalMarkers = [$('#arrivalMarker1'), $('#arrivalMarker2'), $('#arrivalMarker3'), $('#arrivalMarker4')];
const firstAttemptMarkers = [$('#firstComandahyMarker'), $('#firstPindahyMarker')];
const secondAttemptMarkers = [$('#secondComandahyMarker'), $('#secondPindahyMarker'), $('#secondUruguayMarker')];
const thirdAttemptMarkers = [$('#vaccasMarker')];
const fourthAttemptMarkers = [$('#fourthComandahyMarker'), $('#fourthPindahyMarker'), $('#fourthCebolatyMarker')];
const secondDiscoveries = $('#secondDiscoveries');
const vaccasFields = $('#vaccasFields');
const valuableHervais = $('#valuableHervais');
const expeditionUnit = $('#expeditionUnit');
const unitFacing = $('#unitFacing');
const camera = $('#camera');
const zoomValue = $('#zoomValue');
const MAP_WIDTH = 8284;
const MAP_HEIGHT = 7941;
const MAX_ZOOM = 2.35;
const MODERN_MAP_WIDTH = 8000;
const MODERN_MAP_HEIGHT = 8000;
const MODERN_MAX_ZOOM = 2.35;
// Small independent tiles allow the same detailed zoom on phones and desktop.
const MOBILE_MAX_ZOOM = 2.35;
const MODERN_AWAITING_MARKINGS = modernScene.classList.contains('is-awaiting-markings');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobileMapMode = matchMedia('(max-width: 1100px), (pointer: coarse)');
const compactMapLayout = matchMedia('(max-width: 760px), (max-width: 1100px) and (max-height: 500px)');
const stages = [
  { kicker: 'Cartografia histórica', title: 'A região da expedição', bounds: [2382, 500, 4237, 1650] },
  { kicker: 'Ponto de partida', title: 'Cerro do Inhacurutum', bounds: [2720, 1090, 3335, 1550], start: true, cerro: true },
  { kicker: 'Primeira tentativa', attempt: 'Primeira tentativa', title: 'Travessia do Rio Comandahy, chegada ao Rio Pindahy e retorno ao Cerro do Inhacurutum', duration: '7 DIAS', bounds: [2760, 980, 3370, 1515], route: 0 },
  { kicker: 'Segunda tentativa', attempt: 'Segunda tentativa', title: 'Rios Comandahy e Pindahy, margem do Rio Uruguay e retorno ao Cerro', duration: '19 DIAS', bounds: [2590, 900, 3300, 1470], route: 1, discoveries: true },
  { kicker: 'Terceira tentativa', attempt: 'Terceira tentativa', title: 'Travessia do Comandahy, Campos das Vaccas Brancas e retorno ao Cerro', bounds: [2760, 840, 3380, 1515], route: 2, vaccas: true },
  { kicker: 'Quarta tentativa', attempt: 'Quarta tentativa', title: 'Rios Comandahy, Pindahy e Cebolaty, Grandes e Valiosos Hervais e retorno ao Cerro', bounds: [2880, 580, 4050, 1450], route: 3, routeDuration: 15000, hervais: true },
  { kicker: 'Local de referência', title: 'Atual Município de Porto Xavier - RS', bounds: [2460, 975, 2990, 1415], porto: true }
];
const modernStages = [
  { kicker: 'Mapa atual', title: 'Região da expedição', focus: [460, 430], overview: true },
  { kicker: 'Localidade atual', title: 'Município de Porto Xavier - RS', focus: [142, 480], zoom: 1 },
  { kicker: 'Ponto de partida da Expedição', title: 'Cerro do Inhacurutum', focus: [259, 623], zoom: 1 },
  { kicker: 'Curso d’água', title: 'Rio Comandaí', focus: [490, 500], zoom: 1, river: 'comandai' },
  { kicker: 'Localidade atual', title: 'Município de Porto Lucena - RS', focus: [215, 399], zoom: 1 },
  { kicker: 'Correspondência histórica', title: 'Rio Amandaú — Antigo Rio Pindaí', focus: [700, 410], zoom: 1, river: 'amandau' },
  { kicker: 'Localidade atual', title: 'Município de Porto Vera Cruz - RS', focus: [365, 268], zoom: 1 },
  { kicker: 'Localidade atual', title: 'Município de Porto Mauá - RS', focus: [754, 93], zoom: 1 },
  { kicker: 'Correspondência histórica', title: 'Rio Santo Cristo (Antigo Rio Cebolaty)', focus: [741, 151], zoom: 1, river: 'santo-cristo' }
];
// Reference pixels are registered to the unchanged 8000px source, not to the viewport.
function modernReferencePoint(x, y) { return [(x + 2721.2) / 1.152, (y + 1112.8) / 1.152]; }

const modernStageAnnotations = [null, modernPortoMarker, modernCerroMarker, modernComandai,
  modernLucenaMarker, modernAmandau, modernVeraCruzMarker, modernPortoMauaMarker, modernSantoCristo];

// Measure labels as well as routes in source-map coordinates, independent of camera zoom.
function annotationBounds(elements, svg) {
  const points = [];
  for (const element of elements) {
    const box = element.getBBox();
    let matrix = new DOMMatrix();
    for (let node = element; node && node !== svg; node = node.parentElement) {
      const transforms = node.transform?.baseVal;
      if (!transforms) continue;
      let local = new DOMMatrix();
      for (let i = 0; i < transforms.numberOfItems; i++) local = local.multiply(transforms.getItem(i).matrix);
      matrix = local.multiply(matrix);
    }
    for (const x of [box.x, box.x + box.width]) {
      for (const y of [box.y, box.y + box.height]) points.push(new DOMPoint(x, y).matrixTransform(matrix));
    }
  }
  return [Math.min(...points.map(p => p.x)), Math.min(...points.map(p => p.y)),
    Math.max(...points.map(p => p.x)), Math.max(...points.map(p => p.y))];
}

function compactMapFrame(scene, bounds, maximumZoom) {
  const controls = scene.querySelector('.map-controls').getBoundingClientRect();
  const caption = scene.querySelector('.title-card, .modern-title-card');
  const left = caption.getBoundingClientRect().left;
  const right = scene.querySelector('.timeline').getBoundingClientRect().left - 16;
  const top = controls.bottom + 18;
  let bottom = innerHeight - Math.max(110, caption.offsetHeight + 48);
  const next = scene.querySelector('.map-switch-next.is-visible');
  if (next && innerHeight > innerWidth) bottom = Math.min(bottom, next.getBoundingClientRect().top - 18);
  const width = Math.max(120, right - left);
  const height = Math.max(90, bottom - top);
  const [x1, y1, x2, y2] = bounds;
  const zoom = Math.min(width / (x2 - x1 + 28), height / (y2 - y1 + 28), maximumZoom);
  // Shift the camera so the content is centered in the unobstructed part of the screen.
  return [(x1 + x2) / 2 + (innerWidth / 2 - (left + right) / 2) / zoom,
    (y1 + y2) / 2 + (innerHeight / 2 - (top + bottom) / 2) / zoom, zoom];
}

function frameModernStage(stage) {
  if (compactMapLayout.matches) {
    const annotation = modernStageAnnotations[modernStages.indexOf(stage)];
    const bounds = annotation ? annotationBounds([annotation], modernOverlay)
      : [...modernReferencePoint(-40, 20), ...modernReferencePoint(1020, 780)];
    positionModernCamera(...compactMapFrame(modernScene, bounds, stage.overview ? .7 : 1.152), true);
    return;
  }
  const compact = innerWidth < 760;
  const focus = stage.focus;
  const availableScale = Math.min((innerWidth - 100) / 920, (innerHeight - 210) / 530);
  const scale = stage.overview
    ? Math.max(compact ? .36 : .58, Math.min(.74, availableScale))
    : Math.min(stage.zoom, compact ? .78 : 1);
  const [x, y] = modernReferencePoint(...focus);
  positionModernCamera(x, y, scale * 1.152, true);
}
const historicalTopics = {
  primeira: {
    title: 'Primeira Tentativa',
    paragraphs: [
      'A primeira turma, ou expedição, foi composta pelo cacique Antônio Prudente, pelo vaqueano Laureano de Vargas e mais dez soldados da guarda nacional de São Borja. Ela deixou o acampamento no dia 9 de setembro de 1857 e rumou para o norte por cinco léguas até atingirem as margens do rio Comandaí, atravessando-o em uma jangada.',
      'Dali seguiram na direção Nordeste por mais seis ou sete léguas distante daquele rio, declinando para o Leste por mais três léguas, abrindo seu caminho sempre por "espesso sertão", como informa a documentação (CÓPIA, 1864). Dali, após avistarem e reconhecerem de perto o rio de Santo Cristo, já bem conhecido pelo cacique de Nonoai, voltaram para o acampamento seguindo em direção ao Sul, chegando na base do Nhacurutú ao meio-dia de 16 de setembro.',
      'O relato feito pelos membros dessa expedição afirma que estes não encontraram nenhum rasto de índio, campo ou mesmo "um só pau de erva-mate", mesmo depois de terem subido no alto dos picos para fazerem suas observações.'
    ]
  },
  segunda: {
    title: 'Segunda Tentativa',
    paragraphs: [
      'A segunda expedição foi iniciada no dia 28 do mesmo mês de setembro, guiada por Antônio Prudente, o cacique de Nonoai e pelo vaqueano Jesuíno da Silva Nunes, responsáveis pelo relato da expedição ao comandante Araújo Nóbrega. Partiram com uma força de dois cabos e cinco soldados da guarda nacional de São Borja, além de quatro indígenas ao aldeamento de Nonoai.',
      'Deixaram o acampamento em direção ao Norte, rumo ao rio Comandaí, atravessando-o com dificuldade, pois estava crescido em volume. Seguiram a marcha na mesma direção norte por diversos dias até chegarem novamente às margens do rio Santo Cristo, ou Pindaí, quando declinaram para oeste, atingindo as margens do rio Uruguai.',
      'Depois disso se separaram em duas seções, uma formada pelo cacique de Nonoai e seus homens, outro pelo soldado Manoel José Guerreiro e os demais membros da expedição. Ambas as seções voltaram em direção sul, margeando o Uruguai, rumo ao acampamento, aonde chegaram nos dias 13 e 15 de outubro, respectivamente.',
      'Tal como na expedição anterior Jesuíno Nunes e Antônio Prudente declararam não haver encontrado campo ou faxinal algum, tampouco a presença de indígenas na região. Nunes afirmou ter encontrado dois laranjas em frente ao antigo povoado de São Xavier e, ainda, um erval a duas léguas aquém da foz do Comandaí, do qual saía uma picada de cargueiros, intransitável, que terminava no porto em frente a São Xavier.',
      'Segundo moradores da região, seria possível retirar de 400 a 500 arrobas de mate daquele erval. A oeste deste, na direção do porto de São Xavier, encontra-se um faxinal de meia légua de comprido por um quarto de largura, com uma boa parte de campo limpo.'
    ]
  },
  terceira: {
    title: 'Terceira Tentativa',
    paragraphs: [
      'A terceira expedição foi feita entre os dias 3 e 18 de novembro de 1857, tendo como principais guias Laureano de Vargas e Jesuíno da Silva Nunes. Ambos declararam que logo após terem atravessado o Comandaí, pouco mais de uma légua e meia adiante deste rio, reconheceram o lugar em que o mesmo vaqueano Laureano de Vargas havia avistado ao longe o campo que considerou ser o das Vacas Brancas na expedição que havia realizado em março daquele mesmo ano.',
      'Também deram conta de um faxinal de mais de uma légua de extensão e um quarto de légua de largura na forqueta do rio Pindaí. Segundo os declarantes, tanto o campo como o faxinal estavam repletos de taquarais que tornavam o dito sertão "impenetrável", de modo que, sem queimá-los, seria impossível transitar por eles.',
      'Apontaram, ainda, não terem encontrado vestígios de populações indígenas transitando pela região, apenas traços de presença muito antigo, razão pela qual presumiram não haver mais grupos indígenas vivendo naquela área.'
    ]
  },
  quarta: {
    title: 'Quarta Tentativa',
    paragraphs: [
      'A quarta expedição, por fim, teve início no dia 30 de outubro de 1857, tendo como principal guia Antônio Prudente, o cacique de Nonoai, que partiu do acampamento com seis homens armados. Seguiram em direção nordeste, rumo ao rio Comandái, distante cinco léguas do acampamento. Atravessaram o rio em uma jangada e dali seguiram em direção ao Norte por mais três léguas.',
      'Deste ponto tomaram o rumo noroeste e seguiram por cinco léguas até se depararem com um braço do rio Cebolati, onde declinaram em direção nordeste, marchando cerca de uma légua nessa direção. Dali tomaram o rumo de leste, seguindo por mais seis léguas antes de se virarem para o norte e marcharem por outra légua e meia até atingirem as margens do Cebolati. Atravessaram este rio sem maiores problemas, pois dava vau naquele momento, e avançaram duas léguas na mesma direção norte.',
      'Neste ponto declinaram novamente para o oeste, direção na qual avançaram mais cinco léguas até se voltarem para o sul, já buscando retornar ao acampamento. Chegaram à base do Nharauí no dia 18 de novembro, após terem ficado vinte dias no sertão.',
      'Na cópia do auto desta quarta expedição, o cacique de Nonoai declarou ter encontrado alguns faxinais e campestres, mas que entre os rios Pindaí e Cebolati, finalmente, achou um grande erval, até então desconhecido, distante cerca de duas léguas do rio Uruguai. Segundo consta em seu relato, o cacique logrou observá-lo na extensão de uma légua de circunferência, o que lhe deu condição de atestar a quantidade e, principalmente, a grande qualidade das ervas, todas dispostas em um terreno seco e plano.'
    ]
  }
};

let active = -1;
let validationActive = false;
let costActive = false;
let inputLockedUntil = 0;
let unitAnimation = 0;
let routeAnimationTimer = 0;
let unitExitTimer = 0;
let thirdRevealTimer = 0;
let manualTransitionTimer = 0;
let modernManualTransitionTimer = 0;
let currentFacing = 1;
let modernActive = false;
let mapTransitionActive = false;
let mapTransitionTimers = [];
let modernIndex = 0;
let view = { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, zoom: .2 };
let pan = null;
let modernView = { x: MODERN_MAP_WIDTH / 2, y: MODERN_MAP_HEIGHT / 2, zoom: 1 };
let modernPan = null;
let selectedHistoryButton = null;
let focusTimer = 0;
let transitionArtworkWarmed = false;
let modernMapLoaded = false;
const historicalRaster = new TiledMap(historicRasterWorld, MAP_ASSETS.historical);
const currentRaster = new TiledMap(modernWorld, MAP_ASSETS.modern);
let historicCameraTween = null;
let modernCameraTween = null;
let previousViewport = { width: innerWidth, height: innerHeight };
let cameraPaintFrame = 0;
let historicCameraDirty = false;
let modernCameraDirty = false;
const routeLengths = new WeakMap();
const modernRiverAnimations = new WeakMap();
const modernRiverTimers = new WeakMap();

// Geometry stays exact; DOM writes are shared by every input arriving in one frame.
function scheduleCameraPaint() {
  if (!cameraPaintFrame) cameraPaintFrame = requestAnimationFrame(paintCameras);
}

function mobileViewBox(current, width, height) {
  const visibleWidth = innerWidth / current.zoom;
  const visibleHeight = innerHeight / current.zoom;
  return {
    left: Math.max(0, Math.min(width - visibleWidth, current.x - visibleWidth / 2)),
    top: Math.max(0, Math.min(height - visibleHeight, current.y - visibleHeight / 2)),
    width: visibleWidth,
    height: visibleHeight
  };
}

function paintCameras(now = performance.now()) {
  cameraPaintFrame = 0;
  const interpolate = tween => {
    const progress = Math.min(1, (now - tween.started) / tween.duration);
    const ease = progress * progress * (3 - 2 * progress);
    const current = {};
    for (const key of ['x', 'y', 'zoom']) current[key] = tween.from[key] + (tween.to[key] - tween.from[key]) * ease;
    return { current, finished: progress === 1 };
  };
  if (historicCameraTween) {
    const result = interpolate(historicCameraTween);
    view = clampView(result.current.x, result.current.y, result.current.zoom);
    historicCameraDirty = true;
    if (result.finished) historicCameraTween = null;
  }
  if (modernCameraTween) {
    const result = interpolate(modernCameraTween);
    modernView = clampModernView(result.current.x, result.current.y, result.current.zoom);
    modernCameraDirty = true;
    if (result.finished) modernCameraTween = null;
  }
  if (historicCameraDirty) {
    historicCameraDirty = false;
    historicalRaster.paint(view);
    const box = mobileViewBox(view, MAP_WIDTH, MAP_HEIGHT);
    historicOverlay.setAttribute('viewBox', `${box.left} ${box.top} ${box.width} ${box.height}`);
    const label = `${Math.round(view.zoom * 100)}%`;
    if (zoomValue.textContent !== label) zoomValue.textContent = label;
  }
  if (modernCameraDirty) {
    modernCameraDirty = false;
    currentRaster.paint(modernView);
    const box = mobileViewBox(modernView, MODERN_MAP_WIDTH, MODERN_MAP_HEIGHT);
    modernOverlay.setAttribute('viewBox', `${box.left} ${box.top} ${box.width} ${box.height}`);
    const label = `${Math.round(modernView.zoom * 100)}%`;
    if (modernZoomValue.textContent !== label) modernZoomValue.textContent = label;
  }
  if (historicCameraTween || modernCameraTween) scheduleCameraPaint();
}

function routeLength(path) {
  if (!routeLengths.has(path)) routeLengths.set(path, path.getTotalLength());
  return routeLengths.get(path);
}

function isCompactCostLayout() {
  return innerWidth <= 980 || innerHeight <= 700;
}

function warmTransitionArtwork() {
  if (transitionArtworkWarmed || typeof Image === 'undefined') return;
  transitionArtworkWarmed = true;
  // Only the lightweight transition artwork is prepared here. Decoding the
  // current high-detail map beside the historical map exhausted mobile GPU memory.
  const image = new Image();
  image.decoding = 'async';
  image.src = 'public/assets/map-cover.webp';
  $('.transition-atlas').src = image.src;
  if (image.decode) image.decode().catch(() => {});
}

function ensureModernMapLoaded() {
  return currentRaster.prepare().then(ready => { modernMapLoaded = ready; return ready; });
}

function prepareHistoricalMap() {
  historicalRaster.prepare();
  document.querySelectorAll('[data-map-src]').forEach(image => {
    image.setAttribute('href', image.dataset.mapSrc);
    image.removeAttribute('data-map-src');
  });
}

// Page transitions focus the reading surface, never select the next action.
function focusAfterTransition(target, isStillVisible, delay = 0) {
  clearTimeout(focusTimer);
  focusTimer = setTimeout(() => {
    if (isStillVisible()) target.focus({ preventScroll: true });
  }, reducedMotion.matches ? 0 : delay);
}

function stopExpeditionAnimation() {
  cancelAnimationFrame(unitAnimation);
  clearTimeout(routeAnimationTimer);
  clearTimeout(unitExitTimer);
  clearTimeout(thirdRevealTimer);
  expeditionUnit.classList.remove('is-moving');
  (unitFacing.getAnimations?.() || []).forEach((animation) => animation.cancel());
}

// A short acceleration, a steady march and a short deceleration.
function routeProgress(progress) {
  const ramp = .1;
  if (progress < ramp) return progress * progress / (2 * ramp * (1 - ramp));
  if (progress > 1 - ramp) return 1 - (1 - progress) ** 2 / (2 * ramp * (1 - ramp));
  return (progress - ramp / 2) / (1 - ramp);
}

stages.forEach(() => {
  const dot = document.createElement('i');
  dot.setAttribute('aria-hidden', 'true');
  dots.appendChild(dot);
});

(MODERN_AWAITING_MARKINGS ? [] : modernStages).forEach(() => {
  const dot = document.createElement('i');
  dot.setAttribute('aria-hidden', 'true');
  modernDots.appendChild(dot);
});

function setModernRiver(group, path, visible, animate) {
  const previousAnimation = modernRiverAnimations.get(path);
  if (previousAnimation) previousAnimation.cancel();
  modernRiverAnimations.delete(path);
  clearTimeout(modernRiverTimers.get(path));
  modernRiverTimers.delete(path);
  group.classList.toggle('is-visible', visible);
  group.classList.toggle('is-drawing', visible && animate && !reducedMotion.matches);
  path.style.opacity = '';
  path.style.strokeDasharray = '';
  path.style.strokeDashoffset = '';
  if (!visible) {
    return;
  }

  if (animate && !reducedMotion.matches) {
    const length = routeLength(path);
    path.style.strokeDasharray = `${length} ${length}`;
    path.style.strokeDashoffset = `${length}`;
    const drawing = path.animate(
      [
        { opacity: 0, strokeDashoffset: `${length}` },
        { opacity: 1, offset: .1 },
        { opacity: 1, strokeDashoffset: '0', offset: .88 },
        { opacity: 0, strokeDashoffset: '0' }
      ],
      { duration: 3000, easing: 'cubic-bezier(.22,.68,.18,1)', fill: 'forwards' }
    );
    modernRiverAnimations.set(path, drawing);
    modernRiverTimers.set(path, setTimeout(() => {
      if (!group.classList.contains('is-visible') || !group.classList.contains('is-drawing')) return;
      drawing.cancel();
      modernRiverAnimations.delete(path);
      modernRiverTimers.delete(path);
      path.style.opacity = '';
      path.style.strokeDasharray = '';
      path.style.strokeDashoffset = '';
      group.classList.remove('is-drawing');
    }, 3650));
  }
}

function renderModern({ animate = true } = {}) {
  if (MODERN_AWAITING_MARKINGS) {
    resetModernGestures();
    modernCamera.classList.remove('is-manual', 'is-dragging');
    modernPan = null;
    fitModernMap();
    modernStageKicker.textContent = 'Mapa atual';
    modernStageTitle.textContent = 'Rio Grande do Sul';
    return;
  }
  const stage = modernStages[modernIndex];
  modernCamera.classList.remove('is-manual');
  modernStageKicker.textContent = stage.kicker;
  modernStageTitle.textContent = stage.title;
  scheduleMobileStageTitleFit(modernStageTitle);
  modernTitleCard.classList.remove('is-changing');
  void modernTitleCard.offsetWidth;
  modernTitleCard.classList.add('is-changing');

  modernPortoMarker.classList.toggle('is-visible', modernIndex >= 1);
  modernCerroMarker.classList.toggle('is-visible', modernIndex >= 2);
  modernLucenaMarker.classList.toggle('is-visible', modernIndex >= 4);
  modernVeraCruzMarker.classList.toggle('is-visible', modernIndex >= 6);
  modernPortoMauaMarker.classList.toggle('is-visible', modernIndex >= 7);
  setModernRiver(modernComandai, modernComandaiPath, modernIndex >= 3, animate && stage.river === 'comandai');
  setModernRiver(modernAmandau, modernAmandauPath, modernIndex >= 5, animate && stage.river === 'amandau');
  setModernRiver(modernSantoCristo, modernSantoCristoPath, modernIndex >= 8, animate && stage.river === 'santo-cristo');
  modernStageAnnotations.forEach((annotation, index) => annotation?.classList.toggle('is-current', index === modernIndex));
  frameModernStage(stage);
  [...modernDots.children].forEach((dot, index) => dot.classList.toggle('active', index === modernIndex));
}

function modernMinimumZoom() {
  return Math.max(innerWidth / MODERN_MAP_WIDTH, innerHeight / MODERN_MAP_HEIGHT) * 1.008;
}

function clampModernView(x, y, zoom) {
  const maximumZoom = mobileMapMode.matches ? MOBILE_MAX_ZOOM : MODERN_MAX_ZOOM;
  const limitedZoom = Math.max(modernMinimumZoom(), Math.min(maximumZoom, zoom));
  const halfWidth = innerWidth / (2 * limitedZoom);
  const halfHeight = innerHeight / (2 * limitedZoom);
  return {
    x: halfWidth >= MODERN_MAP_WIDTH / 2 ? MODERN_MAP_WIDTH / 2 : Math.max(halfWidth, Math.min(MODERN_MAP_WIDTH - halfWidth, x)),
    y: halfHeight >= MODERN_MAP_HEIGHT / 2 ? MODERN_MAP_HEIGHT / 2 : Math.max(halfHeight, Math.min(MODERN_MAP_HEIGHT - halfHeight, y)),
    zoom: limitedZoom
  };
}

function positionModernCamera(x, y, zoom, animate = false) {
  const target = clampModernView(x, y, zoom);
  modernCameraTween = animate && modernActive && !reducedMotion.matches
    ? { from: { ...modernView }, to: target, started: performance.now(), duration: 900 } : null;
  if (!modernCameraTween) modernView = target;
  modernCameraDirty = true;
  scheduleCameraPaint();
}

function fitModernMap() {
  positionModernCamera(MODERN_MAP_WIDTH / 2, MODERN_MAP_HEIGHT / 2, modernMinimumZoom());
}

function useModernManualTransition() {
  clearTimeout(modernManualTransitionTimer);
  modernCamera.classList.add('is-manual');
  modernManualTransitionTimer = setTimeout(() => modernCamera.classList.remove('is-manual'), 480);
}

function zoomModernAt(clientX, clientY, zoom) {
  const mapX = modernView.x + (clientX - innerWidth / 2) / modernView.zoom;
  const mapY = modernView.y + (clientY - innerHeight / 2) / modernView.zoom;
  const maximumZoom = mobileMapMode.matches ? MOBILE_MAX_ZOOM : MODERN_MAX_ZOOM;
  const targetZoom = Math.max(modernMinimumZoom(), Math.min(maximumZoom, zoom));
  const targetX = mapX - (clientX - innerWidth / 2) / targetZoom;
  const targetY = mapY - (clientY - innerHeight / 2) / targetZoom;
  positionModernCamera(targetX, targetY, targetZoom);
}

function zoomHistoricAt(clientX, clientY, zoom) {
  const mapX = view.x + (clientX - innerWidth / 2) / view.zoom;
  const mapY = view.y + (clientY - innerHeight / 2) / view.zoom;
  const maximumZoom = mobileMapMode.matches ? MOBILE_MAX_ZOOM : MAX_ZOOM;
  const targetZoom = Math.max(minimumZoom(), Math.min(maximumZoom, zoom));
  positionCamera(mapX - (clientX - innerWidth / 2) / targetZoom,
    mapY - (clientY - innerHeight / 2) / targetZoom, targetZoom);
}

function minimumZoom() {
  return Math.max(innerWidth / MAP_WIDTH, innerHeight / MAP_HEIGHT);
}

function clampView(x, y, zoom) {
  const maximumZoom = mobileMapMode.matches ? MOBILE_MAX_ZOOM : MAX_ZOOM;
  const limitedZoom = Math.max(minimumZoom(), Math.min(maximumZoom, zoom));
  const halfWidth = innerWidth / (2 * limitedZoom);
  const halfHeight = innerHeight / (2 * limitedZoom);
  return {
    x: halfWidth >= MAP_WIDTH / 2 ? MAP_WIDTH / 2 : Math.max(halfWidth, Math.min(MAP_WIDTH - halfWidth, x)),
    y: halfHeight >= MAP_HEIGHT / 2 ? MAP_HEIGHT / 2 : Math.max(halfHeight, Math.min(MAP_HEIGHT - halfHeight, y)),
    zoom: limitedZoom
  };
}

function positionCamera(x, y, zoom, animate = false) {
  const target = clampView(x, y, zoom);
  historicCameraTween = animate && active >= 0 && !reducedMotion.matches
    ? { from: { ...view }, to: target, started: performance.now(), duration: 1200 } : null;
  if (!historicCameraTween) view = target;
  historicCameraDirty = true;
  scheduleCameraPaint();
}

function useManualTransition() {
  clearTimeout(manualTransitionTimer);
  camera.classList.add('is-manual');
  manualTransitionTimer = setTimeout(() => camera.classList.remove('is-manual'), 620);
}

function positionCoverMap() {
  // Both introductory pages share one small, dedicated regional crop.
  coverMapStage.style.transform = 'none';
  validationMapStage.style.transform = 'none';
  costMapStage.style.transform = 'none';
}

function fitBounds([left, top, right, bottom], maximumZoom = 1.08) {
  if (compactMapLayout.matches && active >= 0) {
    const stage = stages[active];
    let annotations;
    if (stage.porto) annotations = [$('#portoMarker')];
    else if (stage.cerro) annotations = [$('#startMarker'), $('#cerroIllustration')];
    else if (Number.isInteger(stage.route)) {
      const details = [firstAttemptMarkers, [...secondAttemptMarkers, secondDiscoveries],
        [...thirdAttemptMarkers, vaccasFields], [...fourthAttemptMarkers, valuableHervais]];
      annotations = [routeElements[stage.route], ...details[stage.route]];
    }
    const bounds = annotations ? annotationBounds(annotations, historicOverlay) : [left, top, right, bottom];
    positionCamera(...compactMapFrame(mapScene, bounds, maximumZoom), true);
    return;
  }
  const compact = innerWidth < 760;
  const paddingX = compact ? 72 : 190;
  const paddingY = compact ? 110 : 155;
  const availableWidth = Math.max(320, innerWidth - paddingX * 2);
  const availableHeight = Math.max(300, innerHeight - paddingY * 2);
  const width = right - left;
  const height = bottom - top;
  const zoom = Math.min(availableWidth / width, availableHeight / height, maximumZoom);
  positionCamera((left + right) / 2, (top + bottom) / 2, zoom, true);
}

function showEntireMap() {
  const edge = innerWidth < 760 ? 28 : 62;
  const zoom = Math.min((innerWidth - edge * 2) / 8284, (innerHeight - edge * 2) / 7941);
  positionCamera(4142, 3970, zoom);
}

function placeExpeditionUnit(path, distance) {
  const length = routeLength(path);
  const at = Math.max(0, Math.min(length, distance));
  const point = path.getPointAtLength(at);
  const progress = length ? at / length : 0;
  const previousFacing = currentFacing;
  if (path.id === 'route1') {
    currentFacing = progress < .56 ? 1 : -1;
  } else if (path.id === 'route2') {
    currentFacing = progress < .35 ? 1 : progress < .74 ? -1 : 1;
  } else if (path.id === 'route3') {
    currentFacing = progress < .51 ? 1 : -1;
  } else if (path.id === 'route4') {
    currentFacing = progress < .54 ? 1 : -1;
  } else {
    currentFacing = 1;
  }
  expeditionUnit.setAttribute('transform', `translate(${point.x} ${point.y})`);
  if (previousFacing !== currentFacing) {
    (unitFacing.getAnimations?.() || []).forEach((animation) => animation.cancel());
    const nextFacing = currentFacing;
    const fadeOut = unitFacing.animate([
      { opacity: 1 },
      { opacity: .42 }
    ], {
      duration: 130,
      easing: 'cubic-bezier(.4, 0, 1, 1)',
      fill: 'forwards'
    });
    fadeOut.onfinish = () => {
      if (currentFacing !== nextFacing) return;
      unitFacing.setAttribute('transform', `scale(${nextFacing} 1)`);
      fadeOut.cancel();
      unitFacing.animate([
        { opacity: .42 },
        { opacity: 1 }
      ], {
        duration: 210,
        easing: 'cubic-bezier(0, 0, .2, 1)'
      });
    };
  }
}

function animateRouteAndUnit(route, duration) {
  cancelAnimationFrame(unitAnimation);
  clearTimeout(unitExitTimer);
  const length = routeLength(route);
  const started = performance.now();
  route.style.strokeDasharray = `${length}`;
  route.style.strokeDashoffset = `${length}`;
  route.classList.add('is-visible');
  expeditionUnit.classList.add('is-visible');
  expeditionUnit.classList.add('is-moving');
  expeditionUnit.classList.remove('is-departing');
  currentFacing = 1;
  (unitFacing.getAnimations?.() || []).forEach((animation) => animation.cancel());
  unitFacing.setAttribute('transform', 'scale(1 1)');
  placeExpeditionUnit(route, 0);

  function frame(now) {
    const progress = Math.min(1, (now - started) / duration);
    const eased = routeProgress(progress);
    // Read the exact SVG geometry before changing its painted stroke.
    placeExpeditionUnit(route, length * eased);
    if (route.id === 'route1') {
      if (eased >= .30) firstAttemptMarkers[0].classList.add('is-visible');
      if (eased >= .58) firstAttemptMarkers[1].classList.add('is-visible');
    } else if (route.id === 'route2') {
      if (eased >= .14) secondAttemptMarkers[0].classList.add('is-visible');
      if (eased >= .35) secondAttemptMarkers[1].classList.add('is-visible');
      if (eased >= .57) secondAttemptMarkers[2].classList.add('is-visible');
      if (eased >= .74) secondDiscoveries.classList.add('is-visible');
    } else if (route.id === 'route4') {
      if (eased >= .08) fourthAttemptMarkers[0].classList.add('is-visible');
      if (eased >= .19) fourthAttemptMarkers[1].classList.add('is-visible');
      if (eased >= .49) valuableHervais.classList.add('is-visible');
      if (eased >= .54) fourthAttemptMarkers[2].classList.add('is-visible');
    }
    route.style.strokeDashoffset = `${length * (1 - eased)}`;
    if (progress < 1) {
      unitAnimation = requestAnimationFrame(frame);
    } else {
      expeditionUnit.classList.remove('is-moving');
      const routeIndex = routeElements.indexOf(route);
      if (routeIndex >= 0) arrivalMarkers[routeIndex].classList.add('is-visible');
      unitExitTimer = setTimeout(() => expeditionUnit.classList.add('is-departing'), 650);
      if (route.id === 'route3') {
        thirdRevealTimer = setTimeout(() => {
          if (stages[active]?.route !== 2) return;
          thirdAttemptMarkers.forEach((marker) => marker.classList.add('is-visible'));
          vaccasFields.classList.add('is-visible');
        }, 420);
      }
    }
  }

  unitAnimation = requestAnimationFrame(frame);
}

// Captions wrap naturally on compact screens; never shrink them to unreadable text.
function fitMobileStageTitle(title) {
  title.style.fontSize = '';
}

function scheduleMobileStageTitleFit(title) {
  requestAnimationFrame(() => fitMobileStageTitle(title));
  document.fonts?.ready?.then(() => fitMobileStageTitle(title));
}

function render({ animateRoute = true } = {}) {
  animateRoute = animateRoute && !reducedMotion.matches;
  const stage = stages[active];
  const titleCard = $('#titleCard');
  const stageTitle = $('#stageTitle');
  const stageDuration = $('#stageDuration');
  camera.classList.remove('is-manual', 'is-dragging');
  $('#stageIndex').textContent = String(active + 1).padStart(2, '0');
  $('#stageKicker').textContent = stage.kicker;
  titleCard.classList.toggle('is-attempt', Boolean(stage.attempt));
  if (stage.attempt) {
    stageTitle.innerHTML = `<span class="attempt-name">${stage.attempt}</span><span class="attempt-detail">${stage.title}</span>`;
  } else {
    stageTitle.textContent = stage.title;
  }
  scheduleMobileStageTitleFit(stageTitle);
  stageDuration.textContent = stage.duration || '';
  stageDuration.classList.toggle('is-visible', Boolean(stage.duration));
  titleCard.classList.add('is-visible');
  titleCard.classList.remove('is-changing');
  void titleCard.offsetWidth;
  titleCard.classList.add('is-changing');
  $('#startMarker').classList.toggle('is-visible', active >= 1 && !stage.porto);
  $('#startMarker').classList.toggle('origin-only', active >= 2);
  $('#portoMarker').classList.toggle('is-visible', Boolean(stage.porto));
  $('#cerroIllustration').classList.toggle('is-visible', Boolean(stage.cerro));
  modernMapButton.classList.toggle('is-visible', active === stages.length - 1);
  fitBounds(stage.bounds);
  vaccasFields.classList.remove('is-visible');
  valuableHervais.classList.remove('is-visible');
  secondDiscoveries.classList.remove('is-visible');
  stopExpeditionAnimation();
  expeditionUnit.classList.remove('is-visible');
  expeditionUnit.classList.remove('is-moving');
  expeditionUnit.classList.remove('is-departing');

  routeElements.forEach((route) => {
    (route.getAnimations?.() || []).forEach((animation) => animation.cancel());
    route.classList.remove('is-visible');
    route.style.strokeDasharray = '';
    route.style.strokeDashoffset = '';
  });
  arrivalMarkers.forEach((marker) => marker.classList.remove('is-visible'));
  firstAttemptMarkers.forEach((marker) => marker.classList.remove('is-visible'));
  secondAttemptMarkers.forEach((marker) => marker.classList.remove('is-visible'));
  thirdAttemptMarkers.forEach((marker) => marker.classList.remove('is-visible'));
  fourthAttemptMarkers.forEach((marker) => marker.classList.remove('is-visible'));

  [...dots.children].forEach((dot, index) => dot.classList.toggle('active', index === active));
  if (stage.unit) {
    placeExpeditionUnit(routeElements[0], 0);
    expeditionUnit.classList.add('is-visible');
  }
  if (animateRoute && Number.isInteger(stage.route)) {
    const route = routeElements[stage.route];
    const length = routeLength(route);
    const duration = stage.routeDuration || Math.max(5200, Math.min(12500, 3400 + length * 2.8));
    routeAnimationTimer = setTimeout(() => animateRouteAndUnit(route, duration), 850);
  } else if (Number.isInteger(stage.route)) {
    const route = routeElements[stage.route];
    const length = routeLength(route);
    route.style.strokeDasharray = '';
    route.style.strokeDashoffset = '0';
    route.classList.add('is-visible');
    placeExpeditionUnit(route, length);
    if (stage.route === 0) expeditionUnit.classList.add('is-visible');
    arrivalMarkers[stage.route].classList.add('is-visible');
    if (stage.route === 0) firstAttemptMarkers.forEach((marker) => marker.classList.add('is-visible'));
    if (stage.route === 1) secondAttemptMarkers.forEach((marker) => marker.classList.add('is-visible'));
    if (stage.route === 2) thirdAttemptMarkers.forEach((marker) => marker.classList.add('is-visible'));
    if (stage.route === 3) fourthAttemptMarkers.forEach((marker) => marker.classList.add('is-visible'));
    if (stage.discoveries) secondDiscoveries.classList.add('is-visible');
    if (stage.vaccas) vaccasFields.classList.add('is-visible');
    if (stage.hervais) valuableHervais.classList.add('is-visible');
  }
}

function showValidationPage() {
  if (active >= 0 || validationActive || performance.now() < inputLockedUntil) return;
  validationActive = true;
  prepareHistoricalMap();
  inputLockedUntil = performance.now() + 900;
  validationPage.classList.remove('is-leaving');
  validationPage.classList.add('is-visible');
  validationPage.setAttribute('aria-hidden', 'false');
  cover.classList.remove('is-visible');
  cover.setAttribute('aria-hidden', 'true');
  focusAfterTransition(validationPage, () => validationActive && active < 0 && !validationPage.classList.contains('is-leaving'), 760);
}

function openHistoryMenu() {
  historicalInfo.classList.add('is-open');
  historyMenuToggle.setAttribute('aria-expanded', 'true');
  historyMenuToggle.setAttribute('aria-label', 'Recolher contextos históricos');
  historyMenuPanel.setAttribute('aria-hidden', 'false');
}

function closeHistoryDetail({ restoreFocus = false } = {}) {
  const buttonToFocus = selectedHistoryButton;
  historicalInfo.classList.remove('is-detail-open');
  historyDetail.classList.remove('is-changing');
  historyDetail.setAttribute('aria-hidden', 'true');
  historyTopicButtons.forEach((button) => button.classList.remove('is-active'));
  selectedHistoryButton = null;
  if (restoreFocus && buttonToFocus) focusAfterTransition(buttonToFocus, () => historicalInfo.classList.contains('is-open') && !historicalInfo.classList.contains('is-detail-open'), 280);
}

function closeHistoryMenu({ restoreFocus = false } = {}) {
  historicalInfo.classList.remove('is-open', 'is-detail-open');
  historyMenuToggle.setAttribute('aria-expanded', 'false');
  historyMenuToggle.setAttribute('aria-label', 'Abrir contextos históricos');
  historyMenuPanel.setAttribute('aria-hidden', 'true');
  historyDetail.setAttribute('aria-hidden', 'true');
  historyDetail.classList.remove('is-changing');
  historyTopicButtons.forEach((button) => button.classList.remove('is-active'));
  selectedHistoryButton = null;
  if (restoreFocus) focusAfterTransition(historyMenuToggle, () => active >= 0 && !modernActive && !costActive, 280);
}

function showHistoryTopic(button) {
  const topic = historicalTopics[button.dataset.historyTopic];
  if (!topic) return;
  selectedHistoryButton = button;
  historyTopicButtons.forEach((item) => item.classList.toggle('is-active', item === button));
  historyDetailTitle.textContent = topic.title;
  historyDetailText.replaceChildren(...topic.paragraphs.map((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  }));
  historyDetailCopy.scrollTop = 0;
  historyDetail.classList.remove('is-changing');
  void historyDetail.offsetWidth;
  historyDetail.classList.add('is-changing');
  historicalInfo.classList.add('is-detail-open');
  historyDetail.setAttribute('aria-hidden', 'false');
  focusAfterTransition(historyDetailCopy, () => selectedHistoryButton === button && historicalInfo.classList.contains('is-detail-open'), 360);
}

function showCover() {
  historicalRaster.setActive(false);
  currentRaster.setActive(false);
  historicCameraTween = modernCameraTween = null;
  stopExpeditionAnimation();
  closeHistoryMenu();
  mapScene.classList.remove('is-cost-open');
  active = -1;
  validationActive = false;
  costActive = false;
  mapScene.classList.remove('is-visible');
  costPage.classList.remove('is-visible', 'is-leaving');
  costPage.setAttribute('aria-hidden', 'true');
  validationPage.classList.remove('is-visible', 'is-leaving');
  validationPage.setAttribute('aria-hidden', 'true');
  cover.classList.add('is-visible');
  cover.setAttribute('aria-hidden', 'false');
  focusAfterTransition(begin, () => active < 0 && !validationActive, 520);
}

function start() {
  if (active >= 0 || !validationActive || performance.now() < inputLockedUntil) return;
  inputLockedUntil = performance.now() + 1450;
  prepareHistoricalMap();
  historicalRaster.setActive(true);
  fitBounds(stages[0].bounds);
  validationPage.classList.add('is-leaving');
  mapScene.classList.add('is-visible');
  setTimeout(() => {
    if (!validationActive || !validationPage.classList.contains('is-leaving')) return;
    validationPage.classList.remove('is-visible', 'is-leaving');
    validationPage.setAttribute('aria-hidden', 'true');
    validationActive = false;
    active = 0;
    render();
    mapScene.focus({ preventScroll: true });
  }, 760);
}

function showCostPage() {
  if (active !== stages.length - 1 || costActive || modernActive || mapTransitionActive) return;
  closeHistoryMenu();
  stopExpeditionAnimation();
  resetHistoricalGestures();
  warmTransitionArtwork();
  ensureModernMapLoaded();
  costActive = true;
  inputLockedUntil = performance.now() + 1150;
  mapScene.classList.add('is-cost-open');
  costPage.classList.remove('is-leaving', 'is-transitioning');
  costPage.scrollTop = 0;
  costPage.classList.add('is-visible');
  costPage.setAttribute('aria-hidden', 'false');
  modernMapButton.setAttribute('aria-expanded', 'true');
  setTimeout(() => {
    if (costActive && !mapTransitionActive) costPage.focus({ preventScroll: true });
  }, 920);
}

function hideCostPage() {
  if (!costActive || mapTransitionActive) return;
  inputLockedUntil = performance.now() + 850;
  costPage.classList.add('is-leaving');
  setTimeout(() => {
    costActive = false;
    costPage.classList.remove('is-visible', 'is-leaving');
    costPage.setAttribute('aria-hidden', 'true');
    mapScene.classList.remove('is-cost-open');
    modernMapButton.setAttribute('aria-expanded', 'false');
    if (compactMapLayout.matches) fitBounds(stages[active].bounds);
    modernMapButton.focus();
  }, 620);
}

function showModernMap() {
  if (active !== stages.length - 1 || !costActive || modernActive || mapTransitionActive) return;
  closeHistoryMenu();
  clearTimeout(focusTimer);
  mapTransitionTimers.forEach(clearTimeout);
  mapTransitionTimers = [];
  mapTransitionActive = true;
  const revealDuration = reducedMotion.matches ? 300 : MAP_REVEAL_DURATION;
  const totalDuration = MAP_TRANSITION_DURATION + revealDuration;
  inputLockedUntil = performance.now() + totalDuration + 150;
  const transitionStarted = performance.now();
  const mapReady = ensureModernMapLoaded();
  costPage.classList.add('is-leaving', 'is-transitioning');
  mapTransition.style.setProperty('--sand-duration', `${MAP_TRANSITION_DURATION - 600}ms`);
  mapTransition.style.setProperty('--reveal-duration', `${revealDuration}ms`);
  mapTransition.classList.remove('is-active', 'is-revealing');
  mapTransition.setAttribute('aria-hidden', 'false');
  mapTransition.setAttribute('aria-busy', 'true');
  mapScene.inert = true;
  costPage.inert = true;
  modernScene.inert = true;
  transitionSeconds.textContent = '5 s';
  mapTransition.classList.add('is-active');
  mapTransition.focus({ preventScroll: true });

  // Once the opaque transition covers the historical map, stop painting it
  // before activating the current map. This keeps mobile memory bounded.
  mapTransitionTimers.push(setTimeout(() => {
    mapScene.classList.add('is-suspended');
    historicalRaster.setActive(false);
    historicCameraTween = null;
  }, reducedMotion.matches ? 80 : 620));

  for (let second = 1; second < 5; second++) {
    mapTransitionTimers.push(setTimeout(() => {
      const remaining = Math.max(0, Math.ceil((MAP_TRANSITION_DURATION - (performance.now() - transitionStarted)) / 1000));
      transitionSeconds.textContent = `${remaining} s`;
    }, second * 1000));
  }

  // Prepare the current map while the hourglass still covers the scene.
  mapTransitionTimers.push(setTimeout(() => {
    costActive = false;
    costPage.classList.remove('is-visible', 'is-leaving', 'is-transitioning');
    costPage.setAttribute('aria-hidden', 'true');
    mapScene.classList.remove('is-cost-open');
    modernIndex = 0;
    renderModern({ animate: false });
    modernActive = true;
    currentRaster.setActive(true);
    modernScene.classList.add('is-visible');
    modernScene.setAttribute('aria-hidden', 'false');
    modernMapButton.setAttribute('aria-expanded', 'false');
  }, MAP_TRANSITION_DURATION - 1400));

  mapTransitionTimers.push(setTimeout(async () => {
    // Finish the full countdown before the breeze starts revealing the map.
    transitionSeconds.textContent = '0 s';
    if (!modernMapLoaded) $('.transition-caption').textContent = 'Preparando o mapa';
    let ready = await mapReady;
    if (!mapTransitionActive) return;
    $('.transition-caption').textContent = 'Da história ao presente';
    $('#modernLoadNotice').hidden = ready;
    if (!ready) ensureModernMapLoaded().then(recovered => {
      if (recovered) {
        $('#modernLoadNotice').hidden = true;
        currentRaster.setActive(true);
      }
    });
    mapTransition.classList.add('is-revealing');
    modernScene.classList.add('is-entering');
    mapTransitionTimers.push(setTimeout(() => {
    transitionSeconds.textContent = '0 s';
    mapTransition.classList.remove('is-active', 'is-revealing');
    mapTransition.setAttribute('aria-hidden', 'true');
    mapTransition.setAttribute('aria-busy', 'false');
    modernScene.classList.remove('is-entering');
    mapScene.classList.add('is-suspended');
    mapTransitionActive = false;
    inputLockedUntil = performance.now();
    mapScene.inert = true;
    costPage.inert = false;
    modernScene.inert = false;
    mapTransitionTimers = [];
    modernScene.focus({ preventScroll: true });
    }, revealDuration));
  }, MAP_TRANSITION_DURATION));
}

function showHistoricMap() {
  if (!modernActive || mapTransitionActive) return;
  mapScene.classList.remove('is-suspended');
  currentRaster.setActive(false);
  modernCameraTween = null;
  historicalRaster.setActive(true);
  mapScene.inert = false;
  modernActive = false;
  costActive = false;
  mapScene.classList.remove('is-cost-open');
  costPage.classList.remove('is-visible', 'is-leaving');
  costPage.setAttribute('aria-hidden', 'true');
  resetModernGestures();
  modernCamera.classList.remove('is-dragging', 'is-manual');
  modernPortoMarker.classList.remove('is-visible');
  modernCerroMarker.classList.remove('is-visible');
  modernLucenaMarker.classList.remove('is-visible');
  modernVeraCruzMarker.classList.remove('is-visible');
  modernPortoMauaMarker.classList.remove('is-visible');
  setModernRiver(modernComandai, modernComandaiPath, false, false);
  setModernRiver(modernAmandau, modernAmandauPath, false, false);
  setModernRiver(modernSantoCristo, modernSantoCristoPath, false, false);
  modernScene.classList.remove('is-visible');
  modernScene.setAttribute('aria-hidden', 'true');
  modernMapButton.setAttribute('aria-expanded', 'false');
  if (compactMapLayout.matches) fitBounds(stages[active].bounds);
  setTimeout(() => modernMapButton.focus(), 520);
}

function move(direction) {
  if (mapTransitionActive) return;
  if (costActive) {
    direction > 0 ? showModernMap() : hideCostPage();
    return;
  }
  if (modernActive) {
    if (MODERN_AWAITING_MARKINGS) return;
    const next = Math.max(0, Math.min(modernStages.length - 1, modernIndex + direction));
    if (next === modernIndex) {
      if (direction < 0 && modernIndex === 0) showHistoricMap();
      return;
    }
    modernIndex = next;
    renderModern({ animate: direction > 0 });
    return;
  }
  if (active < 0) {
    if (direction < 0 && validationActive) {
      showCover();
      return;
    }
    validationActive ? start() : showValidationPage();
    return;
  }
  if (active === stages.length - 1 && direction > 0) {
    showCostPage();
    return;
  }
  const next = Math.max(0, Math.min(stages.length - 1, active + direction));
  if (next === active) return;
  active = next;
  render();
}

begin.addEventListener('click', showValidationPage);
validationContinue.addEventListener('click', start);
costContinue.addEventListener('click', showModernMap);
$('#costBack').addEventListener('click', hideCostPage);
historyMenuToggle.addEventListener('click', () => {
  historicalInfo.classList.contains('is-open') ? closeHistoryMenu() : openHistoryMenu();
});
historyCollapse.addEventListener('click', () => closeHistoryMenu({ restoreFocus: true }));
historyBack.addEventListener('click', () => closeHistoryDetail({ restoreFocus: true }));
historyTopicButtons.forEach((button) => button.addEventListener('click', () => showHistoryTopic(button)));
modernMapButton.addEventListener('click', showCostPage);
historicMapButton.addEventListener('click', showHistoricMap);
$('#retryModernMap').addEventListener('click', async () => {
  const ready = await ensureModernMapLoaded();
  $('#modernLoadNotice').hidden = ready;
  if (ready) currentRaster.setActive(true);
});
$('#next').addEventListener('click', () => move(1));
$('#prev').addEventListener('click', () => move(-1));
$('#modernNext').addEventListener('click', () => move(1));
$('#modernPrev').addEventListener('click', () => move(-1));
$('#modernZoomIn').addEventListener('click', () => {
  if (!modernActive) return;
  useModernManualTransition();
  positionModernCamera(modernView.x, modernView.y, modernView.zoom * 1.25);
});
$('#modernZoomOut').addEventListener('click', () => {
  if (!modernActive) return;
  useModernManualTransition();
  positionModernCamera(modernView.x, modernView.y, modernView.zoom / 1.25);
});
$('#modernRecenter').addEventListener('click', () => {
  if (!modernActive) return;
  modernCamera.classList.remove('is-manual');
  renderModern({ animate: false });
});
$('#zoomIn').addEventListener('click', () => {
  if (active < 0) return start();
  useManualTransition();
  positionCamera(view.x, view.y, view.zoom * 1.24);
});
$('#zoomOut').addEventListener('click', () => {
  if (active < 0) return start();
  useManualTransition();
  positionCamera(view.x, view.y, view.zoom / 1.24);
});
$('#recenter').addEventListener('click', () => {
  if (active < 0) return start();
  camera.classList.remove('is-manual');
  fitBounds(stages[active].bounds);
});

// One-finger drag and two-finger zoom share the same bounded map coordinates.
function bindMapGestures(surface, { enabled, readView, position, limitZoom, setPan }) {
  const pointers = new Map();
  let gesture = null;
  let sequenceMoved = false;
  let sequenceHadPinch = false;
  let lastTouchTap = null;
  let suppressNativeDoubleClickUntil = 0;

  const zoomAtGesture = (clientX, clientY) => {
    if (surface === camera) {
      useManualTransition();
      zoomHistoricAt(clientX, clientY, view.zoom * 1.38);
    } else {
      useModernManualTransition();
      zoomModernAt(clientX, clientY, modernView.zoom * 1.38);
    }
  };
  const reset = () => {
    pointers.clear(); gesture = null; setPan(null);
    surface.classList.remove('is-dragging');
  };
  const startGesture = () => {
    const [first, second] = [...pointers.values()];
    const current = readView();
    if (second) {
      sequenceHadPinch = true;
      const cx = (first.x + second.x) / 2, cy = (first.y + second.y) / 2;
      gesture = {
        mode: 'pinch', zoom: current.zoom, distance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
        x: current.x + (cx - innerWidth / 2) / current.zoom,
        y: current.y + (cy - innerHeight / 2) / current.zoom
      };
    } else {
      gesture = { mode: 'pan', clientX: first.x, clientY: first.y, ...current };
    }
    setPan(gesture);
  };
  surface.addEventListener('pointerdown', (event) => {
    if (!enabled() || (event.pointerType !== 'touch' && event.button !== 0) || pointers.size >= 2) return;
    if (pointers.size && event.pointerType !== 'touch') return;
    if (surface === camera) historicCameraTween = null;
    else modernCameraTween = null;
    if (!pointers.size) {
      sequenceMoved = false;
      sequenceHadPinch = false;
    }
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    surface.classList.remove('is-manual');
    surface.classList.add('is-dragging');
    startGesture();
    surface.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  surface.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    if (!enabled()) return reset();
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const [first, second] = [...pointers.values()];
    if (gesture.mode === 'pinch' && second) {
      sequenceMoved = true;
      const zoom = limitZoom(gesture.zoom * Math.hypot(second.x - first.x, second.y - first.y) / gesture.distance);
      const cx = (first.x + second.x) / 2, cy = (first.y + second.y) / 2;
      position(gesture.x - (cx - innerWidth / 2) / zoom, gesture.y - (cy - innerHeight / 2) / zoom, zoom);
    } else {
      if (Math.hypot(first.x - gesture.clientX, first.y - gesture.clientY) > 9) sequenceMoved = true;
      position(gesture.x - (first.x - gesture.clientX) / gesture.zoom, gesture.y - (first.y - gesture.clientY) / gesture.zoom, gesture.zoom);
    }
  });
  const finish = (event) => {
    if (!pointers.has(event.pointerId)) return;
    const isLastPointer = pointers.size === 1;
    if (event.type === 'pointerup' && event.pointerType === 'touch' && isLastPointer && !sequenceMoved && !sequenceHadPinch) {
      const now = performance.now();
      const closeToLastTap = lastTouchTap && Math.hypot(event.clientX - lastTouchTap.x, event.clientY - lastTouchTap.y) < 34;
      if (closeToLastTap && now - lastTouchTap.time < 380) {
        lastTouchTap = null;
        suppressNativeDoubleClickUntil = now + 650;
        zoomAtGesture(event.clientX, event.clientY);
      } else {
        lastTouchTap = { time: now, x: event.clientX, y: event.clientY };
      }
    }
    pointers.delete(event.pointerId);
    pointers.size ? startGesture() : reset();
  };
  surface.addEventListener('pointerup', finish);
  surface.addEventListener('pointercancel', finish);
  surface.addEventListener('lostpointercapture', finish);
  surface.addEventListener('dblclick', (event) => {
    if (!enabled()) return;
    event.preventDefault();
    if (performance.now() < suppressNativeDoubleClickUntil) return;
    zoomAtGesture(event.clientX, event.clientY);
  });
  return reset;
}

const resetHistoricalGestures = bindMapGestures(camera, {
  enabled: () => active >= 0 && !costActive && !modernActive && !mapTransitionActive,
  readView: () => view, position: positionCamera,
  limitZoom: zoom => clampView(view.x, view.y, zoom).zoom,
  setPan: value => { pan = value; }
});
const resetModernGestures = bindMapGestures(modernCamera, {
  enabled: () => modernActive && !mapTransitionActive,
  readView: () => modernView, position: positionModernCamera,
  limitZoom: zoom => clampModernView(modernView.x, modernView.y, zoom).zoom,
  setPan: value => { modernPan = value; }
});

addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && ['+', '=', '-', '0'].includes(event.key)) event.preventDefault();
  if (mapTransitionActive) return;
  if (costActive) {
    if (event.target.closest('button') && [' ', 'Enter'].includes(event.key)) return;
    if (isCompactCostLayout() && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' '].includes(event.key)) return;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      showModernMap();
    } else if (['ArrowLeft', 'ArrowUp', 'Escape'].includes(event.key)) {
      event.preventDefault();
      hideCostPage();
    }
    return;
  }
  if (event.key === 'Escape' && historicalInfo.classList.contains('is-open')) {
    event.preventDefault();
    closeHistoryMenu({ restoreFocus: true });
    return;
  }
  // Reading a context keeps focus in its panel, but must not disable story arrows.
  if (event.target.isContentEditable || event.target.closest('input,textarea,select')) return;
  // Preserve native Space/Enter activation for the focused button.
  if (event.target.closest('button') && [' ', 'Enter'].includes(event.key)) return;
  if (modernActive) {
    if (MODERN_AWAITING_MARKINGS && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      const horizontal = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
      const vertical = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
      useModernManualTransition();
      positionModernCamera(modernView.x + horizontal * 90 / modernView.zoom, modernView.y + vertical * 90 / modernView.zoom, modernView.zoom);
      return;
    }
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      move(1);
      return;
    }
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      move(-1);
      return;
    }
    if (['+', '='].includes(event.key)) {
      event.preventDefault();
      useModernManualTransition();
      positionModernCamera(modernView.x, modernView.y, modernView.zoom * 1.24);
      return;
    }
    if (event.key === '-') {
      event.preventDefault();
      useModernManualTransition();
      positionModernCamera(modernView.x, modernView.y, modernView.zoom / 1.24);
      return;
    }
    if (event.key === '0') {
      event.preventDefault();
      modernCamera.classList.remove('is-manual');
      renderModern({ animate: false });
      return;
    }
    if (event.key === 'Escape') showHistoricMap();
    return;
  }
  if (['ArrowRight', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    move(1);
  }
  if (event.key === 'Enter' && active < 0) {
    event.preventDefault();
    move(1);
  }
  if (['ArrowLeft', 'ArrowUp'].includes(event.key)) {
    event.preventDefault();
    move(-1);
  }
  if (event.key === 'Escape') {
    showCover();
  }
  if (active >= 0 && ['+', '='].includes(event.key)) {
    event.preventDefault();
    useManualTransition();
    positionCamera(view.x, view.y, view.zoom * 1.24);
  }
  if (active >= 0 && event.key === '-') {
    event.preventDefault();
    useManualTransition();
    positionCamera(view.x, view.y, view.zoom / 1.24);
  }
  if (active >= 0 && event.key === '0') {
    event.preventDefault();
    fitBounds(stages[active].bounds);
  }
});

addEventListener('wheel', (event) => {
  if (mapTransitionActive) { event.preventDefault(); return; }
  const activeMapSurface = modernActive ? modernCamera : active >= 0 ? camera : null;
  if (!activeMapSurface || !activeMapSurface.contains(event.target)) {
    if (event.ctrlKey) event.preventDefault();
    return;
  }
  // Scroll reads the folio/panels. It never advances a presentation page.
  if (costActive || (!modernActive && active < 0)) return;
  if (historicalInfo.classList.contains('is-open') && historicalInfo.contains(event.target)) return;
  event.preventDefault();
  if (performance.now() < inputLockedUntil || pan || modernPan || !event.deltaY) return;
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
  const delta = Math.max(-160, Math.min(160, event.deltaY * unit));
  const factor = Math.exp(-delta * .0018);
  const clientX = event.clientX ?? innerWidth / 2, clientY = event.clientY ?? innerHeight / 2;
  if (modernActive) {
    useModernManualTransition();
    zoomModernAt(clientX, clientY, modernView.zoom * factor);
  } else {
    useManualTransition();
    zoomHistoricAt(clientX, clientY, view.zoom * factor);
  }
}, { passive: false });

addEventListener('resize', () => {
  const chromeOnlyResize = innerWidth === previousViewport.width && Math.abs(innerHeight - previousViewport.height) < 180;
  previousViewport = { width: innerWidth, height: innerHeight };
  positionCoverMap();
  if (modernActive) {
    if (chromeOnlyResize) positionModernCamera(modernView.x, modernView.y, modernView.zoom);
    else frameModernStage(modernStages[modernIndex]);
    // Mobile browser bars resize the visual viewport repeatedly. Repainting the
    // current camera is enough; rebuilding every marker and river here caused
    // visible hitches on iOS and Android.
    scheduleMobileStageTitleFit(modernStageTitle);
  } else if (active >= 0 && (chromeOnlyResize || costActive || mapTransitionActive)) {
    positionCamera(view.x, view.y, view.zoom);
    scheduleMobileStageTitleFit($('#stageTitle'));
  } else {
    active < 0 ? fitBounds(stages[0].bounds) : render({ animateRoute: false });
  }
});
positionCoverMap();
fitBounds(stages[0].bounds);
fitModernMap();
