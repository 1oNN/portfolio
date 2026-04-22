# ha. — Portfolio

Personal portfolio for Hammad Ahmad. Built with Next.js, TypeScript, and Tailwind CSS.

## Live
[hammadahmad.co.uk](https://hammadahmad.co.uk) 

## Features
- Dark/light theme toggle
- Bento grid project cards with hover-to-reveal architecture diagrams
- AI chat assistant (Groq API — Llama 3.1 8B)
- Contact form with email notifications
- CV download tracking
- Responsive design

## Tech Stack
- **Framework**: Next.js 14, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **AI Agent**: Groq API (Llama 3.1 8B Instant)
- **Hosting**: Vercel *(or AWS — update accordingly)*

## Getting Started
```bash
git clone https://github.com/1onn/portfolio.git
cd portfolio
npm install
npm run dev
```

## Environment Variables

Create `.env.local`:
```
GROQ_API_KEY=
AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SES_FROM_EMAIL=
```

> Never commit `.env.local`. See `.env.example` for reference.

## Project Structure
```
app/              → Pages and API routes
components/
  interactive/    → Cursor, starfield, theme toggle, chat agent
  layout/         → Header, footer
  sections/       → Hero, about, experience, projects, publications, contact
  ui/             → Buttons, cards, pipeline diagrams
hooks/            → Custom React hooks
lib/              → Constants, system prompt, utilities
types/            → TypeScript interfaces
public/cv/        → Downloadable CVs (3 versions)
```

## License
MIT
