/**
 * vehicleService.js
 * Service layer for vehicle CRUD operations
 * Handles Layer 1 (basic data) + Layer 2 (technical specs generation)
 */

const db = require('../database');
const specLookup = require('../helpers/specLookup');
const technicalSpecsService = require('./technicalSpecsService');

const vehicleService = {
  /**
   * Get all vehicles for a user
   */
  getUserVehicles(userId) {
    const vehicles = db.prepare(`
      SELECT v.*, 
        (SELECT COUNT(*) FROM repairs WHERE vehicle_id = v.id) as repairs_count
      FROM vehicles v 
      WHERE v.user_id = ? 
      ORDER BY v.created_at DESC
    `).all(userId);

    // Attach technical specs to each vehicle
    return vehicles.map(v => {
      const specs = technicalSpecsService.getByVehicleId(v.id);
      return { ...v, technical_specs: specs || null };
    });
  },

  /**
   * Get a single vehicle by ID (with ownership check)
   */
  getVehicleById(vehicleId, userId) {
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(vehicleId, userId);
    if (!vehicle) return null;

    const specs = technicalSpecsService.getByVehicleId(vehicleId);
    return { ...vehicle, technical_specs: specs || null };
  },

  /**
   * Create a new vehicle with auto-generated technical specs (Layer 2)
   */
  createVehicle({ name, year, plate_number, user_id, brand, model, variant, fuel_type, transmission }) {
    const result = db.prepare(`
      INSERT INTO vehicles (name, year, plate_number, user_id, status, created_at, brand, model, variant, fuel_type, transmission)
      VALUES (?, ?, ?, ?, 'ok', datetime('now'), ?, ?, ?, ?, ?)
    `).run(
      name, 
      year, 
      plate_number || null, 
      user_id, 
      brand || '', 
      model || '', 
      variant || '', 
      fuel_type || '', 
      transmission || ''
    );

    const vehicleId = result.lastInsertRowid;

    // Auto-generate technical specs from local database
    if (brand && model && year) {
      technicalSpecsService.generateAndSave(vehicleId, { brand, model, variant, year });
    }

    return vehicleId;
  },

  /**
   * Update an existing vehicle
   */
  updateVehicle(vehicleId, userId, { name, year, plate_number, brand, model, variant, fuel_type, transmission }) {
    const vehicle = db.prepare('SELECT user_id FROM vehicles WHERE id = ?').get(vehicleId);
    if (!vehicle) return { error: 'Véhicule introuvable', status: 404 };
    if (vehicle.user_id !== userId) return { error: 'غير مصرح', status: 403 };

    db.prepare(`
      UPDATE vehicles SET 
        name = ?, year = ?, plate_number = ?, 
        brand = ?, model = ?, variant = ?, 
        fuel_type = ?, transmission = ?
      WHERE id = ?
    `).run(name, year, plate_number || null, brand || '', model || '', variant || '', fuel_type || '', transmission || '', vehicleId);

    // Regenerate technical specs if brand/model/year changed
    if (brand && model && year) {
      technicalSpecsService.generateAndSave(vehicleId, { brand, model, variant, year });
    }

    return { success: true, message: '✅ Véhicule modifié avec succès!' };
  },

  /**
   * Delete a vehicle and its related data
   */
  deleteVehicle(vehicleId, userId) {
    const vehicle = db.prepare('SELECT user_id FROM vehicles WHERE id = ?').get(vehicleId);
    if (!vehicle) return { error: 'Véhicule introuvable', status: 404 };
    if (vehicle.user_id !== userId) return { error: 'غير مصرح', status: 403 };

    db.prepare('DELETE FROM diagnostics WHERE vehicle_id = ?').run(vehicleId);
    db.prepare('DELETE FROM technician_reports WHERE vehicle_id = ?').run(vehicleId);
    db.prepare('DELETE FROM vehicle_technical_specs WHERE vehicle_id = ?').run(vehicleId);
    db.prepare('DELETE FROM vehicles WHERE id = ?').run(vehicleId);

    return { success: true, message: '🗑️ Véhicule supprimé avec succès!' };
  },

  /**
   * Admin: Get all vehicles with user info
   */
  getAllVehicles() {
    return db.prepare(`
      SELECT v.*, u.phone as user_phone, u.vehicle_type as user_vehicle_type
      FROM vehicles v
      JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
    `).all();
  }
};

module.exports = vehicleService;