import pool from "../config/db.js";

export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", message: "User ID is required" });
    }

    const { rows } = await pool.query(
      `SELECT preference_id, user_id, email_notifications, sms_notifications, 
              push_notifications, language, timezone, theme, default_payment_method,
              auto_save_draft, created_at, updated_at
       FROM "UserPreferences"
       WHERE user_id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      const { rows: newRows } = await pool.query(
        `INSERT INTO "UserPreferences" 
         (user_id, email_notifications, sms_notifications, push_notifications,
          language, timezone, theme, default_payment_method, auto_save_draft)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [userId, true, false, true, 'vi', 'Asia/Ho_Chi_Minh', 'light', null, true]
      );
      return res.json(newRows[0]);
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/user/preferences ERROR:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.user_id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", message: "User ID is required" });
    }

    const fields = ['email_notifications', 'sms_notifications', 'push_notifications', 
                    'language', 'timezone', 'theme', 'default_payment_method', 'auto_save_draft'];
    const updateFields = [];
    const params = [];
    let paramCount = 1;

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        params.push(req.body[field]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update", message: "At least one preference field must be provided" });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(userId);

    const existing = await pool.query(`SELECT preference_id FROM "UserPreferences" WHERE user_id = $${paramCount}`, [userId]);
    let result;

    if (existing.rows.length === 0) {
      const insertFields = ['user_id', ...updateFields.map(f => f.split('=')[0].trim())];
      const insertValues = [userId, ...params.slice(0, -1)];
      result = await pool.query(
        `INSERT INTO "UserPreferences" (${insertFields.join(', ')})
         VALUES (${insertFields.map((_, i) => `$${i + 1}`).join(', ')})
         RETURNING *`,
        insertValues
      );
    } else {
      result = await pool.query(
        `UPDATE "UserPreferences" SET ${updateFields.join(', ')} WHERE user_id = $${paramCount} RETURNING *`,
        params
      );
    }

    res.json({ success: true, message: "Preferences updated successfully", data: result.rows[0] });
  } catch (err) {
    console.error("PUT /api/user/preferences ERROR:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

