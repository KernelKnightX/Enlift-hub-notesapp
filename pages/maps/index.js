// pages/maps/index.js

import Head from 'next/head';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  ArrowRight,
  Circle,
} from 'lucide-react';

import {
  SectionHeader,
  ResourceLayout,
} from '@/components/public/SharedComponents';

import {
  mapsQuickFacts,
  mapsTopics,
} from '@/data/maps';


const atlasTopics = mapsTopics;
const quickFacts = mapsQuickFacts;


export default function MapsLandingPage() {

  return (
    <>
      <Head>

        <title>
          UPSC Maps and Atlas Resources for Geography Preparation
        </title>

        <meta
          name="description"
          content="Explore UPSC maps and atlas resources covering India, world geography, rivers, mountains, parks, ports, and important locations for better revision."
        />

        <meta
          property="og:title"
          content="UPSC Maps and Atlas Resources for Geography Preparation"
        />

        <meta
          property="og:description"
          content="Explore UPSC maps and atlas resources covering India, world geography, rivers, mountains, parks, ports, and important locations for better revision."
        />

        <meta
          property="og:type"
          content="website"
        />

        <link
          rel="canonical"
          href="https://www.notescafe.in/maps"
        />

      </Head>


      <ResourceLayout
        eyebrow="Maps & Atlas"
        title="A modern atlas experience for geography preparation."
        description="Move from broad geography awareness to focused revision with a more visual and intuitive public resource hub."
        breadcrumbs={[
          {
            label: 'Maps & Atlas',
          },
        ]}
      >


        {/* =====================================================
            ATLAS HERO
        ====================================================== */}

        <section className="max-w-[1240px] mx-auto px-6 md:px-10 pb-8">

          <div
            className="rounded-[28px] border p-6 md:p-8"
            style={{
              background:
                'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 100%)',
              borderColor:
                'var(--color-border)',
            }}
          >

            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">


              {/* LEFT */}

              <div>

                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]"
                  style={{
                    borderColor:
                      'var(--color-border)',
                    background:
                      'var(--color-surface)',
                    color:
                      'var(--color-primary)',
                  }}
                >

                  <Sparkles
                    size={13}
                    strokeWidth={1.8}
                  />

                  Atlas experience

                </div>


                <h2 className="mt-4 font-serif text-[28px] md:text-[34px] leading-[1.06]">

                  Search, filter, and explore map-based topics with more confidence.

                </h2>


                <p
                  className="mt-3 text-[15px] leading-[1.75]"
                  style={{
                    color:
                      'var(--color-ink-muted)',
                  }}
                >

                  Explore geography through a visual collection of
                  maps, regions, locations, and UPSC-focused
                  information designed for faster revision.

                </p>

              </div>


              {/* RIGHT */}

              <div
                className="rounded-[24px] border p-5"
                style={{
                  borderColor:
                    'var(--color-border)',
                  background:
                    'rgba(255,255,255,0.82)',
                }}
              >

                <div
                  className="flex items-center gap-3 rounded-2xl border px-3 py-3"
                  style={{
                    borderColor:
                      'var(--color-border)',
                    background:
                      'var(--color-surface)',
                  }}
                >

                  <Search
                    size={15}
                    strokeWidth={1.8}
                    style={{
                      color:
                        'var(--color-ink-muted)',
                    }}
                  />

                  <span
                    className="text-[14px]"
                    style={{
                      color:
                        'var(--color-ink-muted)',
                    }}
                  >
                    Search rivers, parks, ranges...
                  </span>

                </div>


                <div className="mt-4 flex flex-wrap gap-2">

                  {quickFacts.map((item) => (

                    <span
                      key={item}
                      className="chip chip-primary"
                    >
                      {item}
                    </span>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            ATLAS TOPICS
        ====================================================== */}

        <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 md:py-12">

          <SectionHeader
            eyebrow="Atlas topics"
            title="Curated cards for geography and map-based learning."
            description="Each topic is designed to feel like part of a premium resource library rather than a set of disconnected pages."
          />


          <div className="mt-8 grid md:grid-cols-2 xl:grid-cols-4 gap-4">

            {atlasTopics.map((item) => {

              const Icon = item.icon;

              return (

                <Link
                  key={item.title}
                  href={item.href}
                  className="card card-hover p-6 h-full"
                >


                  {/* CARD HEADER */}

                  <div className="flex items-center justify-between">

                    <div
                      className="rounded-2xl p-2.5"
                      style={{
                        background:
                          'var(--color-primary-tint)',
                        color:
                          'var(--color-primary)',
                      }}
                    >

                      <Icon
                        size={17}
                        strokeWidth={1.8}
                      />

                    </div>


                    <span className="chip chip-primary">
                      {item.badge}
                    </span>

                  </div>


                  {/* TITLE */}

                  <h3 className="mt-5 font-serif text-[20px] leading-[1.12]">

                    {item.title}

                  </h3>


                  {/* SUBTITLE */}

                  <div
                    className="mt-1 text-[12px]"
                    style={{
                      color:
                        'var(--color-primary)',
                    }}
                  >

                    {item.subtitle}

                  </div>


                  {/* DESCRIPTION */}

                  <p
                    className="mt-3 text-[14px] leading-[1.7]"
                    style={{
                      color:
                        'var(--color-ink-muted)',
                    }}
                  >

                    {item.description}

                  </p>


                  {/* OPEN */}

                  <div
                    className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold"
                    style={{
                      color:
                        'var(--color-primary)',
                    }}
                  >

                    Explore maps

                    <ArrowRight size={14} />

                  </div>

                </Link>

              );

            })}

          </div>

        </section>


        {/* =====================================================
            QUICK FACTS
        ====================================================== */}

        <section className="max-w-[1240px] mx-auto px-6 md:px-10 py-8 md:py-12">

          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6">


            {/* LEFT */}

            <div className="card p-7 md:p-8">

              <div className="eyebrow">
                Quick facts
              </div>


              <h3 className="mt-3 font-serif text-[24px] leading-[1.12]">

                A more premium atlas experience for visual learners.

              </h3>


              <div className="mt-6 space-y-3">

                {[
                  'Large, clear topic cards',
                  'Helpful categories for fast browsing',
                  'Easy internal links to related geography resources',
                ].map((item) => (

                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >

                    <Circle
                      size={14}
                      strokeWidth={2.4}
                      style={{
                        color:
                          'var(--color-primary)',
                        marginTop: 4,
                      }}
                    />

                    <div
                      className="text-[14px] leading-[1.7]"
                      style={{
                        color:
                          'var(--color-ink-muted)',
                      }}
                    >

                      {item}

                    </div>

                  </div>

                ))}

              </div>

            </div>


            {/* RIGHT */}

            <div
              className="card p-7 md:p-8"
              style={{
                background:
                  'var(--color-surface-alt)',
              }}
            >

              <div className="eyebrow">
                Explore
              </div>


              <h3 className="mt-3 font-serif text-[24px] leading-[1.12]">

                Start with a map category and build your geography revision.

              </h3>


              <p
                className="mt-4 text-[14px] leading-[1.7]"
                style={{
                  color:
                    'var(--color-ink-muted)',
                }}
              >

                Browse the available UPSC map categories and
                open individual maps for detailed information,
                important locations, and quick revision facts.

              </p>


              <Link
                href="/maps/upsc-maps"
                className="btn btn-primary mt-6 inline-flex items-center gap-2"
              >

                Explore UPSC Maps

                <ArrowRight size={15} />

              </Link>

            </div>

          </div>

        </section>


      </ResourceLayout>

    </>

  );

}