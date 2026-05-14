const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

// انشاء وفتح قاعدة البيانات
const dbPath = path.join(__dirname, 'diagnostic.db');
const db = new Database(dbPath, { verbose: console.log });

// انشاء الجداول مع هيكل متطور
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    status TEXT DEFAULT 'ok',
    plate_number TEXT,
    user_id INTEGER NOT NULL,
    lastInspection DATETIME,
    last_repair_date DATETIME,
    total_repairs_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS diagnostics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL,
    resolved BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS garages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    rating REAL DEFAULT 5.0,
    services TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    working_hours TEXT,
    image_url TEXT,
    source TEXT DEFAULT 'local',
    verified BOOLEAN DEFAULT 1,
    latitude REAL,
    longitude REAL,
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    rating REAL DEFAULT 5.0,
    description TEXT,
    services_list TEXT NOT NULL,
    phone TEXT,
    working_hours TEXT,
    working_days TEXT,
    image_url TEXT,
    latitude REAL,
    longitude REAL,
    verified BOOLEAN DEFAULT 1,
    source TEXT DEFAULT 'local',
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    garage_id INTEGER NOT NULL,
    vehicle_id INTEGER,
    vehicle_type TEXT NOT NULL,
    service_required TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (garage_id) REFERENCES garages(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
  );

  CREATE TABLE IF NOT EXISTS repairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER,
    user_id INTEGER NOT NULL,
    garage_id INTEGER NOT NULL,
    vehicle_id INTEGER,
    vehicle_info TEXT NOT NULL,
    problem_description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    estimated_cost REAL,
    final_cost REAL,
    diagnosis_notes TEXT,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (garage_id) REFERENCES garages(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
  );

  CREATE TABLE IF NOT EXISTS repair_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repair_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    updated_by TEXT DEFAULT 'garage',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repair_id) REFERENCES repairs(id)
  );
`);

// ادخال البيانات الافتراضية اذا كانت القاعدة فارغة
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  // انشاء حساب مدير افتراضي
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (phone, password, vehicle_type, role) VALUES (?, ?, ?, ?)')
    .run('admin', hashedPassword, 'system', 'admin');

  // ادخال السيارات الافتراضية مرتبطة بالمستخدم admin (id=1)
  const insertVehicle = db.prepare(`
    INSERT OR IGNORE INTO vehicles (name, year, status, user_id, lastInspection, last_repair_date, total_repairs_count) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertVehicle.run('Sedan LX', 2023, 'ok', 1, '2026-04-01', '2026-04-01', 2);
  insertVehicle.run('SUV Pro', 2022, 'warning', 1, '2026-03-24', '2026-03-24', 1);
  insertVehicle.run('Truck XT', 2024, 'critical', 1, '2026-04-06', null, 0);

  // ادخال اخطاء التشخيص
  const insertDiagnostic = db.prepare('INSERT OR IGNORE INTO diagnostics (vehicle_id, code, description, severity) VALUES (?, ?, ?, ?)');
  insertDiagnostic.run(1, 'P0420', 'Catalyst system efficiency below threshold', 'medium');
  insertDiagnostic.run(1, 'P0171', 'System too lean (Bank 1)', 'low');
  insertDiagnostic.run(2, 'P0302', 'Cylinder 2 misfire detected', 'high');
  insertDiagnostic.run(3, 'P0700', 'Transmission control system malfunction', 'critical');
  insertDiagnostic.run(3, 'P0128', 'Coolant thermostat temperature below threshold', 'medium');

  // ادخال جراجات افتراضية
  const insertGarage = db.prepare(`
    INSERT OR IGNORE INTO garages (id, name, location, rating, services, phone, address, working_hours, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertGarage.run(30, 'Alaa Mécanique Auto Pro', 'Alger Centre', 4.5, '["Vidange","Révision","Diagnostic","Freins"]', '0550123456', '12 Rue Didouche Mourad, Alger', '08:00 - 18:00', 1);
  insertGarage.run(31, 'Garage Moderne Auto', 'Bab Ezzouar', 4.2, '["Climatisation","Moteur","Échappement","Électricité"]', '0550987654', '15 Cité 5 Juillet, Bab Ezzouar', '09:00 - 17:00', 1);
  insertGarage.run(32, 'Elite Car Service', 'Hydra', 4.8, '["Diagnostic","Réparation moteur","Vidange"]', '0550112233', '03 Rue des Frères, Hydra', '08:00 - 19:00', 1);

  // ادخال مواعيد وهمية للعرض
  const insertAppointment = db.prepare(`
    INSERT OR IGNORE INTO appointments (user_id, garage_id, vehicle_id, vehicle_type, service_required, appointment_date, appointment_time, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAppointment.run(1, 30, 1, 'Sedan LX 2023', 'Vidange et révision', '2026-05-10', '09:00', 'confirmed');
  insertAppointment.run(1, 31, 2, 'SUV Pro 2022', 'Réparation freins', '2026-05-12', '14:00', 'in_progress');
  insertAppointment.run(1, 32, 1, 'Sedan LX 2023', 'vidange', '2026-05-13', '05:14', 'completed');

  // ادخال اصلاحات وهمية
  const insertRepair = db.prepare(`
    INSERT OR IGNORE INTO repairs (appointment_id, user_id, garage_id, vehicle_id, vehicle_info, problem_description, status, estimated_cost, diagnosis_notes, started_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertRepair.run(1, 1, 30, 1, 'Sedan LX 2023', 'Vidange moteur et changement filtres', 'in_progress', 4500, 'Huile moteur usée, filtres encrassés', '2026-05-10 09:30:00', null);
  insertRepair.run(2, 1, 31, 2, 'SUV Pro 2022', 'Bruit anormal au freinage', 'diagnosing', 3500, 'À vérifier: plaquettes et disques de frein', '2026-05-12 14:15:00', null);
  insertRepair.run(3, 1, 32, 1, 'Sedan LX 2023', 'vidange', 'completed', 2000, 'Vidange effectuée', '2026-05-13 05:14:00', '2026-05-13 06:30:00');

  // ادخال تحديثات الاصلاحات
  const insertUpdate = db.prepare(`
    INSERT OR IGNORE INTO repair_updates (repair_id, status, message)
    VALUES (?, ?, ?)
  `);
  insertUpdate.run(1, 'pending', '✅ Rendez-vous confirmé pour le 10 Mai');
  insertUpdate.run(1, 'in_progress', '🔧 Travaux de vidange en cours...');
  insertUpdate.run(2, 'pending', '✅ Rendez-vous confirmé pour le 12 Mai');
  insertUpdate.run(2, 'diagnosing', '🔍 Diagnostic en cours...');
}

// تحديث قاعدة البيانات القديمة: إضافة الأعمدة الجديدة إذا لم تكن موجودة
try {
  db.exec(`ALTER TABLE vehicles ADD COLUMN user_id INTEGER REFERENCES users(id)`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE vehicles ADD COLUMN last_repair_date DATETIME`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE vehicles ADD COLUMN total_repairs_count INTEGER DEFAULT 0`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE vehicles ADD COLUMN plate_number TEXT`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE appointments ADD COLUMN vehicle_id INTEGER REFERENCES vehicles(id)`);
} catch (e) {}
try {
  db.exec(`ALTER TABLE repairs ADD COLUMN vehicle_id INTEGER REFERENCES vehicles(id)`);
} catch (e) {}

// ترحيل بيانات السيارات القديمة من users إلى vehicles إذا كانت موجودة ولم يتم ترحيلها بعد
const vehiclesWithoutUser = db.prepare('SELECT COUNT(*) as count FROM vehicles WHERE user_id IS NULL').get().count;
if (vehiclesWithoutUser > 0) {
  const users = db.prepare('SELECT id, vehicle_type FROM users WHERE vehicle_type IS NOT NULL AND vehicle_type != \'\'').all();
  for (const u of users) {
    const existing = db.prepare('SELECT id FROM vehicles WHERE user_id = ?').get(u.id);
    if (!existing) {
      db.prepare(`
        INSERT OR IGNORE INTO vehicles (name, year, status, user_id, created_at) 
        VALUES (?, ?, ?, ?, datetime('now'))
      `).run(u.vehicle_type, 2024, 'ok', u.id);
    }
  }
}

console.log('✅ قاعدة بيانات SQLite تم انشائها وتجهيزها بنجاح');

module.exports = db;