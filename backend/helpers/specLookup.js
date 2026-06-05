/**
 * specLookup.js
 * Helper to look up vehicle technical specifications from local JSON database
 * Structured for future external API integration (e.g., NHTSA vPIC, CarQuery API)
 */

const fs = require('fs');
const path = require('path');

const specsPath = path.join(__dirname, '..', 'data', 'vehicle_specs.json');
let specsCache = null;

/**
 * Load and cache the vehicle specs database
 */
function loadSpecs() {
  if (!specsCache) {
    try {
      const raw = fs.readFileSync(specsPath, 'utf-8');
      specsCache = JSON.parse(raw);
    } catch (err) {
      console.error('❌ Failed to load vehicle specs:', err.message);
      specsCache = { brands: {} };
    }
  }
  return specsCache;
}

/**
 * Normalize a string: trim, lowercase, remove extra spaces
 */
function normalize(str) {
  if (!str) return '';
  return str.toString().trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Find the closest matching brand key from specs database
 */
function findBrandKey(brandName) {
  const data = loadSpecs();
  const normalized = normalize(brandName);
  
  // Direct match first
  for (const key of Object.keys(data.brands)) {
    if (normalize(key) === normalized) return key;
  }
  
  // Partial match
  for (const key of Object.keys(data.brands)) {
    if (normalize(key).includes(normalized) || normalized.includes(normalize(key))) return key;
  }
  
  return null;
}

/**
 * Find the closest matching model key for a given brand
 */
function findModelKey(brandKey, modelName) {
  const data = loadSpecs();
  const brand = data.brands[brandKey];
  if (!brand || !brand.models) return null;
  
  const normalized = normalize(modelName);
  
  for (const key of Object.keys(brand.models)) {
    if (normalize(key) === normalized) return key;
  }
  
  for (const key of Object.keys(brand.models)) {
    if (normalize(key).includes(normalized) || normalized.includes(normalize(key))) return key;
  }
  
  return null;
}

/**
 * Find the closest matching variant key for a given brand and model
 */
function findVariantKey(brandKey, modelKey, variantName) {
  const data = loadSpecs();
  const model = data.brands[brandKey]?.models[modelKey];
  if (!model || !model.variants) return null;
  
  if (!variantName) {
    // Return first variant available
    const keys = Object.keys(model.variants);
    return keys.length > 0 ? keys[0] : null;
  }
  
  const normalized = normalize(variantName);
  
  for (const key of Object.keys(model.variants)) {
    if (normalize(key) === normalized) return key;
  }
  
  for (const key of Object.keys(model.variants)) {
    if (normalize(key).includes(normalized) || normalized.includes(normalize(key))) return key;
  }
  
  // Fall back to first variant
  const keys = Object.keys(model.variants);
  return keys.length > 0 ? keys[0] : null;
}

/**
 * Look up technical specs for a vehicle
 * @param {Object} params - { brand, model, variant (optional), year }
 * @returns {Object|null} - Technical specs or null if not found
 */
function lookupTechnicalSpecs({ brand, model, variant, year }) {
  const brandKey = findBrandKey(brand);
  if (!brandKey) {
    console.log(`ℹ️ Brand "${brand}" not found in local specs database`);
    return null;
  }
  
  const modelKey = findModelKey(brandKey, model);
  if (!modelKey) {
    console.log(`ℹ️ Model "${model}" not found for brand "${brandKey}"`);
    return null;
  }
  
  const variantKey = findVariantKey(brandKey, modelKey, variant);
  if (!variantKey) {
    console.log(`ℹ️ Variant "${variant || '(none)'}" not found for ${brandKey} ${modelKey}`);
    return null;
  }
  
  const data = loadSpecs();
  const yearsData = data.brands[brandKey].models[modelKey].variants[variantKey]?.years;
  
  if (!yearsData) {
    console.log(`ℹ️ No year data for ${brandKey} ${modelKey} ${variantKey}`);
    return null;
  }
  
  const yearStr = String(year);
  
  // Exact year match
  if (yearsData[yearStr]) {
    return { ...yearsData[yearStr], _matched: true, _source: 'local', _match_method: 'exact_year' };
  }
  
  // Find closest year
  const availableYears = Object.keys(yearsData).map(Number).sort((a, b) => a - b);
  if (availableYears.length === 0) return null;
  
  // Find nearest year
  const closest = availableYears.reduce((prev, curr) => {
    return Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev;
  });
  
  if (yearsData[String(closest)]) {
    return {
      ...yearsData[String(closest)],
      _matched: true,
      _source: 'local',
      _match_method: 'closest_year',
      _matched_year: closest
    };
  }
  
  return null;
}

/**
 * Get all available brands
 */
function getAvailableBrands() {
  const data = loadSpecs();
  return Object.keys(data.brands);
}

/**
 * Get all models for a brand
 */
function getModelsForBrand(brandName) {
  const brandKey = findBrandKey(brandName);
  if (!brandKey) return [];
  const data = loadSpecs();
  return Object.keys(data.brands[brandKey].models);
}

/**
 * Get all variants for a brand and model
 */
function getVariantsForModel(brandName, modelName) {
  const brandKey = findBrandKey(brandName);
  if (!brandKey) return [];
  const modelKey = findModelKey(brandKey, modelName);
  if (!modelKey) return [];
  const data = loadSpecs();
  return Object.keys(data.brands[brandKey].models[modelKey].variants);
}

/**
 * Get available years for a specific brand, model, variant
 */
function getYearsForVariant(brandName, modelName, variantName) {
  const brandKey = findBrandKey(brandName);
  if (!brandKey) return [];
  const modelKey = findModelKey(brandKey, modelName);
  if (!modelKey) return [];
  const variantKey = findVariantKey(brandKey, modelKey, variantName);
  if (!variantKey) return [];
  const data = loadSpecs();
  return Object.keys(data.brands[brandKey].models[modelKey].variants[variantKey].years).map(Number).sort((a, b) => a - b);
}

module.exports = {
  loadSpecs,
  findBrandKey,
  findModelKey,
  findVariantKey,
  lookupTechnicalSpecs,
  getAvailableBrands,
  getModelsForBrand,
  getVariantsForModel,
  getYearsForVariant
};