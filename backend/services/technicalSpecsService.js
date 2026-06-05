/**
 * technicalSpecsService.js
 * Service for managing vehicle technical specifications (Layer 2)
 * Automatically generates specs from local JSON database
 * Designed for future AI diagnostic integration
 */

const db = require('../database');
const specLookup = require('../helpers/specLookup');

const technicalSpecsService = {
  /**
   * Get technical specs by vehicle ID
   */
  getByVehicleId(vehicleId) {
    try {
      return db.prepare('SELECT * FROM vehicle_technical_specs WHERE vehicle_id = ?').get(vehicleId);
    } catch (err) {
      // Table might not exist yet
      return null;
    }
  },

  /**
   * Generate technical specs from local database and save to DB
   */
  generateAndSave(vehicleId, { brand, model, variant, year }) {
    const specs = specLookup.lookupTechnicalSpecs({ brand, model, variant, year });

    if (!specs) {
      console.log(`ℹ️ No technical specs found for ${brand} ${model} ${year}`);
      // Save default empty specs to allow future update
      this.save(vehicleId, {
        engine_code: '',
        engine_size: 0,
        horsepower: 0,
        torque: 0,
        abs: false,
        esp: false,
        fuel_system: '',
        ecu_type: '',
        obd_protocol: ''
      });
      return null;
    }

    console.log(`✅ Technical specs found for ${brand} ${model} ${year}: ${specs.engine_code}`);

    this.save(vehicleId, {
      engine_code: specs.engine_code || '',
      engine_size: specs.engine_size || 0,
      horsepower: specs.horsepower || 0,
      torque: specs.torque || 0,
      abs: specs.abs || false,
      esp: specs.esp || false,
      fuel_system: specs.fuel_system || '',
      ecu_type: specs.ecu_type || '',
      obd_protocol: specs.obd_protocol || ''
    });

    return specs;
  },

  /**
   * Save or update technical specs for a vehicle
   */
  save(vehicleId, { engine_code, engine_size, horsepower, torque, abs, esp, fuel_system, ecu_type, obd_protocol }) {
    const existing = this.getByVehicleId(vehicleId);
    
    if (existing) {
      db.prepare(`
        UPDATE vehicle_technical_specs SET
          engine_code = ?, engine_size = ?, horsepower = ?, torque = ?,
          abs = ?, esp = ?, fuel_system = ?, ecu_type = ?, obd_protocol = ?,
          updated_at = datetime('now')
        WHERE vehicle_id = ?
      `).run(
        engine_code, engine_size, horsepower, torque,
        abs ? 1 : 0, esp ? 1 : 0, fuel_system, ecu_type, obd_protocol,
        vehicleId
      );
    } else {
      db.prepare(`
        INSERT INTO vehicle_technical_specs 
          (vehicle_id, engine_code, engine_size, horsepower, torque, abs, esp, fuel_system, ecu_type, obd_protocol)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        vehicleId, engine_code, engine_size, horsepower, torque,
        abs ? 1 : 0, esp ? 1 : 0, fuel_system, ecu_type, obd_protocol
      );
    }
  },

  /**
   * Admin: Manually update technical specs
   */
  adminUpdate(vehicleId, specsData) {
    this.save(vehicleId, specsData);
    return { success: true, message: '✅ Spécifications techniques mises à jour' };
  },

  /**
   * Lookup what specs would be found (without saving)
   */
  preview(brand, model, variant, year) {
    return specLookup.lookupTechnicalSpecs({ brand, model, variant, year });
  },

  /**
   * Get available brands from local database
   */
  getAvailableBrands() {
    return specLookup.getAvailableBrands();
  },

  /**
   * Get models for a brand
   */
  getModels(brand) {
    return specLookup.getModelsForBrand(brand);
  },

  /**
   * Get variants for a model
   */
  getVariants(brand, model) {
    return specLookup.getVariantsForModel(brand, model);
  },

  /**
   * Get years for a variant
   */
  getYears(brand, model, variant) {
    return specLookup.getYearsForVariant(brand, model, variant);
  }
};

module.exports = technicalSpecsService;