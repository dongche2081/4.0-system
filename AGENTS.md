# AI Management Capability Enhancement Assistant

## Project Overview

This is a React-based web application designed as a practical management consulting platform. It helps managers at all levels improve their leadership skills through AI-powered diagnostics, interactive simulations, expert case studies, and tactical recommendations.

The application adopts a battlefield command metaphor with Chinese military-themed UI copy to create an immersive learning experience for management scenarios.

## Technology Stack

- **Framework**: React 19 with TypeScript 5.8
- **Build Tool**: Vite 6.2
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4.1.14 with custom design tokens
- **AI Integration**: Google GenAI SDK using Gemini 3 Flash model
- **Animation**: Motion (Framer Motion successor)
- **Icons**: Lucide React
- **Charts**: Recharts

## Project Structure

```
project-root/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Root component with routing logic
│   ├── types.ts              # TypeScript type definitions
│   ├── data.ts               # Static data (topics, experts, scenarios)
│   ├── index.css             # Global styles with Tailwind v4 theme config
│   ├── components/           # React components
│   └── services/
│       └── gemini.ts         # Google Gemini AI API integration
├── index.html                # HTML entry
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies and scripts
└── .env.example              # Environment variable template
```

## Build and Development Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server on port 3000
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Type checking (tsc --noEmit)
npm run clean     # Clean build output
```

## Configuration

### Environment Variables

Create `.env.local` file based on `.env.example`:

```bash
GEMINI_API_KEY=your-api-key-here
APP_URL=http://localhost:3000
```

### Vite Configuration Notes

- HMR can be disabled via DISABLE_HMR=true environment variable
- This prevents flickering during agent edits in AI Studio
- Path alias `@/` maps to project root

## Core Application Modules

### 1. Ask - Home View
- Central search interface for management pain points
- Displays trending topics and personal pain points
- Expert leaderboard with ranking system

### 2. Practice - Simulation
- Interactive scenario-based training
- Multiple-choice decision making with impact metrics
- Categories: Talent Retention, Performance Management, Cross-department Communication

### 3. Chat - AI Consultation
- Deep diagnostic engine with multi-step questionnaire
- AI-powered analysis using Gemini 3 Flash
- Context-aware recommendations

### 4. History
- Archive of past consultations
- Persistent storage via localStorage

## Data Model

Key types from src/types.ts:
- ProfileContext: User profile with business stage, team status, leadership style
- Topic: Management topics with hot/top10 flags
- Expert: Expert profiles with points and stats
- Prescription: AI-generated recommendations

## State Persistence

Uses localStorage for:
- saodiseng_context - User profile
- saodiseng_user_stats - User stats and points
- management_history - Consultation history

## Code Style Guidelines

### TypeScript
- Use strict typing, avoid any
- Prefer interfaces over type aliases
- Use path alias `@/` for imports

### Component Patterns
- Functional components with hooks
- Props interfaces defined inline
- Use motion/react for animations

### CSS/Styling
- Tailwind CSS utility classes
- Custom CSS variables:
  --primary-blue: #1B3C59
  --wisdom-gold: #F2C94C (primary accent)
  --reality-red: #EB5757

### Naming Conventions
- Components: PascalCase
- Utilities/Hooks: camelCase
- Types/Interfaces: PascalCase

## AI Integration

Model: gemini-3-flash-preview
Primary Function: generateManagementFeedback() in src/services/gemini.ts

The AI acts as a seasoned management consultant providing root cause analysis, strategic directions, and memorable quotes.

## Security Considerations

1. API Keys: Injected at build time via environment variables
2. Local Storage: User data persists in browser
3. Authentication: Simulated login system (state-based)

## Deployment

Designed for Google AI Studio and Cloud Run:
1. AI Studio: Accessible at provided URL
2. Local: npm run dev on port 3000
3. Production: npm run build outputs to dist/
