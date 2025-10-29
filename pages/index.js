// pages/index.js
'use client';

import Head from "next/head";
import { useState, useEffect } from "react";

export default function Home() {
  // State for hero slider and testimonials
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Hero slides data
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

  // Features data
  const features = [
    { icon: "📝", title: "Digital Notes", desc: "Create, search & download notes as PDF." },
    { icon: "📊", title: "Practice Tests", desc: "Topic-wise practice with detailed analytics." },
    { icon: "📚", title: "Resource Vault", desc: "CDS syllabus PDFs, PYQs, cheat-sheets & more." },
    { icon: "🎯", title: "SSB Practice", desc: "Comprehensive Services Selection Board preparation." },
    { icon: "📈", title: "Progress Tracking", desc: "Monitor your preparation with detailed analytics." }
  ];

  // Testimonials data
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

  // Branches data
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

  // Auto-slide effect for hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>The Enlift Hub – Elevate Your Learning Journey | Premium Education Platform</title>
        <meta name="description" content="India's premier education platform. Create digital notes, practice tests, and track progress for competitive exams and skill development." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet" />
      </Head>

      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg sticky-top" style={{
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div className="container">
          <a className="navbar-brand fw-bold fs-4 d-flex align-items-center" href="#" style={{ color: 'black' }}>
            <img src="/enlift-hub-logo.jpeg" alt="The Enlift Hub Logo" style={{ height: '40px', marginRight: '10px', borderRadius: '6px' }} />
            The Enlift Hub
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto me-3">
              <li className="nav-item"><a className="nav-link fw-semibold" href="#features" style={{ color: 'black' }}>Features</a></li>
              <li className="nav-item"><a className="nav-link fw-semibold" href="#about" style={{ color: 'black' }}>Who We Are</a></li>
              <li className="nav-item"><a className="nav-link fw-semibold" href="#cds" style={{ color: 'black' }}>CDS Info</a></li>
              <li className="nav-item"><a className="nav-link fw-semibold" href="#blogs" style={{ color: 'black' }}>Knowledge</a></li>
              <li className="nav-item"><a className="nav-link fw-semibold" href="#contact" style={{ color: 'black' }}>Contact</a></li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              <a href="/login" className="btn fw-bold px-3 py-2 rounded-3" style={{
                background: 'black',
                color: '#fbbf24',
                border: '2px solid black'
              }}>Login</a>
              <a href="/register" className="btn fw-bold px-3 py-2 rounded-3" style={{
                background: 'black',
                color: '#fbbf24'
              }}>Register</a>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="position-relative overflow-hidden d-flex align-items-center justify-content-center" style={{
        height: '92vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #000000 50%, #0f172a 100%)'
      }}>
        {/* Background Image */}
        <div 
          className="position-absolute w-100 h-100"
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'all 3s ease-in-out'
          }}
        ></div>
        
        {/* Overlay */}
        <div className="position-absolute w-100 h-100" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.9) 100%)'
        }}></div>

        {/* Content */}
        <div className="position-relative text-center text-white px-4" style={{ maxWidth: '800px', zIndex: 10 }}>
          <span className="d-block text-warning opacity-75 text-uppercase fw-semibold mb-3" style={{
            fontSize: '0.9rem',
            letterSpacing: '0.2em'
          }}>
            {slides[currentSlide].tag}
          </span>
          
          <h1 className="display-3 fw-black mb-4" style={{ lineHeight: '1.1' }}>
            {slides[currentSlide].heading}
          </h1>
          
          <p className="fs-4 text-light mb-5" style={{ lineHeight: '1.5' }}>
            {slides[currentSlide].sub}
          </p>
          
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <a href="/register" className="btn btn-lg px-4 py-3 fw-bold fs-5 rounded-pill d-inline-flex align-items-center gap-2" style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: 'black',
              textDecoration: 'none'
            }}>
              🚀 Start CDS Preparation
            </a>
            <a href="#features" className="btn btn-lg px-4 py-3 fw-bold fs-5 rounded-pill d-inline-flex align-items-center gap-2" style={{
              background: 'rgba(255, 255, 255, 0.9)',
              color: 'black',
              textDecoration: 'none'
            }}>
              ✨ See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-5" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <div className="container">
          <h2 className="display-5 fw-bold text-center mb-5 text-warning">
            Our CDS Preparation Features
          </h2>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-lg-2 col-md-4 col-sm-6">
                <div className="p-4 text-center h-100 rounded-4" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div className="fs-1 mb-3">{feature.icon}</div>
                  <div className="text-warning fw-bold mb-2">{feature.title}</div>
                  <div className="text-light small">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-6 bg-white text-black">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4">Who We Are</h2>
              <p className="fs-5 text-muted mb-4">
                We are India's premier CDS-focused web application for defence aspirants to
                <strong> create digital notes, practice questions, and track progress</strong> — all in one place. We are <strong>not a coaching institute</strong>.
                Instead, we give you tools to learn faster, revise better, and stay consistent for CDS success.
              </p>
              <ul className="list-unstyled">
                <li className="mb-3">• Keep all your CDS notes synced across devices — download as PDF anytime.</li>
                <li className="mb-3">• Create organized notes with rich formatting and search functionality.</li>
                <li className="mb-3">• Practice CDS PYQs with detailed performance analytics.</li>
                <li className="mb-3">• Track progress with topic mastery & revision reminders for English, GK & Maths.</li>
                <li className="mb-3">• Built specifically for CDS preparation — focused, distraction-free study environment.</li>
              </ul>
              <div className="d-flex gap-3 mt-4">
                <a href="/register" className="btn btn-warning btn-lg px-4">Start CDS Prep</a>
                <a href="#cds" className="btn btn-dark btn-lg px-4">Explore CDS</a>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="p-4 rounded-4" style={{ background: '#fef3c7', border: '2px solid #fcd34d' }}>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-4 bg-white rounded-3 text-center shadow-sm">
                      <div className="display-6 fw-bold text-warning">25k+</div>
                      <div className="small text-muted">CDS Notes Created</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-4 bg-white rounded-3 text-center shadow-sm">
                      <div className="display-6 fw-bold text-warning">2.5M</div>
                      <div className="small text-muted">CDS Questions Practiced</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-4 bg-white rounded-3 text-center shadow-sm">
                      <div className="display-6 fw-bold text-warning">89%</div>
                      <div className="small text-muted">CDS Success Rate</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-4 bg-white rounded-3 text-center shadow-sm">
                      <div className="display-6 fw-bold text-warning">24x7</div>
                      <div className="small text-muted">Learning Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CDS INFO SECTION */}
      <section id="cds" className="py-6" style={{
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
      }}>
        <div className="container text-black">
          <h2 className="display-5 fw-bold text-center mb-3">Master CDS with Smart Preparation</h2>
          <p className="text-center fs-5 mb-5 opacity-75">Your gateway to Indian Army, Navy & Air Force through Combined Defence Services</p>
          
          <div className="bg-white rounded-4 shadow-lg overflow-hidden mb-5">
            <div className="p-4 text-center text-white" style={{
              background: 'linear-gradient(135deg, black 0%, #374151 100%)'
            }}>
              <div className="fs-2 fw-bold text-warning">CDS</div>
              <h3 className="display-6 fw-bold mt-2">Combined Defence Services</h3>
              <p className="text-light mt-2">One exam, multiple opportunities across all three Armed Forces</p>
            </div>

            <div className="p-4">
              {/* Exam Overview */}
              <div className="mb-5">
                <h4 className="fs-4 fw-bold mb-4">📋 Exam Overview</h4>
                <div className="row g-3">
                  {[
                    "🎯 Conducted twice yearly (February & November)",
                    "📝 Written exam followed by SSB Interview",
                    "⏰ 2 hours duration for each paper",
                    "🏆 Join prestigious defence academies",
                    "👨‍💼 Become a commissioned officer in Armed Forces"
                  ].map((item, idx) => (
                    <div key={idx} className="col-md-6 col-lg-4">
                      <div className="p-3 rounded-3" style={{ background: 'rgba(251, 191, 36, 0.25)' }}>
                        <small>{item}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academies */}
              <div className="mb-5">
                <h4 className="fs-4 fw-bold mb-4">🎯 Academies You Can Join</h4>
                <div className="row g-4">
                  {branches.map((branch, idx) => (
                    <div key={idx} className="col-lg-6">
                      <div className="p-4 rounded-3" style={{
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                        border: '2px solid #fcd34d'
                      }}>
                        <h5 className="fw-bold">{branch.name}</h5>
                        <p className="small text-muted mb-2">{branch.location}</p>
                        <div className="badge text-warning fw-bold mb-3" style={{ background: 'black' }}>
                          {branch.service}
                        </div>
                        <p className="small mt-2">{branch.description}</p>
                        <div className="small bg-warning text-dark px-3 py-1 rounded fw-semibold">
                          📚 {branch.subjects}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SSB Process */}
              <div className="mb-5">
                <h4 className="fs-4 fw-bold mb-4">🏅 SSB Selection Process</h4>
                <div className="p-4 bg-light rounded-3">
                  <div className="row g-3">
                    {[
                      "Stage 1: Officer Intelligence Rating (OIR) & Picture Perception",
                      "Stage 2: Psychological Tests, Group Testing & Personal Interview",
                      "Medical Examination & Final Merit List",
                      "5-day comprehensive assessment of leadership qualities"
                    ].map((step, idx) => (
                      <div key={idx} className="col-md-6">
                        <div className="d-flex align-items-start gap-3">
                          <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{
                            width: '30px',
                            height: '30px',
                            fontSize: '0.8rem'
                          }}>
                            {idx + 1}
                          </div>
                          <span className="small">{step}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <a href="/register" className="btn btn-dark btn-lg px-5 py-3 rounded-pill fw-bold">
                  🚀 Start CDS Preparation Now
                </a>
                <p className="small text-muted mt-3">
                  Digital notes • Practice tests • Study planning
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-6 bg-black">
        <div className="container">
          <h2 className="display-5 fw-bold text-center mb-5 text-warning">CDS Success Stories</h2>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="p-5 text-center rounded-4" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.5s ease'
              }}>
                <div className="text-warning display-4 mb-4">⭐</div>
                <p className="fs-4 text-light fst-italic mb-4 lh-base">
                  "{testimonials[currentTestimonial].text}"
                </p>
                <div className="text-warning fw-bold fs-5">{testimonials[currentTestimonial].name}</div>
                <div className="text-muted">{testimonials[currentTestimonial].rank}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG SECTION */}
      <section id="blogs" className="py-6 bg-white text-black">
        <div className="container">
          <h2 className="display-5 fw-bold text-center mb-5">CDS Knowledge Hub</h2>
          <div className="row g-4">
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
                <div className="p-4 h-100 rounded-3 shadow-sm" style={{
                  background: '#fef3c7',
                  border: '2px solid #fcd34d',
                  transition: 'all 0.3s ease'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <h3 className="fw-bold fs-5">{blog.title}</h3>
                  <p className="small text-muted mt-2">{blog.desc}</p>
                  <a href="#" className="fw-bold text-decoration-none text-warning mt-3 d-inline-block">Read more →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="py-4 text-center text-black" style={{
        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
      }}>
        <div className="container">
          <h3 className="fs-2 fw-bold">Ready to crack CDS with smart preparation?</h3>
          <p className="opacity-75 mt-2 fs-5">Create your free account and start your CDS journey today.</p>
          <a href="/register" className="btn btn-dark btn-lg px-5 py-3 mt-3 rounded-pill fw-bold">Get Started Free</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="py-5 bg-black text-white">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3">
              <div className="text-warning fw-black fs-5 mb-3">🚀 The Enlift Hub</div>
              <p className="text-muted small">
                India's premier CDS preparation platform. Digital notes, practice tests, study planning — everything you need to crack CDS and join IMA, INA, AFA, or OTA.
              </p>
            </div>
            <div className="col-lg-3">
              <h4 className="text-warning fw-bold mb-3">Product</h4>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#features" className="text-muted text-decoration-none small">Features</a></li>
                <li className="mb-2"><a href="#blogs" className="text-muted text-decoration-none small">Knowledge Hub</a></li>
                <li className="mb-2"><a href="#cds" className="text-muted text-decoration-none small">CDS Info</a></li>
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none small">Pricing</a></li>
              </ul>
            </div>
            <div className="col-lg-3">
              <h4 className="text-warning fw-bold mb-3">Company</h4>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#about" className="text-muted text-decoration-none small">About Us</a></li>
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none small">Careers</a></li>
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none small">Terms</a></li>
                <li className="mb-2"><a href="#" className="text-muted text-decoration-none small">Privacy</a></li>
              </ul>
            </div>
            <div className="col-lg-3">
              <h4 className="text-warning fw-bold mb-3">Contact</h4>
              <ul className="list-unstyled">
                <li className="text-muted small mb-2">📧 support@cdsai.in</li>
                <li className="text-muted small mb-2">📞 +91 98765 43210</li>
                <li className="text-muted small mb-2">📍 Pune, Maharashtra, India</li>
                <li className="pt-2">
                  <a href="#" className="text-muted me-3">𝕏</a>
                  <a href="#" className="text-muted me-3">IG</a>
                  <a href="#" className="text-muted">YT</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-5 pt-4 border-top border-secondary text-center text-muted small">
            © 2025 The Enlift Hub - Elevate Your Learning Journey. All rights reserved.
          </div>
        </div>
      </footer>


      {/* Custom Styles */}
      <style jsx>{`
        .py-6 {
          padding-top: 4rem !important;
          padding-bottom: 4rem !important;
        }

        .fw-black {
          font-weight: 900 !important;
        }

        .navbar-custom .nav-link:hover {
          text-decoration: underline;
          transform: translateY(-1px);
          transition: all 0.3s ease;
        }

        .hero-content {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .btn:hover {
          transform: scale(1.05);
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .blog-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .footer-section a:hover {
          color: #fbbf24 !important;
          transition: color 0.3s ease;
        }

        .text-gradient {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .display-3 {
            font-size: 2.5rem !important;
          }
          
          .fs-4 {
            font-size: 1.1rem !important;
          }
          
          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }
        }

        /* Bootstrap overrides */
        .btn-warning {
          background-color: #fbbf24 !important;
          border-color: #fbbf24 !important;
          color: black !important;
        }

        .btn-warning:hover {
          background-color: #f59e0b !important;
          border-color: #f59e0b !important;
          color: black !important;
        }

        .text-warning {
          color: #fbbf24 !important;
        }

        .bg-warning {
          background-color: #fbbf24 !important;
        }

        .border-warning {
          border-color: #fbbf24 !important;
        }

        /* Additional animations */
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeIn 0.8s ease forwards;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Hero background transition */
        .hero-bg-transition {
          transition: background-image 3s ease-in-out;
        }

        /* Testimonial transition */
        .testimonial-fade {
          transition: opacity 0.5s ease-in-out;
        }

        /* Hover effects */
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        /* Chatbot animation */
        .chatbot-slide-in {
          animation: slideInUp 0.3s ease forwards;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile responsive text */
        @media (max-width: 576px) {
          .display-3 {
            font-size: 2rem !important;
          }
          
          .display-5 {
            font-size: 2rem !important;
          }
          
          .fs-4 {
            font-size: 1rem !important;
          }
          
          .fs-5 {
            font-size: 0.9rem !important;
          }
        }

        /* Navbar mobile */
        @media (max-width: 991px) {
          .navbar-collapse {
            background: rgba(251, 191, 36, 0.95);
            border-radius: 10px;
            margin-top: 10px;
            padding: 15px;
          }
        }

        /* Feature cards responsive */
        @media (max-width: 768px) {
          .feature-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }

        /* Stats grid mobile */
        @media (max-width: 576px) {
          .stats-grid .row {
            gap: 0.5rem;
          }
        }

        /* Branch cards mobile */
        @media (max-width: 992px) {
          .branch-card {
            margin-bottom: 1.5rem;
          }
        }

        /* Chatbot mobile */
        @media (max-width: 576px) {
          .chatbot-window {
            width: 300px !important;
            height: 400px !important;
          }
          
          .chatbot-float {
            right: 1rem !important;
            bottom: 1rem !important;
          }
        }

        /* Footer mobile */
        @media (max-width: 768px) {
          .footer-section .row {
            text-align: center;
          }
          
          .footer-section .col-lg-3 {
            margin-bottom: 2rem;
          }
        }

        /* Loading states */
        .loading {
          opacity: 0.6;
          pointer-events: none;
        }

        /* Accessibility improvements */
        .btn:focus,
        .nav-link:focus {
          outline: 2px solid #fbbf24;
          outline-offset: 2px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .text-muted {
            color: #666 !important;
          }
          
          .opacity-75 {
            opacity: 0.9 !important;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Print styles */
        @media print {
          .chatbot-float,
          .btn,
          .navbar {
            display: none !important;
          }
          
          .hero-section {
            height: auto !important;
            padding: 2rem 0 !important;
          }
          
          .bg-dark,
          .bg-black {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Bootstrap JS */}
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" defer></script>
    </>
  );
}