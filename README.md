# ha. — Portfolio

Personal portfolio for Hammad Ahmad — AI/ML Engineer & Researcher. Built with Next.js 15 App Router, TypeScript, and Tailwind CSS.

## Live
[hammadahmad.dev](https://hammadahmad.dev)

## Features
- Dark/light theme toggle
- Bento grid project cards with architecture pipeline diagrams
- AI chat assistant (Groq API — Llama 3.1 8B Instant)
- Blog & case studies with admin panel (DynamoDB-backed)
- Contact form with AWS SES email delivery
- CV download tracking
- Responsive design, animated starfield, Ctrl+` terminal easter egg

## Tech Stack
- **Framework**: Next.js 15 (App Router), TypeScript 5.5
- **Styling**: Tailwind CSS, Framer Motion
- **AI Agent**: Groq API (Llama 3.1 8B Instant)
- **Email**: AWS SES
- **Database**: AWS DynamoDB (blog posts, contacts, agent logs)
- **Hosting**: AWS Amplify Hosting

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
ADMIN_PASSWORD=your-strong-password
SESSION_SECRET=at-least-32-random-characters

AWS_REGION=eu-west-2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SES_FROM_EMAIL=your-verified@email.com

DYNAMODB_BLOG_TABLE=portfolio-blog
DYNAMODB_CONTACTS_TABLE=portfolio-contacts
DYNAMODB_AGENT_TABLE=portfolio-agent-logs

GROQ_API_KEY=
NEXT_PUBLIC_SITE_URL=https://hammadahmad.dev
```

## AWS Setup

1. **DynamoDB tables** (partition key `id`, type String):
   - `portfolio-blog`
   - `portfolio-contacts`
   - `portfolio-agent-logs`

2. **SES**: verify `SES_FROM_EMAIL` in the AWS SES console

3. **IAM permissions** needed for credentials:
   - `ses:SendEmail` on the from-address resource
   - `dynamodb:PutItem`, `dynamodb:GetItem`, `dynamodb:UpdateItem`, `dynamodb:DeleteItem`, `dynamodb:Scan` on all three tables

## Deployment (AWS Amplify)

Connect the repo in the Amplify Console and set environment variables. The `amplify.yml` handles the build — Amplify auto-detects Next.js SSR.

## Project Structure
```
app/              → Pages and API routes
components/
  interactive/    → StarField, theme toggle, chat agent, terminal
  layout/         → Header, footer
  sections/       → Hero, About, Experience, Projects, Publications, Contact
  ui/             → SectionTitle, PipelineDiagram
lib/              → Constants, auth, blog-db, markdown, agent system prompt
types/            → TypeScript interfaces
public/cv/        → Downloadable CVs (add your PDFs here)
```

## Scripts
```bash
npm run dev          # local dev server
npm run build        # production build
npm run type-check   # TypeScript check
npm run lint         # ESLint
```

## License
MIT
