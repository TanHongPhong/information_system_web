import pool from "../config/db.js";

export const getOrderStatusHistory = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId || orderId.length !== 4 || !/^\d{4}$/.test(orderId)) {
      return res.status(400).json({ error: "Invalid order ID. Must be 4 digits" });
    }

    const { rows } = await pool.query(
      `SELECT history_id, order_id, old_status, new_status, changed_by_type, 
              changed_by_id, changed_by_name, reason, notes, created_at
       FROM "OrderStatusHistory"
       WHERE order_id = $1
       ORDER BY created_at DESC`,
      [orderId]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/orders/:orderId/status-history ERROR:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

export const getStatusHistory = async (req, res) => {
  try {
    const { order_id, changed_by_type, limit = 50 } = req.query;
    let query = `SELECT h.history_id, h.order_id, co.order_code, co.cargo_name,
                        h.old_status, h.new_status, h.changed_by_type, h.changed_by_id,
                        h.changed_by_name, h.reason, h.notes, h.created_at
                 FROM "OrderStatusHistory" h
                 LEFT JOIN "CargoOrders" co ON h.order_id = co.order_id
                 WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (order_id) {
      query += ` AND h.order_id = $${paramCount}`;
      params.push(order_id);
      paramCount++;
    }
    if (changed_by_type) {
      query += ` AND h.changed_by_type = $${paramCount}`;
      params.push(changed_by_type);
      paramCount++;
    }
    query += ` ORDER BY h.created_at DESC LIMIT $${paramCount}`;
    params.push(Number(limit));

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/orders/status-history ERROR:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

