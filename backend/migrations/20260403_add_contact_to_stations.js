const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/db');

async function migrate() {
  try {
    const promiseDb = db.promise();
    
    console.log("Adding phone_number and email columns to fuel_stations...");
    
    // Check if columns already exist
    const [columns] = await promiseDb.query("SHOW COLUMNS FROM fuel_stations");
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('phone_number')) {
      await promiseDb.query("ALTER TABLE fuel_stations ADD COLUMN phone_number VARCHAR(20) AFTER location");
      console.log("Added phone_number column.");
    } else {
      console.log("phone_number column already exists.");
    }
    
    if (!columnNames.includes('email')) {
      await promiseDb.query("ALTER TABLE fuel_stations ADD COLUMN email VARCHAR(100) AFTER phone_number");
      console.log("Added email column.");
    } else {
      console.log("email column already exists.");
    }
    
    process.exit(0);
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

migrate();
