# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Luopan (罗盘) is a Feng Shui compass PWA built with React, TypeScript, and Vite. Users can:
- Select a photo from their device
- Overlay a traditional Chinese feng shui compass (with 24 mountains, 8 trigrams, 10 heavenly stems, 12 earthly branches)
- Adjust photo rotation/scale and compass position/rotation/scale/opacity
- Export the composed image as PNG

## Common Commands

```bash
# Start development server
npm run dev

# Build for production (runs TypeScript compiler then Vite build)
npm run build

# Run ESLint
npm run lint

# Preview production build locally
npm run preview
```

## Architecture

### Tech Stack
- React 19 + TypeScript 5 with strict settings
- Vite 8 with `@vitejs/plugin-react` (uses Oxc)
- Tailwind CSS v4 via `@tailwindcss/vite` plugin (NOT PostCSS)
- `react-zoom-pan-pinch` for zoom/pan functionality around the photo
- `lucide-react` for icons
- `vite-plugin-pwa` for PWA capabilities

### State Management
All application state lives in `App.tsx`:
- Photo state: `photo` (data URL), `photoSize`, `photoRotation`, `photoScale`
- Compass state: `compassX`, `compassY`, `compassRotation`, `compassScale`, `compassOpacity`
- Zoom state: `zoomScale` (from TransformWrapper)

State is passed down to components; changes flow back via callback props.

### Component Structure

**App.tsx**: Main container. Manages all state, renders two modes:
- Photo picker view (when no photo selected)
- Editor view with TransformWrapper (zoom/pan), photo layer, compass overlay, and Controls

**Compass.tsx**: Renders the feng shui compass as an SVG (400x400). Contains:
- 19 concentric rings
- 360 tick marks (main every 15°, sub every 5°)
- 8 trigrams (八卦) at outer positions
- 24 mountains (二十四山)
- 10 heavenly stems (天干)
- 12 earthly branches (地支)
- Central pool (天池) with red/black needle

**Controls.tsx**: Bottom panel with sliders for adjusting photo and compass parameters. Uses `env(safe-area-inset-bottom)` for iOS notch compatibility.

**PhotoPicker.tsx**: Hidden file input triggered by button. Reads selected image as data URL and extracts natural dimensions.

### Custom Hooks

**useCompassDrag.ts**: Handles pointer-based dragging of the compass overlay. Accounts for `zoomScale` when calculating movement deltas.

### Utils

**exportImage.ts**: Canvas-based export that composites:
1. Photo with rotation and scale applied
2. Compass SVG with position, rotation, scale, and opacity applied

Returns a PNG data URL for download.

### Styling Notes

- Tailwind CSS v4 with Vite plugin (configured in `vite.config.ts`, not `postcss.config.js`)
- iOS safe area insets used: `pt-[env(safe-area-inset-top)]`, `pb-[env(safe-area-inset-bottom)]`
- `touch-none` and `cursor-move` on compass for draggable interaction
- Dark theme with amber accent colors

### TypeScript Configuration

Uses project references (`tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`):
- `tsconfig.app.json`: ES2023, DOM libs, bundler module resolution, strict unused locals/parameters
- `tsconfig.node.json`: Config for Vite config and other Node scripts

### PWA Configuration

Configured in `vite.config.ts` via `VitePWA`:
- Auto-update service worker
- Manifest with Chinese name "罗盘 PWA"
- Portrait orientation, standalone display
- Icons: 192x192 and 512x512 PNG
- Theme/background color: #1a1a1a
