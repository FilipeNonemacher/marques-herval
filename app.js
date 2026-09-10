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
const modernComandai = $('#modernComandai');
const modernBugre = $('#modernBugre');
const modernAmandau = $('#modernAmandau');
const modernComandaiPath = $('#modernComandaiPath');
const modernBugrePath = $('#modernBugrePath');
const modernAmandauPath = $('#modernAmandauPath');
const modernCamera = $('#modernCamera');
const modernWorld = $('#modernWorld');
const mapWorld = $('.map-world');
const historicRasterWorld = $('#historicRasterWorld');
const begin = $('#begin');
const dots = $('#dots');
const historicalInfo = $('#historicalInfo');
const historyMenuToggle = $('#historyMenuToggle');
const historyMenuPanel = $('#historyMenuPanel');
const historyCollapse = $('#historyCollapse');
const historyDetail = $('#historyDetail');
const historyDetailTitle = $('#historyDetailTitle');
const historyDetailText = $('#historyDetailText');
const historyBack = $('#historyBack');
const historyTopicButtons = [...document.querySelectorAll('[data-history-topic]')];
const routeElements = [$('#route1'), $('#route2'), $('#route3')];
const arrivalMarkers = [$('#arrivalMarker1'), $('#arrivalMarker2'), $('#arrivalMarker3')];
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
const MODERN_AWAITING_MARKINGS = modernScene.classList.contains('is-awaiting-markings');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const stages = [
  { kicker: 'Cartografia histórica', title: 'A região da expedição', bounds: [2382, 500, 4237, 1650] },
  { kicker: 'Ponto de partida', title: 'Cerro do Inhacurutum', bounds: [2720, 1090, 3335, 1550], start: true, cerro: true },
  { kicker: 'Primeira tentativa', attempt: 'Primeira tentativa', title: 'Travessia do Rio Comandahy por jangada e chegada ao Rio Sto Christo', duration: '7 DIAS', bounds: [2820, 1030, 3330, 1495], route: 0 },
  { kicker: 'Segunda tentativa', attempt: 'Segunda tentativa', title: 'Travessia do Rio Comandahy e retorno pela costa do Rio Uruguay', duration: '19 DIAS', bounds: [2590, 760, 3360, 1490], route: 1, discoveries: true },
  { kicker: 'Terceira tentativa', attempt: 'Terceira tentativa', title: 'Travessia do Rio Cebolaty e encontro dos grandes e valiosos Hervais', bounds: [2610, 480, 4090, 1490], route: 2, hervais: true },
  { kicker: 'Local de referência', title: 'Atual Munícipio de Porto Xavier - RS', bounds: [2460, 975, 2990, 1415], porto: true }
];
const modernStages = [
  { kicker: 'Mapa atual', title: 'Região da expedição', focus: [460, 430], overview: true },
  { kicker: 'Localidade atual', title: 'Município de Porto Xavier - RS', focus: [145, 485], zoom: 1 },
  { kicker: 'Ponto de partida da Expedição', title: 'Cerro do Inhacurutum', focus: [260, 625], zoom: 1 },
  { kicker: 'Curso d’água', title: 'Rio Comandaí', focus: [490, 500], zoom: 1, river: 'comandai' },
  { kicker: 'Localidade atual', title: 'Município de Porto Lucena - RS', focus: [210, 390], zoom: 1 },
  { kicker: 'Correspondência histórica', title: 'Rio Amandaú — Antigo Rio Pindaí', focus: [700, 410], zoom: 1, river: 'amandau' },
  { kicker: 'Localidade atual', title: 'Município de Porto Vera Cruz - RS', focus: [365, 270], zoom: 1 },
  { kicker: 'Curso d’água', title: 'Rio Cebolaty', focus: [735, 305], zoom: 1, river: 'cebolaty' }
];
// Reference pixels are registered to the unchanged 8000px source, not to the viewport.
function modernReferencePoint(x, y) { return [(x + 2721.2) / 1.152, (y + 1112.8) / 1.152]; }

function frameModernStage(stage) {
  const compact = innerWidth < 760;
  const focus = stage.overview && compact ? [30 + (innerWidth / 2 - 34) / .75, 430] : stage.focus;
  const availableScale = Math.min((innerWidth - 100) / 920, (innerHeight - 210) / 530);
  const scale = stage.overview
    ? Math.max(.58, Math.min(.74, availableScale))
    : Math.min(stage.zoom, compact ? .78 : 1);
  const [x, y] = modernReferencePoint(...focus);
  positionModernCamera(x, y, scale * 1.152);
}
const historicalTopics = {
  vaqueanos: {
    title: 'Vaqueanos Laureano de Vargas e Jesuíno da Silva Nunes',
    titleLines: ['Vaqueanos Laureano de Vargas', 'e Jesuíno da Silva Nunes'],
    text: 'Explorações particulares (1856–1857) — detentores do conhecimento do território'
  },
  indigenas: {
    title: 'Indígenas de Nonoai',
    text: 'Liderados pelo Cacique Prudente — guias essenciais na navegação do Alto Uruguai'
  },
  agrimensor: {
    title: 'Agrimensor Francisco Rave',
    text: 'Codificação técnica do conhecimento empírico dos vaqueanos e indígenas'
  },
  capitao: {
    title: 'Capitão Tristão de Araújo Nóbrega',
    text: 'Comando militar da expedição oficial de 1857'
  },
  objetivo: {
    title: 'Objetivo da Missão',
    text: 'Descobrir e documentar os ricos ervais do Alto Uruguai — riqueza estratégica do Império'
  }
};

let active = -1;
let validationActive = false;
let costActive = false;
let inputLockedUntil = 0;
let unitAnimation = 0;
let routeAnimationTimer = 0;
let unitExitTimer = 0;
let discoveryTimer = 0;
let hervaisTimer = 0;
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

function paintCameras() {
  cameraPaintFrame = 0;
  if (historicCameraDirty) {
    historicCameraDirty = false;
    const transform = `translate(${-view.x * view.zoom}px, ${-view.y * view.zoom}px) scale(${view.zoom})`;
    if (mapWorld.style.transform !== transform) {
      mapWorld.style.transform = transform;
      historicRasterWorld.style.transform = transform;
    }
    const label = `${Math.round(view.zoom * 100)}%`;
    if (zoomValue.textContent !== label) zoomValue.textContent = label;
  }
  if (modernCameraDirty) {
    modernCameraDirty = false;
    const transform = `translate(${-modernView.x * modernView.zoom}px, ${-modernView.y * modernView.zoom}px) scale(${modernView.zoom})`;
    if (modernWorld.style.transform !== transform) modernWorld.style.transform = transform;
    const label = `${Math.round(modernView.zoom * 100)}%`;
    if (modernZoomValue.textContent !== label) modernZoomValue.textContent = label;
  }
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
  // Decode while the audience reads, rather than on the transition's first frame.
  for (const src of ['public/assets/transicao-mapas.jpg', 'public/assets/mapa-atual-br-ers.png']) {
    const image = new Image();
    image.src = src;
    if (image.decode) image.decode().catch(() => {});
  }
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
  clearTimeout(discoveryTimer);
  clearTimeout(hervaisTimer);
  expeditionUnit.classList.remove('is-moving');
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
        { opacity: .25, strokeDashoffset: `${length}` },
        { opacity: 1, offset: .16 },
        { opacity: 1, strokeDashoffset: '0' }
      ],
      { duration: 2600, easing: 'cubic-bezier(.35,0,.2,1)', fill: 'forwards' }
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
    }, 2600));
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
  frameModernStage(stage);
  modernStageKicker.textContent = stage.kicker;
  modernStageTitle.textContent = stage.title;
  modernTitleCard.classList.remove('is-changing');
  void modernTitleCard.offsetWidth;
  modernTitleCard.classList.add('is-changing');

  modernPortoMarker.classList.toggle('is-visible', modernIndex >= 1);
  modernCerroMarker.classList.toggle('is-visible', modernIndex >= 2);
  modernLucenaMarker.classList.toggle('is-visible', modernIndex >= 4);
  modernVeraCruzMarker.classList.toggle('is-visible', modernIndex >= 6);
  setModernRiver(modernComandai, modernComandaiPath, modernIndex >= 3, animate && stage.river === 'comandai');
  setModernRiver(modernAmandau, modernAmandauPath, modernIndex >= 5, animate && stage.river === 'amandau');
  setModernRiver(modernBugre, modernBugrePath, modernIndex >= 7, animate && stage.river === 'cebolaty');
  [...modernDots.children].forEach((dot, index) => dot.classList.toggle('active', index === modernIndex));
}

function modernMinimumZoom() {
  return Math.max(innerWidth / MODERN_MAP_WIDTH, innerHeight / MODERN_MAP_HEIGHT) * 1.008;
}

function clampModernView(x, y, zoom) {
  const limitedZoom = Math.max(modernMinimumZoom(), Math.min(MODERN_MAX_ZOOM, zoom));
  const halfWidth = innerWidth / (2 * limitedZoom);
  const halfHeight = innerHeight / (2 * limitedZoom);
  return {
    x: halfWidth >= MODERN_MAP_WIDTH / 2 ? MODERN_MAP_WIDTH / 2 : Math.max(halfWidth, Math.min(MODERN_MAP_WIDTH - halfWidth, x)),
    y: halfHeight >= MODERN_MAP_HEIGHT / 2 ? MODERN_MAP_HEIGHT / 2 : Math.max(halfHeight, Math.min(MODERN_MAP_HEIGHT - halfHeight, y)),
    zoom: limitedZoom
  };
}

function positionModernCamera(x, y, zoom) {
  modernView = clampModernView(x, y, zoom);
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
  const targetZoom = Math.max(modernMinimumZoom(), Math.min(MODERN_MAX_ZOOM, zoom));
  const targetX = mapX - (clientX - innerWidth / 2) / targetZoom;
  const targetY = mapY - (clientY - innerHeight / 2) / targetZoom;
  positionModernCamera(targetX, targetY, targetZoom);
}

function zoomHistoricAt(clientX, clientY, zoom) {
  const mapX = view.x + (clientX - innerWidth / 2) / view.zoom;
  const mapY = view.y + (clientY - innerHeight / 2) / view.zoom;
  const targetZoom = Math.max(minimumZoom(), Math.min(MAX_ZOOM, zoom));
  positionCamera(mapX - (clientX - innerWidth / 2) / targetZoom,
    mapY - (clientY - innerHeight / 2) / targetZoom, targetZoom);
}

function minimumZoom() {
  return Math.max(innerWidth / MAP_WIDTH, innerHeight / MAP_HEIGHT);
}

function clampView(x, y, zoom) {
  const limitedZoom = Math.max(minimumZoom(), Math.min(MAX_ZOOM, zoom));
  const halfWidth = innerWidth / (2 * limitedZoom);
  const halfHeight = innerHeight / (2 * limitedZoom);
  return {
    x: halfWidth >= MAP_WIDTH / 2 ? MAP_WIDTH / 2 : Math.max(halfWidth, Math.min(MAP_WIDTH - halfWidth, x)),
    y: halfHeight >= MAP_HEIGHT / 2 ? MAP_HEIGHT / 2 : Math.max(halfHeight, Math.min(MAP_HEIGHT - halfHeight, y)),
    zoom: limitedZoom
  };
}

function positionCamera(x, y, zoom) {
  view = clampView(x, y, zoom);
  historicCameraDirty = true;
  scheduleCameraPaint();
}

function useManualTransition() {
  clearTimeout(manualTransitionTimer);
  camera.classList.add('is-manual');
  manualTransitionTimer = setTimeout(() => camera.classList.remove('is-manual'), 620);
}

function positionCoverMap() {
  const [left, top, right, bottom] = stages[0].bounds;
  const zoom = Math.max(innerWidth / (right - left), innerHeight / (bottom - top)) * 1.04;
  const x = (left + right) / 2;
  const y = (top + bottom) / 2;
  const transform = `translate(${-x * zoom}px, ${-y * zoom}px) scale(${zoom})`;
  coverMapStage.style.transform = transform;
  validationMapStage.style.transform = transform;
  costMapStage.style.transform = transform;
}

function fitBounds([left, top, right, bottom], maximumZoom = 1.08) {
  const compact = innerWidth < 760;
  const paddingX = compact ? 72 : 190;
  const paddingY = compact ? 110 : 155;
  const availableWidth = Math.max(320, innerWidth - paddingX * 2);
  const availableHeight = Math.max(300, innerHeight - paddingY * 2);
  const width = right - left;
  const height = bottom - top;
  const zoom = Math.min(availableWidth / width, availableHeight / height, maximumZoom);
  positionCamera((left + right) / 2, (top + bottom) / 2, zoom);
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
  if (path.id === 'route2') {
    currentFacing = progress < .345 ? 1 : progress < .79 ? -1 : 1;
  } else {
    currentFacing = 1;
  }
  expeditionUnit.setAttribute('transform', `translate(${point.x} ${point.y})`);
  if (previousFacing !== currentFacing) unitFacing.setAttribute('transform', `scale(${currentFacing} 1)`);
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
  unitFacing.setAttribute('transform', 'scale(1 1)');
  placeExpeditionUnit(route, 0);

  function frame(now) {
    const progress = Math.min(1, (now - started) / duration);
    const eased = routeProgress(progress);
    // Read the exact SVG geometry before changing its painted stroke.
    placeExpeditionUnit(route, length * eased);
    route.style.strokeDashoffset = `${length * (1 - eased)}`;
    if (progress < 1) {
      unitAnimation = requestAnimationFrame(frame);
    } else {
      expeditionUnit.classList.remove('is-moving');
      const routeIndex = routeElements.indexOf(route);
      if (routeIndex >= 0) arrivalMarkers[routeIndex].classList.add('is-visible');
      unitExitTimer = setTimeout(() => expeditionUnit.classList.add('is-departing'), 650);
    }
  }

  unitAnimation = requestAnimationFrame(frame);
}

function render({ animateRoute = true } = {}) {
  animateRoute = animateRoute && !reducedMotion.matches;
  const stage = stages[active];
  const titleCard = $('#titleCard');
  const stageTitle = $('#stageTitle');
  const stageDuration = $('#stageDuration');
  camera.classList.remove('is-manual', 'is-dragging');
  fitBounds(stage.bounds);
  $('#stageIndex').textContent = String(active + 1).padStart(2, '0');
  $('#stageKicker').textContent = stage.kicker;
  titleCard.classList.toggle('is-attempt', Boolean(stage.attempt));
  if (stage.attempt) {
    stageTitle.innerHTML = `<span class="attempt-name">${stage.attempt}</span><span class="attempt-detail"> — ${stage.title}</span>`;
  } else {
    stageTitle.textContent = stage.title;
  }
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
  const hervais = $('#hervais');
  hervais.classList.remove('is-visible');
  const secondDiscoveries = $('#secondDiscoveries');
  secondDiscoveries.classList.remove('is-visible');
  stopExpeditionAnimation();
  expeditionUnit.classList.remove('is-visible');
  expeditionUnit.classList.remove('is-moving');
  expeditionUnit.classList.remove('is-departing');

  routeElements.forEach((route) => {
    route.getAnimations().forEach((animation) => animation.cancel());
    route.classList.remove('is-visible');
    route.style.strokeDasharray = '';
    route.style.strokeDashoffset = '';
  });
  arrivalMarkers.forEach((marker) => marker.classList.remove('is-visible'));

  [...dots.children].forEach((dot, index) => dot.classList.toggle('active', index === active));
  if (stage.unit) {
    placeExpeditionUnit(routeElements[0], 0);
    expeditionUnit.classList.add('is-visible');
  }
  if (animateRoute && Number.isInteger(stage.route)) {
    const route = routeElements[stage.route];
    const length = routeLength(route);
    const duration = Math.max(5200, Math.min(12500, 3400 + length * 2.8));
    routeAnimationTimer = setTimeout(() => animateRouteAndUnit(route, duration), 850);
    if (stage.discoveries) {
      discoveryTimer = setTimeout(() => secondDiscoveries.classList.add('is-visible'), 850 + duration * .7);
    }
    if (stage.hervais) {
      hervaisTimer = setTimeout(() => hervais.classList.add('is-visible'), 850 + duration * .62);
    }
  } else if (Number.isInteger(stage.route)) {
    const route = routeElements[stage.route];
    const length = routeLength(route);
    route.style.strokeDasharray = '';
    route.style.strokeDashoffset = '0';
    route.classList.add('is-visible');
    placeExpeditionUnit(route, length);
    expeditionUnit.classList.add('is-visible');
    arrivalMarkers[stage.route].classList.add('is-visible');
    if (stage.discoveries) secondDiscoveries.classList.add('is-visible');
    if (stage.hervais) hervais.classList.add('is-visible');
  }
}

function showValidationPage() {
  if (active >= 0 || validationActive || performance.now() < inputLockedUntil) return;
  validationActive = true;
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
  historyDetailTitle.classList.toggle('is-two-line', Boolean(topic.titleLines));
  if (topic.titleLines) {
    const lines = topic.titleLines.map((line) => {
      const span = document.createElement('span');
      span.className = 'history-title-line';
      span.textContent = line;
      return span;
    });
    historyDetailTitle.replaceChildren(lines[0], document.createTextNode(' '), lines[1]);
  } else {
    historyDetailTitle.textContent = topic.title;
  }
  historyDetailText.textContent = topic.text;
  historyDetail.classList.remove('is-changing');
  void historyDetail.offsetWidth;
  historyDetail.classList.add('is-changing');
  historicalInfo.classList.add('is-detail-open');
  historyDetail.setAttribute('aria-hidden', 'false');
  focusAfterTransition(historyDetail, () => selectedHistoryButton === button && historicalInfo.classList.contains('is-detail-open'), 360);
}

function showCover() {
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
  warmTransitionArtwork();
  inputLockedUntil = performance.now() + 1450;
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
    modernActive = true;
    modernIndex = 0;
    renderModern({ animate: false });
    modernScene.classList.add('is-visible');
    modernScene.setAttribute('aria-hidden', 'false');
    modernMapButton.setAttribute('aria-expanded', 'false');
  }, MAP_TRANSITION_DURATION - 1400));

  mapTransitionTimers.push(setTimeout(() => {
    // Finish the full countdown before the breeze starts revealing the map.
    transitionSeconds.textContent = '0 s';
    mapTransition.classList.add('is-revealing');
    modernScene.classList.add('is-entering');
  }, MAP_TRANSITION_DURATION));

  mapTransitionTimers.push(setTimeout(() => {
    transitionSeconds.textContent = '0 s';
    mapTransition.classList.remove('is-active', 'is-revealing');
    mapTransition.setAttribute('aria-hidden', 'true');
    mapTransition.setAttribute('aria-busy', 'false');
    modernScene.classList.remove('is-entering');
    mapScene.classList.add('is-suspended');
    mapTransitionActive = false;
    mapScene.inert = true;
    costPage.inert = false;
    modernScene.inert = false;
    mapTransitionTimers = [];
    modernScene.focus({ preventScroll: true });
  }, totalDuration));
}

function showHistoricMap() {
  if (!modernActive || mapTransitionActive) return;
  mapScene.classList.remove('is-suspended');
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
  setModernRiver(modernComandai, modernComandaiPath, false, false);
  setModernRiver(modernAmandau, modernAmandauPath, false, false);
  setModernRiver(modernBugre, modernBugrePath, false, false);
  modernScene.classList.remove('is-visible');
  modernScene.setAttribute('aria-hidden', 'true');
  modernMapButton.setAttribute('aria-expanded', 'false');
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
  const reset = () => {
    pointers.clear(); gesture = null; setPan(null);
    surface.classList.remove('is-dragging');
  };
  const startGesture = () => {
    const [first, second] = [...pointers.values()];
    const current = readView();
    if (second) {
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
      const zoom = limitZoom(gesture.zoom * Math.hypot(second.x - first.x, second.y - first.y) / gesture.distance);
      const cx = (first.x + second.x) / 2, cy = (first.y + second.y) / 2;
      position(gesture.x - (cx - innerWidth / 2) / zoom, gesture.y - (cy - innerHeight / 2) / zoom, zoom);
    } else {
      position(gesture.x - (first.x - gesture.clientX) / gesture.zoom, gesture.y - (first.y - gesture.clientY) / gesture.zoom, gesture.zoom);
    }
  });
  const finish = (event) => {
    if (!pointers.delete(event.pointerId)) return;
    pointers.size ? startGesture() : reset();
  };
  surface.addEventListener('pointerup', finish);
  surface.addEventListener('pointercancel', finish);
  surface.addEventListener('lostpointercapture', finish);
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
    useManualTransition();
    positionCamera(view.x, view.y, view.zoom * 1.24);
  }
  if (active >= 0 && event.key === '-') {
    useManualTransition();
    positionCamera(view.x, view.y, view.zoom / 1.24);
  }
  if (active >= 0 && event.key === '0') {
    fitBounds(stages[active].bounds);
  }
});

addEventListener('wheel', (event) => {
  if (mapTransitionActive) { event.preventDefault(); return; }
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
    positionModernCamera(modernView.x, modernView.y, modernView.zoom);
    if (!MODERN_AWAITING_MARKINGS) renderModern({ animate: false });
  } else if (active >= 0 && (chromeOnlyResize || costActive || mapTransitionActive)) {
    positionCamera(view.x, view.y, view.zoom);
  } else {
    active < 0 ? fitBounds(stages[0].bounds) : render({ animateRoute: false });
  }
});
positionCoverMap();
fitBounds(stages[0].bounds);
fitModernMap();
