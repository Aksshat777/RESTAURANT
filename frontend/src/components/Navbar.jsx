import React, { useState, useEffect } from 'react';
import { Menu, X, Flame } from 'lucide-react';

const Navbar = ({ onOpenBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Experience', href: '#experience' },
    { name: 'Menu', href: '#menu' },
    { name: 'Story', href: '#story' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 100,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      borderBottom: scrolled ? '1px solid rgba(212, 175, 55, 0.15)' : '1px solid rgba(255, 255, 255, 0.03)',
      background: scrolled ? 'rgba(12, 12, 14, 0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      padding: scrolled ? '14px 0' : '24px 0',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand Logo */}
        <a href="#home" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          color: '#d4af37',
        }}>
          <Flame size={24} style={{ color: '#e65c00', filter: 'drop-shadow(0 0 5px rgba(230, 92, 0, 0.5))' }} />
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.4rem',
            fontWeight: '700',
            letterSpacing: '0.12em',
            textShadow: '0 0 10px rgba(212, 175, 55, 0.2)',
          }}>
            EMBER & OAK
          </span>
        </a>

        {/* Desktop Menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
        }} className="desktop-only">
          <ul style={{
            display: 'flex',
            listStyle: 'none',
            gap: '32px',
            margin: 0,
            padding: 0,
          }}>
            {navLinks.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  style={{
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.85rem',
                    fontWeight: '400',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--gold-primary)';
                    e.target.style.textShadow = '0 0 8px rgba(212, 175, 55, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--text-primary)';
                    e.target.style.textShadow = 'none';
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>

          <button 
            onClick={onOpenBooking}
            className="btn-gold"
          >
            Book A Table
          </button>
        </div>

        {/* Mobile Hamburger Trigger */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'none',
          }}
          className="mobile-toggle-btn"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(12, 12, 14, 0.98)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99,
          gap: '32px',
          animation: 'fadeIn 0.3s ease-out forwards',
        }}>
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <X size={28} />
          </button>
          
          <ul style={{
            listStyle: 'none',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            padding: 0,
          }}>
            {navLinks.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  style={{
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.6rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    transition: 'color 0.3s',
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--gold-primary)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          
          <button 
            onClick={() => {
              setIsOpen(false);
              onOpenBooking();
            }}
            className="btn-solid-gold"
            style={{ marginTop: '16px' }}
          >
            Book A Table
          </button>
        </div>
      )}

      {/* Global CSS for toggle and display block/none */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-only {
            display: flex !important;
          }
          .mobile-toggle-btn {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
