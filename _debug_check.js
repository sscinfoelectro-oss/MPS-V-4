const db = require('./backend/database');

console.log('=== DATABASE CHECK ===');
console.log('');

// 1. GARAGES
console.log('--- GARAGES ---');
try { db.prepare('SELECT reviews_count FROM garages LIMIT 1').get(); console.log('✓ reviews_count column exists'); } catch(e) { console.log('✗ reviews_count MISSING'); }
try { db.prepare('SELECT description FROM garages LIMIT 1').get(); console.log('✓ description column exists'); } catch(e) { console.log('✗ description MISSING'); }
try { db.prepare('SELECT working_days FROM garages LIMIT 1').get(); console.log('✓ working_days column exists'); } catch(e) { console.log('✗ working_days MISSING'); }
const garages = db.prepare('SELECT * FROM garages').all();
console.log(`Total garages: ${garages.length}`);
garages.forEach(g => console.log(`  ID=${g.id} Name="${g.name}" Location="${g.location}" Rating=${g.rating}`));

// 2. SERVICES
console.log('');
console.log('--- SERVICES ---');
const services = db.prepare('SELECT * FROM services').all();
console.log(`Total services: ${services.length}`);
services.forEach(s => console.log(`  ID=${s.id} Name="${s.name}"`));

// 3. USERS + VEHICLES
console.log('');
console.log('--- USERS ---');
const users = db.prepare('SELECT * FROM users').all();
console.log(`Total users: ${users.length}`);
users.forEach(u => console.log(`  ID=${u.id} Phone="${u.phone}" Role="${u.role}" VehicleType="${u.vehicle_type}"`));

console.log('');
console.log('--- VEHICLES ---');
const vehicles = db.prepare('SELECT * FROM vehicles').all();
console.log(`Total vehicles: ${vehicles.length}`);
vehicles.forEach(v => console.log(`  ID=${v.id} Name="${v.name}" UserID=${v.user_id} Status="${v.status}"`));

// 4. APPOINTMENTS + REPAIRS
console.log('');
console.log('--- APPOINTMENTS ---');
const appointments = db.prepare('SELECT * FROM appointments').all();
console.log(`Total appointments: ${appointments.length}`);
appointments.forEach(a => console.log(`  ID=${a.id} UserID=${a.user_id} GarageID=${a.garage_id} Date="${a.appointment_date}" Status="${a.status}"`));

console.log('');
console.log('--- REPAIRS ---');
const repairs = db.prepare('SELECT * FROM repairs').all();
console.log(`Total repairs: ${repairs.length}`);
repairs.forEach(r => console.log(`  ID=${r.id} UserID=${r.user_id} GarageID=${r.garage_id} Status="${r.status}"`));

// 5. Check server.js API logic
console.log('');
console.log('=== CHECKING QUERY ISSUE ===');
console.log('Garage query in server.js: SELECT * FROM garages ORDER BY rating DESC');
const garagesByRating = db.prepare('SELECT * FROM garages ORDER BY rating DESC').all();
console.log(`Garages by rating: ${garagesByRating.length}`);

console.log('');
console.log('=== DIAGNOSIS COMPLETE ===');