import React from 'react';
import PublicPageLayout from '../components/public/PublicPageLayout';
import '../styles/about.module.css';

const page = {
  eyebrow: 'About',

  icon: 'plan',

  seoTitle: 'About Notes Cafe | Premium UPSC Preparation Platform',

  metaDescription:
    'Learn about Notes Cafe, our mission, team and technology behind a modern preparation platform for UPSC aspirants.',
};

const founders = [
  {
    name: 'Founder Name',
    role: 'Founder & CEO',
    image: '/images/team/founder.jpg',
    description:
      'Visionary behind Notes Cafe, focused on building a better learning experience for aspirants.',
  },
  {
    name: 'Co-Founder Name',
    role: 'Co-Founder',
    image: '/images/team/co-founder.jpg',
    description:
      'Helping shape the product, strategy and long-term direction of Notes Cafe.',
  },
  {
    name: 'Co-Founder Name',
    role: 'Co-Founder',
    image: '/images/team/co-founder-2.jpg',
    description:
      'Focused on content, community and creating useful resources for serious learners.',
  },
];

const technologyTeam = [
  {
    name: 'CTO Name',
    role: 'CTO',
    image: '/images/team/cto.jpg',
    description:
      'Leads engineering, technology architecture and the overall technical direction.',
  },
  {
    name: 'CTO Name',
    role: 'CTO — Platform',
    image: '/images/team/cto-platform.jpg',
    description:
      'Focused on scalable systems, platform reliability and product engineering.',
  },
  {
    name: 'CTO Name',
    role: 'CTO — Data & AI',
    image: '/images/team/cto-ai.jpg',
    description:
      'Building data and AI experiences to make learning and discovery smarter.',
  },
];

const timeline = [
  {
    number: '01',
    year: 'The Beginning',
    title: 'The idea',
    description:
      'Notes Cafe started with a simple belief — quality preparation resources should be easier to discover, understand and use.',
  },
  {
    number: '02',
    year: 'Early Growth',
    title: 'Building the foundation',
    description:
      'Study material, notes and preparation resources became the first building blocks of the platform.',
  },
  {
    number: '03',
    year: 'Expanding',
    title: 'More than notes',
    description:
      'Maps, government resources and planning tools expanded Notes Cafe into a broader preparation ecosystem.',
  },
  {
    number: '04',
    year: 'Today',
    title: 'Building together',
    description:
      'Notes Cafe continues to evolve around the needs of serious aspirants across India.',
  },
];

const values = [
  {
    icon: '01',
    title: 'Student First',
    description:
      'Everything starts with understanding what aspirants actually need.',
  },
  {
    icon: '02',
    title: 'Reliable Information',
    description:
      'Accuracy, credibility and trust are at the centre of every resource.',
  },
  {
    icon: '03',
    title: 'Simple & Effective',
    description:
      'Learning should feel organised, focused and easy to navigate.',
  },
  {
    icon: '04',
    title: 'Continuous Improvement',
    description:
      'We continuously improve the content, tools and experience.',
  },
  {
    icon: '05',
    title: 'Built for India',
    description:
      'Created with the needs of Indian aspirants at the centre.',
  },
];

const products = [
  {
    title: 'Courses',
    description: 'Structured courses designed for serious aspirants.',
    href: '/courses',
  },
  {
    title: 'Study Material',
    description: 'Notes, PDFs and curated learning resources.',
    href: '/study-material',
  },
  {
    title: 'Maps & Atlas',
    description: 'Detailed maps and geographical resources.',
    href: '/maps',
  },
  {
    title: 'Government',
    description: 'Schemes, policies and important government resources.',
    href: '/government',
  },
  {
    title: 'Planning Tools',
    description: 'Tools to organise and improve your preparation.',
    href: '/planning-tools',
  },
];

function TeamCard({ person }) {
  return (
    <article className="about-team-card">
      <div className="about-team-image">
        <img
          src={person.image}
          alt={person.name}
        />
      </div>

      <div className="about-team-content">
        <h3>{person.name}</h3>

        <div className="about-team-role">
          {person.role}
        </div>

        <p>{person.description}</p>

        <div className="about-socials">
          <a href="#" aria-label={`${person.name} LinkedIn`}>
            in
          </a>

          <a href="#" aria-label={`${person.name} X`}>
            X
          </a>

          <a href="#" aria-label={`Email ${person.name}`}>
            @
          </a>
        </div>
      </div>
    </article>
  );
}

export default function AboutPage() {
  return (
    <PublicPageLayout page={page}>
      <main className="about-page">

        {/* =========================================
            HERO
        ========================================= */}

        <section className="about-hero">
          <div className="about-container about-hero-inner">

            <div className="about-hero-copy">

              <div className="about-eyebrow">
                ABOUT NOTES CAFE
              </div>

              <h1>
                We’re building the
                <br />
                future of learning
                <br />
                for <span>aspirants.</span>
              </h1>

              <p>
                Notes Cafe is built to make preparation clearer,
                more organised and more trustworthy — bringing
                study material, maps, government resources and
                planning tools together in one place.
              </p>

              <div className="about-hero-stats">

                <div className="about-stat">
                  <strong>50K+</strong>
                  <span>Study Notes</span>
                </div>

                <div className="about-stat">
                  <strong>2000+</strong>
                  <span>Maps & Atlas</span>
                </div>

                <div className="about-stat">
                  <strong>15+</strong>
                  <span>Govt. Sections</span>
                </div>

                <div className="about-stat">
                  <strong>15+</strong>
                  <span>Planning Tools</span>
                </div>

              </div>
            </div>

            <div className="about-hero-art">

              <div className="about-dot-map" />

              <div className="about-books">

                <div className="about-plant">
                  🌿
                </div>

                <div className="about-book about-book-1">
                  INDIAN POLITY
                </div>

                <div className="about-book about-book-2">
                  INDIAN GEOGRAPHY
                </div>

                <div className="about-book about-book-3">
                  ENVIRONMENT
                </div>

                <div className="about-book about-book-4">
                  ECONOMY
                </div>

                <div className="about-cup">
                  N
                </div>

              </div>
            </div>

          </div>
        </section>


        {/* =========================================
            STORY
        ========================================= */}

        <section className="about-section">

          <div className="about-container">

            <div className="about-section-label">
              <span>01</span>
              <span>OUR STORY</span>
            </div>

            <div className="about-story-grid">

              <div className="about-story-copy">

                <h2>
                  Every great journey
                  <br />
                  starts with a <span>purpose.</span>
                </h2>

                <p>
                  Notes Cafe was born from a simple belief —
                  quality resources can change the way people
                  prepare.
                </p>

                <p>
                  We wanted to create a platform where aspirants
                  could discover useful resources without having
                  to navigate through dozens of disconnected
                  sources.
                </p>

                <p>
                  Today, Notes Cafe is growing into a complete
                  preparation ecosystem covering study material,
                  geography, government resources and planning
                  tools.
                </p>

              </div>


              <div className="about-timeline">

                {timeline.map((item, index) => (
                  <div
                    className="about-timeline-item"
                    key={item.number}
                  >

                    <div className="about-timeline-marker">

                      <span>
                        {item.number}
                      </span>

                      {index !== timeline.length - 1 && (
                        <div className="about-timeline-line" />
                      )}

                    </div>

                    <div className="about-timeline-content">

                      <span>
                        {item.year}
                      </span>

                      <h3>
                        {item.title}
                      </h3>

                      <p>
                        {item.description}
                      </p>

                    </div>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </section>


        {/* =========================================
            FOUNDERS
        ========================================= */}

        <section className="about-team-section">

          <div className="about-container">

            <div className="about-section-label">
              <span>02</span>
              <span>MEET THE FOUNDERS</span>
            </div>

            <div className="about-heading">

              <h2>
                The people behind
                <span> Notes Cafe.</span>
              </h2>

              <p>
                The people responsible for shaping the vision,
                culture and direction of Notes Cafe.
              </p>

            </div>

            <div className="about-team-grid">

              {founders.map((person) => (
                <TeamCard
                  person={person}
                  key={`${person.name}-${person.role}`}
                />
              ))}

            </div>

          </div>

        </section>


        {/* =========================================
            TECHNOLOGY TEAM
        ========================================= */}

        <section className="about-section about-technology">

          <div className="about-container">

            <div className="about-section-label">
              <span>03</span>
              <span>TECHNOLOGY LEADERSHIP</span>
            </div>

            <div className="about-heading">

              <h2>
                The technology
                <span> behind the platform.</span>
              </h2>

              <p>
                Our technology leadership builds the systems,
                infrastructure and experiences that power Notes Cafe.
              </p>

            </div>

            <div className="about-tech-grid">

              {technologyTeam.map((person) => (
                <TeamCard
                  person={person}
                  key={`${person.name}-${person.role}`}
                />
              ))}

            </div>

          </div>

        </section>


        {/* =========================================
            VALUES
        ========================================= */}

        <section className="about-section about-values">

          <div className="about-container">

            <div className="about-section-label">
              <span>04</span>
              <span>WHAT WE BELIEVE</span>
            </div>

            <div className="about-values-card">

              {values.map((value) => (
                <div
                  className="about-value"
                  key={value.title}
                >

                  <div className="about-value-number">
                    {value.icon}
                  </div>

                  <div>
                    <h3>
                      {value.title}
                    </h3>

                    <p>
                      {value.description}
                    </p>
                  </div>

                </div>
              ))}

            </div>

          </div>

        </section>


        {/* =========================================
            PRODUCTS
        ========================================= */}

        <section className="about-section about-products">

          <div className="about-container">

            <div className="about-section-label">
              <span>05</span>
              <span>WHAT WE'RE BUILDING</span>
            </div>

            <div className="about-products-grid">

              {products.map((product) => (
                <a
                  href={product.href}
                  className="about-product"
                  key={product.title}
                >

                  <div className="about-product-icon">
                    +
                  </div>

                  <h3>
                    {product.title}
                  </h3>

                  <p>
                    {product.description}
                  </p>

                  <span className="about-product-arrow">
                    →
                  </span>

                </a>
              ))}

            </div>

          </div>

        </section>


        {/* =========================================
            CTA
        ========================================= */}

        <section className="about-cta-section">

          <div className="about-container">

            <div className="about-cta">

              <div className="about-cta-decoration">
                📚
              </div>

              <div className="about-cta-content">

                <h2>
                  Built for aspirants.
                  <br />
                  Built with <span>purpose.</span>
                </h2>

                <p>
                  Explore Notes Cafe and discover a better way
                  to organise your preparation.
                </p>

              </div>

              <a
                href="/"
                className="about-cta-button"
              >
                Explore Notes Cafe
                <span>→</span>
              </a>

            </div>

          </div>

        </section>

      </main>
    </PublicPageLayout>
  );
}