/**
 * @file quotaScheduler.js
 * @description Enterprise Automated Weekly Quota Reset & Carry-Forward Scheduler.
 * Automatically runs every Sunday at midnight (or can be triggered on-demand by District Admins)
 * to process quota renewal, calculate carry-forward allowances for reserved vehicles, and clear expired reservations.
 */

const db = require("../config/db");

/**
 * Executes quota renewal calculations across all registered vehicles.
 * @param {Object} options
 * @param {'AUTOMATIC'|'MANUAL'} [options.resetType='AUTOMATIC'] - Execution trigger type.
 * @returns {Promise<Object>} Execution metrics summary.
 */
async function executeWeeklyQuotaRenewal({ resetType = "AUTOMATIC" } = {}) {
  const startTime = Date.now();
  console.log(`[QUOTA-SCHEDULER] Starting ${resetType} weekly quota reset & carry-forward cycle...`);

  return new Promise((resolve, reject) => {
    // 1. Fetch all active vehicles with their rules and previous week's usage
    const fetchVehiclesQuery = `
      SELECT v.id, v.vehicle_number, v.vehicle_type, v.reserved_until,
             COALESCE(v.carried_forward_quota, 0.00) AS current_carried_forward,
             COALESCE(fqr.weekly_limit, 20.00) AS weekly_limit,
             COALESCE(fqr.carry_forward_limit, 5.00) AS carry_forward_limit,
             COALESCE((
               SELECT SUM(amount) FROM fuel_transactions 
               WHERE vehicle_id = v.id 
                 AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             ), 0) AS previous_week_used
      FROM vehicles v
      LEFT JOIN fuel_quota_rules fqr ON LOWER(REPLACE(fqr.vehicle_type, ' ', '')) = LOWER(REPLACE(v.vehicle_type, ' ', ''))
    `;

    db.query(fetchVehiclesQuery, async (err, vehicles) => {
      if (err) {
        console.error("[QUOTA-SCHEDULER] Error fetching vehicles for quota renewal:", err);
        await logResetExecution({
          resetType,
          vehiclesProcessed: 0,
          vehiclesCarriedForward: 0,
          totalLitresCarried: 0,
          expiredCleared: 0,
          durationMs: Date.now() - startTime,
          status: "FAILED",
          errorMessage: err.message,
        });
        return reject(err);
      }

      let vehiclesCarriedForward = 0;
      let totalLitresCarried = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      try {
        // 2. Process each vehicle's carry-forward calculation
        for (const vehicle of vehicles) {
          const weeklyLimit = parseFloat(vehicle.weekly_limit || 20);
          const previousUsed = parseFloat(vehicle.previous_week_used || 0);
          const carryLimit = parseFloat(vehicle.carry_forward_limit || 5);
          const unusedQuota = Math.max(0, weeklyLimit - previousUsed);

          const isReserved = vehicle.reserved_until && new Date(vehicle.reserved_until) >= today;

          let newCarryForward = 0.00;
          if (isReserved && unusedQuota > 0) {
            newCarryForward = Math.min(unusedQuota, carryLimit);
            vehiclesCarriedForward++;
            totalLitresCarried += newCarryForward;
          }

          // Update vehicle carried forward quota
          await new Promise((resUp, rejUp) => {
            db.query(
              "UPDATE vehicles SET carried_forward_quota = ? WHERE id = ?",
              [newCarryForward, vehicle.id],
              (upErr) => (upErr ? rejUp(upErr) : resUp())
            );
          });
        }

        // 3. Clear reservations that have expired (reserved_until < today)
        const expiredCleared = await new Promise((resExp, rejExp) => {
          db.query(
            "UPDATE vehicles SET reserved_until = NULL WHERE reserved_until IS NOT NULL AND reserved_until < CURDATE()",
            (expErr, expResult) => (expErr ? rejExp(expErr) : resExp(expResult?.affectedRows || 0))
          );
        });

        const durationMs = Date.now() - startTime;

        // 4. Record audit log entry in database
        await logResetExecution({
          resetType,
          vehiclesProcessed: vehicles.length,
          vehiclesCarriedForward,
          totalLitresCarried: parseFloat(totalLitresCarried.toFixed(2)),
          expiredCleared,
          durationMs,
          status: "SUCCESS",
          errorMessage: null,
        });

        console.log(`[QUOTA-SCHEDULER] Quota reset cycle completed in ${durationMs}ms:`, {
          vehiclesProcessed: vehicles.length,
          vehiclesCarriedForward,
          totalLitresCarried: totalLitresCarried.toFixed(2),
          expiredCleared,
        });

        resolve({
          success: true,
          resetType,
          vehiclesProcessed: vehicles.length,
          vehiclesCarriedForward,
          totalLitresCarried: parseFloat(totalLitresCarried.toFixed(2)),
          expiredReservationsCleared: expiredCleared,
          durationMs,
          timestamp: new Date().toISOString(),
        });
      } catch (loopError) {
        console.error("[QUOTA-SCHEDULER] Error processing quota updates:", loopError);
        await logResetExecution({
          resetType,
          vehiclesProcessed: vehicles.length,
          vehiclesCarriedForward,
          totalLitresCarried,
          expiredCleared: 0,
          durationMs: Date.now() - startTime,
          status: "FAILED",
          errorMessage: loopError.message,
        });
        reject(loopError);
      }
    });
  });
}

/**
 * Inserts an execution record into quota_reset_logs table.
 */
function logResetExecution({ resetType, vehiclesProcessed, vehiclesCarriedForward, totalLitresCarried, expiredCleared, durationMs, status, errorMessage }) {
  return new Promise((resolve) => {
    const query = `
      INSERT INTO quota_reset_logs 
        (reset_type, vehicles_processed, vehicles_carried_forward, total_litres_carried, expired_reservations_cleared, execution_duration_ms, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      query,
      [resetType, vehiclesProcessed, vehiclesCarriedForward, totalLitresCarried, expiredCleared, durationMs, status, errorMessage],
      (err) => {
        if (err) console.error("[QUOTA-SCHEDULER] Could not record reset log:", err.message);
        resolve();
      }
    );
  });
}

/**
 * Retrieves past quota reset audit logs for District Admin dashboard.
 * @param {number} limit - Maximum number of logs to fetch.
 * @returns {Promise<Array>}
 */
function getQuotaResetLogs(limit = 10) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM quota_reset_logs ORDER BY created_at DESC LIMIT ?";
    db.query(query, [Number(limit) || 10], (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

/**
 * Calculates milliseconds until next Sunday at 23:59:59.
 * @returns {number} Delay in milliseconds.
 */
function getMsUntilNextSundayMidnight() {
  const now = new Date();
  const nextSunday = new Date(now);

  // Day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysUntilSunday = (7 - now.getDay()) % 7;
  nextSunday.setDate(now.getDate() + (daysUntilSunday === 0 && (now.getHours() > 0 || now.getMinutes() > 0) ? 7 : daysUntilSunday));
  nextSunday.setHours(23, 59, 59, 0);

  return Math.max(1000, nextSunday.getTime() - now.getTime());
}

/**
 * Initializes standing cron timer for automatic weekly quota reset.
 */
function startWeeklyQuotaCron() {
  const msUntilNext = getMsUntilNextSundayMidnight();
  const nextDate = new Date(Date.now() + msUntilNext);

  console.log(`[QUOTA-SCHEDULER] Initialized. Next automatic reset scheduled for: ${nextDate.toLocaleString()}`);

  setTimeout(async () => {
    try {
      await executeWeeklyQuotaRenewal({ resetType: "AUTOMATIC" });
    } catch (e) {
      console.error("[QUOTA-SCHEDULER] Scheduled execution failed:", e.message);
    }
    // Schedule repeating weekly interval (7 days)
    setInterval(async () => {
      try {
        await executeWeeklyQuotaRenewal({ resetType: "AUTOMATIC" });
      } catch (e) {
        console.error("[QUOTA-SCHEDULER] Interval execution failed:", e.message);
      }
    }, 7 * 24 * 60 * 60 * 1000);
  }, msUntilNext);
}

module.exports = {
  executeWeeklyQuotaRenewal,
  getQuotaResetLogs,
  startWeeklyQuotaCron,
};

