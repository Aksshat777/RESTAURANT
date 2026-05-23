const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

const usePostgres = !!process.env.DATABASE_URL;
let pgPool;
let sqliteDb;

// Helper to convert "?" placeholders to "$1", "$2" for Postgres
function convertPlaceholders(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

// Helper to adapt SQLite schema syntax to Postgres
function adaptSchema(sql) {
  return sql
    .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
    .replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
}

if (usePostgres) {
  console.log('Using PostgreSQL database (production/Supabase)');
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  // Test connection and run migrations
  pgPool.connect((err, client, release) => {
    if (err) {
      console.error('Could not connect to PostgreSQL database:', err.stack);
    } else {
      console.log('Connected to PostgreSQL database successfully.');
      release();
      initializeDatabase();
    }
  });
} else {
  console.log('Using SQLite database (local dev)');
  const dbPath = path.resolve(__dirname, process.env.DB_PATH || 'database.sqlite');
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Could not connect to SQLite database:', err);
    } else {
      console.log('Connected to SQLite database at:', dbPath);
      initializeDatabase();
    }
  });
}

// Compatibility wrapper exposing standard sqlite3 methods
const dbWrapper = {
  serialize: (cb) => {
    if (usePostgres) {
      cb();
    } else {
      sqliteDb.serialize(cb);
    }
  },

  all: (sql, params, cb) => {
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }

    if (usePostgres) {
      const pgSql = convertPlaceholders(sql);
      pgPool.query(pgSql, params, (err, res) => {
        if (err) return cb(err);
        cb(null, res.rows);
      });
    } else {
      sqliteDb.all(sql, params, cb);
    }
  },

  get: (sql, params, cb) => {
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }

    if (usePostgres) {
      const pgSql = convertPlaceholders(sql);
      pgPool.query(pgSql, params, (err, res) => {
        if (err) return cb(err);
        cb(null, res.rows[0] || null);
      });
    } else {
      sqliteDb.get(sql, params, cb);
    }
  },

  run: function(sql, params, cb) {
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }

    if (usePostgres) {
      let pgSql = adaptSchema(sql);
      pgSql = convertPlaceholders(pgSql);
      const isInsert = /^\s*insert\s+/i.test(sql);

      if (isInsert) {
        pgSql += ' RETURNING id';
      }

      pgPool.query(pgSql, params, (err, res) => {
        if (err) {
          if (cb) cb(err);
          return;
        }

        const context = {
          lastID: isInsert && res.rows[0] ? res.rows[0].id : null,
          changes: res.rowCount
        };

        if (cb) {
          cb.call(context, null);
        }
      });
    } else {
      sqliteDb.run(sql, params, cb);
    }
  },

  prepare: function(sql) {
    if (usePostgres) {
      return {
        run: function(...args) {
          let cbRun;
          let paramsRun = args;
          if (typeof args[args.length - 1] === 'function') {
            cbRun = args[args.length - 1];
            paramsRun = args.slice(0, -1);
          }

          let pgSql = convertPlaceholders(sql);
          pgPool.query(pgSql, paramsRun, (err, res) => {
            if (cbRun) cbRun(err);
          });
        },
        finalize: function(cbFinalize) {
          if (cbFinalize) cbFinalize(null);
        }
      };
    } else {
      return sqliteDb.prepare(sql);
    }
  }
};

function initializeDatabase() {
  dbWrapper.serialize(() => {
    // 1. Create menu_items table
    dbWrapper.run(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        spice_level INTEGER CHECK(spice_level >= 0 AND spice_level <= 3),
        is_veg BOOLEAN NOT NULL,
        image_url TEXT
      )
    `, (err) => {
      if (err) console.error('Error creating menu_items table:', err);
    });

    // 2. Create bookings table
    dbWrapper.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        guests INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        table_id TEXT,
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating bookings table:', err);
    });

    // 3. Seed menu_items if empty
    dbWrapper.get("SELECT COUNT(*) as count FROM menu_items", (err, row) => {
      if (err) {
        console.error("Error checking menu_items count:", err);
        return;
      }

      const count = row ? parseInt(row.count, 10) : 0;
      if (count === 0) {
        console.log("Seeding menu_items table...");
        const stmt = dbWrapper.prepare(`
          INSERT INTO menu_items (name, description, price, category, spice_level, is_veg, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const initialItems = [
          {
            name: "Signature Ember Manchurian",
            description: "Crispy vegetable dumplings in a dark smoky soy glaze with toasted sesame and microgreens.",
            price: 18.00,
            category: "Signature Manchurian",
            spice_level: 2,
            is_veg: true,
            image_url: "/images/ember-manchurian.jpg"
          },
          {
            name: "Gobi Manchurian Royale",
            description: "Cauliflower florets, double-fried, tossed with ginger, green chilis, scallions, and finished with a dash of rice wine.",
            price: 16.00,
            category: "Appetizers",
            spice_level: 2,
            is_veg: true,
            image_url: "/images/gobi-manchurian.jpg"
          },
          {
            name: "Paneer Manchurian Silhouette",
            description: "Seared organic paneer in a ginger-coriander emulsion with bell peppers.",
            price: 19.00,
            category: "Appetizers",
            spice_level: 1,
            is_veg: true,
            image_url: "/images/paneer-manchurian.jpg"
          },
          {
            name: "Lobster Manchurian",
            description: "Succulent lobster chunks wok-tossed in garlic-chili oil and light soy sauce.",
            price: 38.00,
            category: "Entrees",
            spice_level: 2,
            is_veg: false,
            image_url: "/images/lobster-manchurian.jpg"
          },
          {
            name: "Manchurian Fried Rice",
            description: "Wok-tossed jasmine rice with charred scallions, garlic, and crumbled vegetable Manchurian.",
            price: 17.00,
            category: "Rice & Noodles",
            spice_level: 1,
            is_veg: true,
            image_url: "/images/manchurian-fried-rice.jpg"
          },
          {
            name: "Sichuan Truffle Noodles",
            description: "Hand-pulled wheat noodles tossed in black truffle paste, chili oil, and wild mushrooms.",
            price: 22.00,
            category: "Rice & Noodles",
            spice_level: 2,
            is_veg: true,
            image_url: "/images/sichuan-truffle-noodles.jpg"
          },
          {
            name: "Lotus Blossom Elixir",
            description: "Refreshing mocktail with lychee, lemongrass, and sparkling coconut water.",
            price: 8.00,
            category: "Beverages",
            spice_level: 0,
            is_veg: true,
            image_url: "/images/lotus-blossom.jpg"
          },
          {
            name: "Smoked Ginger Mule",
            description: "Ginger beer, fresh lime, smoked rosemary syrup, and club soda.",
            price: 9.00,
            category: "Beverages",
            spice_level: 0,
            is_veg: true,
            image_url: "/images/smoked-ginger.jpg"
          },
          {
            name: "Matcha Lava Fondant",
            description: "Warm green tea cake with a molten dark chocolate center, served with ginger ice cream.",
            price: 12.00,
            category: "Desserts",
            spice_level: 0,
            is_veg: true,
            image_url: "/images/matcha-lava.jpg"
          },
          {
            name: "Lychee Coconut Panna Cotta",
            description: "Creamy coconut cream infused with kaffir lime, topped with sweet lychee compote.",
            price: 10.00,
            category: "Desserts",
            spice_level: 0,
            is_veg: true,
            image_url: "/images/lychee-panna-cotta.jpg"
          }
        ];

        initialItems.forEach(item => {
          stmt.run(
            item.name,
            item.description,
            item.price,
            item.category,
            item.spice_level,
            item.is_veg ? 1 : 0,
            item.image_url,
            (err) => {
              if (err) console.error(`Error seeding item ${item.name}:`, err);
            }
          );
        });

        stmt.finalize((err) => {
          if (err) console.error("Error finalizing seeding statement:", err);
          else console.log("Seeding completed successfully.");
        });
      } else {
        console.log("Database already seeded. Total items:", count);
      }
    });
  });
}

module.exports = dbWrapper;
