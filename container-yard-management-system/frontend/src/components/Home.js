import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';

// Image paths for slider
const sliderImages = [
  '/images/gpt1.png',
  '/images/gpt2.png',
  '/images/gpt3.png',
];

const Home = () => {
  // Sample container data for demonstration
  const featuredContainers = [
    {
      id: 'C1042',
      type: '40HQ',
      status: 'In Yard',
      location: 'Block A, Row 3, Slot 12',
      arrivalDate: '2025-04-20',
      departureDate: '2025-05-15',
      contents: 'Electronics',
      priority: 'high',
    },
    {
      id: 'C7589',
      type: '20GP',
      status: 'In Transit',
      location: 'En route to yard',
      arrivalDate: '2025-04-26',
      departureDate: '2025-05-10',
      contents: 'Automotive Parts',
      priority: 'medium',
    },
    {
      id: 'C2305',
      type: '40RF',
      status: 'In Yard',
      location: 'Block C, Row 1, Slot 4',
      arrivalDate: '2025-04-18',
      departureDate: '2025-04-29',
      contents: 'Perishable Goods',
      priority: 'urgent',
    },
  ];

  // Sample metrics for the stats section
  const metrics = [
    { number: '98.7%', label: 'Operational Efficiency' },
    { number: '45%', label: 'Cost Reduction' },
    { number: '2.5x', label: 'Throughput Increase' },
    { number: '99.9%', label: 'Location Accuracy' },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [truckPosition, setTruckPosition] = useState(window.innerWidth);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Truck animation in footer - reversed direction (right to left)
  useEffect(() => {
    const animateTruck = () => {
      setTruckPosition((prevPos) => {
        // Reset position when truck goes off-screen to the left
        if (prevPos < -150) {
          return window.innerWidth; // Start from right edge
        }
        return prevPos - 5; // Move 5px to the left (increased speed)
      });
    };

    const truckAnimation = setInterval(animateTruck, 40); // Faster interval for smoother animation
    return () => clearInterval(truckAnimation);
  }, []);

  return (
    <div className="app-container dockshift-theme">
      <Header />

      <div className="home-wrapper">
        {/* Main Container - Maintains consistent max-width */}
        <div
          className="container"
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '2rem',
          }}
        >
          {/* Image Slider Section - Restored */}
          <section
            style={{
              position: 'relative',
              height: '500px',
              width: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              marginBottom: '4rem',
            }}
          >
            {sliderImages.map((img, idx) => (
              <img
                key={img}
                src={img}
                alt={`DockShift Solution ${idx + 1}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: idx === currentSlide ? 1 : 0,
                  transition: 'opacity 0.8s ease-in-out',
                  zIndex: 1,
                }}
              />
            ))}

            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '2rem',
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
              }}
            >
              <h2
                style={{
                  color: '#fff',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                }}
              >
                Welcome to DockShift
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1.2rem',
                  maxWidth: '600px',
                  marginBottom: '1.5rem',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                }}
              >
                Your partner in efficient container yard management
              </p>
              <div>
                <Link
                  to="/register"
                  className="btn btn-danger btn-large"
                  style={{
                    background: 'var(--dockshift-primary)',
                    padding: '0.75rem 2rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    marginRight: '1rem',
                  }}
                >
                  Get Started
                </Link>
                <Link
                  to="/dashboard"
                  className="btn btn-outline"
                  style={{
                    background: 'transparent',
                    border: '2px solid white',
                    color: 'white',
                    padding: '0.75rem 2rem',
                  }}
                >
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Slider Navigation */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '0.5rem',
                zIndex: 3,
              }}
            >
              {sliderImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: 'none',
                    background:
                      idx === currentSlide
                        ? 'var(--dockshift-primary)'
                        : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </section>

          {/* Hero Section with DockShift Branding */}
          {/* <section
            className="brand-intro"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3rem',
              marginBottom: '5rem',
              padding: '2rem 0',
            }}
          >
            <div
              className="brand-logo"
              style={{
                flex: '0 0 400px',
              }}
            >
              <div
                style={{
                  width: '380px',
                  height: '380px',
                  margin: '0 auto',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 0 40px rgba(206, 44, 44, 0.6)',
                }}
              >
                <img
                  src="/images/Component 1.png"
                  alt="DockShift Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
            </div>
            
            <div className="brand-content" style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: '4rem',
                  fontWeight: 700,
                  color: 'var(--dockshift-secondary)',
                  marginBottom: '1.5rem',
                  letterSpacing: '1px',
                }}
              >
                DockShift
              </h1>
              <p
                style={{
                  fontSize: '1.5rem',
                  color: 'var(--dockshift-text)',
                  marginBottom: '2.5rem',
                  lineHeight: 1.6,
                  maxWidth: '600px',
                }}
              >
                Revolutionary Container Yard Management System designed for the
                modern logistics industry with cutting-edge features.
              </p>
              <Link
                to="/register"
                className="btn btn-danger btn-large btn-icon"
                style={{
                  backgroundColor: '#e63946',
                  padding: '0.85rem 2.5rem',
                  fontWeight: 600,
                  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                  fontSize: '1.1rem',
                }}
              >
                Start Your Journey
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginLeft: '0.5rem' }}
                >
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 5L19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </section> */}
        </div>

        {/* Problem Statement - Full Width with Container Inside */}
        <section className="problem-statement" style={{ padding: '5rem 0' }}>
          <div
            className="container"
            style={{
              maxWidth: '1320px',
              margin: '0 auto',
              padding: '0 2rem',
            }}
          >
            <div className="section-header" style={{ marginBottom: '3rem' }}>
              <h2
                style={{
                  color: 'var(--dockshift-secondary)',
                  fontSize: '2.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                }}
              >
                The Challenge
              </h2>
            </div>

            <div
              className="problem-content"
              style={{
                background: 'var(--dockshift-card-bg)',
                borderRadius: '16px',
                padding: '3rem',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.35)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '5px',
                  height: '100%',
                  background: 'var(--dockshift-primary)',
                }}
              ></div>

              <p
                className="problem-text"
                style={{
                  color: 'var(--dockshift-text)',
                  fontSize: '1.25rem',
                  lineHeight: 1.8,
                  textAlign: 'justify',
                }}
              >
                Container yards are critical to global logistics operations,
                managing container storage and transfer across transportation
                modes. However, traditional methods—often manual or minimally
                automated—create inefficiencies that increase costs and delay
                operations. The solution should include real-time tracking,
                smart stacking, optimized traffic management, and predictive
                analytics to enhance yard operations and maximize efficiency.
              </p>
            </div>
          </div>
        </section>

        {/* Container Management Section */}
        <section
          className="container-management"
          style={{
            padding: '6rem 0',
            background: 'var(--dockshift-bg-light)',
          }}
        >
          <div
            className="container"
            style={{
              maxWidth: '1320px',
              margin: '0 auto',
              padding: '0 2rem',
            }}
          >
            <div className="section-header" style={{ marginBottom: '3.5rem' }}>
              <h2
                style={{
                  color: 'var(--dockshift-secondary)',
                  fontSize: '2.5rem',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}
              >
                Container Management
              </h2>
              <p
                style={{
                  color: 'var(--dockshift-text)',
                  fontSize: '1.25rem',
                  maxWidth: '700px',
                  margin: '0 auto',
                  textAlign: 'center',
                }}
              >
                Monitor and manage every container with detailed tracking and
                status information
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: '2.5rem',
                marginBottom: '3rem',
              }}
            >
              {featuredContainers.map((container) => (
                <div
                  key={container.id}
                  className={`container-card priority-${container.priority}`}
                  style={{
                    background: 'var(--dockshift-card-bg)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                    borderLeft: '5px solid var(--dockshift-primary)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--dockshift-border)',
                    }}
                  >
                    <h3
                      style={{
                        color: 'var(--dockshift-primary)',
                        fontSize: '1.6rem',
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      {container.id}
                    </h3>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        background:
                          container.status === 'In Yard'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(234, 179, 8, 0.2)',
                        color:
                          container.status === 'In Yard'
                            ? '#10b981'
                            : '#eab308',
                      }}
                    >
                      {container.status}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: '1.75rem',
                      flex: 1,
                    }}
                  >
                    {[
                      { label: 'Type', value: container.type },
                      { label: 'Location', value: container.location },
                      {
                        label: 'Arrival',
                        value: new Date(
                          container.arrivalDate
                        ).toLocaleDateString(),
                      },
                      {
                        label: 'Departure',
                        value: new Date(
                          container.departureDate
                        ).toLocaleDateString(),
                      },
                      { label: 'Contents', value: container.contents },
                    ].map((detail, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '1rem',
                          padding: '0.5rem 0',
                          borderBottom:
                            idx < 4
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : 'none',
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--dockshift-text-muted)',
                            fontWeight: 500,
                          }}
                        >
                          {detail.label}:
                        </span>
                        <span
                          style={{
                            color: 'var(--dockshift-text)',
                            fontWeight: 600,
                          }}
                        >
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      padding: '1.5rem',
                      background: 'rgba(0, 0, 0, 0.15)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--dockshift-border)',
                    }}
                  >
                    <button
                      className="btn"
                      style={{
                        background: 'var(--dockshift-primary)',
                        color: 'white',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '4px',
                        fontWeight: 500,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                        flex: '1 0 auto',
                        marginRight: '0.75rem',
                      }}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--dockshift-primary)',
                        color: 'var(--dockshift-primary)',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '4px',
                        fontWeight: 500,
                        flex: '1 0 auto',
                      }}
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '2rem',
              }}
            >
              <Link
                to="/containers"
                style={{
                  backgroundColor: 'var(--dockshift-primary)',
                  color: 'white',
                  padding: '0.85rem 2.5rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                  fontSize: '1.1rem',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow =
                    '0 10px 20px rgba(0, 0, 0, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 6px 15px rgba(0, 0, 0, 0.3)';
                }}
              >
                View All Containers
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section
          className="dockshift-solutions"
          style={{
            padding: '6rem 0',
            background: 'var(--dockshift-bg)',
            borderTop: '1px solid var(--dockshift-border)',
          }}
        >
          <div
            className="container"
            style={{
              maxWidth: '1320px',
              margin: '0 auto',
              padding: '0 2rem',
            }}
          >
            <div className="section-header" style={{ marginBottom: '4rem' }}>
              <h2
                style={{
                  color: 'var(--dockshift-secondary)',
                  fontSize: '2.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                }}
              >
                Our Solutions
              </h2>
              <p
                style={{
                  color: 'var(--dockshift-text)',
                  fontSize: '1.25rem',
                  maxWidth: '700px',
                  margin: '0 auto',
                  textAlign: 'center',
                }}
              >
                DockShift's comprehensive management platform brings visibility,
                efficiency, and automation to container yard operations
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
                gap: '2.5rem',
                maxWidth: '1200px',
                margin: '0 auto',
              }}
            >
              {[
                {
                  title: 'Real-time Tracking',
                  description:
                    'Know the exact location and status of every container at any time with GPS precision',
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  ),
                },
                {
                  title: 'Intelligent Stacking',
                  description:
                    'AI-powered container placement algorithms that optimize for accessibility and space',
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  ),
                },
                {
                  title: 'Automated Scheduling',
                  description:
                    'Seamless coordination of arrivals, departures and transfers with minimal manual intervention',
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="4" y="5" width="16" height="16" rx="2"></rect>
                      <line x="16" y="3" x2="16" y2="7"></line>
                      <line x="8" y="3" x2="8" y2="7"></line>
                      <line x="4" y="11" x2="20" y2="11"></line>
                      <line x="10" y="16" x2="14" y2="16"></line>
                    </svg>
                  ),
                },
                {
                  title: 'Traffic Optimization',
                  description:
                    'Smart routing and queuing systems that minimize congestion and maximize equipment utilization',
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  ),
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    alignItems: 'flex-start',
                    background: 'var(--dockshift-card-bg)',
                    padding: '2rem',
                    borderRadius: '12px',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(206, 44, 44, 0.15)',
                      color: 'var(--dockshift-primary)',
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {feature.icon}
                  </div>

                  <div>
                    <h3
                      style={{
                        color: 'var(--dockshift-secondary)',
                        margin: '0 0 0.75rem 0',
                        fontSize: '1.5rem',
                        fontWeight: 600,
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        color: 'var(--dockshift-text)',
                        margin: 0,
                        lineHeight: 1.6,
                        fontSize: '1.1rem',
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics Section */}
        <section
          style={{
            padding: '5rem 0',
            background: 'var(--dockshift-bg-light)',
            borderTop: '1px solid var(--dockshift-border)',
          }}
        >
          <div
            className="container"
            style={{
              maxWidth: '1320px',
              margin: '0 auto',
              padding: '0 2rem',
            }}
          >
            <div className="section-header" style={{ marginBottom: '3rem' }}>
              <h2
                style={{
                  color: 'var(--dockshift-secondary)',
                  fontSize: '2.5rem',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}
              >
                Performance Metrics
              </h2>
              <p
                style={{
                  color: 'var(--dockshift-text)',
                  fontSize: '1.25rem',
                  maxWidth: '700px',
                  margin: '0 auto',
                  textAlign: 'center',
                }}
              >
                Real results from our enterprise clients
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
              }}
            >
              {metrics.map((metric, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--dockshift-card-bg)',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: 'var(--dockshift-primary)',
                      opacity: 0.7,
                    }}
                  ></div>

                  <span
                    style={{
                      color: 'var(--dockshift-secondary)',
                      fontSize: '3rem',
                      fontWeight: 700,
                      marginBottom: '1rem',
                      display: 'block',
                    }}
                  >
                    {metric.number}
                  </span>

                  <span
                    style={{
                      color: 'var(--dockshift-text)',
                      fontSize: '1.2rem',
                    }}
                  >
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section
          style={{
            background:
              'linear-gradient(45deg, var(--dockshift-primary-dark), var(--dockshift-primary))',
            padding: '6rem 0',
            textAlign: 'center',
          }}
        >
          <div
            className="container"
            style={{
              maxWidth: '1320px',
              margin: '0 auto',
              padding: '0 2rem',
            }}
          >
            <h2
              style={{
                color: 'white',
                fontSize: '2.5rem',
                marginBottom: '1.5rem',
                maxWidth: '700px',
                margin: '0 auto 1.5rem',
              }}
            >
              Ready to Transform Your Container Yard?
            </h2>

            <p
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1.3rem',
                marginBottom: '2.5rem',
                maxWidth: '700px',
                margin: '0 auto 2.5rem',
              }}
            >
              Start optimizing your operations today with our advanced container
              management platform
            </p>

            <Link
              to="/register"
              style={{
                backgroundColor: 'white',
                color: 'var(--dockshift-primary)',
                padding: '1rem 3rem',
                borderRadius: '6px',
                fontWeight: 600,
                display: 'inline-block',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                fontSize: '1.2rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow =
                  '0 12px 25px rgba(0, 0, 0, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 8px 20px rgba(0, 0, 0, 0.3)';
              }}
            >
              Get Started Now
            </Link>

            <p
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                marginTop: '1.5rem',
              }}
            >
              No credit card required • Free 30-day trial
            </p>
          </div>
        </section>

        {/* Footer Section with Animated Truck - Direction Reversed */}
        <footer
          className="dockshift-footer"
          style={{
            padding: '5rem 0 2rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated Truck - Moving Right to Left */}
          <div
            style={{
              position: 'relative',
              height: '60px',
              width: '100%',
              marginBottom: '3rem',
            }}
          >
            {/* Road */}
          </div>

          {/* Footer Content */}
          <div
            className="container"
            style={{
              maxWidth: '1320px',
              margin: '0 auto',
              padding: '0 2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src="/images/Component 1.png"
                    alt="DockShift"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 700,
                      color: 'var(--dockshift-secondary)',
                    }}
                  >
                    DockShift
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: 'var(--dockshift-text)',
                    }}
                  >
                    Container Yard Management
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                }}
              >
                {[
                  {
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                      </svg>
                    ),
                    url: 'https://twitter.com',
                  },
                  {
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    ),
                    url: 'https://linkedin.com',
                  },
                  {
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                    ),
                    url: 'https://github.com',
                  },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--dockshift-bg-light)',
                      color: 'var(--dockshift-text-muted)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'var(--dockshift-primary)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor =
                        'var(--dockshift-bg-light)';
                      e.currentTarget.style.color =
                        'var(--dockshift-text-muted)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--dockshift-border)',
                margin: '2rem 0',
              }}
            ></div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <p
                style={{
                  margin: '0',
                  color: 'var(--dockshift-text-muted)',
                }}
              >
                &copy; {new Date().getFullYear()} DockShift. All rights
                reserved.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '2rem',
                }}
              >
                {['Privacy Policy', 'Terms of Service', 'Contact Us'].map(
                  (item, idx) => (
                    <a
                      key={idx}
                      href="#"
                      style={{
                        color: 'var(--dockshift-text-muted)',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color =
                          'var(--dockshift-primary)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color =
                          'var(--dockshift-text-muted)';
                      }}
                    >
                      {item}
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
