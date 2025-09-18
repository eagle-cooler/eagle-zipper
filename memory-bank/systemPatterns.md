# System Patterns: Eagle Zipper Extension

## Architecture Overview
```
Eagle Extension Framework
├── React Application (src/App.tsx)
├── Archive Viewer Component (src/viewer/)
├── Eagle API Integration (src/eagle.d.ts)
└── Build System (Vite + TypeScript)
```

## Core Components

### 1. Extension Entry Point
- **Location**: `src/App.tsx`
- **Current State**: Template with basic React setup
- **Purpose**: Main application container and extension initialization

### 2. Archive Viewer
- **Location**: `src/viewer/` (currently empty)
- **Planned Structure**:
  - Archive browser component
  - File list renderer
  - Preview pane
  - Extraction utilities

### 3. Eagle Integration
- **API Surface**: Comprehensive Eagle API definitions in `eagle.d.ts`
- **Key Capabilities**:
  - File system access
  - UI integration
  - Event handling
  - Window management

## Design Patterns

### Component Architecture
- **Container/Presenter Pattern**: Separate data logic from UI rendering
- **Composition**: Build complex UI from smaller, reusable components
- **Hook-based State**: Use React hooks for state management

### Eagle Integration Patterns
- **Event-driven**: Respond to Eagle lifecycle events
- **API-first**: Leverage Eagle's native capabilities
- **Theme Awareness**: Adapt to Eagle's light/dark themes

## Key Technical Decisions

### Frontend Stack
- **React 18**: Modern hooks and concurrent features
- **TypeScript**: Type safety and better development experience
- **TailwindCSS + DaisyUI**: Consistent styling with Eagle's design system

### Build System
- **Vite**: Fast development builds and HMR
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing and optimization

### Extension Manifest
- **File Associations**: `"zip,rar,tar,7z"` in preview configuration
- **Viewer Path**: Points to built React application
- **Multi-language Support**: 8 language locales supported

## Implementation Approach

### Phase 1: Basic Viewer
1. Create archive content parser
2. Implement file tree display
3. Basic file information rendering

### Phase 2: Preview Integration
1. File preview capabilities
2. Eagle API integration
3. Theme synchronization

### Phase 3: Advanced Features
1. Search within archives
2. Selective extraction
3. Performance optimizations

## Critical Dependencies
- **Eagle API**: Core platform integration
- **Archive Parsing**: Client-side compression libraries
- **React Ecosystem**: Component lifecycle and state management