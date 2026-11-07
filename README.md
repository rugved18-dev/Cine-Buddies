# CineBuddies

A movie night planning and recommendation platform designed to help friend groups match, vote, and decide on movies together.

---

## Monorepo Project Structure

```text
CineBuddies/
│
├── frontend/             # React + Vite frontend application (generated with Lovable)
│   ├── src/              # React components, pages, hooks, and routing
│   ├── public/           # Static web assets
│   ├── package.json      # Frontend dependencies and npm scripts
│   ├── vite.config.ts    # Vite configuration
│   └── README.md         # Detailed frontend documentation and specifications
│
├── backend/              # Java & Spring Boot backend service (planned)
│   └── README.md         # Backend documentation and roadmap
│
├── .gitignore            # Root-level Git ignore configuration
└── README.md             # Project overview and navigation
```

---

## Subprojects Overview

### 1. [Frontend](./Frontend)
- **Framework**: React 19, TanStack Start / Router, Vite
- **Styling**: Tailwind CSS v4, Radix UI primitives, Lucide icons
- **Origin**: Generated via [Lovable](https://lovable.dev)
- **Features**: Group lobbies, preference collection, movie cards & voting, group analysis, and recommendations.

To run the frontend:
```bash
cd Frontend
npm install
npm run dev
```

### 2. [Backend](./backend)
- **Language / Framework**: Java 17+, Spring Boot
- **Database**: PostgreSQL (planned)
- **Role**: RESTful API service for rooms, preferences, voting aggregation, and catalog recommendations.

---

## Getting Started

1. **Frontend Development**: Navigate to `Frontend/`, install packages with `npm install`, and run `npm run dev`.
2. **Backend Development**: Follow instructions in `backend/README.md` once backend scaffolding is initialized.

