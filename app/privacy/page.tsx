import type { Metadata } from "next";
import Link from "next/link";

import { CONTACT_EMAIL } from "@/lib/constants";
import { SITE_URL } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What this site records, why, and how to object. No cookies, no third-party trackers, no advertising.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

/**
 * Static. Nothing here depends on the request, and a privacy notice that
 * needed a server round trip would be its own small irony.
 */
export const dynamic = "force-static";

const UPDATED = "27 August 2026";

export default function PrivacyPage() {
  return (
    <main id="main" className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Privacy
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
        What this site records
      </h1>
      <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
        Short version: no cookies, no third-party trackers, no advertising, and nothing is sold or
        shared. The site counts visits and measures which pages get read, using a method that
        cannot follow anyone from one day to the next.
      </p>

      <Section title="Analytics">
        <P>
          Every page view records the path, the referring site, a two-letter country code, whether
          the device is a phone, tablet or desktop, how far down the page you scrolled, how long the
          page was in the foreground, and which links you clicked. This is recorded on my own
          server. Nothing is sent to anyone else.
        </P>
        <P>
          To count visitors without cookies, your IP address and browser user-agent are combined
          with a random secret that is generated fresh every day, hashed, and the result stored. The
          IP address and user-agent themselves are never written down. The daily secret is deleted
          after two days, which means the identifier for today cannot be linked to the identifier
          for yesterday, even by me. The practical effect: if you visit on Monday and again on
          Friday, you are counted as two different people, and there is no way to discover otherwise.
        </P>
        <P>
          Nothing is stored on your device. No cookie, no local storage. That is why there is no
          consent banner on this site: under the UK Privacy and Electronic Communications
          Regulations, the consent requirement is triggered by storing or reading information on
          your device, and this does neither.
        </P>
        <P>
          Traffic that identifies itself as a bot or link preview fetcher is discarded before
          anything is written.
        </P>
      </Section>

      <Section title="CV downloads">
        <P>
          Downloading a CV records which of the two CVs it was, the time, the referring page and
          your browser user-agent.
        </P>
      </Section>

      <Section title="The agent console">
        <P>
          If you open the chat console and ask it something, the question and the first 200
          characters of its answer are stored, along with a random id for that conversation. Please
          do not type anything into it you would not want kept. Your message is also sent to Groq,
          which runs the language model that answers it.
        </P>
      </Section>

      <Section title="The contact form">
        <P>
          The name, email address, subject and message you submit are emailed to me and stored. That
          is the whole point of the form, and it is kept until I no longer need it.
        </P>
      </Section>

      <Section title="How long things are kept">
        <List
          items={[
            "Individual analytics events and visit trails: 90 days, deleted automatically.",
            "Daily and per-page totals: kept indefinitely. These contain no identifiers of any kind.",
            "The daily hashing secret: deleted after two days.",
            "CV download records, agent conversations and contact messages: kept until no longer needed.",
          ]}
        />
      </Section>

      <Section title="Why I am allowed to do this">
        <P>
          For analytics, the lawful basis is legitimate interests: understanding whether anything on
          a personal portfolio is being read, using the least identifying method I could build. For
          the contact form, it is your own request to be contacted back. There is no profiling, no
          automated decision-making, and no advertising.
        </P>
      </Section>

      <Section title="Your rights, and how to object">
        <P>
          You can ask what is held about you, ask for it to be corrected or deleted, or object to
          the analytics entirely. Email{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[var(--accent)] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </P>
        <P>
          Be aware that the analytics data is genuinely not linkable back to you: there is no
          account, no cookie and no stored IP address, so in most cases I will have no way to find
          your records even if you ask. That is a deliberate design choice rather than an evasion.
        </P>
        <P>
          If your browser sends a Global Privacy Control or Do Not Track signal, the site records
          nothing at all for your visit. You can also block the request to <Code>/api/analytics</Code>{" "}
          and the site will work exactly as before.
        </P>
      </Section>

      <p className="mt-12 border-t border-[var(--border)] pt-6 font-mono text-[11px] text-[var(--text-muted)]">
        Last updated {UPDATED}.{" "}
        <Link
          href="/"
          className="text-[var(--accent)] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
        >
          Back to the site
        </Link>
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)]">
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-[var(--surface-elevated)] px-1.5 py-0.5 font-mono text-[12px] text-[var(--text-primary)]">
      {children}
    </code>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="border-l-2 border-[var(--border)] pl-3 text-sm leading-relaxed text-[var(--text-secondary)]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
