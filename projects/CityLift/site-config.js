// Asset paths are relative to this file in /projects/CityLift/, even though the page URL is /CityLift/.
// Empty strings intentionally show placeholders.
// After uploading an asset, enter its path here. See README.md for examples.
export const siteConfig = {
  authors: [
    { name: 'Haoran Gong', affiliations: [1, 2], url: 'https://ranhaogong.github.io/' },
    { name: 'Jie Feng', affiliations: [2], url: 'https://vonfeng.github.io/', corresponding: true },
    { name: 'Chenxu Wang', affiliations: [1], url: 'https://gr.xjtu.edu.cn/cxwang/', corresponding: true },
  ],
  affiliations: [
    { id: 1, name: 'Xi’an Jiaotong University' },
    { id: 2, name: 'Zhongguancun Academy' },
  ],
  // A nonempty URL turns the matching Coming soon label into a working link.
  links: { paper: '', code: '', dataset: '' },
  // type: 'image' or 'video'; poster is optional and only used for videos.
  media: {
    teaser: { type: 'image', src: 'assets/images/teaser.webp', alt: 'CityLift input images and generated urban scenes' },
    editing: { type: 'video', src: '', poster: '', alt: 'Editing individual generated buildings' },
    composition: { type: 'video', src: '', poster: '', alt: 'Composing generated urban scene blocks' },
    method: { type: 'image', src: 'assets/images/method.webp', alt: 'The three stages of the CityLift framework' },
    dataset: { type: 'image', src: '', alt: 'Examples from the CityLift-5K dataset' },
  },
  scenes: [
    { id: 'scene-01', label: 'Scene 01', input: 'assets/images/scene_rgb_4877.webp', model: 'assets/models/citylift_5k_4877-compressed.glb', poster: '', video: '', modelSizeMB: 9.53, upAxis: 'y', instanceNodes: [] },
    { id: 'scene-02', label: 'Scene 02', input: 'assets/images/scene_rgb_4765.webp', model: 'assets/models/citylift_5k_4765-compressed.glb', poster: '', video: '', modelSizeMB: 16.6, upAxis: 'y', instanceNodes: [] },
    { id: 'scene-03', label: 'Scene 03', input: 'assets/images/scene_rgb_4865.webp', model: 'assets/models/citylift_5k_4865-compressed.glb', poster: '', video: '', modelSizeMB: 5.5, upAxis: 'y', instanceNodes: [] },
    { id: 'scene-04', label: 'Scene 04', input: 'assets/images/scene_rgb_4998.webp', model: 'assets/models/citylift_5k_4998-compressed.glb', poster: '', video: '', modelSizeMB: 11.4, upAxis: 'y', instanceNodes: [] },
  ],
  // Add the final BibTeX entry when the paper is available. No citation is fabricated.
  citation: '',
};
