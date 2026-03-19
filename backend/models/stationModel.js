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

module.exports = {
  findStationById,
  updateStationPassword
};
