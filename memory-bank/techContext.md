# Technical Context: Eagle Zipper Extension

## Technology Stack

### Core Framework
- **React**: 18.2.0 - Modern React with hooks and concurrent features
- **TypeScript**: 5.0.2 - Type safety and enhanced developer experience
- **Vite**: 6.3.5 - Fast build tool with HMR support

### Styling & UI
- **TailwindCSS**: 3.3.3 - Utility-first CSS framework
- **DaisyUI**: 3.6.4 - Component library built on Tailwind
- **PostCSS**: 8.4.29 - CSS processing and optimization
- **Autoprefixer**: 10.4.15 - Browser compatibility

### Development Tools
- **ESLint**: 8.45.0 - Code linting and quality
- **TypeScript ESLint**: 6.0.0 - TypeScript-specific linting
- **React Plugins**: Hooks and refresh support

### Eagle Platform
- **Extension API**: Comprehensive Eagle.cool integration
- **Manifest Version**: 1.0.0
- **Platform**: Cross-platform (all)
- **Architecture**: Universal (all architectures)

## Development Environment

### Build Configuration
```json
{
  "scripts": {
    "dev": "tsc && vite build --watch",
    "build": "vite build",
    "lint": "eslint . --ext ts,tsx",
    "preview": "vite preview"
  }
}
```

### Package Management
- **PNPM**: Primary package manager (lock file present)
- **NPM**: Alternative option supported

### File Structure
```
src/
├── App.tsx              # Main application entry
├── main.tsx             # React DOM mounting
├── index.css            # Global styles
├── eagle.d.ts           # Eagle API type definitions
├── vite-env.d.ts        # Vite environment types
├── assets/              # Static assets
└── viewer/              # Archive viewer components (empty)
```

## Platform Integration

### Eagle Extension Manifest
- **ID**: `870e7d2e-a37a-4f67-997a-0b43f849217e`
- **File Associations**: ZIP, RAR, TAR, 7Z
- **Viewer Path**: `dist/index.html`
- **Dev Tools**: Enabled for development

### Internationalization
- **Supported Locales**: 8 languages
  - English (en)
  - Traditional Chinese (zh_TW)
  - Simplified Chinese (zh_CN)
  - Japanese (ja_JP)
  - Spanish (es_ES)
  - Russian (ru_RU)
  - German (de_DE)
  - Korean (ko_KR)

## Technical Constraints

### Eagle Platform Limitations
- Extension runs in sandboxed environment
- Limited file system access through Eagle API
- Must comply with Eagle's security model

### Archive Processing
- Client-side only processing
- Memory constraints for large archives
- Browser-based compression library limitations

### Performance Considerations
- Large archive handling
- Memory management for file previews
- Responsive UI during archive parsing

## Archive Processing Dependencies
- **adm-zip**: 0.5.16 - ZIP archive parsing and extraction
- **node-unrar-js**: 2.0.2 - RAR archive support with TypeScript types
- **7zip-min**: 1.4.5 - 7Z archive processing
- **Installation Method**: External modules manually installed in dist/node_modules post-build

## Build Process
```json
{
  "scripts": {
    "build": "vite build && npm run post-build",
    "post-build": "copy manifest.json dist\\ && cd dist && npm init -y && npm install node-unrar-js 7zip-min adm-zip --production && cd .. && npm run clean-sourcemaps",
    "clean-sourcemaps": "node scripts/clean-sourcemaps.js"
  }
}
```

## Build Output
- **Target**: `dist/` directory with embedded node_modules
- **Entry Point**: `dist/index.html`
- **Modules**: External dependencies installed locally in dist folder
- **Source Maps**: Cleaned to prevent Eagle compatibility issues
- **Assets**: Bundled CSS and JS files
- **Deployment**: Direct integration with Eagle