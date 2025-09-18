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

## Required Dependencies (Missing)
- Archive parsing libraries (JSZip, node-stream-zip, etc.)
- File type detection utilities
- Preview rendering components

## Build Output
- **Target**: `dist/` directory
- **Entry Point**: `dist/index.html`
- **Assets**: Bundled CSS and JS files
- **Deployment**: Direct integration with Eagle