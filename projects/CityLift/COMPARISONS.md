# Add a comparison scene

Edit `comparison-scenes.js` to add a scene to the thumbnail selector. Only the supplied `us_02` scene is currently published.

1. Put each new scene in `static/comparisons/<scene-id>/` with `input.png` and MP4 videos plus PNG posters named `sam3d`, `pixal3d`, `3dfixer`, `trellis2`, `scenegen`, and `citylift`.
2. Add an entry to `comparisonScenes`, for example:

```js
{ id: 'us_03', label: 'Scene 02', directory: 'us_03/', input: 'input.png', duration: 8 },
```

Keep IDs unique. `directory` is relative to `static/comparisons/`, and `input` is relative to the scene directory. All six videos in a scene should use the same duration, frame rate and orbit trajectory. `duration` is the placeholder time displayed while videos load; loaded metadata controls the actual timeline.

Clicking a thumbnail updates all six videos and posters, resets the timeline to the start and highlights the selected scene. A user's explicit pause is preserved when switching scenes. Keyboard users can Tab to a thumbnail and select it with Enter or Space. Additional thumbnails scroll horizontally when they exceed the available width.

When changing the scene list after deployment, bump the `comparison-scenes.js` query version in `comparisons.js` and the `comparisons.js` query version in `index.html` to refresh cached copies. Bump the CSS query version only when styles change. Commit the assets, scene list and version updates together so GitHub Pages publishes a complete scene.
