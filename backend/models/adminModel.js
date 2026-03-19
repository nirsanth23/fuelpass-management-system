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

module.exports = {
  createNotification,
  getPendingNotifications,
  markNotificationResolved
};
