/**
 * technicianReportService.js
 * Service for technician reports (Layer 3)
 * Only admins/technicians can create/view these reports
 * Hidden from regular users
 */

const db = require('../database');

const technicianReportService = {
  /**
   * Create a new technician report (admin/technician only)
   */
  create({ vehicle_id, technician_id, diagnostic, fault_codes, repair_history, notes }) {
    const result = db.prepare(`
      INSERT INTO technician_reports (vehicle_id, technician_id, diagnostic, fault_codes, repair_history, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      vehicle_id,
      technician_id,
      diagnostic || '',
      fault_codes || '',
      repair_history || '',
      notes || ''
    );

    return {
      success: true,
      id: result.lastInsertRowid,
      message: '✅ Rapport technique ajouté'
    };
  },

  /**
   * Get all reports for a specific vehicle (admin/technician only)
   */
  getByVehicleId(vehicleId) {
    return db.prepare(`
      SELECT tr.*, u.phone as technician_phone
      FROM technician_reports tr
      JOIN users u ON tr.technician_id = u.id
      WHERE tr.vehicle_id = ?
      ORDER BY tr.created_at DESC
    `).all(vehicleId);
  },

  /**
   * Get all technician reports (admin)
   */
  getAll() {
    return db.prepare(`
      SELECT tr.*, u.phone as technician_phone, v.name as vehicle_name, v.brand, v.model, v.license_plate
      FROM technician_reports tr
      JOIN users u ON tr.technician_id = u.id
      JOIN vehicles v ON tr.vehicle_id = v.id
      ORDER BY tr.created_at DESC
    `).all();
  },

  /**
   * Get a single report by ID
   */
  getById(reportId) {
    return db.prepare(`
      SELECT tr.*, u.phone as technician_phone, v.name as vehicle_name, v.brand, v.model
      FROM technician_reports tr
      JOIN users u ON tr.technician_id = u.id
      JOIN vehicles v ON tr.vehicle_id = v.id
      WHERE tr.id = ?
    `).get(reportId);
  },

  /**
   * Delete a report (admin only)
   */
  delete(reportId) {
    db.prepare('DELETE FROM technician_reports WHERE id = ?').run(reportId);
    return { success: true, message: '✅ Rapport technique supprimé' };
  }
};

module.exports = technicianReportService;