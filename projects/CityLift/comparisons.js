// Asset bases are relative to this module, not to /CityLift/'s Jekyll permalink.
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
  const playButton = root.querySelector('[data-cl-play]');
  const restartButton = root.querySelector('[data-cl-restart]');
  const seek = root.querySelector('[data-cl-seek]');
  const time = root.querySelector('[data-cl-time]');
  const status = root.querySelector('[data-cl-status]');
  const assetBase = new URL(root.dataset.clAssetBase || 'static/comparisons/us_02/', import.meta.url);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let playing = false;
  let inView = false;
  let userPaused = reducedMotion.matches;
  let hasStarted = false;
  let pageWasPlaying = false;
  let playVersion = 0;

  const entries = methods.map((method) => {
    const card = createNode('figure', 'cl-comparison-card');
    card.dataset.method = method.id;
    const caption = createNode('figcaption', 'cl-comparison-caption');
    caption.append(createNode('span', '', method.label));
    if (method.ours) caption.append(createNode('span', 'cl-comparison-badge', 'Ours'));
    const media = createNode('div', 'cl-comparison-media');
    const poster = createNode('img');
    poster.alt = `${method.label}: us_02 orbit preview`;
    poster.src = new URL(`${method.id}.png`, assetBase).href;
    poster.decoding = 'async';
    poster.addEventListener('error', () => { poster.hidden = true; });
    const video = createNode('video');
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = 'auto';
    video.setAttribute('aria-label', `${method.label}: 360 degree orbit of us_02`);
    video.poster = poster.src;
    video.src = new URL(`${method.id}.mp4`, assetBase).href;
    const unavailable = createNode('span', 'cl-comparison-unavailable', 'Video unavailable · still preview');
    media.append(poster, video, unavailable);
    card.append(caption, media);
    grid.append(card);
    const entry = { video, card, ready: false, failed: false };
    video.addEventListener('loadeddata', () => {
      entry.ready = true;
      card.classList.add('cl-has-video');
      refreshAvailability();
      if (playing) playAll();
    }, { once: true });
    video.addEventListener('error', () => {
      entry.failed = true;
      card.classList.remove('cl-has-video');
      card.classList.add('cl-video-error');
      refreshAvailability();
    }, { once: true });
    return entry;
  });

  const available = () => entries.filter(entry => entry.ready && !entry.failed).map(entry => entry.video);
  const allSettled = () => entries.every(entry => entry.ready || entry.failed);
  const clockText = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

  function paintControls() {
    const master = available()[0];
    const duration = master && Number.isFinite(master.duration) ? master.duration : 8;
    const position = master?.currentTime || 0;
    time.textContent = `${clockText(position)} / ${clockText(duration)}`;
    seek.value = String(duration ? Math.round(position / duration * 1000) : 0);
    playButton.textContent = playing ? 'Pause all' : 'Play all';
    playButton.setAttribute('aria-label', playing ? 'Pause all comparison videos' : 'Play all comparison videos');
  }

  function reportState() {
    const count = available().length;
    if (!count) status.textContent = allSettled() ? 'Videos unavailable. Showing available preview images.' : 'Loading rendered previews…';
    else if (count < entries.length) status.textContent = `${count} of ${entries.length} videos ready. Other methods show still previews.`;
    else status.textContent = playing ? 'Synchronized orbit · drag the timeline to compare any angle.' : 'Paused · play all or drag the timeline to compare any angle.';
  }

  function refreshAvailability() {
    const ready = available().length > 0;
    playButton.disabled = !ready;
    restartButton.disabled = !ready;
    seek.disabled = !ready;
    paintControls();
    reportState();
    if (!hasStarted && allSettled() && inView && !userPaused) playAll();
  }

  function pauseAll() {
    ++playVersion;
    playing = false;
    entries.forEach(({ video }) => video.pause());
    // Freeze every panel at exactly the same angle for still comparisons.
    const videos = available();
    const position = videos[0]?.currentTime;
    if (position !== undefined) videos.slice(1).forEach(video => { video.currentTime = position; });
    paintControls();
    reportState();
  }

  async function playAll() {
    const videos = available();
    if (!videos.length) return;
    const version = ++playVersion;
    const position = videos[0].currentTime;
    videos.forEach(video => { if (Math.abs(video.currentTime - position) > .01) video.currentTime = position; });
    const results = await Promise.allSettled(videos.map(video => video.play()));
    if (version !== playVersion) return;
    if (results.some(result => result.status === 'rejected')) {
      pauseAll();
      status.textContent = 'Press Play all to start the comparison videos.';
      return;
    }
    playing = true;
    hasStarted = true;
    paintControls();
    reportState();
  }

  playButton.addEventListener('click', () => {
    userPaused = playing;
    if (playing) pauseAll(); else playAll();
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

  // Re-align clocks after decoding stalls and at loop boundaries.
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
    if (inView && !userPaused && allSettled()) playAll();
    else if (!inView && playing) pauseAll();
  }, { threshold: .05 });
  observer.observe(root);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pageWasPlaying = playing; pauseAll(); }
    else if (pageWasPlaying && inView && !userPaused) playAll();
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
}

document.querySelectorAll('[data-cl-comparison]').forEach(initializeComparison);
