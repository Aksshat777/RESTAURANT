require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Admin Authentication Middleware
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_KEY || 'ember-oak-admin-secret';
  
  if (adminKey === expectedKey) {
    next();
  } else {
    res.status(401).json({
      error: 'Unauthorized: Invalid or missing x-admin-key header. Use the secret key configured in .env (default: ember-oak-admin-secret).'
    });
  }
};

// -------------------------------------------------------------
// MENU ENDPOINTS
// -------------------------------------------------------------

// GET /api/menu - Retrieve all menu items
app.get('/api/menu', (req, res) => {
  db.all("SELECT * FROM menu_items", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const items = rows.map(row => ({
      ...row,
      is_veg: row.is_veg === 1
    }));
    res.json(items);
  });
});

// POST /api/menu - Create a new menu item (Admin only)
app.post('/api/menu', adminAuth, (req, res) => {
  const { name, description, price, category, spice_level, is_veg, image_url } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name must be a non-empty string.' });
  }
  if (price === undefined || typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'Price must be a non-negative number.' });
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({ error: 'Category must be a non-empty string.' });
  }
  if (spice_level !== undefined && (typeof spice_level !== 'number' || spice_level < 0 || spice_level > 3)) {
    return res.status(400).json({ error: 'Spice level must be an integer between 0 and 3.' });
  }
  if (is_veg === undefined || typeof is_veg !== 'boolean') {
    return res.status(400).json({ error: 'is_veg must be a boolean.' });
  }

  const query = `
    INSERT INTO menu_items (name, description, price, category, spice_level, is_veg, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [name, description || '', price, category, spice_level || 0, is_veg ? 1 : 0, image_url || ''],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        description: description || '',
        price,
        category,
        spice_level: spice_level || 0,
        is_veg,
        image_url: image_url || ''
      });
    }
  );
});

// PUT /api/menu/:id - Update an existing menu item (Admin only)
app.put('/api/menu/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, spice_level, is_veg, image_url } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name must be a non-empty string.' });
  }
  if (price === undefined || typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'Price must be a non-negative number.' });
  }
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({ error: 'Category must be a non-empty string.' });
  }
  if (spice_level !== undefined && (typeof spice_level !== 'number' || spice_level < 0 || spice_level > 3)) {
    return res.status(400).json({ error: 'Spice level must be an integer between 0 and 3.' });
  }
  if (is_veg === undefined || typeof is_veg !== 'boolean') {
    return res.status(400).json({ error: 'is_veg must be a boolean.' });
  }

  const query = `
    UPDATE menu_items
    SET name = ?, description = ?, price = ?, category = ?, spice_level = ?, is_veg = ?, image_url = ?
    WHERE id = ?
  `;

  db.run(
    query,
    [name, description || '', price, category, spice_level || 0, is_veg ? 1 : 0, image_url || '', id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: `Menu item with id ${id} not found.` });
      }
      res.json({
        id: parseInt(id),
        name,
        description: description || '',
        price,
        category,
        spice_level: spice_level || 0,
        is_veg,
        image_url: image_url || ''
      });
    }
  );
});

// DELETE /api/menu/:id - Delete a menu item (Admin only)
app.delete('/api/menu/:id', adminAuth, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM menu_items WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: `Menu item with id ${id} not found.` });
    }
    res.json({ message: 'Menu item deleted successfully.', id: parseInt(id) });
  });
});

// -------------------------------------------------------------
// BOOKING ENDPOINTS
// -------------------------------------------------------------

// POST /api/bookings - Create a new booking (Public)
app.post('/api/bookings', (req, res) => {
  const { name, email, phone, date, time, guests, special_requests, table_id } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required.' });
  }
  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  // Simple Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  // Date validation (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!date || !dateRegex.test(date)) {
    return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format.' });
  }
  
  // Basic date validity check
  const parsedDate = Date.parse(date);
  if (isNaN(parsedDate)) {
    return res.status(400).json({ error: 'Invalid date provided.' });
  }

  // Time validation (HH:MM)
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!time || !timeRegex.test(time)) {
    return res.status(400).json({ error: 'Time must be in HH:MM format (24-hour style).' });
  }
  
  const [hours, minutes] = time.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return res.status(400).json({ error: 'Invalid time value.' });
  }

  // Guests validation
  const guestCount = parseInt(guests, 10);
  if (isNaN(guestCount) || guestCount <= 0) {
    return res.status(400).json({ error: 'Guests must be a positive integer.' });
  }

  const query = `
    INSERT INTO bookings (name, email, phone, date, time, guests, status, table_id, special_requests)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `;

  db.run(
    query,
    [name, email, phone, date, time, guestCount, table_id || null, special_requests || ''],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        name,
        email,
        phone,
        date,
        time,
        guests: guestCount,
        status: 'pending',
        table_id: table_id || null,
        special_requests: special_requests || '',
        created_at: new Date().toISOString()
      });
    }
  );
});

// GET /api/bookings/occupied - Retrieve occupied tables for a specific date (Public)
app.get('/api/bookings/occupied', (req, res) => {
  const { date, time } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date query parameter is required (YYYY-MM-DD).' });
  }
  
  let query = "SELECT table_id FROM bookings WHERE date = ? AND status != 'cancelled' AND status != 'rejected'";
  const params = [date];
  
  if (time) {
    query += " AND time = ?";
    params.push(time);
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const occupiedTables = rows.map(r => r.table_id).filter(Boolean);
    res.json(occupiedTables);
  });
});

// GET /api/bookings - Retrieve all bookings (Admin only)
app.get('/api/bookings', adminAuth, (req, res) => {
  db.all("SELECT * FROM bookings ORDER BY date DESC, time DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// PUT /api/bookings/:id - Update booking status or table (Admin only)
app.put('/api/bookings/:id', adminAuth, (req, res) => {
  const { id } = req.params;
  const { status, table_id } = req.body;

  // Validation
  const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'rejected'];
  if (status !== undefined && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
  }

  db.get("SELECT * FROM bookings WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: `Booking with id ${id} not found.` });
    }

    const updatedStatus = status !== undefined ? status : row.status;
    const updatedTableId = table_id !== undefined ? table_id : row.table_id;

    const query = `
      UPDATE bookings
      SET status = ?, table_id = ?
      WHERE id = ?
    `;

    db.run(query, [updatedStatus, updatedTableId, id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        ...row,
        status: updatedStatus,
        table_id: updatedTableId
      });
    });
  });
});

// -------------------------------------------------------------
// SERVER INITIATION
// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Ember Oak Backend running on port ${PORT}`);
});
