  What was built                                                                                                                                                                                                                                                                                                                                                                                    
  43 files across a complete Next.js 15 + TypeScript portfolio.                                                                                                                                   

  File structure

  F:/Projects/Portfolio/
  ├── app/
  │   ├── layout.tsx           # Root layout, SEO metadata, Inter font
  │   ├── page.tsx             # Main page — loading screen, terminal easter egg
  │   ├── globals.css          # CSS tokens (dark/light), animations, utility classes
  │   └── api/
  │       ├── contact/         # Email handler (nodemailer)
  │       ├── analytics/       # Simple page-view tracker
  │       └── projects/        # Cached project data API
  ├── components/
  │   ├── layout/              # Header (active section tracking) + Footer
  │   ├── sections/            # Hero, About, Experience, Projects, Publications, Contact
  │   ├── ui/                  # SectionTitle, Button, ProjectCard
  │   └── interactive/         # CustomCursor, ThemeToggle, Terminal, ParticleBackground
  ├── lib/constants.ts         # All CV data in one place
  ├── types/index.ts           # Shared TypeScript interfaces
  ├── Dockerfile + docker-compose.yml
  └── config files (tsconfig, tailwind, next.config, postcss, eslint)

  Features

  ┌─────────────────────┬──────────────────────────────────────────────────────────────┐
  │       Feature       │                        Implementation                        │
  ├─────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Particle hero       │ Canvas API with connected-graph animation                    │
  ├─────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Typewriter          │ State-machine typewriter cycling 4 roles                     │
  ├─────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Dark/light mode     │ next-themes, CSS custom properties, smooth transitions       │
  ├─────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Custom cursor       │ requestAnimationFrame lagged ring + instant dot              │
  ├─────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Terminal easter egg │ **Ctrl+\``** — command history, tab-complete, clear, exit`   │
  ├─────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Experience timeline │ Expandable cards with role-type colour coding                │
  ├─────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Skill bars          │ Animated progress bars per category with level dots          │
  ├─────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Project cards       │ Filter by category, expandable highlights, tech tags         │
  ├─────────────────────┼──────────────────────────────────────────────────────────────┤
  │ Contact form        │ /api/contact route with validation, sanitisation, nodemailer │
  ├─────────────────────┼──────────────────────────────────────────────────────────────┤
  │ SEO                 │ metadata, Open Graph, Twitter card, robots config            │
  └─────────────────────┴──────────────────────────────────────────────────────────────┘

  To get running

  # 1. Start dev server
  npm run dev        # http://localhost:3000

  # 2. Add a .env.local (copy .env.example) for the contact form
  # 3. Drop your files into /public:
  #    - cv-ml.pdf, cv-phd.pdf, og-image.png (1200×630), favicon.ico

  To update content

  Everything is in lib/constants.ts — projects, experience, skills, publications. Once you have GitHub links for your projects, add them to the liveUrl/githubUrl fields in the PROJECTS array    
  there.

  AWS deployment (two options)

  Option A — AWS Amplify (easiest):
  1. Push to GitHub
  2. Connect repo in Amplify Console → it auto-detects Next.js
  3. Set env vars in Amplify → Environment variables

  Option B — Docker on EC2/ECS:
  docker build -t hammad-portfolio .
  docker run -p 3000:3000 --env-file .env hammad-portfolio
  # Or use docker-compose up
  The output: "standalone" in next.config.js produces a self-contained Node server for both approaches.