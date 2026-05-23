import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Story from './components/Story';
import Menu from './components/Menu';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const openBooking = () => setIsBookingOpen(true);
  const closeBooking = () => setIsBookingOpen(false);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Navigation Header */}
      {!isAdminMode ? (
        <Navbar onOpenBooking={openBooking} />
      ) : (
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 100,
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          background: 'rgba(12, 12, 14, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '16px 0',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4rem',
              fontWeight: '700',
              color: 'var(--gold-primary)',
              letterSpacing: '0.12em',
            }}>
              EMBER & OAK <span style={{ fontSize: '0.8rem', color: '#ffffff', opacity: 0.6 }}>[ADMIN]</span>
            </span>
            <button 
              onClick={() => {
                setIsAdminMode(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="btn-gold"
              style={{ fontSize: '0.8rem', padding: '8px 16px' }}
            >
              Exit Sanctuary Dashboard
            </button>
          </div>
        </nav>
      )}

      {/* Adjust layout margin if in admin mode */}
      <div style={{ paddingTop: isAdminMode ? '80px' : '0' }}>
        {isAdminMode ? (
          <AdminDashboard />
        ) : (
          <>
            {/* Hero Section & Canvas Scrubbing */}
            <Hero onOpenBooking={openBooking} />

            {/* Philosophy Section */}
            <Story />

            {/* Menu Categories & Items */}
            <Menu />

            {/* Contact & Hours Info */}
            <Contact />
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Toggle Keeper Portal Link at the bottom of the page */}
      <div style={{
        textAlign: 'center',
        padding: '24px 0',
        background: 'var(--bg-darker)',
        borderTop: '1px solid rgba(255,255,255,0.03)'
      }}>
        <button 
          onClick={() => {
            setIsAdminMode(!isAdminMode);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            cursor: 'pointer',
            textDecoration: 'underline',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.target.style.color = 'var(--gold-primary)'}
          onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
        >
          {isAdminMode ? "Return to Live Site" : "Keeper Access Portal"}
        </button>
      </div>

      {/* Booking Form Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={closeBooking} />
    </div>
  );
}

export default App;
