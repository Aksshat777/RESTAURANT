import React, { useState, useEffect } from 'react';
import { Flame, Star, Leaf, AlertCircle, RefreshCw } from 'lucide-react';

const FALLBACK_MENU = {
  starters: [
    { name: 'Smoked Octopus Tacos', price: 26, description: 'Tender wood-fired octopus, charred avocado crema, house pickled red onion, micro cilantro, handmade blue corn tortillas.', is_veg: false, spice_level: 1, category: 'Appetizers' },
    { name: 'Binchotan Bone Marrow', price: 24, description: 'Roasted over Japanese white-hot embers, white oak smoke, toasted brioche, caramelized onion jam, micro herbs.', is_veg: false, spice_level: 0, category: 'Appetizers' },
    { name: 'Ember-Roasted Heirloom Beets', price: 18, description: 'Slow buried in hot coals, whipped goat cheese, wild honey, roasted pistachios, jade-green basil oil infusions.', is_veg: true, spice_level: 0, category: 'Appetizers' }
  ],
  mains: [
    { name: '45-Day Dry Aged Ribeye (16oz)', price: 68, description: 'Prime cut seared over live White Oak fire, finished with smoked sea salt crystals, roasted garlic bulb, and rosemary brush.', is_veg: false, spice_level: 0, category: 'Entrees' },
    { name: 'Hearth-Roasted Pacific Seabass', price: 48, description: 'Wrapped in charred banana leaves, roasted on glowing embers, lemongrass, ginger glaze, fresh jade herbs.', is_veg: false, spice_level: 1, category: 'Entrees' },
    { name: 'Applewood Smoked Duck Breast', price: 42, description: 'Slow-smoked over seasoned applewood, glazed with local wild berry reduction, parsnip purée, grilled endives.', is_veg: false, spice_level: 0, category: 'Entrees' },
    { name: 'Smoked Cauliflower Steak', price: 32, description: 'Thick cut cauliflower charred over hardwood fire, spicy walnut muhammara, pomegranate seeds, fresh mint oil.', is_veg: true, spice_level: 1, category: 'Entrees' }
  ],
  sides: [
    { name: 'Charred Broccolini', price: 14, description: 'Cast iron seared with lemon, red chili flakes, toasted pine nuts, shavings of cured egg yolk.', is_veg: true, spice_level: 1, category: 'Sides' },
    { name: 'Truffle Hearth Fries', price: 16, description: 'Double cooked in beef tallow, tossed with white truffle oil, rosemary salt, served with smoked roasted garlic aioli.', is_veg: false, spice_level: 0, category: 'Sides' },
    { name: 'Wood-Fired Mac & Cheese', price: 15, description: 'Gruyère, sharp cheddar, smoked gouda, baked in a cast-iron skillet over live fire with sourdough crumbs.', is_veg: true, spice_level: 0, category: 'Sides' }
  ],
  desserts: [
    { name: 'Charred Peach Galette', price: 14, description: 'Hearth-baked pastry, fire-roasted peaches, vanilla bean gelato, bourbon-caramel drizzle.', is_veg: true, spice_level: 0, category: 'Desserts' },
    { name: 'Smoked Chocolate Pot de Crème', price: 12, description: 'Rich dark chocolate infused with hickory smoke, sea salt flakes, fresh honeycomb, espresso cream.', is_veg: true, spice_level: 0, category: 'Desserts' }
  ],
  beverages: [
    { name: 'Lotus Blossom Elixir', price: 8, description: 'Refreshing mocktail with lychee, lemongrass, and sparkling coconut water.', is_veg: true, spice_level: 0, category: 'Beverages' },
    { name: 'Smoked Ginger Mule', price: 9, description: 'Ginger beer, fresh lime, smoked rosemary syrup, and club soda.', is_veg: true, spice_level: 0, category: 'Beverages' }
  ]
};
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('mains');
  const [menuItems, setMenuItems] = useState(FALLBACK_MENU);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  const categories = [
    { id: 'starters', name: 'Starters' },
    { id: 'mains', name: 'Mains & Manchurians' },
    { id: 'sides', name: 'Ember Sides' },
    { id: 'desserts', name: 'Sweets & Char' },
    { id: 'beverages', name: 'Elixirs & Drinks' }
  ];

  const getCategoryKey = (cat) => {
    if (!cat) return 'mains';
    const c = cat.toLowerCase();
    if (c.includes('starter') || c.includes('appetizer')) return 'starters';
    if (c.includes('side')) return 'sides';
    if (c.includes('dessert') || c.includes('sweet')) return 'desserts';
    if (c.includes('beverage') || c.includes('drink') || c.includes('elixir') || c.includes('mule')) return 'beverages';
    return 'mains'; // Default matching for Manchurians, Entrees, Rice & Noodles
  };

  const fetchMenu = async () => {
    setLoading(true);
    setErrorState(false);
    try {
      const response = await fetch(`${API_URL}/api/menu`);
      if (response.ok) {
        const data = await response.json();
        
        // Group menu items by category
        const grouped = {
          starters: [],
          mains: [],
          sides: [],
          desserts: [],
          beverages: []
        };
        
        data.forEach(item => {
          const key = getCategoryKey(item.category);
          grouped[key].push(item);
        });

        setMenuItems(grouped);
      } else {
        throw new Error('Server returned non-200 response');
      }
    } catch (err) {
      console.warn('Backend menu API unavailable. Using cellar reserves.');
      setErrorState(true);
      setMenuItems(FALLBACK_MENU);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <section id="menu" style={{
      background: 'var(--bg-dark)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Visual Accents */}
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-100px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.04) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '-100px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(230, 92, 0, 0.04) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="section-container">
        <h5 className="section-subtitle">Gastronomic Artistry</h5>
        <h2 className="section-title">The Culinary Canvas</h2>
        <div className="section-divider" />

        {/* Dynamic Fetch Offline Indicator */}
        {errorState && (
          <div style={{
            maxWidth: '600px',
            margin: '-20px auto 30px auto',
            background: 'rgba(212, 175, 55, 0.05)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '6px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.85rem',
            color: 'var(--gold-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>Offline Mode: Displaying Ember & Oak\'s classic cellar selections.</span>
            </div>
            <button 
              onClick={fetchMenu}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--gold-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 'bold'
              }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* Category Selector Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '48px',
        }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                background: activeCategory === cat.id ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.02)',
                color: activeCategory === cat.id ? 'var(--bg-darker)' : 'var(--text-muted)',
                border: `1px solid ${activeCategory === cat.id ? 'var(--gold-primary)' : 'var(--glass-border)'}`,
                padding: '10px 20px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                borderRadius: '24px',
              }}
            >
              {cat.name} ({menuItems[cat.id]?.length || 0})
            </button>
          ))}
        </div>

        {/* Menu Content Display */}
        {loading ? (
          /* Premium Fallback Skeleton Loader */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 0',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '2px solid rgba(212, 175, 55, 0.2)',
              borderTopColor: 'var(--gold-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.1rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              animation: 'pulse 1.5s infinite'
            }}>
              Stoking the hearth fire...
            </p>
          </div>
        ) : menuItems[activeCategory]?.length === 0 ? (
          /* Empty category indicator */
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-sans)'
          }}>
            No selections currently offered in this category.
          </div>
        ) : (
          /* Menu Grid Items */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            gap: '30px',
          }} className="menu-grid">
            {menuItems[activeCategory].map((item, idx) => {
              // Dynamically compute badges/tags from properties
              const tags = [];
              if (item.is_veg) tags.push('Vegetarian');
              if (item.spice_level > 0) {
                tags.push(`Spicy ${'🌶️'.repeat(item.spice_level)}`);
              }
              if (item.category && item.category.toLowerCase().includes('signature')) {
                tags.push('Signature');
              }
              if (item.price >= 35) {
                tags.push('Premium Cut');
              }

              return (
                <div 
                  key={idx}
                  className="glass-panel gold-glow-hover"
                  style={{
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: '12px',
                      gap: '16px'
                    }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        color: '#ffffff',
                        fontFamily: 'var(--font-serif)',
                        letterSpacing: '0.02em',
                      }}>
                        {item.name}
                      </h3>
                      <span style={{
                        color: 'var(--gold-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: '700',
                        fontSize: '1.15rem',
                      }}>
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                    
                    <p style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      marginBottom: '20px',
                    }}>
                      {item.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}>
                      {tags.map((tag, tagIdx) => {
                        const isVeg = tag === 'Vegetarian';
                        const isSig = tag === 'Signature';
                        const isSpicy = tag.startsWith('Spicy');
                        
                        const tagBg = isVeg ? 'rgba(78, 140, 111, 0.1)' : (isSig || isSpicy) ? 'rgba(230, 92, 0, 0.1)' : 'rgba(212, 175, 55, 0.1)';
                        const tagBorder = isVeg ? 'rgba(78, 140, 111, 0.3)' : (isSig || isSpicy) ? 'rgba(230, 92, 0, 0.3)' : 'rgba(212, 175, 55, 0.3)';
                        const tagColor = isVeg ? 'var(--jade-primary)' : (isSig || isSpicy) ? 'var(--ember-primary)' : 'var(--gold-primary)';
                        
                        return (
                          <span
                            key={tagIdx}
                            style={{
                              background: tagBg,
                              border: `1px solid ${tagBorder}`,
                              color: tagColor,
                              padding: '3px 10px',
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              fontWeight: '600',
                              letterSpacing: '0.08em',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {isSig && <Flame size={10} />}
                            {isVeg && <Leaf size={10} />}
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @media (max-width: 500px) {
          .menu-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Menu;
