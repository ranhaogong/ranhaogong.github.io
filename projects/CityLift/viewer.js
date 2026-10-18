// Imported only after a visitor clicks "Load 3D scene".
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const decoderBase = 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/';
const palette = [0x5f8fdf, 0xe5a15f, 0x76b49b, 0xa68bd2, 0xdf8395, 0x68a9b8, 0xc5ad62, 0x858ccf, 0x96b570, 0xc58d70, 0x7aabd6, 0xb588b7];

function containsMesh(object) {
  let found = false;
  object.traverse((child) => { if (child.isMesh) found = true; });
  return found;
}

function disposeModel(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  root.traverse((node) => {
    if (!node.isMesh) return;
    if (node.geometry) geometries.add(node.geometry);
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  const closedImages = new Set();
  for (const texture of textures) {
    texture.dispose();
    if (texture.image?.close && !closedImages.has(texture.image)) {
      texture.image.close();
      closedImages.add(texture.image);
    }
  }
}

export class SceneViewer {
  constructor(container) {
    this.container = container;
    this.disposed = false;
    this.isVisible = true;
    this.abort = new AbortController();
    this.model = null;
    this.instances = [];
    this.originalMaterials = new Map();
    this.instanceMaterials = [];
    this.flatMaterials = new Map();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.01, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.domElement.setAttribute('aria-label', 'Interactive CityLift scene. Use the mouse or touch to orbit and zoom.');
    this.container.append(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.autoRotateSpeed = 0.65;
    this.controls.screenSpacePanning = true;
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environmentTarget = pmrem.fromScene(environment, 0.04);
    this.scene.environment = this.environmentTarget.texture;
    environment.dispose();
    pmrem.dispose();
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xbcc5d6, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 8, 5);
    this.scene.add(key);
    this.geometryMaterial = new THREE.MeshStandardMaterial({ color: 0xd1d7df, roughness: 0.86, metalness: 0, side: THREE.DoubleSide });
    this.neutralMaterial = new THREE.MeshStandardMaterial({ color: 0xe2e6eb, roughness: 0.9, side: THREE.DoubleSide });
    this.draco = new DRACOLoader();
    this.draco.setDecoderPath(`${decoderBase}draco/`);
    this.ktx2 = new KTX2Loader();
    this.ktx2.setTranscoderPath(`${decoderBase}basis/`).detectSupport(this.renderer);
    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(this.draco);
    this.loader.setKTX2Loader(this.ktx2);
    this.loader.setMeshoptDecoder(MeshoptDecoder);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(([entry]) => { this.isVisible = entry.isIntersecting; });
      this.intersectionObserver.observe(this.container);
    }
    this.resize();
    this.animate();
  }

  resize() {
    if (this.disposed) return;
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  async load(url, { upAxis = 'y', instanceNodes = [], onProgress = () => {} } = {}) {
    onProgress('Downloading scene…');
    const response = await fetch(url, { signal: this.abort.signal });
    if (!response.ok) throw new Error(`Model request failed (${response.status}).`);
    const buffer = await response.arrayBuffer();
    if (this.disposed) return;
    if (buffer.byteLength < 12 || new DataView(buffer).getUint32(0, true) !== 0x46546c67) throw new Error('The asset is not a valid GLB file.');
    onProgress('Preparing scene…');
    const gltf = await this.loader.parseAsync(buffer, new URL('.', url).href);
    if (this.disposed) { disposeModel(gltf.scene); return; }
    this.model = gltf.scene;
    if (!containsMesh(this.model)) throw new Error('The GLB contains no mesh geometry.');
    this.model.traverse((mesh) => { if (mesh.isMesh) this.originalMaterials.set(mesh, mesh.material); });
    this.pivot = new THREE.Group();
    this.pivot.add(this.model);
    if (upAxis?.toLowerCase() === 'z') this.pivot.rotation.x = -Math.PI / 2;
    this.scene.add(this.pivot);
    this.resolveInstances(instanceNodes);
    this.frameModel();
    this.setAppearance('textured');
  }

  resolveInstances(names) {
    let nodes = [];
    if (Array.isArray(names) && names.length) {
      nodes = names.map((name) => this.model.getObjectByName(name)).filter((node) => node && containsMesh(node));
      nodes = [...new Set(nodes)];
      // Avoid treating a parent and its child as separate instances.
      nodes = nodes.filter((node) => !nodes.some((other) => {
        if (other === node) return false;
        for (let parent = node.parent; parent; parent = parent.parent) if (parent === other) return true;
        return false;
      }));
    }
    if (!nodes.length) {
      let root = this.model;
      let children = root.children.filter(containsMesh);
      while (children.length === 1 && !children[0].isMesh) {
        root = children[0];
        children = root.children.filter(containsMesh);
      }
      nodes = children.length ? children : [root];
    }
    this.instances = nodes.map((node, index) => ({ node, label: node.name || `Building ${index + 1}`, initialVisibility: node.visible }));
    this.instanceMaterials = nodes.map((_, index) => new THREE.MeshStandardMaterial({ color: palette[index % palette.length], roughness: 0.8, side: THREE.DoubleSide }));
  }

  getInstances() { return this.instances.map(({ label }) => ({ label })); }

  frameModel() {
    this.pivot.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.pivot);
    if (box.isEmpty()) throw new Error('The model has no visible extent.');
    const center = box.getCenter(new THREE.Vector3());
    const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
    if (!Number.isFinite(radius) || radius <= 0) throw new Error('The model has invalid bounds.');
    this.pivot.position.sub(center);
    const halfVertical = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const halfHorizontal = Math.atan(Math.tan(halfVertical) * this.camera.aspect);
    const distance = radius / Math.sin(Math.min(halfVertical, halfHorizontal)) * 1.18;
    this.camera.near = Math.max(radius / 1000, 0.0001);
    this.camera.far = Math.max(radius * 100, distance * 10);
    this.camera.position.copy(new THREE.Vector3(1.15, 0.85, 1.6).normalize().multiplyScalar(distance));
    this.camera.updateProjectionMatrix();
    this.controls.target.set(0, 0, 0);
    this.controls.minDistance = radius * 0.08;
    this.controls.maxDistance = distance * 8;
    this.controls.update();
    this.controls.saveState();
  }

  setAppearance(mode) {
    if (!this.model || this.disposed) return;
    this.model.traverse((mesh) => {
      if (!mesh.isMesh) return;
      mesh.material = mode === 'textured'
        ? this.originalMaterials.get(mesh)
        : this.materialForMesh(mesh, mode === 'geometry' ? this.geometryMaterial : this.neutralMaterial);
    });
    if (mode === 'instances') this.instances.forEach(({ node }, index) => node.traverse((mesh) => {
      if (mesh.isMesh) mesh.material = this.materialForMesh(mesh, this.instanceMaterials[index]);
    }));
  }

  materialForMesh(mesh, material) {
    if (mesh.geometry.hasAttribute('normal')) return material;
    // Like GLTFLoader, derive face normals in the shader when the GLB omits NORMAL.
    // Keep a separate variant so meshes with authored normals retain smooth shading.
    if (!this.flatMaterials.has(material)) {
      const flat = material.clone();
      flat.flatShading = true;
      this.flatMaterials.set(material, flat);
    }
    return this.flatMaterials.get(material);
  }

  showInstance(index) {
    this.instances.forEach((instance, i) => { instance.node.visible = index === null ? instance.initialVisibility : i === index; });
  }

  resetCamera() { if (!this.disposed && this.model) this.frameModel(); }
  setAutoRotate(enabled) { if (!this.disposed) this.controls.autoRotate = enabled; }

  animate() {
    if (this.disposed) return;
    this.frame = requestAnimationFrame(() => this.animate());
    if (!this.isVisible || document.hidden) return;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.abort.abort();
    cancelAnimationFrame(this.frame);
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.controls?.dispose();
    if (this.model) {
      for (const [mesh, material] of this.originalMaterials) mesh.material = material;
      disposeModel(this.model);
    }
    this.originalMaterials.clear();
    this.geometryMaterial?.dispose();
    this.neutralMaterial?.dispose();
    for (const material of this.instanceMaterials) material.dispose();
    for (const material of this.flatMaterials.values()) material.dispose();
    this.flatMaterials.clear();
    this.instanceMaterials = [];
    this.instances = [];
    this.scene.clear();
    this.scene.environment = null;
    this.environmentTarget?.dispose();
    this.draco?.dispose();
    this.ktx2?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
    this.model = null;
  }
}
