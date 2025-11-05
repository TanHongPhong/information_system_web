import pool from "../config/db.js";

export const getPaymentMethods = async (req, res) => {
  try {
    const { is_active } = req.query;
    let query = `SELECT method_id, method_code, method_name, description, 
                        is_active, icon_url, created_at, updated_at
                 FROM "PaymentMethods"
                 WHERE 1=1`;
    const params = [];

    if (is_active !== undefined) {
      query += ` AND is_active = $1`;
      params.push(is_active === 'true' || is_active === true);
    }
    query += ` ORDER BY method_id ASC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/payment-methods ERROR:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

export const getPaymentMethodByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { rows } = await pool.query(
      `SELECT method_id, method_code, method_name, description, 
              is_active, icon_url, created_at, updated_at
       FROM "PaymentMethods"
       WHERE method_code = $1`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Payment method not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/payment-methods/:code ERROR:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

