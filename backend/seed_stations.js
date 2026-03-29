const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./config/db');

const stationsData = [
  { id: 'ST001', name: 'Lanka IOC - Kollupitiya',      location: 'Kollupitiya, Colombo 03' },
  { id: 'ST002', name: 'Ceypetco - Bambalapitiya',      location: 'Bambalapitiya, Colombo 04' },
  { id: 'ST003', name: 'Lanka IOC - Borella',           location: 'Borella, Colombo 08' },
  { id: 'ST004', name: 'Ceypetco - Maradana',           location: 'Maradana, Colombo 10' },
  { id: 'ST005', name: 'Lanka IOC - Wellawatte',        location: 'Wellawatte, Colombo 06' },
  { id: 'ST006', name: 'Ceypetco - Dehiwala',           location: 'Dehiwala, Colombo' },
  { id: 'ST007', name: 'Lanka IOC - Nugegoda',          location: 'Nugegoda, Colombo' },
  { id: 'ST008', name: 'Ceypetco - Rajagiriya',         location: 'Rajagiriya, Colombo' },
  { id: 'ST009', name: 'Lanka IOC - Battaramulla',      location: 'Battaramulla, Colombo' },
  { id: 'ST010', name: 'Ceypetco - Kottawa',            location: 'Kottawa, Colombo' },
  { id: 'ST011', name: 'Lanka IOC - Maharagama',        location: 'Maharagama, Colombo' },
  { id: 'ST012', name: 'Ceypetco - Piliyandala',        location: 'Piliyandala, Colombo' },
  { id: 'ST013', name: 'Lanka IOC - Moratuwa',          location: 'Moratuwa, Colombo' },
  { id: 'ST014', name: 'Ceypetco - Mount Lavinia',      location: 'Mount Lavinia, Colombo' },
  { id: 'ST015', name: 'Lanka IOC - Kaduwela',          location: 'Kaduwela, Colombo' },
  { id: 'ST016', name: 'Ceypetco - Malabe',             location: 'Malabe, Colombo' },
  { id: 'ST017', name: 'Lanka IOC - Nawala',            location: 'Nawala, Colombo' },
  { id: 'ST018', name: 'Ceypetco - Kiribathgoda',       location: 'Kiribathgoda, Colombo' },
  { id: 'ST019', name: 'Lanka IOC - Kelaniya',          location: 'Kelaniya, Colombo' },
  { id: 'ST020', name: 'Ceypetco - Kadawatha',          location: 'Kadawatha, Colombo' },
  { id: 'ST021', name: 'Lanka IOC - Athurugiriya',      location: 'Athurugiriya, Colombo' },
  { id: 'ST022', name: 'Ceypetco - Homagama',           location: 'Homagama, Colombo' },
  { id: 'ST023', name: 'Lanka IOC - Pannipitiya',       location: 'Pannipitiya, Colombo' },
  { id: 'ST024', name: 'Ceypetco - Pettah',             location: 'Pettah, Colombo 11' },
  { id: 'ST025', name: 'Lanka IOC - Fort',              location: 'Fort, Colombo 01' },
];

// First 9 stations will have low stock (< 1000L)
const LOW_STOCK_COUNT = 9;

async function run() {
  try {
    const promiseDb = db.promise();

    // Clear all existing stations
    await promiseDb.query("DELETE FROM fuel_stations");
    console.log("Cleared existing stations.");

    for (let i = 0; i < stationsData.length; i++) {
      const s = stationsData[i];
      const isLow = i < LOW_STOCK_COUNT;

      const petrolStock = isLow
        ? Math.floor(Math.random() * 700) + 100   // 100 - 800
        : Math.floor(Math.random() * 4000) + 2000; // 2000 - 6000
      const dieselStock = isLow
        ? Math.floor(Math.random() * 700) + 100
        : Math.floor(Math.random() * 4000) + 2000;

      // Generate a last supply date within the past 7 days
      const daysAgo = Math.floor(Math.random() * 7);
      const supplyDate = new Date();
      supplyDate.setDate(supplyDate.getDate() - daysAgo);
      const formattedDate = supplyDate.toISOString().split('T')[0];

      // Random supply amounts between 1000 and 5000
      const suppliedPetrol = Math.floor(Math.random() * 4000) + 1000;
      const suppliedDiesel = Math.floor(Math.random() * 4000) + 1000;

      await promiseDb.query(
        'INSERT INTO fuel_stations (station_id, name, location, password, petrol_stock, diesel_stock, last_supplied_date, last_supplied_petrol, last_supplied_diesel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.name, s.location, '12345', petrolStock, dieselStock, formattedDate, suppliedPetrol, suppliedDiesel]
      );
    }

    const [finalCheck] = await promiseDb.query("SELECT * FROM fuel_stations");
    const lowCount = finalCheck.filter(s => s.petrol_stock < 1000 || s.diesel_stock < 1000).length;
    console.log(`Done! Total stations: ${finalCheck.length}, Low stock: ${lowCount}`);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
