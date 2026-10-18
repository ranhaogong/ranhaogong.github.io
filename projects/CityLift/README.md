# CityLift 项目主页

访问地址：**https://ranhaogong.github.io/CityLift/**

CityLift 项目主页源码位于 `ranhaogong/ranhaogong.github.io` 仓库的 `projects/CityLift/` 目录。页面使用 HTML / CSS / JavaScript，沿用个人主页的 Jekyll / GitHub Pages 发布流程；提交到 `master` 后自动更新。图片、视频和模型放在本目录的 `assets/` 下。

`index.html` 顶部的 `permalink: /CityLift/` 将页面发布到上述短地址，因此源码目录与访问地址不同。JS、CSS 和素材仍从 `/projects/CityLift/` 加载，不需要维护第二份页面。

## 最常修改的两个文件

- **`site-config.js`**：作者、单位、论文/代码/数据链接、图片、视频、场景 GLB、最终 BibTeX。
- **`index.html`**：项目标题、Abstract、方法介绍和数据集文字。

作者信息由 `site-config.js` 统一维护。正式发布论文前请核对完整作者顺序、单位和通讯作者。

## 上传素材

建议路径（名字可以改，只要与配置一致；路径区分大小写）。图片支持 PNG、JPG 和 WebP；上传后必须把实际文件路径填入相应配置，不会自动识别文件。路径直接从 `assets/` 开始，不需要加 `/CityLift/` 或 `/projects/CityLift/` 前缀。`app.js` 会相对于自身所在目录解析这些路径。

| 用途 | 建议路径 | 对应配置 |
| --- | --- | --- |
| 首页头图 | `assets/images/teaser.webp` | `media.teaser.src` |
| 方法图 | `assets/images/method.webp` | `media.method.src` |
| 数据集拼图 | `assets/images/dataset.webp` | `media.dataset.src` |
| 单体编辑视频 | `assets/videos/editing.mp4` | `media.editing.src` |
| 场景组装视频 | `assets/videos/composition.mp4` | `media.composition.src` |
| 第一个场景输入图 | `assets/images/scene-01.webp` | `scenes[0].input` |
| 第一个场景模型 | `assets/models/scene-01.glb` | `scenes[0].model` |
| 第一个场景封面 | `assets/images/scene-01-poster.webp` | `scenes[0].poster` |
| 第一个场景视频（可选） | `assets/videos/scene-01.mp4` | `scenes[0].video` |

例如，把模型和输入图上传后，将 `site-config.js` 中第一条场景改为：

```js
{
  id: 'scene-01',
  label: 'Scene 01',
  input: 'assets/images/scene-01.webp',
  model: 'assets/models/scene-01.glb',
  poster: 'assets/images/scene-01-poster.webp',
  video: '',
  modelSizeMB: 18.5, // 实际下载大小，仅展示给访客；不填可保持 null
  upAxis: 'y',
  instanceNodes: ['building_001', 'building_002', 'building_003'],
}
```

空字符串表示素材尚未发布，页面保留占位区，不请求不存在的文件。图片和视频出现加载错误时也会退回占位提示。可增加或删除 `scenes` 数组条目，缩略图列表会自动更新。只填 `input` 也可以先展示输入图。

`upAxis: 'y'` 适用于标准 glTF / GLB 导出，包括 Blender 默认 glTF 导出。仅在**文件坐标本身**仍为 Z-up 时使用 `'z'`，不要因为模型在 Blender 中以 Z 为竖直方向就直接改成 `'z'`。

## 单栋建筑选择

一个 GLB 包含完整场景，每栋建筑应保留为一个独立节点或父节点。建筑的窗户、墙体等子网格可以放在该建筑节点下面。

- 最可靠的方式：节点命名为 `building_001`、`building_002` 等，并在 `instanceNodes` 中列出这些**实际导出的节点名称**。
- 地面、道路等背景节点不要加入 `instanceNodes`。单栋查看时，未列入的背景仍保留。
- 不配置时，查看器会尝试展开场景的包装节点，用下面的子节点作为实例。复杂层级可能把墙体/材质分组当成建筑；遇到这种情况请显式填写 `instanceNodes`。
- 不要把所有建筑合并成一个不可分割的 Mesh；那样仍能旋转观看，但不能正确选择单栋。
- 不要把父节点和它的子节点同时列为两个实例。

查看器支持 Texture / Geometry / Instances、单栋选择、自动旋转和相机复位。灰模与实例颜色只改变网页显示材质，不改动模型文件。切换场景会释放旧场景的几何、材质、纹理和 WebGL 资源；离开可视区域时暂停绘制。

## 大场景只展示视频

如果不想公开 GLB，保持 `model: ''`，填写 `video` 和可选 `poster`。同一区域会变为视频播放器，3D 控件保持禁用。若同时填写 `model` 和 `video`，页面先显示加载 3D 的入口，并提供视频替代选项。

头图也可改用视频：

```js
teaser: {
  type: 'video',
  src: 'assets/videos/teaser.mp4',
  poster: 'assets/images/teaser.webp',
  alt: 'CityLift generation showcase',
},
```

视频默认不自动播放，以减少流量和移动端负担。推荐 MP4 / H.264 和清晰的封面。当前实现不包含拖动式多视角图片序列；该功能可以后续单独添加。

## 发布论文、代码和数据链接

```js
links: {
  paper: 'https://arxiv.org/abs/实际编号',
  code: 'https://github.com/你的账号/公开代码仓库',
  dataset: 'https://huggingface.co/datasets/你的账号/数据集',
},
```

只有填入真实链接的项目会从 `Coming soon` 自动变为可点击链接。不要把私有代码仓库当作已开放的代码链接。`citation` 留空时不显示引用区；填入正式 BibTeX 后，会自动出现引用和复制按钮。

若更改项目标题，请同时更新 `index.html` 的可见标题、`<title>`、description 和 Open Graph 信息。获得正式头图后，可以添加 `og:image` 元数据用于分享预览。

## 性能与发布说明

- 页面初始不加载 Three.js 或 GLB；访客点击 **Load 3D scene** 后才请求模型。
- Three.js 固定为 `0.170.0`，通过 jsDelivr 加载。Draco、Meshopt 和 KTX2 解码器使用对应版本。若 CDN 不可用，页面正文与占位仍然可访问，3D 区会提供重试入口。
- 可以把压缩后的、自包含的 `.glb` 放入 `assets/models/`。保持贴图嵌入 GLB 最省事。
- 模型也可放在支持 CORS 的 HTTPS 静态资源服务上，并在 `model` 中填写完整 URL。外链模型的服务必须允许从本站跨域读取。
- 关闭下载按钮不能保护公开静态 GLB。上传到此公开仓库的展示模型可以被获取；如不希望公开几何，请仅上传渲染视频/图片。
- 不要将几百 MB 的原始模型直接加入仓库。先制作适合网页的减面/压缩版本；普通 GitHub Git 文件上限为 100 MiB。Git LFS 并不能自动让 Pages 获得可用的模型文件。
- 保留 `projects/CityLift/index.html` 顶部的 Jekyll front matter（`layout: null` 和 `permalink: /CityLift/`），以确保短地址和独立页面样式正确。
- 个人主页仓库依赖 Jekyll，**不要在仓库根目录添加 `.nojekyll`**。
- GitHub Pages 沿用个人主页仓库的 **master / (root)** 发布设置。
- 旧 `/citylift/` 与 `/CityLift-Page/` 入口由仓库内的兼容页面跳转到 `/CityLift/`。

## 本地预览

在个人主页仓库根目录安装现有 Gemfile 的依赖后执行 `bundle exec jekyll serve`，然后打开 `http://localhost:4000/CityLift/`。Jekyll 会处理页面的 permalink。不要双击 HTML 通过 `file://` 打开，ES Modules 和模型加载需要 HTTP。

## 文件说明

| 文件 | 职责 |
| --- | --- |
| `index.html` | 页面语义结构、文案、SEO 和空素材占位 |
| `styles.css` | 桌面/手机布局与研究主页视觉样式 |
| `site-config.js` | 日常内容与素材配置 |
| `app.js` | 配置渲染、场景选择、加载入口、错误处理 |
| `viewer.js` | 按需加载的 Three.js 查看器与资源清理 |
| `favicon.svg` | 网站图标 |

视觉结构参考 3D-Fixer / MIDI 的学术项目主页；本目录页面与查看器代码为独立实现。页面底部保留参考链接。
