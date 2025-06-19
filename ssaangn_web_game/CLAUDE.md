# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Korean word guessing game (한글 단어 맞추기) built with React + TypeScript + Vite. Players guess 2-character Korean words with visual feedback using emoji hints based on Hangul character decomposition.

## Common Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

Note: There are no test scripts configured in package.json.

## Architecture

### Core Game Logic
- **Game State**: Managed with Zustand store (`src/store/gameStore.ts`)
- **Hangul Processing**: Korean character decomposition and comparison (`src/utils/hangulUtils.ts`, `src/utils/gameLogic.ts`)
- **Persistence**: Game state is encrypted and saved to localStorage using custom encryption utilities

### Component Structure
- **GameBoard**: 7x2 grid displaying guessed words and hints
- **VirtualKeyboard**: Korean character input interface
- **Game Store**: Central state management for game logic, word validation, and hint calculation

### Hint System
The game uses a sophisticated Korean character analysis system:
- 🥕 Perfect match (당연하죠)
- 🍄 Similar (비슷해요) - 2+ components match + first consonant matches
- 🧄 Many components (많을 거예요) - 2+ components match but first consonant doesn't
- 🍆 Has component (가지고 있어요) - exactly 1 component matches
- 🍌 Opposite position (반대로요) - components match in opposite character position
- 🍎 No match (사과해요)

### Key Technical Details
- **Hangul Decomposition**: Each Korean character is broken down into consonant, vowel, and optional final consonant
- **Word Dictionary**: Stored in `src/data/dictionary.ts` with difficulty levels and meanings
- **Encryption**: Game state is encrypted before localStorage storage for security
- **Responsive Design**: Uses CSS Grid and Flexbox with mobile-first approach

### Dependencies
- **UI Framework**: React 19 with Material-UI components and Emotion styling
- **Animation**: Framer Motion for smooth transitions
- **State Management**: Zustand for game state
- **Build Tool**: Vite with TypeScript support

## File Organization
- `src/components/` - React components organized by feature
- `src/store/` - Zustand store definitions
- `src/utils/` - Game logic, Hangul utilities, and encryption
- `src/types/` - TypeScript type definitions
- `src/data/` - Static game data (word dictionary)

## Development Notes
- Uses absolute imports from `src/`
- ESLint configured with React hooks and TypeScript rules
- Build outputs to `dist/` with relative paths for deployment
- Korean language support throughout with UTF-8 encoding