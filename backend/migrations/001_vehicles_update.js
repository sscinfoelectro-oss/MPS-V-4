/**
 * Migration 001 - Update vehicles table with new fields
 * Adds brand, model, variant, fuel_type, transmission columns
 * Creates vehicle_technical_specs and technician_reports tables
 */

module.exports = {
  version: 1,
  name: '001_vehicles_update',
  up: (db) => {
    // 1. Add new columns to vehicles table (with safe ALTER TABLE)
    const existingColumns = db.prepare("PRAGMA table_info('vehicles')").all().map(c => c.name);

    const newColumns = [
      { name: 'brand', type: 'TEXT NOT NULL DEFAULT \'\'' },
      { name: 'model', type: 'TEXT NOT NULL DEFAULT \'\'' },
      { name: 'variant', type: 'TEXT DEFAULT \'\'' },
      { name: 'fuel_type', type: 'TEXT DEFAULT \'\'' },
      { name: 'transmission', type: 'TEXT DEFAULT \'\'' },
    ];

    newColumns.forEach(col => {
      if (!existingColumns.includes(col.name)) {
        db.exec(`ALTER TABLE vehicles ADD COLUMN ${col.name} ${col.type}`);
      }
    });

    // 2. Create vehicle_technical_specs table
    db.exec(`
      CREATE TABLE IF NOT EXISTS vehicle_technical_specs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL UNIQUE,
        engine_code TEXT DEFAULT '',
        engine_size REAL DEFAULT 0,
        horsepower INTEGER DEFAULT 0,
        torque INTEGER DEFAULT 0,
        abs BOOLEAN DEFAULT 0,
        esp BOOLEAN DEFAULT 0,
        fuel_system TEXT DEFAULT '',
        ecu_type TEXT DEFAULT '',
        obd_protocol TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      );
    `);

    // 3. Create technician_reports table
    db.exec(`
      CREATE TABLE IF NOT EXISTS technician_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        technician_id INTEGER NOT NULL,
        diagnostic TEXT DEFAULT '',
        fault_codes TEXT DEFAULT '',
        repair_history TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        FOREIGN KEY (technician_id) REFERENCES users(id)
      );
    `);

    // 4. Create migrations tracking table if not exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Migration 001 applied: vehicles updated, technical_specs and technician_reports created');
  },

  down: (db) => {
    // Rollback
    const existingColumns = db.prepare("PRAGMA table_info('vehicles')").all().map(c => c.name);
    const dropColumns = ['brand', 'model', 'variant', 'fuel_type', 'transmission'];
    dropColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        // SQLite doesn't support DROP COLUMN in older versions, but we note it
        console.log(`Note: Cannot easily drop column ${col} in SQLite without recreating table`);
      }
    });
    db.exec('DROP TABLE IF EXISTS vehicle_technical_specs');
    db.exec('DROP TABLE IF EXISTS technician_reports');
    db.exec('DROP TABLE IF EXISTS _migrations');
    console.log('⬇️ Migration 001 rolled back');
  }
};