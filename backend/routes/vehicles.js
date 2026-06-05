/**
 * vehicles.js - Express Router for Vehicle APIs
 * Handles all vehicle-related endpoints with modular service layer
 */

const express = require('express');
const router = express.Router();
const db = require('../database');
const vehicleService = require('../services/vehicleService');
const technicalSpecsService = require('../services/technicalSpecsService');
const technicianReportService = require('../services/technicianReportService');

// Middleware: Auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'msp-diagnostic-platform-2026-secret-key';
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } catch {
    return res.sendStatus(403);
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};

// ==========================================
// LAYER 1 - User Vehicle CRUD
// ==========================================

// GET /api/vehicles - Get user's vehicles
router.get('/vehicles', authenticateToken, (req, res) => {
  try {
    const vehicles = vehicleService.getUserVehicles(req.user.id);
    res.json({ vehicles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/:id - Get single vehicle details
router.get('/vehicles/:id', authenticateToken, (req, res) => {
  try {
    const vehicle = vehicleService.getVehicleById(parseInt(req.params.id), req.user.id);
    if (!vehicle) return res.status(404).json({ error: 'Véhicule introuvable' });
    res.json({ vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicles - Add new vehicle
router.post('/vehicles', authenticateToken, (req, res) => {
  const { name, year, plate_number, brand, model, variant, fuel_type, transmission } = req.body;
  if (!name || !year) {
    return res.status(400).json({ error: 'الاسم والسنة مطلوبان' });
  }
  try {
    const id = vehicleService.createVehicle({
      name, year, plate_number,
      user_id: req.user.id,
      brand, model, variant, fuel_type, transmission
    });
    res.json({ success: true, id, message: '🚗 Véhicule ajouté avec succès!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/vehicles/:id - Update vehicle
router.put('/vehicles/:id', authenticateToken, (req, res) => {
  const { name, year, plate_number, brand, model, variant, fuel_type, transmission } = req.body;
  try {
    const result = vehicleService.updateVehicle(parseInt(req.params.id), req.user.id, {
      name, year, plate_number, brand, model, variant, fuel_type, transmission
    });
    if (result.error) return res.status(result.status || 400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vehicles/:id - Delete vehicle
router.delete('/vehicles/:id', authenticateToken, (req, res) => {
  try {
    const result = vehicleService.deleteVehicle(parseInt(req.params.id), req.user.id);
    if (result.error) return res.status(result.status || 400).json({ error: result.error });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// LAYER 2 - Technical Specs API
// ==========================================

// GET /api/vehicles/:id/specs - Get technical specs for a vehicle
router.get('/vehicles/:id/specs', authenticateToken, (req, res) => {
  try {
    const vehicle = vehicleService.getVehicleById(parseInt(req.params.id), req.user.id);
    if (!vehicle) return res.status(404).json({ error: 'Véhicule introuvable' });
    
    const specs = technicalSpecsService.getByVehicleId(parseInt(req.params.id));
    res.json({ specs, vehicle: { brand: vehicle.brand, model: vehicle.model, variant: vehicle.variant, year: vehicle.year } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vehicles/specs/preview - Preview what specs would be generated (no save)
router.post('/vehicles/specs/preview', authenticateToken, (req, res) => {
  const { brand, model, variant, year } = req.body;
  if (!brand || !model || !year) {
    return res.status(400).json({ error: 'Marque, modèle et année sont requis' });
  }
  try {
    const result = technicalSpecsService.preview(brand, model, variant, year);
    res.json({ specs: result || { message: 'Aucune spécification trouvée pour ce véhicule' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/specs/brands - Get available brands from local DB
router.get('/vehicles/specs/brands', authenticateToken, (req, res) => {
  try {
    const brands = technicalSpecsService.getAvailableBrands();
    res.json({ brands });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/specs/models/:brand - Get models for a brand
router.get('/vehicles/specs/models/:brand', authenticateToken, (req, res) => {
  try {
    const models = technicalSpecsService.getModels(decodeURIComponent(req.params.brand));
    res.json({ models });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/specs/variants/:brand/:model - Get variants
router.get('/vehicles/specs/variants/:brand/:model', authenticateToken, (req, res) => {
  try {
    const variants = technicalSpecsService.getVariants(
      decodeURIComponent(req.params.brand),
      decodeURIComponent(req.params.model)
    );
    res.json({ variants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// LAYER 3 - Technician Reports (Admin only)
// ==========================================

// GET /api/admin/technician-reports - Get all reports
router.get('/admin/technician-reports', authenticateToken, isAdmin, (req, res) => {
  try {
    const reports = technicianReportService.getAll();
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/vehicles/:id/reports - Get reports for a specific vehicle
router.get('/admin/vehicles/:id/reports', authenticateToken, isAdmin, (req, res) => {
  try {
    const reports = technicianReportService.getByVehicleId(parseInt(req.params.id));
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/technician-reports - Create a new report
router.post('/admin/technician-reports', authenticateToken, isAdmin, (req, res) => {
  const { vehicle_id, diagnostic, fault_codes, repair_history, notes } = req.body;
  if (!vehicle_id) {
    return res.status(400).json({ error: 'ID du véhicule requis' });
  }
  try {
    const result = technicianReportService.create({
      vehicle_id,
      technician_id: req.user.id,
      diagnostic, fault_codes, repair_history, notes
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/technician-reports/:id - Delete a report
router.delete('/admin/technician-reports/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const result = technicianReportService.delete(parseInt(req.params.id));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Admin: Update technical specs manually
// ==========================================
router.put('/admin/specs/:id', authenticateToken, isAdmin, (req, res) => {
  const { engine_code, engine_size, horsepower, torque, abs, esp, fuel_system, ecu_type, obd_protocol } = req.body;
  try {
    const result = technicalSpecsService.adminUpdate(parseInt(req.params.id), {
      engine_code, engine_size, horsepower, torque, abs, esp, fuel_system, ecu_type, obd_protocol
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;