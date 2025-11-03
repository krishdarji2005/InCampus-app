import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaClock, 
  FaCheckCircle,
  FaArrowUp,
  FaChartLine
} from 'react-icons/fa';
import styles from './QuickStatistics.module.css';

// Throttle function for better performance
function throttle(func, delay) {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(139, 92, 246, 0.3)', title, subtitle }) => {
  const divRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const onMouseMove = useCallback(
    throttle((e) => {
      const card = e.currentTarget;
      const box = card.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      const centerX = box.width / 2;
      const centerY = box.height / 2;
      
      // Reduced tilt intensity for subtle effect
      const rotateX = (y - centerY) / 25; // Reduced from 10 to 25
      const rotateY = (centerX - x) / 25; // Reduced from 10 to 25

      setRotate({ x: rotateX, y: rotateY });

      // Set mouse position for spotlight effect
      divRef.current.style.setProperty('--mouse-x', `${x}px`);
      divRef.current.style.setProperty('--mouse-y', `${y}px`);
      divRef.current.style.setProperty('--spotlight-color', spotlightColor);
    }, 16),
    [spotlightColor]
  );

  const onMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  return (
    <div 
      ref={divRef} 
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`${styles.cardSpotlight} ${className} ${isHovered ? styles.hovered : ''}`}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
        transition: rotate.x === 0 && rotate.y === 0 
          ? 'all 400ms cubic-bezier(0.03, 0.98, 0.52, 0.99)' 
          : 'none',
      }}
    >
      <div className={styles.cardContent}>
        {title && (
          <div className={styles.cardHeader}>
            <span className={styles.cardBadge}>InCampus</span>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardSubtitle}>{subtitle}</p>
            {/* <button className={styles.cardButton}>{buttonText}</button> */}
          </div>
        )}
        
        <div className={styles.cardBody}>
          {children}
        </div>
      </div>
    </div>
  );
};

const QuickStatistics = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    timeSaved: 0,
    successRate: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fetch real stats from your backend
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          // Fallback demo data
          setStats({
            totalEvents: 150,
            totalUsers: 2500,
            timeSaved: 850,
            successRate: 94
          });
        }
      } catch (error) {
        // Demo data
        setStats({
          totalEvents: 150,
          totalUsers: 2500,
          timeSaved: 850,
          successRate: 94
        });
      }
    };

    fetchStats();

    // Intersection Observer for animation trigger
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('stats-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const Counter = ({ end, duration = 2000, suffix = '' }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        setCount(Math.floor(progress * end));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return <span>{count}{suffix}</span>;
  };

  return (
    <section id="stats-section" className={styles.statsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Revolutionizing Campus Events
          </h2>
          <p className={styles.subtitle}>
            See how we're transforming manual processes into seamless digital experiences
          </p>
        </div>

        <div className={styles.statsContainer}>
          {/* Left side - Features Card */}
          <SpotlightCard 
            spotlightColor="rgba(34, 197, 94, 0.4)"
            className={styles.featuresCard}
            title="Streamlined Event Management with InCampus"
            subtitle="From manual paperwork to digital excellence, InCampus transforms how students register for campus events with cutting-edge automation and real-time processing."
            // buttonText="Explore Features"
          >
            <div className={styles.featuresPanel}>
              <div className={styles.featureItem}>
                <div className={styles.checkmark}>
                  <FaCheckCircle />
                </div>
                <span>Instant event registration</span>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.checkmark}>
                  <FaCheckCircle />
                </div>
                <span>Digital document verification</span>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.checkmark}>
                  <FaCheckCircle />
                </div>
                <span>Real-time registration tracking</span>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.checkmark}>
                  <FaCheckCircle />
                </div>
                <span>Automated confirmation system</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Right side - Analytics Card */}
          <SpotlightCard 
            spotlightColor="rgba(139, 92, 246, 0.4)"
            className={styles.analyticsCard}
            title="Real-time Analytics Dashboard"
            subtitle="Monitor registration patterns, track time savings, and visualize the efficiency gains from digital transformation in real-time interactive displays."
            // buttonText="View Analytics"
          >
            <div className={styles.chartPanel}>
              <div className={styles.statsCards}>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>
                    <Counter end={stats.totalEvents} />
                  </div>
                  <div className={styles.statLabel}>Events</div>
                  <div className={styles.statTrend}>
                    <FaArrowUp />
                    <span>+12%</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statNumber}>
                    <Counter end={stats.totalUsers} />
                  </div>
                  <div className={styles.statLabel}>Registrations</div>
                  <div className={styles.statTrend}>
                    <FaArrowUp />
                    <span>+25%</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statNumber}>
                    <Counter end={stats.timeSaved} />h
                  </div>
                  <div className={styles.statLabel}>Time Saved</div>
                  <div className={styles.statTrend}>
                    <FaArrowUp />
                    <span>+89%</span>
                  </div>
                </div>
              </div>

              {/* Time Comparison Chart */}
              <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                  <FaClock />
                  <span>Processing Time Comparison</span>
                </div>

                <div className={styles.chartLegend}>
                  <div className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ backgroundColor: '#ef4444' }}></div>
                    <span>Manual Process</span>
                  </div>
                  <div className={styles.legendItem}>
                    <div className={styles.legendDot} style={{ backgroundColor: '#8b5cf6' }}></div>
                    <span>Our Platform</span>
                  </div>
                </div>
                
                <div className={styles.chart}>
                  <svg viewBox="0 0 400 200" className={styles.chartSvg}>
                    <defs>
                      {/* Manual process gradient */}
                      <linearGradient id="manualGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
                        <stop offset="100%" stopColor="rgba(239, 68, 68, 0.05)" />
                      </linearGradient>
                      
                      {/* Platform gradient */}
                      <linearGradient id="platformGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
                        <stop offset="100%" stopColor="rgba(139, 92, 246, 0.05)" />
                      </linearGradient>
                    </defs>
                    
                    {/* Manual process line (higher/slower) */}
                    <path
                      d="M 0 50 Q 100 45 200 60 T 400 70"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      className={styles.chartLineManual}
                    />
                    
                    {/* Platform line (lower/faster) */}
                    <path
                      d="M 0 150 Q 100 160 200 140 T 400 130"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="3"
                      className={styles.chartLinePlatform}
                    />
                    
                    {/* Manual process fill */}
                    <path
                      d="M 0 50 Q 100 45 200 60 T 400 70 L 400 200 L 0 200 Z"
                      fill="url(#manualGradient)"
                      className={styles.chartFillManual}
                    />
                    
                    {/* Platform fill */}
                    <path
                      d="M 0 150 Q 100 160 200 140 T 400 130 L 400 200 L 0 200 Z"
                      fill="url(#platformGradient)"
                      className={styles.chartFillPlatform}
                    />
                    
                    {/* Manual process data points */}
                    <circle cx="0" cy="50" r="4" fill="#ef4444" className={styles.chartDotManual} />
                    <circle cx="133" cy="47" r="4" fill="#ef4444" className={styles.chartDotManual} />
                    <circle cx="266" cy="65" r="4" fill="#ef4444" className={styles.chartDotManual} />
                    <circle cx="400" cy="70" r="4" fill="#ef4444" className={styles.chartDotManual} />
                    
                    {/* Platform data points */}
                    <circle cx="0" cy="150" r="4" fill="#8b5cf6" className={styles.chartDotPlatform} />
                    <circle cx="133" cy="160" r="4" fill="#8b5cf6" className={styles.chartDotPlatform} />
                    <circle cx="266" cy="140" r="4" fill="#8b5cf6" className={styles.chartDotPlatform} />
                    <circle cx="400" cy="130" r="4" fill="#8b5cf6" className={styles.chartDotPlatform} />
                  </svg>

                  <div className={styles.chartLabels}>
                    <span>Registration</span>
                    <span>Verification</span>
                    <span>Approval</span>
                    <span>Confirmation</span>
                  </div>

                  <div className={styles.timeLabels}>
                    <div className={styles.timeLabel} style={{ top: '25%' }}>
                      <span>120 min</span>
                      <small>(Manual)</small>
                    </div>
                    <div className={styles.timeLabel} style={{ top: '75%' }}>
                      <span>5 min</span>
                      <small>(Platform)</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
};

export default QuickStatistics;