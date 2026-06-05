const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');

const logTime = (message) => {
  const time = new Date().toLocaleTimeString('fr-FR', { hour12: false });
  console.log(`[${time}]`, message);
};

const app = express();
const port = process.env.PORT || 4000;
const JWT_SECRET = 'msp-diagnostic-platform-2026-secret-key';

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logTime(`${req.method} ${req.path}`);
  next();
});

// ============================================
// ✅ MIDDLEWARES D'AUTHENTIFICATION
// ============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};

// ============================================
// 🔐 AUTHENTIFICATION
// ============================================
app.post('/api/auth/register', (req, res) => {
  const { phone, password, carType } = req.body;

  if (!phone || !password || !carType) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
      const sqlQuery = 'INSERT INTO users (phone, password, vehicle_type, role) VALUES (?, ?, ?, ?)';
      logTime(sqlQuery);
      const result = db.prepare(sqlQuery).run(phone, hashedPassword, carType, 'user');

    const token = jwt.sign({ id: result.lastInsertRowid, phone, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      token,
      user: {
        id: result.lastInsertRowid,
        phone,
        vehicle_type: carType,
        role: 'user'
      }
    });
  } catch (err) {
    res.status(400).json({ error: 'رقم الهاتف مسجل بالفعل' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;

  const sqlUser = 'SELECT * FROM users WHERE phone = ?';
  logTime(sqlUser);
  const user = db.prepare(sqlUser).get(phone);
  if (!user) return res.status(401).json({ error: 'رقم الهاتف او كلمة المرور خاطئة' });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'رقم الهاتف او كلمة المرور خاطئة' });
  }

  const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  
  res.json({
    token,
    user: {
      id: user.id,
      phone: user.phone,
      vehicle_type: user.vehicle_type,
      role: user.role
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

// ============================================
// 🛠️ GARAGES
// ============================================
app.get('/api/garages', (req, res) => {
  const sqlGarages = 'SELECT * FROM garages ORDER BY rating DESC';
  logTime(sqlGarages);
  const garages = db.prepare(sqlGarages).all();
  res.json({ garages });
});

app.get('/api/garages/external', (req, res) => {
  const sqlGarages = 'SELECT * FROM garages WHERE verified = 0 AND source = "Google Maps" ORDER BY rating DESC';
  logTime(sqlGarages);
  const garages = db.prepare(sqlGarages).all();
  res.json({ garages });
});

app.post('/api/garages/external/:id/verify', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('UPDATE garages SET verified = 1 WHERE id = ?').run(id);
    res.json({ success: true, message: '✅ تم اعتماد الجراج بنجاح' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/garages/:id/vote', (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  
  try {
    const garage = db.prepare('SELECT rating, reviews_count, votes_up, votes_down FROM garages WHERE id = ?').get(id);
    
    let totalPoints = garage.rating * garage.reviews_count;
    let newReviewsCount = garage.reviews_count + 1;
    let newVotesUp = garage.votes_up;
    let newVotesDown = garage.votes_down;
    
    if (type === 'up') {
      totalPoints += 5;
      newVotesUp += 1;
    } else if (type === 'down') {
      totalPoints += 1;
      newVotesDown += 1;
    } else {
      return res.status(400).json({ error: 'نوع التصويت غير صالح' });
    }
    
    const newRating = totalPoints / newReviewsCount;
    
    db.prepare('UPDATE garages SET rating = ?, reviews_count = ?, votes_up = ?, votes_down = ? WHERE id = ?')
      .run(newRating, newReviewsCount, newVotesUp, newVotesDown, id);
    
    res.json({ 
      success: true, 
      rating: newRating,
      reviews_count: newReviewsCount,
      votes_up: newVotesUp,
      votes_down: newVotesDown,
      message: type === 'up' ? '✅ تم إضافة تصويت إيجابي' : '✅ تم إضافة تصويت سلبي'
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================
// 🔧 SERVICES
// ============================================
app.get('/api/services', (req, res) => {
  const sqlServices = 'SELECT * FROM services ORDER BY rating DESC';
  logTime(sqlServices);
  const services = db.prepare(sqlServices).all();
  res.json({ services });
});

app.post('/api/services/:id/vote', (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  
  try {
    const service = db.prepare('SELECT rating, reviews_count, votes_up, votes_down FROM services WHERE id = ?').get(id);
    
    let totalPoints = service.rating * service.reviews_count;
    let newReviewsCount = service.reviews_count + 1;
    let newVotesUp = service.votes_up;
    let newVotesDown = service.votes_down;
    
    if (type === 'up') {
      totalPoints += 5;
      newVotesUp += 1;
    } else if (type === 'down') {
      totalPoints += 1;
      newVotesDown += 1;
    } else {
      return res.status(400).json({ error: 'نوع التصويت غير صالح' });
    }
    
    const newRating = totalPoints / newReviewsCount;
    
    db.prepare('UPDATE services SET rating = ?, reviews_count = ?, votes_up = ?, votes_down = ? WHERE id = ?')
      .run(newRating, newReviewsCount, newVotesUp, newVotesDown, id);
    
    res.json({ 
      success: true, 
      rating: newRating,
      reviews_count: newReviewsCount,
      votes_up: newVotesUp,
      votes_down: newVotesDown,
      message: type === 'up' ? '✅ تم إضافة تصويت إيجابي' : '✅ تم إضافة تصويت سلبي'
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================
// 📅 APPOINTMENTS (RÉSERVATIONS)
// ============================================

// Créer un rendez-vous
app.post('/api/appointments', authenticateToken, (req, res) => {
  const { garage_id, service_required, appointment_date, appointment_time, notes } = req.body;
  const user_id = req.user.id;

  if (!garage_id || !service_required || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }

  try {
    // Récupérer le type de véhicule de l'utilisateur
    const user = db.prepare('SELECT vehicle_type FROM users WHERE id = ?').get(user_id);
    
    const result = db.prepare(`
      INSERT INTO appointments (user_id, garage_id, vehicle_type, service_required, appointment_date, appointment_time, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(user_id, garage_id, user.vehicle_type, service_required, appointment_date, appointment_time, notes || '');

    // Créer aussi une entrée dans repairs
    const garage = db.prepare('SELECT name FROM garages WHERE id = ?').get(garage_id);
    db.prepare(`
      INSERT INTO repairs (appointment_id, user_id, garage_id, vehicle_info, problem_description, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(result.lastInsertRowid, user_id, garage_id, `${user.vehicle_type}`, service_required);

    res.json({ 
      success: true, 
      id: result.lastInsertRowid, 
      message: '✅ Rendez-vous créé avec succès!'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Liste des rendez-vous d'un utilisateur
app.get('/api/appointments', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  try {
    const appointments = db.prepare(`
      SELECT a.*, g.name as garage_name, g.location as garage_location, g.image_url as garage_image
      FROM appointments a
      JOIN garages g ON a.garage_id = g.id
      WHERE a.user_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `).all(user_id);

    res.json({ appointments });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Annuler un rendez-vous
app.put('/api/appointments/:id/cancel', authenticateToken, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    db.prepare('UPDATE appointments SET status = ? WHERE id = ? AND user_id = ?')
      .run('cancelled', id, user_id);
    db.prepare('UPDATE repairs SET status = ? WHERE appointment_id = ?')
      .run('cancelled', id);
    
    res.json({ success: true, message: '✅ Rendez-vous annulé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================
// 🔧 REPAIRS (SUIVI DES RÉPARATIONS)
// ============================================

// Obtenir les réparations d'un utilisateur
app.get('/api/repairs', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  try {
    const repairs = db.prepare(`
      SELECT r.*, g.name as garage_name, g.location as garage_location, g.image_url as garage_image, g.phone as garage_phone
      FROM repairs r
      JOIN garages g ON r.garage_id = g.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `).all(user_id);

    res.json({ repairs });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtenir les mises à jour d'une réparation (timeline)
app.get('/api/repairs/:id/updates', authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    const updates = db.prepare(`
      SELECT * FROM repair_updates
      WHERE repair_id = ?
      ORDER BY created_at ASC
    `).all(id);

    res.json({ updates });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================
// 🛠️ ADMIN GARAGES
// ============================================
app.post('/api/admin/garages', authenticateToken, isAdmin, (req, res) => {
  const { name, location, rating, services, phone, address, working_hours, working_days, image_url, latitude, longitude, source, verified, reviews_count } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO garages (name, location, rating, services, phone, address, working_hours, working_days, image_url, latitude, longitude, source, verified, reviews_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, 
      location, 
      rating || 5.0, 
      JSON.stringify(services), 
      phone, 
      address, 
      working_hours, 
      working_days !== undefined && working_days !== '' ? working_days : null, 
      image_url || null, 
      latitude ? parseFloat(latitude) : null, 
      longitude ? parseFloat(longitude) : null,
      source || 'local',
      verified ? 1 : 0,
      reviews_count || 0
    );
    
    res.json({ success: true, id: result.lastInsertRowid, message: '✅ Garage ajouté avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/garages/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { name, location, rating, services, phone, address, working_hours, working_days, image_url, latitude, longitude, source, verified, reviews_count } = req.body;
  try {
    db.prepare(`
      UPDATE garages 
      SET name = ?, location = ?, rating = ?, services = ?, phone = ?, address = ?, working_hours = ?, working_days = ?, image_url = ?, latitude = ?, longitude = ?, source = ?, verified = ?, reviews_count = ?
      WHERE id = ?
    `).run(
      name, 
      location, 
      rating, 
      JSON.stringify(services), 
      phone, 
      address, 
      working_hours, 
      working_days !== undefined && working_days !== '' ? working_days : null, 
      image_url || null,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      source || 'local',
      verified ? 1 : 0,
      reviews_count || 0,
      id
    );
    
    res.json({ success: true, message: '✅ Garage mis à jour avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/garages/:id', authenticateToken, isAdmin, (req, res) => {
  db.prepare('DELETE FROM garages WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: '✅ Garage supprimé avec succès' });
});

// ============================================
// 🛠️ ADMIN SERVICES
// ============================================
app.post('/api/admin/services', authenticateToken, isAdmin, (req, res) => {
  const { name, location, rating, description, services_list, phone, working_hours, working_days, image_url, latitude, longitude, source, verified, reviews_count } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO services (name, location, rating, description, services_list, phone, working_hours, working_days, image_url, latitude, longitude, source, verified, reviews_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, 
      location, 
      rating || 5.0, 
      description, 
      JSON.stringify(services_list), 
      phone,
      working_hours || null,
      working_days || null,
      image_url || null,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      source || 'local',
      verified ? 1 : 0,
      reviews_count || 0
    );
    
    res.json({ success: true, id: result.lastInsertRowid, message: '✅ Service ajouté avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/admin/services/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { name, location, rating, description, services_list, phone, working_hours, working_days, image_url, latitude, longitude, source, verified, reviews_count } = req.body;
  
  console.log('🔧 ========== DATA RECEIVED FROM FRONTEND ==========');
  console.log('working_hours =', working_hours, '| type:', typeof working_hours, '| is empty string:', working_hours === '');
  console.log('working_days =', working_days, '| type:', typeof working_days);
  console.log('image_url =', image_url);
  console.log('🔧 =================================================');
  
  try {
    db.exec('BEGIN TRANSACTION');
    
    const result = db.prepare(`
      UPDATE services 
      SET name = ?, location = ?, rating = ?, description = ?, services_list = ?, phone = ?, working_hours = ?, working_days = ?, image_url = ?, latitude = ?, longitude = ?, source = ?, verified = ?, reviews_count = ?
      WHERE id = ?
    `).run(
      name, 
      location, 
      rating, 
      description, 
      JSON.stringify(services_list), 
      phone, 
      working_hours !== undefined && working_hours !== '' ? working_hours : null,
      working_days !== undefined && working_days !== '' ? working_days : null,
      image_url !== undefined && image_url !== '' ? image_url : null,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      source !== undefined ? source : 'local',
      verified ? 1 : 0,
      parseInt(reviews_count) || 0,
      id
    );

    db.exec('COMMIT');
    
    console.log('🔧 Update result:', result);
    res.json({ success: true, message: '✅ Service mis à jour avec succès' });
  } catch (err) {
    console.error('🔧 Update error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/admin/services/:id', authenticateToken, isAdmin, (req, res) => {
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: '✅ Service supprimé avec succès' });
});

// ============================================
// 📊 STATS
// ============================================
app.get('/api/public/stats', (req, res) => {
  const usersResult = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const totalUsers = usersResult ? usersResult.count : 0;

  logTime(`✅ Public stats: Users=${totalUsers}`);

  res.json({
    totalUsers
  });
});

app.get('/api/admin/stats', authenticateToken, isAdmin, (req, res) => {
  const vehiclesResult = db.prepare('SELECT COUNT(*) as count FROM vehicles').get();
  const totalVehicles = vehiclesResult ? vehiclesResult.count : 0;

  const usersResult = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const totalUsers = usersResult ? usersResult.count : 0;

  const activeResult = db.prepare('SELECT COUNT(*) as count FROM diagnostics WHERE resolved = 0').get();
  const activeDiagnostics = activeResult ? activeResult.count : 0;

  const criticalResult = db.prepare("SELECT COUNT(*) as count FROM diagnostics WHERE severity = 'critical' AND resolved = 0").get();
  const criticalCount = criticalResult ? criticalResult.count : 0;

  // Ajouter les stats sur les réparations
  const activeRepairs = db.prepare("SELECT COUNT(*) as count FROM repairs WHERE status NOT IN ('completed', 'cancelled')").get();
  const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get();

  logTime(`✅ Stats: Users=${totalUsers}, Vehicles=${totalVehicles}`);

  res.json({
    totalVehicles,
    totalUsers,
    activeDiagnostics,
    criticalCount,
    activeRepairs: activeRepairs ? activeRepairs.count : 0,
    totalAppointments: totalAppointments ? totalAppointments.count : 0
  });
});

// Admin: liste des réparations
app.get('/api/admin/repairs', authenticateToken, isAdmin, (req, res) => {
  try {
    const repairs = db.prepare(`
      SELECT r.*, g.name as garage_name, u.phone as user_phone
      FROM repairs r
      JOIN garages g ON r.garage_id = g.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `).all();

    res.json({ repairs });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: liste des rendez-vous
app.get('/api/admin/appointments', authenticateToken, isAdmin, (req, res) => {
  try {
    const appointments = db.prepare(`
      SELECT a.*, g.name as garage_name, u.phone as user_phone
      FROM appointments a
      JOIN garages g ON a.garage_id = g.id
      JOIN users u ON a.user_id = u.id
      ORDER BY a.appointment_date DESC
    `).all();

    res.json({ appointments });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: mettre à jour le statut d'une réparation
app.put('/api/admin/repairs/:id/status', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { status, message } = req.body;

  try {
    db.prepare('UPDATE repairs SET status = ? WHERE id = ?').run(status, id);
    
    // Ajouter une mise à jour dans la timeline
    db.prepare(`
      INSERT INTO repair_updates (repair_id, status, message, updated_by)
      VALUES (?, ?, ?, 'garage')
    `).run(id, status, message || `Statut mis à jour: ${status}`);

    // Mettre à jour le rendez-vous associé
    const repair = db.prepare('SELECT appointment_id FROM repairs WHERE id = ?').get(id);
    if (repair && repair.appointment_id) {
      const appointmentStatus = status === 'completed' ? 'completed' : 
                                status === 'in_progress' ? 'in_progress' :
                                status === 'cancelled' ? 'cancelled' : 'pending';
      db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(appointmentStatus, repair.appointment_id);
    }

    if (status === 'completed') {
      db.prepare('UPDATE repairs SET completed_at = datetime("now") WHERE id = ?').run(id);
    }

    res.json({ success: true, message: '✅ Statut mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: mettre à jour les coûts
app.put('/api/admin/repairs/:id/cost', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { final_cost, diagnosis_notes } = req.body;

  try {
    db.prepare('UPDATE repairs SET final_cost = ?, diagnosis_notes = ? WHERE id = ?')
      .run(final_cost, diagnosis_notes, id);
    
    res.json({ success: true, message: '✅ Coût mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================
// ADMIN USERS
// ============================================
app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
  const sqlUsers = 'SELECT id, phone, vehicle_type, role, created_at FROM users';
  logTime(sqlUsers);
  const users = db.prepare(sqlUsers).all();
  res.json({ users });
});

app.post('/api/admin/vehicles', authenticateToken, isAdmin, (req, res) => {
  const { id, name, year, status } = req.body;
  
  try {
    db.prepare('INSERT INTO vehicles (id, name, year, status, lastInspection) VALUES (?, ?, ?, ?, datetime("now"))')
      .run(id, name, year, status || 'ok');
    
    res.json({ success: true, message: 'تم اضافة المركبة بنجاح' });
  } catch (err) {
    res.status(400).json({ error: 'هذا المعرف مستخدم بالفعل' });
  }
});

app.delete('/api/admin/vehicles/:id', authenticateToken, isAdmin, (req, res) => {
  db.prepare('DELETE FROM diagnostics WHERE vehicle_id = ?').run(req.params.id);
  db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
  
  res.json({ success: true, message: 'تم حذف المركبة بنجاح' });
});

app.delete('/api/admin/users/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  
  if (id === '1') {
    return res.status(400).json({ error: 'لا يمكن حذف حساب المدير الرئيسي' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  
  logTime(`✅ المستخدم رقم ${id} تم حذفه بنجاح`);
  res.json({ success: true, message: '✅ تم حذف المستخدم بنجاح' });
});

// ============================================
// 🚗 DIAGNOSTIC EN LIGNE (SIMULATION)
// ============================================

// API de diagnostic basique
app.post('/api/diagnostics/analyze', (req, res) => {
  const { symptoms, vehicle_type, year } = req.body;

  if (!symptoms) {
    return res.status(400).json({ error: 'Veuillez décrire les symptômes' });
  }

  // Analyse basique basée sur les symptômes
  const symptomAnalysis = {
    'bruit': { code: 'BRT-001', description: 'Bruit anormal détecté - Vérification mécanique recommandée', severity: 'medium' },
    'bruit moteur': { code: 'BRT-002', description: 'Bruit moteur anormal - Possible usure interne', severity: 'high' },
    'fumée': { code: 'SMK-001', description: 'Émission de fumée détectée - Vérifier le système d\'échappement', severity: 'high' },
    'fumée noire': { code: 'SMK-002', description: 'Fumée noire - Mélange air/carburant trop riche', severity: 'medium' },
    'fumée blanche': { code: 'SMK-003', description: 'Fumée blanche - Possible joint de culasse défectueux', severity: 'critical' },
    'vibration': { code: 'VIB-001', description: 'Vibrations anormales - Vérifier les pneus et la suspension', severity: 'medium' },
    'frein': { code: 'BRK-001', description: 'Problème de freinage - Vérification immédiate requise', severity: 'critical' },
    'frein bruit': { code: 'BRK-002', description: 'Bruit de freinage - Plaquettes usées', severity: 'medium' },
    'démarre pas': { code: 'STT-001', description: 'Problème de démarrage - Vérifier la batterie et le démarreur', severity: 'critical' },
    'batterie': { code: 'BAT-001', description: 'Batterie faible - Recharge ou remplacement nécessaire', severity: 'medium' },
    'climatisation': { code: 'AC-001', description: 'Climatisation défaillante - Recharge de gaz possible', severity: 'low' },
    'chauffe': { code: 'TMP-001', description: 'Surchauffe moteur - Vérifier le liquide de refroidissement', severity: 'critical' },
    'huile': { code: 'OIL-001', description: 'Niveau d\'huile bas - Vidange recommandée', severity: 'medium' }
  };

  const lowerSymptoms = symptoms.toLowerCase();
  let result = { code: 'GEN-001', description: 'Diagnostic général - Une vérification complète est recommandée', severity: 'low' };

  for (const [key, value] of Object.entries(symptomAnalysis)) {
    if (lowerSymptoms.includes(key)) {
      result = value;
      break;
    }
  }

  // Recommandation de garage basée sur le diagnostic
  const recommendation = result.severity === 'critical' 
    ? '🚨 Urgence! Rendez-vous immédiat chez un garagiste.'
    : result.severity === 'high'
    ? '⚠️ Problème sérieux. Planifiez une réparation rapidement.'
    : 'ℹ️ Problème mineur. Vous pouvez planifier une réparation quand vous voulez.';

  res.json({
    success: true,
    diagnostic: {
      code: result.code,
      description: result.description,
      severity: result.severity,
      recommendation
    },
    nearby_garages: 'Consultez notre liste de garages partenaires pour trouver un professionnel près de chez vous.'
  });
});

// ============================================
// STATUS
// ============================================
app.get('/api/status', (req, res) => {
  res.json({ 
    platform: 'Smart Automotive Diagnostic Platform', 
    uptime: process.uptime(),
    database: '✅ SQLite متصل بنجاح'
  });
});

app.listen(port, () => {
  logTime(`✅ Serveur démarré sur: http://localhost:${port}`);
  logTime(`✅ Base de données SQLite connectée`);
  logTime(`✅ Système d'authentification opérationnel`);
  logTime(`✅ Tableau de bord administrateur prêt`);
  logTime(`✅ Système de réservation et suivi des réparations activé`);
  logTime(`✅ Diagnostic en ligne opérationnel`);
  console.log(`\n📌 Compte administrateur par défaut: admin / admin123\n`);
});