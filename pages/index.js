import { useState, useEffect } from "react";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      image: "https://defencedirecteducation.com/wp-content/uploads/2021/12/indian-military-academy-scaled-e1638344518595.jpg",
      heading: "Crack CDS with Smart Preparation",
      sub: "Smart notes, practice tests, study planning — built for results.",
      tag: "CDS • OTA • AFA"
    },
    {
      image: "https://wandersky.in/wp-content/uploads/2023/08/pxfuel-scaled.jpg",
      heading: "Join IMA — Serve with Honour",
      sub: "Lead with courage. Train for excellence. Wear the uniform with pride.",
      tag: "IMA, Dehradun"
    },
    {
      image: "https://c4.wallpaperflare.com/wallpaper/782/230/429/indian-air-force-sukhoi-su-30mki-aircraft-wallpaper-preview.jpg",
      heading: "Aim High. Fly Higher.",
      sub: "CDS strategy, sectional practice & performance analytics for AFA.",
      tag: "Air Force Academy"
    },
    {
      image: "https://images.unsplash.com/photo-1719553946838-1190abdeee92?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bmF2eSUyMHdhbGxwYXBlcnxlbnwwfHwwfHx8MA%3D%3D",
      heading: "Command the Seas",
      sub: "Crack CDS and join Indian Naval Academy, Ezhimala.",
      tag: "Indian Navy"
    }
  ];

  const features = [
    { icon: "📝", title: "Digital Notes", desc: "Create, search & download notes as PDF." },
    { icon: "📊", title: "Practice Tests", desc: "Topic-wise practice with detailed analytics." },
    { icon: "📚", title: "Resource Vault", desc: "CDS syllabus PDFs, PYQs, cheat-sheets & more." },
    { icon: "🎯", title: "SSB Practice", desc: "Comprehensive Services Selection Board preparation." },
    { icon: "📈", title: "Progress Tracking", desc: "Monitor your preparation with detailed analytics." },
    { icon: "💡", title: "Smart Revision", desc: "AI-powered spaced repetition system." }
  ];

  const testimonials = [
    {
      name: "Rahul Kumar",
      rank: "Lieutenant (IMA Graduate)",
      text: "Your AI notes + mocks combo helped me crack CDS on first attempt. The subject-wise preparation was perfect!"
    },
    {
      name: "Priya Sharma",
      rank: "Flying Officer (AFA Graduate)",
      text: "The instant summaries and planner made CDS preparation so much easier. Highly recommend for Air Force aspirants!"
    },
    {
      name: "Arjun Singh",
      rank: "Sub Lieutenant (INA Graduate)",
      text: "Clean UI, powerful CDS-focused features, zero distractions. Best platform for naval academy preparation."
    }
  ];

  const branches = [
    {
      name: "Indian Military Academy (IMA)",
      location: "Dehradun, Uttarakhand",
      service: "Indian Army",
      subjects: "English + GK + Mathematics (100 marks each)",
      description: "Train to become an Army Officer and lead with honor"
    },
    {
      name: "Officers Training Academy (OTA)",
      location: "Chennai, Tamil Nadu",
      service: "Indian Army",
      subjects: "English + GK only (No Mathematics)",
      description: "Direct entry for graduates into Army commissioned ranks"
    },
    {
      name: "Indian Naval Academy (INA)",
      location: "Ezhimala, Kerala",
      service: "Indian Navy",
      subjects: "English + GK + Mathematics (100 marks each)",
      description: "Command the seas as a Naval Officer"
    },
    {
      name: "Air Force Academy (AFA)",
      location: "Dundigal, Hyderabad",
      service: "Indian Air Force",
      subjects: "English + GK + Mathematics (100 marks each)",
      description: "Soar high as an Air Force Officer"
    }
  ];

  // Auto-slide with pause capability
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet" />

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg sticky-top shadow-lg" style={{
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      }}>
        <div className="container">
          <a className="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2 text-black" href="#">
            <img
              src="/enlift-hub-logo.jpeg"
              alt="Enlift Hub Logo"
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'contain',
                borderRadius: '6px'
              }}
            />
            The Enlift Hub
          </a>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <i className="bi bi-list fs-2 text-black"></i>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto me-3">
              {['Features', 'About', 'CDS Info', 'Knowledge', 'Contact'].map((item) => (
                <li key={item} className="nav-item">
                  <a className="nav-link fw-semibold text-black px-3" href={`#${item.toLowerCase().replace(' ', '-')}`}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            <a href="/login" className="btn fw-bold px-4 py-2 rounded-pill border-2" style={{
              background: 'black',
              color: '#fbbf24',
              border: '2px solid black'
            }}>
              Login/Register
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section 
        className="position-relative overflow-hidden d-flex align-items-center justify-content-center" 
        style={{ minHeight: '600px', height: '92vh', maxHeight: '900px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div 
          className="position-absolute w-100 h-100"
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'all 2s ease-in-out'
          }}
          role="img"
          aria-label={slides[currentSlide].heading}
        />
        
        <div className="position-absolute w-100 h-100" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.85) 100%)'
        }} />

        <div className="position-relative text-center text-white px-4" style={{ maxWidth: '900px', zIndex: 10 }}>
          <span className="d-block text-warning opacity-75 text-uppercase fw-semibold mb-3" style={{
            fontSize: '0.9rem',
            letterSpacing: '0.2em'
          }}>
            {slides[currentSlide].tag}
          </span>
          
          <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: '1.2' }}>
            {slides[currentSlide].heading}
          </h1>
          
          <p className="fs-5 text-light mb-4" style={{ lineHeight: '1.6' }}>
            {slides[currentSlide].sub}
          </p>
          
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-4">
            <a href="/login" className="btn btn-lg px-5 py-3 fw-bold rounded-pill" style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: 'black',
              textDecoration: 'none',
              border: 'none'
            }}>
              🚀 Start CDS Preparation
            </a>
          </div>

          {/* Slide Indicators */}
          <div className="d-flex gap-2 justify-content-center">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className="border-0 rounded-pill"
                style={{
                  width: currentSlide === idx ? '40px' : '12px',
                  height: '12px',
                  background: currentSlide === idx ? '#fbbf24' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-5" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <div className="container">
          <h2 className="fs-3 fw-bold text-center mb-4 text-warning">
            Our Armed Forces Preparation Features
          </h2>
          <div className="row g-3">
            {features.slice(0, 5).map((feature, index) => (
              <div key={index} className="col-lg-2 col-md-4 col-sm-6">
                <div className="p-3 text-center h-100 rounded-3 hover-card" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}>
                  <div className="fs-3 mb-2">{feature.icon}</div>
                  <div className="text-warning fw-semibold mb-1" style={{ fontSize: '0.85rem' }}>{feature.title}</div>
                  <div className="text-light" style={{ fontSize: '0.7rem' }}>{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

     

      {/* ABOUT SECTION */}
      <section id="about" className="py-4 bg-white text-black">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-12">
              <h2 className="fs-3 fw-bold mb-3">Who We Are</h2>
              <p className="mb-3" style={{ fontSize: '0.95rem' }}>
                We are India's premier Armed Forces Written Preparation web application for defence aspirants to
                <strong> create digital notes, practice questions, and track progress</strong> — all in one place. We are <strong>not a coaching institute</strong>.
                Instead, we give you tools to learn faster, revise better, and stay consistent for Armed Forces success.
              </p>
              <ul className="list-unstyled mb-3">
                <li className="mb-2" style={{ fontSize: '0.85rem' }}>• Keep all your Armed Forces notes synced across devices — download as PDF anytime.</li>
                <li className="mb-2" style={{ fontSize: '0.85rem' }}>• Create organized notes with rich formatting and search functionality.</li>
                <li className="mb-2" style={{ fontSize: '0.85rem' }}>• Practice Armed Forces PYQs with detailed performance analytics.</li>
                <li className="mb-2" style={{ fontSize: '0.85rem' }}>• Track progress with topic mastery & revision reminders for English, GK & Maths.</li>
                <li className="mb-2" style={{ fontSize: '0.85rem' }}>• Built specifically for Armed Forces Written Preparation — focused, distraction-free study environment.</li>
              </ul>
              <div className="d-flex gap-3">
                <a href="/login" className="btn btn-warning px-4 py-2" style={{ fontSize: '0.9rem' }}>Start CDS Prep</a>
                <a href="#cds-info" className="btn btn-outline-dark px-4 py-2" style={{ fontSize: '0.9rem' }}>Explore CDS</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CDS INFO SECTION */}
      <section id="cds-info" className="py-4" style={{
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
      }}>
        <div className="container text-black">
          <h2 className="fs-3 fw-bold text-center mb-2">Master Armed Forces with Smart Preparation</h2>
          <p className="text-center mb-4" style={{ fontSize: '0.95rem' }}>Your gateway to Indian Army, Navy & Air Force through Combined Defence Services</p>
          
          <div className="bg-white rounded-3 shadow-lg overflow-hidden">
            <div className="p-3 text-center text-white" style={{
              background: 'linear-gradient(135deg, black 0%, #374151 100%)'
            }}>
              <div className="fs-4 fw-bold text-warning">CDS</div>
              <h3 className="fs-5 fw-bold mt-1">Combined Defence Services</h3>
              <p className="text-light mb-0" style={{ fontSize: '0.85rem' }}>One exam, multiple opportunities across all three Armed Forces</p>
            </div>

            <div className="p-3 p-md-4">
              {/* Exam Overview */}
              <div className="mb-3">
                <h4 className="fs-6 fw-bold mb-3">📋 Exam Overview</h4>
                <div className="row g-2">
                  {[
                    "🎯 Conducted twice yearly (February & November)",
                    "📝 Written exam followed by SSB Interview",
                    "⏰ 2 hours duration for each paper",
                    "🏆 Join prestigious defence academies",
                    "👨‍💼 Become a commissioned officer in Armed Forces"
                  ].map((item, idx) => (
                    <div key={idx} className="col-md-6 col-lg-4">
                      <div className="p-2 rounded" style={{ background: 'rgba(251, 191, 36, 0.25)', fontSize: '0.75rem' }}>
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academies */}
              <div className="mb-3">
                <h4 className="fs-6 fw-bold mb-3">🎯 Academies You Can Join</h4>
                <div className="row g-3">
                  {branches.map((branch, idx) => (
                    <div key={idx} className="col-lg-6">
                      <div className="p-3 rounded h-100" style={{
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                        border: '2px solid #fcd34d'
                      }}>
                        <h5 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{branch.name}</h5>
                        <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>{branch.location}</p>
                        <div className="badge text-warning fw-semibold mb-2" style={{ background: 'black', fontSize: '0.7rem' }}>
                          {branch.service}
                        </div>
                        <p className="mb-2" style={{ fontSize: '0.8rem' }}>{branch.description}</p>
                        <div className="bg-warning text-dark px-2 py-1 rounded fw-semibold" style={{ fontSize: '0.75rem' }}>
                          📚 {branch.subjects}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SSB Process */}
              <div className="mb-3">
                <h4 className="fs-6 fw-bold mb-3">🏅 SSB Selection Process</h4>
                <div className="p-3 bg-light rounded">
                  <div className="row g-2">
                    {[
                      "Stage 1: Officer Intelligence Rating (OIR) & Picture Perception",
                      "Stage 2: Psychological Tests, Group Testing & Personal Interview",
                      "Medical Examination & Final Merit List",
                      "5-day comprehensive assessment of leadership qualities"
                    ].map((step, idx) => (
                      <div key={idx} className="col-md-6">
                        <div className="d-flex align-items-start gap-2">
                          <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{
                            width: '24px',
                            height: '24px',
                            fontSize: '0.7rem',
                            flexShrink: 0
                          }}>
                            {idx + 1}
                          </div>
                          <span style={{ fontSize: '0.75rem' }}>{step}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <a href="/login" className="btn btn-dark px-4 py-2 rounded-pill fw-bold" style={{ fontSize: '0.9rem' }}>
                  🚀 Start CDS Preparation Now
                </a>
                <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
                  Digital notes • Practice tests • Study planning
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section id="knowledge" className="py-4 bg-white text-black">
        <div className="container">
          <h2 className="fs-3 fw-bold text-center mb-4">Armed Forces Knowledge Hub</h2>
          <div className="row g-3">
            {[
              {
                title: "CDS in 60 Days — Complete Roadmap",
                desc: "Subject-wise daily tasks, weekly targets, revision strategy & mock tests for IMA/INA/AFA/OTA."
              },
              {
                title: "SSB Interview Success Guide",
                desc: "Psychology tests, GTO tasks, PI preparation & what assessors look for in candidates."
              },
              {
                title: "CDS Mathematics Made Easy",
                desc: "Quick formulas, shortcuts & topic-wise practice for scoring high in Maths section."
              }
            ].map((blog, idx) => (
              <div key={idx} className="col-lg-4">
                <div className="p-3 h-100 rounded shadow-sm blog-card" style={{
                  background: '#fef3c7',
                  border: '2px solid #fcd34d',
                  transition: 'all 0.3s ease'
                }}>
                  <h3 className="fw-bold mb-2" style={{ fontSize: '0.95rem' }}>{blog.title}</h3>
                  <p className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>{blog.desc}</p>
                  <a href="#" className="fw-bold text-decoration-none d-inline-flex align-items-center gap-1" style={{ color: '#f59e0b', fontSize: '0.8rem' }}>
                    Read more <i className="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="py-3 text-center text-black" style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
      }}>
        <div className="container">
          <h3 className="fs-5 fw-bold mb-2">Ready to crack CDS with smart preparation?</h3>
          <p className="mb-3" style={{ fontSize: '0.9rem' }}>Create your free account and start your CDS journey today.</p>
          <a href="/login" className="btn btn-dark px-4 py-2 rounded-pill fw-bold" style={{ fontSize: '0.9rem' }}>Get Started Free</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="py-4 bg-dark text-white">
        <div className="container">
          <div className="row g-3">
            <div className="col-lg-3">
              <div className="text-warning fw-bold mb-2" style={{ fontSize: '0.95rem' }}>🚀 The Enlift Hub</div>
              <p className="text-light mb-0" style={{ fontSize: '0.75rem' }}>
                India's premier Armed Forces Written Preparation platform. Digital notes, practice tests, study planning — everything you need to crack CDS and join IMA, INA, AFA, or OTA.
              </p>
            </div>
            <div className="col-lg-3">
              <h4 className="text-warning fw-bold mb-2" style={{ fontSize: '0.9rem' }}>Product</h4>
              <ul className="list-unstyled">
                <li className="mb-1"><a href="#features" className="text-light text-decoration-none" style={{ fontSize: '0.75rem' }}>Features</a></li>
                <li className="mb-1"><a href="#knowledge" className="text-light text-decoration-none" style={{ fontSize: '0.75rem' }}>Knowledge Hub</a></li>
                <li className="mb-1"><a href="#cds-info" className="text-light text-decoration-none" style={{ fontSize: '0.75rem' }}>CDS Info</a></li>
                <li className="mb-1"><a href="#" className="text-light text-decoration-none" style={{ fontSize: '0.75rem' }}>Pricing</a></li>
              </ul>
            </div>
            <div className="col-lg-3">
              <h4 className="text-warning fw-bold mb-2" style={{ fontSize: '0.9rem' }}>Company</h4>
              <ul className="list-unstyled">
                <li className="mb-1"><a href="#about" className="text-light text-decoration-none" style={{ fontSize: '0.75rem' }}>About Us</a></li>
                <li className="mb-1"><a href="#" className="text-light text-decoration-none" style={{ fontSize: '0.75rem' }}>Careers</a></li>
                <li className="mb-1"><a href="#" className="text-light text-decoration-none" style={{ fontSize: '0.75rem' }}>Terms</a></li>
                <li className="mb-1"><a href="#" className="text-light text-decoration-none" style={{ fontSize: '0.75rem' }}>Privacy</a></li>
              </ul>
            </div>
            <div className="col-lg-3">
              <h4 className="text-warning fw-bold mb-2" style={{ fontSize: '0.9rem' }}>Contact</h4>
              <ul className="list-unstyled">
                <li className="text-light mb-1" style={{ fontSize: '0.75rem' }}>📧 support@cdsai.in</li>
                <li className="text-light mb-1" style={{ fontSize: '0.75rem' }}>📞 +91 98765 43210</li>
                <li className="text-light mb-1" style={{ fontSize: '0.75rem' }}>📍 Pune, Maharashtra, India</li>
                <li className="pt-2">
                  <a href="#" className="text-light me-3" style={{ fontSize: '0.85rem' }}>𝕏</a>
                  <a href="#" className="text-light me-3" style={{ fontSize: '0.85rem' }}>IG</a>
                  <a href="#" className="text-light" style={{ fontSize: '0.85rem' }}>YT</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-3 pt-3 border-top border-secondary text-center text-light" style={{ fontSize: '0.7rem' }}>
            © 2025 The Enlift Hub - Elevate Your Learning Journey. All rights reserved.
          </div>
        </div>
      </footer>

      <style jsx>{`
        .hover-card:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(251, 191, 36, 0.4) !important;
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.2);
        }

        .blog-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .btn:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        }

        .nav-link:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .display-3 {
            font-size: 2rem !important;
          }
          .display-5 {
            font-size: 1.8rem !important;
          }
        }

        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}