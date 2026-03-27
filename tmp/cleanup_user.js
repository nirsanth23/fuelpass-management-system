require('dotenv').config({ path: '../backend/.env' });
const mysql = require('mysql2/promise');

async function cleanup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const email = 'nirush104@gmail.com';
    const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      console.log(`User ${email} not found.`);
      return;
    }

    const userId = rows[0].id;

    // Delete associated vehicles (if no cascade)
    await connection.execute('DELETE FROM vehicles WHERE userId = ?', [userId]);
    // Delete the user
    await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

    console.log(`User ${email} and all associated records have been removed.`);
  } catch (err) {
    console.error('Cleanup failed:', err);
  } finally {
    await connection.end();
  }
}

cleanup();
