import { siteConfig } from './site-config.js';

const $ = (selector) => document.querySelector(selector);
const icons = {
  paper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M7 3h7l4 4v14H6V3h1Z"/><path d="M14 3v5h4M9 12h6M9 16h6"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/></svg>',
  dataset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 4 16 4 16 0V5M4 12v7c0 4 16 4 16 0v-7"/></svg>',
};
const resources = [
  { key: 'paper', label: 'Paper', description: 'Research paper' },
  { key: 'code', label: 'Code', description: 'Code & implementation' },
  { key: 'dataset', label: 'Dataset', description: 'CityLift-5K dataset' },
];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function urlFor(value) {
  if (!value || typeof value !== 'string') return '';
  try {
    const url = new URL(value, document.baseURI);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function externalLink(label, href, className) {
  const a = element('a', className, label);
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

function placeholder(title, note, symbol = '◇') {
  const box = element('div', 'placeholder');
  if (symbol) {
    const icon = element('span', 'placeholder-symbol', symbol);
    icon.setAttribute('aria-hidden', 'true');
    box.append(icon);
  }
  box.append(element('span', 'placeholder-title', title));
  if (note) box.append(element('span', 'placeholder-note', note));
  return box;
}

function mountMedia(target, media) {
  if (!target || !media || !urlFor(media.src)) return;
  const fallback = target.innerHTML;
  const isVideo = media.type === 'video';
  const node = document.createElement(isVideo ? 'video' : 'img');
  if (isVideo) {
    node.controls = true;
    node.playsInline = true;
    node.preload = 'none';
    node.setAttribute('aria-label', media.alt || 'Project demonstration');
    if (urlFor(media.poster)) node.poster = urlFor(media.poster);
  } else {
    node.alt = media.alt || '';
    node.loading = 'lazy';
    node.decoding = 'async';
  }
  node.addEventListener('error', () => {
    target.classList.remove('loaded');
    target.innerHTML = fallback;
    const note = target.querySelector('.placeholder-note');
    if (note) note.textContent = 'Preview currently unavailable';
  }, { once: true });
  node.src = urlFor(media.src);
  target.replaceChildren(node);
  target.classList.add('loaded');
}

function initProjectDetails() {
  if (siteConfig.authors?.length) {
    $('#authors').replaceChildren(...siteConfig.authors.map((author) => {
      const wrap = element('span');
      wrap.append(urlFor(author.url) ? externalLink(author.name, urlFor(author.url)) : document.createTextNode(author.name));
      const marks = [...(author.affiliations || [])];
      if (author.corresponding) marks.push('†');
      if (marks.length) wrap.append(element('sup', '', marks.join(',')));
      return wrap;
    }));
    $('#author-note').hidden = !siteConfig.authors.some((author) => author.corresponding);
  }
  if (siteConfig.affiliations?.length) {
    $('#affiliations').replaceChildren(...siteConfig.affiliations.map((affiliation) => {
      const wrap = element('span');
      wrap.append(element('sup', '', String(affiliation.id)), document.createTextNode(affiliation.name));
      return wrap;
    }));
  }
  const hero = $('#hero-links');
  const list = $('#resource-list');
  hero.replaceChildren();
  list.replaceChildren();
  for (const resource of resources) {
    const url = urlFor(siteConfig.links?.[resource.key]);
    const link = url ? externalLink('', url, 'resource-button live') : element('button', 'resource-button');
    if (!url) link.disabled = true;
    link.innerHTML = icons[resource.key];
    link.append(document.createTextNode(resource.label));
    if (!url) link.append(element('span', '', 'Coming soon'));
    hero.append(link);
    const row = element('div', 'resource-row');
    const title = element('div');
    title.innerHTML = icons[resource.key];
    title.append(document.createTextNode(resource.description));
    row.append(title, url ? externalLink('Open ↗', url, 'resource-state') : element('span', 'resource-state', 'Coming soon'));
    list.append(row);
  }
  if (urlFor(siteConfig.links?.dataset)) $('.release-badge').replaceChildren(externalLink('Explore CityLift-5K ↗', urlFor(siteConfig.links.dataset)));
  for (const [key, media] of Object.entries(siteConfig.media || {})) mountMedia($(`#${key}-media`), media);
  if (siteConfig.citation?.trim()) {
    $('#citation-section').hidden = false;
    $('#citation-content').textContent = siteConfig.citation.trim();
    $('#copy-citation').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(siteConfig.citation.trim());
        $('#copy-status').textContent = 'Citation copied to clipboard.';
        $('#copy-citation').textContent = 'Copied';
        setTimeout(() => { $('#copy-citation').textContent = 'Copy BibTeX'; }, 2000);
      } catch {
        $('#copy-status').textContent = 'Please select and copy the citation below.';
        $('#copy-citation').textContent = 'Select text to copy';
      }
    });
  }
}

let activeViewer = null;
let selectionVersion = 0;
let appearance = 'textured';
const viewport = $('#result-viewport');
const sceneStatus = $('#scene-status');
const instanceSelect = $('#instance-select');
const rotateButton = $('#rotate-button');
const resetButton = $('#reset-button');
const appearanceButtons = [...document.querySelectorAll('[data-appearance]')];

function setViewerControls(enabled) {
  [...appearanceButtons, instanceSelect, rotateButton, resetButton].forEach((node) => { node.disabled = !enabled; });
  if (!enabled) {
    appearance = 'textured';
    appearanceButtons.forEach((node) => node.setAttribute('aria-pressed', String(node.dataset.appearance === appearance)));
    rotateButton.setAttribute('aria-pressed', 'false');
    instanceSelect.replaceChildren(new Option('All buildings', 'all'));
  }
}

function clearViewer() {
  activeViewer?.dispose();
  activeViewer = null;
  const video = viewport.querySelector('video');
  if (video) {
    video.pause();
    video.removeAttribute('src');
    video.load();
  }
  viewport.replaceChildren();
  setViewerControls(false);
}

function showVideo(scene) {
  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('aria-label', `${scene.label}: rendered preview`);
  if (urlFor(scene.poster)) video.poster = urlFor(scene.poster);
  video.src = urlFor(scene.video);
  video.addEventListener('error', () => {
    viewport.replaceChildren(placeholder('Preview unavailable', 'Please try again later.'));
    sceneStatus.textContent = 'Preview unavailable';
  }, { once: true });
  viewport.replaceChildren(video);
  sceneStatus.textContent = 'Rendered preview';
  $('#viewer-hint').textContent = 'Play the rendered scene preview.';
}

function prepareModel(scene, version, failed = false) {
  viewport.replaceChildren();
  if (urlFor(scene.poster)) {
    const poster = element('img', 'poster-image');
    poster.alt = '';
    poster.src = urlFor(scene.poster);
    poster.addEventListener('error', () => poster.remove(), { once: true });
    viewport.append(poster);
  }
  const box = placeholder(failed ? '3D preview unavailable' : 'Explore in 3D', failed ? 'The model could not be loaded. Please try again.' : 'Rotate the scene and inspect individual buildings.');
  box.classList.add('load-overlay');
  const size = Number(scene.modelSizeMB);
  if (!failed && size > 0) box.append(element('span', 'placeholder-note', `Approx. ${size} MB download`));
  const loadButton = element('button', 'primary-button', failed ? 'Retry 3D preview' : 'Load 3D scene');
  loadButton.addEventListener('click', () => loadSceneModel(scene, version), { once: true });
  box.append(loadButton);
  if (urlFor(scene.video)) {
    const videoButton = element('button', 'text-button', 'Watch rendered preview');
    videoButton.addEventListener('click', () => showVideo(scene));
    box.append(videoButton);
  }
  viewport.append(box);
  sceneStatus.textContent = failed ? 'Preview unavailable' : 'Ready to explore';
  $('#viewer-hint').textContent = 'The 3D model loads only when you choose to explore it.';
}

async function loadSceneModel(scene, version) {
  viewport.replaceChildren(placeholder('Loading 3D viewer', 'Preparing the interactive preview…'));
  sceneStatus.textContent = 'Loading viewer…';
  let viewer = null;
  try {
    const { SceneViewer } = await import('./viewer.js');
    if (selectionVersion !== version) return;
    viewport.replaceChildren();
    viewer = new SceneViewer(viewport);
    activeViewer = viewer;
    await viewer.load(urlFor(scene.model), {
      upAxis: scene.upAxis,
      instanceNodes: scene.instanceNodes,
      onProgress: (message) => { if (selectionVersion === version) sceneStatus.textContent = message; },
    });
    if (selectionVersion !== version) { viewer.dispose(); return; }
    const instances = viewer.getInstances();
    instanceSelect.replaceChildren(new Option('All buildings', 'all'), ...instances.map((instance, index) => new Option(instance.label, String(index))));
    setViewerControls(true);
    sceneStatus.textContent = 'Interactive 3D';
    $('#viewer-hint').textContent = 'Drag to orbit · Scroll or pinch to zoom · Right-drag to pan';
  } catch (error) {
    viewer?.dispose();
    if (activeViewer === viewer) activeViewer = null;
    if (selectionVersion !== version) return;
    setViewerControls(false);
    prepareModel(scene, version, true);
    console.warn('CityLift preview could not be loaded:', error.message);
  }
}

function selectScene(scene, index) {
  const version = ++selectionVersion;
  clearViewer();
  $('#scene-name').textContent = scene.label || `Scene ${index + 1}`;
  for (const button of $('#scene-list').children) button.setAttribute('aria-pressed', String(Number(button.dataset.index) === index));
  const input = $('#input-media');
  input.classList.remove('loaded');
  input.replaceChildren(placeholder('Input image', 'Coming soon', '▧'));
  mountMedia(input, { type: 'image', src: scene.input, alt: `Input image for ${scene.label}` });
  if (urlFor(scene.model)) {
    prepareModel(scene, version);
  } else if (urlFor(scene.video)) {
    showVideo(scene);
  } else {
    viewport.append(placeholder('Explore the generated scene', 'Interactive results coming soon'));
    sceneStatus.textContent = 'Preview coming soon';
    $('#viewer-hint').textContent = 'Scene previews will be added here.';
  }
}

function initResults() {
  const list = $('#scene-list');
  const scenes = siteConfig.scenes || [];
  scenes.forEach((scene, index) => {
    const button = element('button', 'scene-card');
    button.type = 'button';
    button.dataset.index = String(index);
    button.setAttribute('aria-pressed', String(index === 0));
    button.setAttribute('aria-label', `Show ${scene.label || `Scene ${index + 1}`}`);
    const thumb = element('span', 'scene-thumb', '◇');
    thumb.setAttribute('aria-hidden', 'true');
    if (urlFor(scene.input)) {
      const image = document.createElement('img');
      image.alt = '';
      image.loading = 'lazy';
      image.src = urlFor(scene.input);
      image.addEventListener('error', () => { thumb.textContent = '◇'; }, { once: true });
      thumb.replaceChildren(image);
    }
    button.append(thumb, element('span', '', scene.label || `Scene ${index + 1}`));
    button.addEventListener('click', () => selectScene(scene, index));
    list.append(button);
  });
  if (scenes.length) selectScene(scenes[0], 0);
  appearanceButtons.forEach((button) => button.addEventListener('click', () => {
    appearance = button.dataset.appearance;
    activeViewer?.setAppearance(appearance);
    appearanceButtons.forEach((node) => node.setAttribute('aria-pressed', String(node === button)));
  }));
  instanceSelect.addEventListener('change', () => activeViewer?.showInstance(instanceSelect.value === 'all' ? null : Number(instanceSelect.value)));
  resetButton.addEventListener('click', () => activeViewer?.resetCamera());
  rotateButton.addEventListener('click', () => {
    const enabled = rotateButton.getAttribute('aria-pressed') !== 'true';
    rotateButton.setAttribute('aria-pressed', String(enabled));
    activeViewer?.setAutoRotate(enabled);
  });
  window.addEventListener('pagehide', () => {
    ++selectionVersion;
    clearViewer();
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && scenes.length) {
      const selected = list.querySelector('[aria-pressed="true"]');
      const index = selected ? Number(selected.dataset.index) : 0;
      selectScene(scenes[index], index);
    }
  });
}

initProjectDetails();
initResults();
