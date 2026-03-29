const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./config/db');

async function run() {
  try {
    const promiseDb = db.promise();

    // Get existing users and stations
    const [users] = await promiseDb.query("SELECT id FROM users LIMIT 10");
    const [stations] = await promiseDb.query("SELECT station_id FROM fuel_stations LIMIT 25");

    if (users.length === 0 || stations.length === 0) {
      console.log("No users or stations found. Run migrations and seed_stations first.");
      process.exit(1);
    }

    // Clear old transactions
    await promiseDb.query("DELETE FROM fuel_transactions");
    console.log("Cleared existing transactions.");

    const fuelTypes = ['Petrol', 'Diesel'];

    // Generate transactions for each of the past 7 days
    for (let daysAgo = 0; daysAgo < 7; daysAgo++) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const dateStr = date.toISOString().split('T')[0];

      // 8-15 transactions per day for realistic data
      const txCount = Math.floor(Math.random() * 8) + 8;

      for (let t = 0; t < txCount; t++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const station = stations[Math.floor(Math.random() * stations.length)];
        const fuelType = fuelTypes[Math.floor(Math.random() * 2)];
        const amount = Math.floor(Math.random() * 30) + 5; // 5 to 35 liters

        // Random hour between 6 AM and 9 PM
        const hour = Math.floor(Math.random() * 15) + 6;
        const minute = Math.floor(Math.random() * 60);
        const timestamp = `${dateStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

        await promiseDb.query(
          'INSERT INTO fuel_transactions (user_id, station_id, fuel_type, amount, created_at) VALUES (?, ?, ?, ?, ?)',
          [user.id, station.station_id, fuelType, amount, timestamp]
        );
      }

      console.log(`Day ${dateStr}: ${txCount} transactions added`);
    }

    const [total] = await promiseDb.query("SELECT COUNT(*) as cnt FROM fuel_transactions");
    console.log(`Done! Total transactions: ${total[0].cnt}`);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
