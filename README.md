# Planning Poker

A web-based Planning Poker application for agile teams to estimate task complexity using Fibonacci scoring. Built with Next.js 15, React 19, and TypeScript.

## Features

- **Anonymous Sessions**: Create and join sessions without signup
- **Fibonacci Scoring**: Standard 1, 2, 3, 5, 8, 13, 21 point scale
- **Real-time Collaboration**: Multiple participants can vote simultaneously
- **Session Management**: Create sessions with optional ticket details
- **Easy Sharing**: Copy session IDs and share links instantly
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/juanortegaslalom/planning-pocker.git
cd planning-pocker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Create a Session**: Click "Create New Session" and optionally add ticket details
2. **Share the Session**: Copy the session ID or share link with your team
3. **Join the Session**: Team members enter the session ID to join
4. **Vote**: Select a Fibonacci number to estimate task complexity  
5. **Reveal**: Session creator can reveal all votes to see results

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: In-memory session store
- **ID Generation**: nanoid for unique session IDs

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/sessions/      # API endpoints
│   ├── create-session/    # Session creation page
│   └── page.tsx          # Home page
├── components/            # Reusable UI components (future)
├── lib/                   # Business logic & utilities
│   ├── sessionStore.ts   # In-memory session management
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
    └── index.ts
```
