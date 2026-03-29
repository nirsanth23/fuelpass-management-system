const db = require('../config/db');

const createNotification = (type, stationUsername, email, phoneNumber) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO admin_notifications (type, station_username, email, phone_number)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [type, stationUsername, email, phoneNumber], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getPendingNotifications = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM admin_notifications 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const markNotificationResolved = (id) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE admin_notifications SET status = 'resolved' WHERE id = ?`;
    db.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getNotificationById = (id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM admin_notifications WHERE id = ?`;
    db.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

const getDashboardStats = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        (SELECT SUM(petrol_stock) FROM fuel_stations) as total_petrol_stock,
        (SELECT SUM(diesel_stock) FROM fuel_stations) as total_diesel_stock,
        (SELECT COUNT(*) FROM fuel_stations WHERE status = 'Active') as active_stations,
        (SELECT COALESCE(SUM(amount), 0) FROM fuel_transactions WHERE DATE(created_at) = CURDATE()) as total_fuel_issued_today
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

const getQuotaRules = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM fuel_quota_rules';
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const updateQuotaRule = (vehicleType, weeklyLimit, carryForwardLimit) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE fuel_quota_rules SET weekly_limit = ?, carry_forward_limit = ? WHERE vehicle_type = ?';
    db.query(query, [weeklyLimit, carryForwardLimit, vehicleType], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getStations = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM fuel_stations';
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const addStation = (stationData) => {
  return new Promise((resolve, reject) => {
    const { stationId, name, location, password, petrol_stock, diesel_stock, last_supplied_date, last_supplied_petrol, last_supplied_diesel } = stationData;
    const query = 'INSERT INTO fuel_stations (station_id, name, location, password, petrol_stock, diesel_stock, last_supplied_date, last_supplied_petrol, last_supplied_diesel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [stationId, name, location, password, petrol_stock || 0, diesel_stock || 0, last_supplied_date || null, last_supplied_petrol || 0, last_supplied_diesel || 0], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const updateStation = (stationId, updateData) => {
  return new Promise((resolve, reject) => {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), stationId];
    const query = `UPDATE fuel_stations SET ${fields} WHERE station_id = ?`;
    db.query(query, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getAnalyticsData = () => {
  return new Promise((resolve, reject) => {
    const queries = {
      dailyUsage: `
        SELECT d.date,
          COALESCE(SUM(CASE WHEN t.fuel_type = 'Petrol' THEN t.amount ELSE 0 END), 0) as petrol,
          COALESCE(SUM(CASE WHEN t.fuel_type = 'Diesel' THEN t.amount ELSE 0 END), 0) as diesel
        FROM (
          SELECT CURDATE() as date
          UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 1 DAY)
          UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 2 DAY)
          UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 3 DAY)
          UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 4 DAY)
          UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 5 DAY)
          UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        ) d
        LEFT JOIN fuel_transactions t ON DATE(t.created_at) = d.date
        GROUP BY d.date
        ORDER BY d.date ASC
      `,
      fuelTypeUsage: "SELECT fuel_type, SUM(amount) as total FROM fuel_transactions GROUP BY fuel_type",
      activeStations: "SELECT s.name, COUNT(t.id) as count FROM fuel_transactions t JOIN fuel_stations s ON t.station_id = s.station_id GROUP BY s.station_id ORDER BY count DESC LIMIT 5",
      lowStockStations: "SELECT station_id, name as station_name, location, petrol_stock, diesel_stock, status FROM fuel_stations WHERE petrol_stock <= 1000 OR diesel_stock <= 1000 ORDER BY LEAST(petrol_stock, diesel_stock) ASC LIMIT 15"
    };

    const results = {};
    const keys = Object.keys(queries);
    let completed = 0;

    keys.forEach(key => {
      db.query(queries[key], (err, data) => {
        if (err) return reject(err);
        results[key] = data;
        completed++;
        if (completed === keys.length) resolve(results);
      });
    });
  });
};

const recordSupplyHistory = (stationId, petrol, diesel) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO fuel_supply_history (station_id, petrol_amount, diesel_amount) VALUES (?, ?, ?)';
    db.query(query, [stationId, petrol, diesel], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getStationHistory = (stationId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM fuel_supply_history WHERE station_id = ? ORDER BY supplied_at DESC';
    db.query(query, [stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const addQuotaRule = (vehicleType, weeklyLimit, carryForwardLimit, category = 'Heavy & Special Vehicles') => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO fuel_quota_rules (vehicle_type, weekly_limit, carry_forward_limit, category) VALUES (?, ?, ?, ?)';
    db.query(query, [vehicleType, weeklyLimit, carryForwardLimit, category], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const deleteQuotaRule = (vehicleType) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM fuel_quota_rules WHERE vehicle_type = ?';
    db.query(query, [vehicleType], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = {
  createNotification,
  getPendingNotifications,
  markNotificationResolved,
  getNotificationById,
  getDashboardStats,
  getQuotaRules,
  updateQuotaRule,
  addQuotaRule,
  deleteQuotaRule,
  getStations,
  addStation,
  updateStation,
  getAnalyticsData,
  recordSupplyHistory,
  getStationHistory
};
