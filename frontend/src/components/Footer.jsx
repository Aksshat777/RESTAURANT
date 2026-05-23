import React from 'react';
import { Flame, Instagram, Facebook, Compass, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-darker)',
      borderTop: '1px solid var(--glass-border)',
      color: 'var(--text-primary)',
      padding: '80px 24px 30px 24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative fire glow */}
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '400px',
        height: '300px',
        background: 'radial-gradient(ellipse at center, rgba(230, 92, 0, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '60px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Column 1: Brand Story */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--gold-primary)',
            marginBottom: '20px'
          }}>
            <Flame size={20} style={{ color: '#e65c00' }} />
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              fontWeight: '700',
              letterSpacing: '0.1em'
            }}>
              EMBER & OAK
            </span>
          </div>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            lineHeight: '1.7',
            marginBottom: '20px'
          }}>
            An immersive dining sanctuary where the primal forces of wood and fire meet culinary refinement. Every plate tells the story of smoke, ash, and glowing embers.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }} onMouseEnter={e => e.target.style.color = '#e65c00'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
              <Instagram size={20} />
            </a>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }} onMouseEnter={e => e.target.style.color = 'var(--gold-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
              <Facebook size={20} />
            </a>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }} onMouseEnter={e => e.target.style.color = 'var(--gold-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
              <Compass size={20} />
            </a>
          </div>
        </div>

        {/* Column 2: Hours of Operation */}
        <div>
          <h4 style={{
            color: 'var(--gold-primary)',
            fontSize: '1.05rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '600'
          }}>
            Hours of Operation
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
              <span>Monday - Thursday</span>
              <span style={{ color: 'var(--text-primary)' }}>5:00 PM - 10:00 PM</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
              <span>Friday - Saturday</span>
              <span style={{ color: 'var(--text-primary)' }}>4:30 PM - 11:00 PM</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
              <span>Sunday Brunch</span>
              <span style={{ color: 'var(--text-primary)' }}>11:00 AM - 3:00 PM</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <span>Sunday Dinner</span>
              <span style={{ color: 'var(--text-primary)' }}>5:00 PM - 9:30 PM</span>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact Details */}
        <div>
          <h4 style={{
            color: 'var(--gold-primary)',
            fontSize: '1.05rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            fontFamily: 'var(--font-sans)',
            fontWeight: '600'
          }}>
            Contact & Address
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <MapPin size={18} style={{ color: 'var(--gold-primary)', flexShrink: 0, marginTop: '2px' }} />
              <span>100 Oakwood Avenue, Hearth District,<br />San Francisco, CA 94103</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Phone size={18} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
              <span>(415) 555-0198</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Mail size={18} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
              <span>reservations@emberandoak.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '30px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        position: 'relative',
        zIndex: 1
      }}>
        <p>&copy; {new Date().getFullYear()} Ember & Oak. All Rights Reserved.</p>
        <div style={{ display: 'flex', gap: '24px', marginTop: '10px' }}>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={e => e.target.style.color = 'var(--gold-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Privacy Policy</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={e => e.target.style.color = 'var(--gold-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Terms of Service</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.3s' }} onMouseEnter={e => e.target.style.color = 'var(--gold-primary)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>Accessibility</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
