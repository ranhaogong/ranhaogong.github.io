import { comparisonScenes } from './comparison-scenes.js?v=20261023-scenes';

const methods = [
  { id: 'sam3d', label: 'SAM 3D' },
  { id: 'pixal3d', label: 'Pixal3D' },
  { id: '3dfixer', label: '3D-Fixer' },
  { id: 'trellis2', label: 'TRELLIS.2' },
  { id: 'scenegen', label: 'SceneGen' },
  { id: 'citylift', label: 'CityLift', ours: true },
];

function createNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function initializeComparison(root) {
  const grid = root.querySelector('[data-cl-grid]');
  const sceneList = root.querySelector('[data-cl-scenes]');
  const playButton = root.querySelector('[data-cl-play]');
  const restartButton = root.querySelector('[data-cl-restart]');
  const seek = root.querySelector('[data-cl-seek]');
  const time = root.querySelector('[data-cl-time]');
  const status = root.querySelector('[data-cl-status]');
  // Module-relative URLs also work with the /CityLift/ Jekyll permalink.
  const assetRoot = new URL(root.dataset.clAssetRoot || 'static/comparisons/', import.meta.url);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let entries = [];
  let currentScene = null;
  let sceneVersion = 0;
  let playVersion = 0;
  let playing = false;
  let playPending = false;
  let inView = false;
  let userPaused = reducedMotion.matches;

  const sceneBase = scene => new URL(scene.directory || `${scene.id}/`, assetRoot);
  const available = () => entries.filter(entry => entry.ready && !entry.failed).map(entry => entry.video);
  const allSettled = () => entries.length > 0 && entries.every(entry => entry.ready || entry.failed);
  const clockText = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

  function paintControls() {
    const master = available()[0];
    const duration = master && Number.isFinite(master.duration) ? master.duration : currentScene?.duration || 8;
    const position = master?.currentTime || 0;
    time.textContent = `${clockText(position)} / ${clockText(duration)}`;
    seek.value = String(duration ? Math.round(position / duration * 1000) : 0);
    playButton.textContent = playing ? 'Pause all' : 'Play all';
    playButton.setAttribute('aria-label', playing ? 'Pause all comparison videos' : 'Play all comparison videos');
  }

  function reportState() {
    const count = available().length;
    const label = currentScene ? `${currentScene.label} · ` : '';
    if (!allSettled()) status.textContent = `${label}Loading rendered previews…`;
    else if (!count) status.textContent = `${label}Videos unavailable. Showing available preview images.`;
    else if (count < entries.length) status.textContent = `${label}${count} of ${entries.length} videos ready. Other methods show still previews.`;
    else status.textContent = label + (playing ? 'Synchronized orbit · drag the timeline to compare any angle.' : 'Paused · play all or drag the timeline to compare any angle.');
  }

  function refreshAvailability() {
    const ready = allSettled() && available().length > 0;
    playButton.disabled = !ready;
    restartButton.disabled = !ready;
    seek.disabled = !ready;
    grid.setAttribute('aria-busy', String(!allSettled()));
    paintControls();
    reportState();
    if (ready && inView && !document.hidden && !userPaused) playAll();
  }

  function pauseAll() {
    ++playVersion;
    playPending = false;
    playing = false;
    entries.forEach(({ video }) => video.pause());
    const videos = available();
    const position = videos[0]?.currentTime;
    if (position !== undefined) videos.slice(1).forEach(video => { video.currentTime = position; });
    paintControls();
    reportState();
  }

  async function playAll() {
    const videos = available();
    if (!allSettled() || !videos.length || playing || playPending) return;
    const version = ++playVersion;
    playPending = true;
    const position = videos[0].currentTime;
    videos.forEach(video => { if (Math.abs(video.currentTime - position) > .01) video.currentTime = position; });
    const results = await Promise.allSettled(videos.map(video => video.play()));
    // Ignore promises from videos superseded by a scene switch or pause.
    if (version !== playVersion) return;
    playPending = false;
    if (results.some(result => result.status === 'rejected')) {
      pauseAll();
      status.textContent = 'Press Play all to start the comparison videos.';
      return;
    }
    playing = true;
    paintControls();
    reportState();
  }

  function loadScene(scene) {
    if (currentScene?.id === scene.id) return;
    const version = ++sceneVersion;
    ++playVersion;
    playing = false;
    playPending = false;
    // Release previous decoders and invalidate delayed events before rebuilding.
    entries.forEach(({ video }) => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
    entries = [];
    currentScene = scene;
    grid.replaceChildren();
    root.dataset.clScene = scene.id;
    choices.forEach(({ button, scene: choice }) => {
      button.setAttribute('aria-pressed', String(choice.id === scene.id));
    });
    const base = sceneBase(scene);
    entries = methods.map(method => {
      const card = createNode('figure', 'cl-comparison-card');
      card.dataset.method = method.id;
      const caption = createNode('figcaption', 'cl-comparison-caption');
      caption.append(createNode('span', '', method.label));
      if (method.ours) caption.append(createNode('span', 'cl-comparison-badge', 'Ours'));
      const media = createNode('div', 'cl-comparison-media');
      const poster = createNode('img');
      poster.alt = `${method.label}: ${scene.label} orbit preview`;
      poster.decoding = 'async';
      poster.addEventListener('error', () => { if (version === sceneVersion) poster.hidden = true; });
      poster.src = new URL(`${method.id}.png`, base).href;
      const video = createNode('video');
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.loop = true;
      video.preload = 'auto';
      video.setAttribute('aria-label', `${method.label}: 360 degree orbit of ${scene.label}`);
      video.poster = poster.src;
      const entry = { video, card, ready: false, failed: false };
      video.addEventListener('loadeddata', () => {
        if (version !== sceneVersion) return;
        entry.ready = true;
        card.classList.add('cl-has-video');
        refreshAvailability();
      }, { once: true });
      video.addEventListener('error', () => {
        if (version !== sceneVersion) return;
        entry.failed = true;
        card.classList.remove('cl-has-video');
        card.classList.add('cl-video-error');
        refreshAvailability();
      }, { once: true });
      video.src = new URL(`${method.id}.mp4`, base).href;
      const unavailable = createNode('span', 'cl-comparison-unavailable', 'Video unavailable · still preview');
      media.append(poster, video, unavailable);
      card.append(caption, media);
      grid.append(card);
      return entry;
    });
    refreshAvailability();
  }

  const choices = comparisonScenes.map(scene => {
    const button = createNode('button', 'cl-scene-choice');
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `Show comparison for ${scene.label}`);
    const image = createNode('img');
    image.src = new URL(scene.input || 'input.png', sceneBase(scene)).href;
    image.alt = `Input image for ${scene.label}`;
    image.width = 112;
    image.height = 112;
    image.loading = 'lazy';
    image.decoding = 'async';
    button.append(image, createNode('span', '', scene.label));
    button.addEventListener('click', () => loadScene(scene));
    sceneList.append(button);
    return { scene, button };
  });

  playButton.addEventListener('click', () => {
    userPaused = playing || playPending;
    if (userPaused) pauseAll(); else playAll();
  });
  restartButton.addEventListener('click', () => {
    available().forEach(video => { video.currentTime = 0; });
    paintControls();
  });
  seek.addEventListener('input', () => {
    const videos = available();
    const master = videos[0];
    if (!master || !Number.isFinite(master.duration)) return;
    const target = Number(seek.value) / 1000 * Math.max(0, master.duration - .001);
    videos.forEach(video => { video.currentTime = target; });
    paintControls();
  });

  const timer = setInterval(() => {
    if (!playing || document.hidden) return;
    const videos = available();
    const master = videos[0];
    if (!master) return;
    for (const video of videos.slice(1)) {
      if (!video.seeking && Math.abs(video.currentTime - master.currentTime) > .08) video.currentTime = master.currentTime;
    }
    paintControls();
  }, 200);

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView && !document.hidden && !userPaused && allSettled()) playAll();
    else if (!inView && (playing || playPending)) pauseAll();
  }, { threshold: .05 });
  observer.observe(root);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseAll();
    else if (inView && !userPaused && allSettled()) playAll();
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) { userPaused = true; pauseAll(); }
  });
  window.addEventListener('pagehide', event => {
    pauseAll();
    if (!event.persisted) { clearInterval(timer); observer.disconnect(); }
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted && inView && !userPaused) playAll();
  });

  if (comparisonScenes.length) loadScene(comparisonScenes[0]);
  else {
    playButton.disabled = restartButton.disabled = seek.disabled = true;
    status.textContent = 'Comparison scenes coming soon.';
  }
}

document.querySelectorAll('[data-cl-comparison]').forEach(initializeComparison);
