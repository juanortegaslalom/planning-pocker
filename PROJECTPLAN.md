Goal:
Enable users to create and join sessions anonymously to estimate task complexity (Fibonacci scale), with session state management and reveal functionality.

Story 1 – Project Initialization
✅ Tasks:
make sure the project is ready to start development

Story 2 – Session Creation (Priority: High)
Business Value: Allows a user to create a planning poker session, generating a session ID for others to join.

✅ Tasks:
Create session model

Fields: sessionId, ticketName, ticketNumber, status (active/ended), createdAt

Store sessions in an in-memory store (e.g., Map) or lightweight DB (e.g., SQLite/Prisma)

API endpoint /api/sessions/create

POST → Accepts optional ticketName, ticketNumber

Generates unique sessionId

Returns session object

Frontend page: Create Session

Form with ticketName, ticketNumber

On submit → Calls API → Displays generated sessionId and share link

Routing for session page

app/session/[sessionId]/page.tsx to handle joining

Story 3 – Join Session Anonymously (Priority: High)
Business Value: Users can enter a session without signup, only providing a display name.

✅ Tasks:
Session join API /api/sessions/join

POST → Requires sessionId, displayName

Adds user to session’s participant list

Returns session state

Frontend Join Page

User inputs display name

On submit → Calls join API → Navigates to session room

Handle user state

Store userId in a cookie or session storage to track who voted

Story 4 – Voting (Fibonacci Complexity Score) (Priority: Medium)
Business Value: Participants can select a Fibonacci score for the ticket anonymously.

✅ Tasks:
Add voting API /api/sessions/vote

POST → Requires sessionId, userId, score

Stores vote in session’s participant object

Frontend UI for voting

Show Fibonacci cards: 1, 2, 3, 5, 8, 13, 21

Allow single vote per user (can change until reveal)

Realtime state updates

Use [Next.js Server Actions or WebSockets] to broadcast votes (without showing scores yet)

Show “voted” indicator per participant

Story 5 – Reveal and Final Result (Priority: Medium)
Business Value: Session admin can reveal votes and see the average/final complexity.

✅ Tasks:
Reveal API /api/sessions/reveal

POST → Admin-only action

Sets session status to revealed

Calculate final result

Show individual scores

Show average/consensus value

Frontend update

Add “Reveal” button visible only to session creator

Display results once revealed


Story 6 – Session Lifecycle Management (Priority: Low)
Business Value: Keep track of past sessions and allow viewing ended sessions.

✅ Tasks:
API to list sessions /api/sessions/list

Returns active and past sessions

Session end API /api/sessions/end

Marks session as ended

Frontend view

Simple page listing past sessions with results

Story 7 – Polish & UX Enhancements (Priority: Low)
Business Value: Improve usability and make the app look professional.

✅ Tasks:
Add header and basic navigation

Show participant list and vote status

Add copy-to-clipboard for sessionId link

Basic responsive design with Tailwind

Story 8 – Deployment (Priority: Medium)
Business Value: Make the app publicly accessible.

✅ Tasks:
Setup GitHub Actions for CI/CD

Deploy to Vercel or Netlify

Add environment variables for API secrets if needed

Suggested folder structure

planning-poker/
│
├── public/                     # Static assets (icons, images)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Main layout
│   │   ├── page.tsx             # Landing page (Create/Join session)
│   │   ├── create-session/      # Create session UI
│   │   │   └── page.tsx
│   │   ├── session/             # Dynamic session routes
│   │   │   └── [sessionId]/page.tsx
│   │   └── past-sessions/       # Optional listing of past sessions
│   │       └── page.tsx
│   │
│   ├── components/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── FibonacciCards.tsx
│   │   ├── ParticipantList.tsx
│   │   └── Navbar.tsx
│   │
│   ├── lib/                     # Business logic & utilities
│   │   ├── sessionStore.ts       # In-memory or DB session storage
│   │   ├── utils.ts              # Helper functions (e.g., ID generator)
│   │
│   ├── types/                   # TypeScript interfaces
│   │   └── index.ts
│   │
│   └── app/api/                 # API endpoints
│       └── sessions/
│           ├── create/route.ts
│           ├── join/route.ts
│           ├── vote/route.ts
│           ├── reveal/route.ts
│           ├── end/route.ts
│           └── list/route.ts
│
├── eslint.config.mjs
├── tsconfig.json
├── package.json
└── README.md
