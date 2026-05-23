import React from 'react';
import { Flame, Trees, Award, ShieldCheck } from 'lucide-react';

const Story = () => {
  return (
    <section id="story" style={{
      background: 'var(--bg-darker)',
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid rgba(255, 255, 255, 0.02)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    }}>
      {/* Visual Accent */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(230, 92, 0, 0.02) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div className="section-container" style={{ position: 'relative', zIndex: 1 }}>
        <h5 className="section-subtitle">Our Philosophy</h5>
        <h2 className="section-title">The Primal Craft</h2>
        <div className="section-divider" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '50px',
          alignItems: 'center',
        }} className="story-split">
          
          {/* Narrative Story */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{
              fontSize: '1.8rem',
              color: '#ffffff',
              fontFamily: 'var(--font-serif)',
              lineHeight: '1.3'
            }}>
              Where White Oak Embers Kiss Premium Cuts.
            </h3>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>
              At the center of our kitchen is a custom-forged 12-foot open hearth. We burn white oak logs seasoned for eighteen months, creating clean coals that burn at intense temperatures. 
            </p>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>
              This specific wood produces a sweet, balanced smoke flavor profile that enhances the meat rather than overpowering it. No gas, no charcoal briquettes, no shortcuts. Just wood, fire, and time.
            </p>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>
              Our cuts are sourced from sustainable, family-owned cattle ranches in California and Montana. They are dry-aged in-house for up to 45 days in our custom chamber lined with blocks of pink Himalayan salt to purify the micro-climate and concentrate the beef flavors.
            </p>
          </div>

          {/* Metrics & Design features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
          }} className="story-metrics">
            
            {/* Metric 1 */}
            <div className="glass-panel gold-glow-hover" style={{
              padding: '30px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Flame size={32} style={{ color: 'var(--ember-primary)', marginBottom: '12px' }} />
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.2rem',
                fontWeight: '700',
                color: '#ffffff',
                lineHeight: '1',
                marginBottom: '6px',
              }}>
                1,200°F
              </span>
              <span style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
              }}>
                Hearth Sear Temp
              </span>
            </div>

            {/* Metric 2 */}
            <div className="glass-panel gold-glow-hover" style={{
              padding: '30px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Award size={32} style={{ color: 'var(--gold-primary)', marginBottom: '12px' }} />
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.2rem',
                fontWeight: '700',
                color: '#ffffff',
                lineHeight: '1',
                marginBottom: '6px',
              }}>
                45 Days
              </span>
              <span style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
              }}>
                Himalayan Salt Dry-Aging
              </span>
            </div>

            {/* Metric 3 */}
            <div className="glass-panel gold-glow-hover" style={{
              padding: '30px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Trees size={32} style={{ color: 'var(--jade-primary)', marginBottom: '12px' }} />
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.2rem',
                fontWeight: '700',
                color: '#ffffff',
                lineHeight: '1',
                marginBottom: '6px',
              }}>
                100%
              </span>
              <span style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
              }}>
                Oak Wood Fired
              </span>
            </div>

            {/* Metric 4 */}
            <div className="glass-panel gold-glow-hover" style={{
              padding: '30px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={32} style={{ color: 'var(--gold-primary)', marginBottom: '12px' }} />
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2.2rem',
                fontWeight: '700',
                color: '#ffffff',
                lineHeight: '1',
                marginBottom: '6px',
              }}>
                A-Grade
              </span>
              <span style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
              }}>
                Artisanal Ranches Sourced
              </span>
            </div>

          </div>

        </div>
      </div>
      <style>{`
        @media (max-width: 500px) {
          .story-metrics {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Story;
