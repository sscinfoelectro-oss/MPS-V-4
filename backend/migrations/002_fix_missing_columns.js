/**
 * Migration 002 - Fix missing columns and data
 * Adds missing reviews_count, description, working_days to garages
 * Adds description column to garages
 * Adds working_days column to garages
 * Adds default services data
 * Adds missing garages
 */
module.exports = {
  version: 2,
  name: '002_fix_missing_columns',
  up: (db) => {
    // 1. Add missing columns to garages table
    const garageColumns = db.prepare("PRAGMA table_info('garages')").all().map(c => c.name);
    
    if (!garageColumns.includes('reviews_count')) {
      db.exec("ALTER TABLE garages ADD COLUMN reviews_count INTEGER DEFAULT 0");
      console.log('✓ Added reviews_count to garages');
    }
    if (!garageColumns.includes('description')) {
      db.exec("ALTER TABLE garages ADD COLUMN description TEXT DEFAULT ''");
      console.log('✓ Added description to garages');
    }
    if (!garageColumns.includes('working_days')) {
      db.exec("ALTER TABLE garages ADD COLUMN working_days TEXT DEFAULT ''");
      console.log('✓ Added working_days to garages');
    }

    // 2. Insert missing Elite Car Service garage if not exists
    const garageCount = db.prepare('SELECT COUNT(*) as c FROM garages').get().c;
    if (garageCount < 3) {
      db.prepare(`
        INSERT OR IGNORE INTO garages (id, name, location, rating, services, phone, address, working_hours, verified, reviews_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(32, 'Elite Car Service', 'Hydra', 4.8, '["Diagnostic","Réparation moteur","Vidange"]', '0550112233', '03 Rue des Frères, Hydra', '08:00 - 19:00', 1, 0);
      console.log('✓ Added Elite Car Service garage');
    }

    // 3. Insert default services if empty
    const servicesCount = db.prepare('SELECT COUNT(*) as c FROM services').get().c;
    if (servicesCount === 0) {
      const insertService = db.prepare(`
        INSERT INTO services (name, location, rating, description, services_list, phone, working_hours, reviews_count, verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertService.run('Mécanicien Mobile Alger', 'Alger Centre', 4.5, 'Service de réparation automobile à domicile - Alger et environs', '["Vidange","Diagnostic","Batterie","Pneus"]', '0555123456', '08:00 - 18:00', 0, 1);
      insertService.run('Auto Secours Express', 'Bab Ezzouar', 4.2, 'Service d\'urgence automobile 24h/24 - Déplacement immédiat', '["Dépannage","Batterie","Pneus","Remorquage"]', '0660123456', '24h/24', 0, 1);
      insertService.run('Technicien Mobile Pro', 'Hydra', 4.7, 'Technicien expérimenté à domicile pour tous types de véhicules', '["Diagnostic","Réparation","Entretien","Climatisation"]', '0555987654', '09:00 - 19:00', 0, 1);
      insertService.run('Garage Mobile DZ', 'Bir Mourad Raïs', 4.3, 'Service complet de mécanique mobile - Qualité et fiabilité', '["Vidange","Freins","Moteur","Électricité"]', '0770123456', '08:00 - 17:00', 0, 1);
      insertService.run('Car Doctor Services', 'Kouba', 4.6, 'Docteur pour votre voiture à domicile - Diagnostic gratuit', '["Diagnostic","Réparation","Vidange","Batterie"]', '0550123987', '08:00 - 18:00', 0, 1);
      
      console.log('✓ Added 5 default services');
    }

    // 4. Fix appointments and repairs status if needed
    const pendingAppointments = db.prepare("SELECT COUNT(*) as c FROM appointments WHERE status = 'pending'").get().c;
    if (pendingAppointments === 0) {
      // Reset appointments to proper demo statuses
      db.exec("UPDATE appointments SET status = 'confirmed' WHERE id = 1 AND status = 'completed'");
      db.exec("UPDATE appointments SET status = 'in_progress' WHERE id = 2 AND status = 'completed'");
      console.log('✓ Reset appointment statuses for demo');
    }

    // Reset repairs statuses
    const pendingRepairs = db.prepare("SELECT COUNT(*) as c FROM repairs WHERE status = 'pending'").get().c;
    if (pendingRepairs === 0) {
      db.exec("UPDATE repairs SET status = 'in_progress' WHERE id = 1 AND status = 'completed'");
      db.exec("UPDATE repairs SET status = 'diagnosing' WHERE id = 2 AND status = 'completed'");
      console.log('✓ Reset repair statuses for demo');
    }

    // 5. Update users count: ensure user with phone exists
    const userCheck = db.prepare("SELECT COUNT(*) as c FROM users WHERE phone = '0552656275'").get().c;
    if (userCheck === 0) {
      console.log('Note: User 0552656275 not found, only admin user exists');
    }

    console.log('✅ Migration 002 applied: fixed missing columns and data');
  },

  down: (db) => {
    // Remove added columns (if needed)
    // Note: SQLite doesn't easily drop columns
    db.exec('DELETE FROM services');
    console.log('⬇️ Migration 002 rolled back: services cleared');
  }
};