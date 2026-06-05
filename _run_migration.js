const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'diagnostic.db');
const db = new Database(dbPath);

const MigrationRunner = require('./backend/migrations/runner');
const runner = new MigrationRunner(db);
runner.run();

// Add the Elite Car Service garage if it doesn't exist
const garages = db.prepare('SELECT COUNT(*) as c FROM garages').get();
console.log('Final garage count:', garages.c);

const services = db.prepare('SELECT COUNT(*) as c FROM services').get();
console.log('Final services count:', services.c);

const garagesData = db.prepare('SELECT * FROM garages').all();
garagesData.forEach(g => {
  console.log(`Garage: ID=${g.id}, Name=${g.name}, Rating=${g.rating}, ReviewsCount=${g.reviews_count || 0}`);
});

const servicesData = db.prepare('SELECT * FROM services').all();
servicesData.forEach(s => {
  console.log(`Service: ID=${s.id}, Name=${s.name}, Rating=${s.rating}`);
});

console.log('✅ Fix completed successfully!');
db.close();