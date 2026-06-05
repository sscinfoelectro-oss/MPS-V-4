/**
 * Migration Runner
 * Applies pending migrations to the database
 */

const path = require('path');
const fs = require('fs');

class MigrationRunner {
  constructor(db) {
    this.db = db;
    this.migrationsDir = __dirname;
  }

  getAppliedVersions() {
    try {
      return this.db.prepare('SELECT version FROM _migrations ORDER BY version').all().map(r => r.version);
    } catch {
      return [];
    }
  }

  getMigrations() {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(f => f.match(/^\d+_.*\.js$/))
      .sort();
    return files.map(f => {
      const migration = require(path.join(this.migrationsDir, f));
      return migration;
    }).filter(m => m && typeof m.up === 'function');
  }

  run() {
    const applied = this.getAppliedVersions();
    const migrations = this.getMigrations();
    let count = 0;

    for (const migration of migrations) {
      if (!applied.includes(migration.version)) {
        console.log(`🔄 Running migration: ${migration.name}...`);
        try {
          migration.up(this.db);
          this.db.prepare('INSERT INTO _migrations (version, name) VALUES (?, ?)').run(migration.version, migration.name);
          count++;
          console.log(`✅ Migration ${migration.name} applied successfully`);
        } catch (err) {
          console.error(`❌ Migration ${migration.name} failed:`, err.message);
          throw err;
        }
      }
    }

    if (count === 0) {
      console.log('✅ All migrations already up to date');
    } else {
      console.log(`✅ Applied ${count} migration(s)`);
    }

    return count;
  }
}

module.exports = MigrationRunner;