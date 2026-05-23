import React, { useState, useEffect } from 'react';
import FrameSequencePlayer from './FrameSequencePlayer';
import { ChevronDown, Sparkles, Flame } from 'lucide-react';

const Hero = ({ onOpenBooking }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = window.innerHeight * 1.5;
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute opacities for the fading text blocks based on scroll progress
  // Slide 1: 0% to 35%
  const opacity1 = scrollProgress < 0.35 ? 1 - (scrollProgress / 0.3) : 0;
  // Slide 2: 35% to 75%
  const opacity2 = scrollProgress >= 0.3 && scrollProgress <= 0.75 
    ? (scrollProgress - 0.3) / 0.15 
    : 0;
  const opacity2Clamped = scrollProgress > 0.45 && scrollProgress <= 0.75 
    ? Math.max(0, 1 - (scrollProgress - 0.6) / 0.15) 
    : opacity2;
  // Slide 3: 75% to 100%
  const opacity3 = scrollProgress > 0.7 
    ? Math.min(1, (scrollProgress - 0.7) / 0.15) 
    : 0;

  return (
    <div id="home" style={{
      position: 'relative',
      height: '250vh', // long scroll track for scrubbing
      background: 'var(--bg-dark)',
    }}>
      {/* Sticky Canvas Container */}
      <div style={{
        position: 'sticky',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 1,
      }}>
        {/* The Frame Canvas */}
        <FrameSequencePlayer />

        {/* Dark Vignette Layer overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(12, 12, 14, 0.4) 0%, rgba(12, 12, 14, 0.85) 90%)',
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        {/* Scroll Guide Indicator */}
        {scrollProgress < 0.15 && (
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--gold-primary)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            animation: 'pulse 2s infinite',
            pointerEvents: 'none',
          }}>
            <span>Scroll to Rotate & Explore</span>
            <ChevronDown size={18} style={{ animation: 'bounce 2s infinite' }} />
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
              }
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(6px); }
              }
            `}</style>
          </div>
        )}

        {/* STORY OVERLAYS (STATIONARY/STICKY) */}
        
        {/* Story 1: Title Screen (Fades out early) */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          textAlign: 'center',
          opacity: Math.max(0, Math.min(1, opacity1)),
          pointerEvents: opacity1 > 0.1 ? 'auto' : 'none',
          transition: 'opacity 0.2s ease-out',
          zIndex: 3,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            color: 'var(--gold-primary)',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.25em',
          }}>
            <Sparkles size={16} />
            <span>A Sensory Culinary Journey</span>
            <Sparkles size={16} />
          </div>
          
          <h1 style={{
            fontSize: 'min(5rem, 10vw)',
            lineHeight: '1.1',
            color: '#ffffff',
            marginBottom: '20px',
            letterSpacing: '0.05em',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
          }}>
            EMBER & OAK
          </h1>

          <div style={{
            width: '120px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--gold-primary), transparent)',
            marginBottom: '24px',
          }} />

          <p style={{
            maxWidth: '650px',
            color: 'var(--text-primary)',
            fontSize: 'min(1.25rem, 4.5vw)',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            lineHeight: '1.6',
            marginBottom: '40px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
          }}>
            Where White Oak embers kiss premium cuts, and dark obsidian surroundings create an unmatched dining sanctuary.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={onOpenBooking} className="btn-solid-gold">
              Reserve A Table
            </button>
            <a href="#menu" className="btn-gold" style={{ textDecoration: 'none' }}>
              View Our Menu
            </a>
          </div>
        </div>

        {/* Story 2: Wood-Fire Alchemy (Fades in, then out) */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '0 min(80px, 8vw)',
          opacity: Math.max(0, Math.min(1, opacity2Clamped)),
          pointerEvents: opacity2Clamped > 0.1 ? 'auto' : 'none',
          transition: 'opacity 0.2s ease-out, transform 0.4s ease-out',
          transform: `translateY(${(1 - Math.max(0, Math.min(1, opacity2Clamped))) * 20}px)`,
          zIndex: 3,
        }}>
          <div className="glass-panel gold-glow-hover" style={{
            maxWidth: '520px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--ember-primary)',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: '600',
              marginBottom: '16px',
            }}>
              <Flame size={18} />
              <span>THE HEARTH ALCHEMY</span>
            </div>
            
            <h2 style={{
              fontSize: '2.2rem',
              color: '#ffffff',
              marginBottom: '16px',
              lineHeight: '1.2',
            }}>
              Forged by Fire,<br />Defined by Smoke
            </h2>
            
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
              lineHeight: '1.7',
              marginBottom: '24px',
            }}>
              We cook exclusively over open flames fueled by White Oak and seasoned hickory. This ancient method caramelizes juices, seals in deep wood aromas, and imparts a distinct flavor signature you won't find anywhere else.
            </p>
            
            <a href="#story" style={{
              color: 'var(--gold-primary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              letterSpacing: '0.05em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'gap 0.3s',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--gold-hover)'}
            onMouseLeave={e => e.target.style.color = 'var(--gold-primary)'}
            >
              Meet Our Grillmaster &rarr;
            </a>
          </div>
        </div>

        {/* Story 3: The Sanctuary (Fades in at the end) */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 min(80px, 8vw)',
          opacity: Math.max(0, Math.min(1, opacity3)),
          pointerEvents: opacity3 > 0.1 ? 'auto' : 'none',
          transition: 'opacity 0.2s ease-out, transform 0.4s ease-out',
          transform: `translateY(${(1 - Math.max(0, Math.min(1, opacity3))) * 20}px)`,
          zIndex: 3,
        }}>
          <div className="glass-panel ember-glow-hover" style={{
            maxWidth: '520px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              color: 'var(--gold-primary)',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: '600',
              marginBottom: '16px',
            }}>
              <span>THE DESIGN SANCTUARY</span>
            </div>
            
            <h2 style={{
              fontSize: '2.2rem',
              color: '#ffffff',
              marginBottom: '16px',
              lineHeight: '1.2',
            }}>
              Obsidian & Warm Gold
            </h2>
            
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
              lineHeight: '1.7',
              marginBottom: '24px',
            }}>
              Stepping into Ember & Oak is stepping into another realm. Textured black stone walls absorb the outside world, while soft amber lights dance like embers in the night, reflecting the golden hues of your wine glass.
            </p>
            
            <button onClick={onOpenBooking} className="btn-solid-gold">
              Experience it Tonight
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
