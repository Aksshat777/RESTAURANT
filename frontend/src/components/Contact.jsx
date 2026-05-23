import React, { useState, useEffect } from 'react';
import { Send, MapPin, Phone, Mail, Clock, Share2, Navigation } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const getDiningStatus = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const lunchStart = 12 * 60; // 12:00 PM
    const lunchEnd = 15 * 60 + 30; // 3:30 PM
    const dinnerStart = 18 * 60; // 6:00 PM
    const dinnerEnd = 23 * 60; // 11:00 PM

    if (currentMinutes >= lunchStart && currentMinutes < lunchEnd) {
      return {
        isOpen: true,
        text: 'OPEN NOW - serving Lunch',
        nextOpening: null
      };
    } else if (currentMinutes >= dinnerStart && currentMinutes < dinnerEnd) {
      return {
        isOpen: true,
        text: 'OPEN NOW - serving Dinner',
        nextOpening: null
      };
    } else {
      let nextText = '';
      if (currentMinutes < lunchStart) {
        nextText = 'Opens today at 12:00 PM for Lunch';
      } else if (currentMinutes < dinnerStart) {
        nextText = 'Opens today at 6:00 PM for Dinner';
      } else {
        nextText = 'Opens tomorrow at 12:00 PM for Lunch';
      }
      return {
        isOpen: false,
        text: 'CLOSED NOW',
        nextOpening: nextText
      };
    }
  };

  const [status, setStatus] = useState(getDiningStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(getDiningStatus());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: 'Ember Oak Restaurant',
      text: 'Ember Oak Restaurant - 42 Golden Hearth Lane, Gastronomy District, NY 10013',
      url: window.location.origin
    };
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText('Ember Oak Restaurant, 42 Golden Hearth Lane, Gastronomy District, NY 10013')
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy address: ', err);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setSent(false);
    }, 4000);
  };

  return (
    <section id="contact" style={{
      background: 'var(--bg-dark)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Visual Accent */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="section-container">
        <h5 className="section-subtitle">Reach Out</h5>
        <h2 className="section-title">Connect With Us</h2>
        <div className="section-divider" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '40px',
          alignItems: 'stretch',
        }} className="contact-grid">
          
          {/* Contact Form */}
          <div className="glass-panel gold-glow-hover" style={{ padding: '40px' }}>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.6rem',
              color: '#ffffff',
              marginBottom: '24px'
            }}>
              Send A Message
            </h3>
            
            {sent ? (
              <div style={{
                color: 'var(--gold-primary)',
                fontSize: '1rem',
                fontWeight: '500',
                padding: '20px',
                background: 'rgba(212, 175, 55, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '4px',
                textAlign: 'center',
                animation: 'fadeIn 0.5s'
              }}>
                Thank you! Your message has been received. Our team will contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Evelyn Carter"
                    style={{
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '4px',
                      padding: '12px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="evelyn@domain.com"
                    style={{
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '4px',
                      padding: '12px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.95rem',
                      outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Message</label>
                  <textarea 
                    rows="4" 
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    placeholder="Inquire about private dining events, dietary accommodations, or special arrangements..."
                    style={{
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '4px',
                      padding: '12px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--glass-border)'}
                  />
                </div>

                <button type="submit" className="btn-solid-gold" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}>
                  <Send size={16} />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick Info Sidebar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}>
            
            {/* Address & Interactive Map */}
            <div className="glass-panel-light" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <MapPin size={24} style={{ color: 'var(--gold-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    42 Golden Hearth Lane, Gastronomy District<br />New York, NY 10013
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=42+Golden+Hearth+Lane,+Gastronomy+District,+NY+10013"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-gold"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '4px',
                    border: '1px solid var(--gold-primary)',
                    color: 'var(--gold-primary)',
                    background: 'transparent',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Navigation size={14} />
                  <span>Get Directions</span>
                </a>
                <button
                  onClick={handleShare}
                  className="btn-outline-gold"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '4px',
                    border: '1px solid var(--gold-primary)',
                    color: 'var(--gold-primary)',
                    background: 'transparent',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Share2 size={14} />
                  <span>{copied ? 'Copied!' : 'Share Address'}</span>
                </button>
              </div>

              {/* Styled Map Embed */}
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '200px', 
                borderRadius: '4px', 
                overflow: 'hidden', 
                border: '1px solid rgba(212, 175, 55, 0.15)',
              }}>
                <iframe
                  title="Ember Oak Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-74.0120%2C40.7160%2C-73.9980%2C40.7240&amp;layer=mapnik&amp;marker=40.7200%2C-74.0050"
                  style={{
                    border: 'none',
                    filter: 'grayscale(1) invert(1) sepia(0.6) saturate(2.5) hue-rotate(-20deg) brightness(0.7) contrast(1.2)'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '6px',
                  left: '6px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  fontSize: '9px',
                  color: 'var(--gold-primary)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  pointerEvents: 'none'
                }}>
                  © OpenStreetMap
                </div>
              </div>
            </div>

            {/* Hours & Dining Details with glowing indicator */}
            <div className="glass-panel-light" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <Clock size={24} style={{ color: 'var(--gold-primary)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hours & Dining</h4>
                  
                  {/* Glowing Status Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: status.isOpen ? '#d4af37' : '#ef4444',
                      display: 'inline-block',
                      animation: status.isOpen ? 'pulse 2s infinite' : 'pulse-red 2s infinite'
                    }} />
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '600', 
                      color: status.isOpen ? 'var(--gold-primary)' : '#ef4444',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {status.text}
                    </span>
                  </div>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <span style={{ color: '#ffffff' }}>Lunch:</span> 12:00 PM - 3:30 PM (Daily)<br />
                  <span style={{ color: '#ffffff' }}>Dinner:</span> 6:00 PM - 11:00 PM (Daily)
                </p>

                {!status.isOpen && status.nextOpening && (
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '0.8rem', 
                    color: 'var(--gold-primary)',
                    fontStyle: 'italic',
                    background: 'rgba(212, 175, 55, 0.05)',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    borderLeft: '2px solid var(--gold-primary)'
                  }}>
                    {status.nextOpening}
                  </div>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="glass-panel-light" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <Phone size={24} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reservations</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>(415) 555-0198</p>
              </div>
            </div>

            {/* Email */}
            <div className="glass-panel-light" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <Mail size={24} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>General Inquiries</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>hello@emberandoak.com</p>
              </div>
            </div>

            {/* Private Dining Info */}
            <div className="glass-panel-light ember-glow-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '3px solid var(--ember-primary)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: 'var(--ember-primary)' }} />
                <span>Private Hearth Rooms</span>
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                For groups larger than 8, corporate dinners, or private buyout requests, please email us directly with your date and guest count. We offer custom curated fire tasting menus.
              </p>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7);
          }
          70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 8px rgba(212, 175, 55, 0);
          }
          100% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0);
          }
        }
        @keyframes pulse-red {
          0% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
          100% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;
