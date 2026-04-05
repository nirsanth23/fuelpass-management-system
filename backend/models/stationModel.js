const db = require('../config/db');

const findStationById = (stationId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM fuel_stations WHERE station_id = ?';
    db.query(query, [stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

const updateStationPassword = (stationId, newPassword) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE fuel_stations SET password = ? WHERE station_id = ?';
    db.query(query, [newPassword, stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getStationDashboardStats = (stationId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        s.petrol_stock, 
        s.diesel_stock,
        COALESCE(SUM(CASE WHEN t.fuel_type = 'Petrol' AND DATE(t.created_at) = CURDATE() THEN t.amount ELSE 0 END), 0) as petrol_issued_today,
        COALESCE(SUM(CASE WHEN t.fuel_type = 'Diesel' AND DATE(t.created_at) = CURDATE() THEN t.amount ELSE 0 END), 0) as diesel_issued_today,
        COUNT(CASE WHEN DATE(t.created_at) = CURDATE() THEN t.id ELSE NULL END) as customers_today
      FROM fuel_stations s
      LEFT JOIN fuel_transactions t ON s.station_id = t.station_id
      WHERE s.station_id = ?
      GROUP BY s.station_id
    `;
    db.query(query, [stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || { petrol_stock: 0, diesel_stock: 0, petrol_issued_today: 0, diesel_issued_today: 0, customers_today: 0 });
    });
  });
};

const getStationTransactions = (stationId, date) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i') as date,
        v.vehicle_number,
        v.vehicle_type,
        t.fuel_type,
        t.amount as fuel_amount,
        u.email as customer_email
      FROM fuel_transactions t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.station_id = ? AND DATE(t.created_at) = ?
      ORDER BY t.created_at DESC
    `;
    db.query(query, [stationId, date], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getStationSupplies = (stationId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        id,
        reference_no,
        petrol_amount,
        diesel_amount,
        DATE_FORMAT(supplied_at, '%Y-%m-%d %H:%i') as date
      FROM fuel_supply_history
      WHERE station_id = ?
      ORDER BY supplied_at DESC
    `;
    db.query(query, [stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const addStationSupply = (stationId, petrol, diesel, referenceNo, suppliedAt) => {
  return new Promise((resolve, reject) => {
    db.beginTransaction(err => {
      if (err) return reject(err);

      const q1 = 'INSERT INTO fuel_supply_history (station_id, reference_no, petrol_amount, diesel_amount, supplied_at) VALUES (?, ?, ?, ?, ?)';
      db.query(q1, [stationId, referenceNo, petrol, diesel, suppliedAt], (err1, results) => {
        if (err1) return db.rollback(() => reject(err1));

        const q2 = 'UPDATE fuel_stations SET petrol_stock = petrol_stock + ?, diesel_stock = diesel_stock + ? WHERE station_id = ?';
        db.query(q2, [petrol, diesel, stationId], (err2, _) => {
          if (err2) return db.rollback(() => reject(err2));

          db.commit(err3 => {
            if (err3) return db.rollback(() => reject(err3));
            resolve(results);
          });
        });
      });
    });
  });
};

const getStationProfile = (stationId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT station_id, name, location, phone_number, email FROM fuel_stations WHERE station_id = ?';
    db.query(query, [stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

const updateStationProfile = (stationId, profileData) => {
  return new Promise((resolve, reject) => {
    const { name, location, phone_number, email } = profileData;
    const query = 'UPDATE fuel_stations SET name = ?, location = ?, phone_number = ?, email = ? WHERE station_id = ?';
    db.query(query, [name, location, phone_number, email, stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = {
  findStationById,
  updateStationPassword,
  getStationDashboardStats,
  getStationTransactions,
  getStationSupplies,
  addStationSupply,
  getStationProfile,
  updateStationProfile
};
