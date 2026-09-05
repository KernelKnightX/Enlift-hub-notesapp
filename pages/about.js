import Head from 'next/head';
import { Eye, Target, MapPin, Mail } from 'lucide-react';

const TEAM = [
  { role: 'Founder', name: 'Product & vision', initials: 'FN', tone: 'founder' },
  { role: 'CEO', name: 'Strategy & operations', initials: 'CEO', tone: 'ceo' },
  { role: 'CFO', name: 'Finance & partnerships', initials: 'CFO', tone: 'cfo' },
  { role: 'CTO', name: 'Engineering & platform', initials: 'CTO', tone: 'cto' },
];

export default function About() {
  return (
    <>
      <Head>
        <title>About Us | Notes Cafe</title>
        <meta
          name="description"
          content="Who we are, why we started Notes Cafe, our vision and mission — an editorial UPSC preparation platform built in India."
        />
      </Head>

      <main className="about-page">
        <header className="about-page__head">
          <div className="about-page__eyebrow">Company</div>
          <h1 className="about-page__title">About Notes Cafe</h1>
          <p className="about-page__lead">
            An independent editorial platform for civil services aspirants — structured prep, honest tools, no noise.
          </p>
        </header>

        <div className="about-story">
          <article className="about-block">
            <div className="about-block__label">Who we are</div>
            <h2 className="about-block__title">A small team building for serious aspirants</h2>
            <p className="about-block__text">
              Notes Cafe Editorial Private Limited is an ed-tech company based in India. We build study notes,
              current affairs, PYQ archives, mock tests, and planning tools — all in one calm workspace designed
              for long-form preparation, not quick dopamine hits.
            </p>
          </article>

          <article className="about-block">
            <div className="about-block__label">Why we started</div>
            <h2 className="about-block__title">Because beginners deserve a real starting point</h2>
            <p className="about-block__text">
              Most platforms assume you already know what to study, in what order, and when to add current affairs.
              We saw aspirants drowning in PDFs and syllabus dumps with no sequence. Notes Cafe started to answer
              one question first: &ldquo;I&apos;m new — what do I do this week?&rdquo;
            </p>
          </article>
        </div>

        <div className="about-vm">
          <article className="about-vm__card about-vm__card--vision">
            <div className="about-vm__icon">
              <Eye size={18} strokeWidth={1.6} />
            </div>
            <h2 className="about-block__title">Our vision</h2>
            <p className="about-block__text">
              Make rigorous UPSC preparation accessible, organised, and honest — so every aspirant in India can
              start with clarity instead of confusion, regardless of coaching or background.
            </p>
          </article>

          <article className="about-vm__card about-vm__card--mission">
            <div className="about-vm__icon">
              <Target size={18} strokeWidth={1.6} />
            </div>
            <h2 className="about-block__title">Our mission</h2>
            <p className="about-block__text">
              Ship tools that respect your time: a clear roadmap, editorial current affairs, ten years of PYQs,
              and mocks with real analytics — nothing paywalled at the fundamentals, nothing designed to addict.
            </p>
          </article>
        </div>

        <section className="about-team" aria-labelledby="about-team-title">
          <h2 id="about-team-title" className="about-section-title">Leadership</h2>
          <p className="about-section-sub">The team behind Notes Cafe</p>
          <div className="about-team__grid">
            {TEAM.map((person) => (
              <div key={person.role} className="about-team__card">
                <div className={`about-team__avatar about-team__avatar--${person.tone}`}>
                  {person.initials}
                </div>
                <div className="about-team__role">{person.role}</div>
                <div className="about-team__name">{person.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-contact" aria-labelledby="about-contact-title">
          <div>
            <h2 id="about-contact-title" className="about-section-title">Our address</h2>
            <div className="about-contact__company">Notes Cafe Editorial Private Limited</div>
            <address className="about-contact__lines">
              3rd Floor, Block B<br />
              Connaught Place, New Delhi — 110001<br />
              India
            </address>
          </div>
          <div className="about-contact__meta">
            <strong>Contact</strong>
            <p style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={14} strokeWidth={1.6} style={{ flexShrink: 0 }} />
              <a href="mailto:hello@notescafe.in">hello@notescafe.in</a>
            </p>
            <p style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <MapPin size={14} strokeWidth={1.6} style={{ flexShrink: 0, marginTop: 3 }} />
              <span>
                Independently built in India. Serving aspirants preparing for UPSC CSE, CAPF, CDS, IFoS, and ESE.
              </span>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
