import pool from "../config/db.js";

export const getDocuments = async (req, res) => {
  try {
    const { order_id, transaction_id, document_type, uploaded_by, limit = 50 } = req.query;
    let query = `SELECT d.document_id, d.order_id, d.transaction_id, d.document_type,
                        d.document_name, d.file_path, d.file_url, d.file_size, d.mime_type,
                        d.uploaded_by, d.uploaded_at, d.description, d.is_public,
                        d.created_at, d.updated_at, u.name as uploaded_by_name,
                        u.email as uploaded_by_email, co.order_code, co.cargo_name
                 FROM "DocumentFiles" d
                 LEFT JOIN users u ON d.uploaded_by = u.id
                 LEFT JOIN "CargoOrders" co ON d.order_id = co.order_id
                 WHERE 1=1`;
    const params = [];
    let paramCount = 1;

    if (order_id) { query += ` AND d.order_id = $${paramCount}`; params.push(order_id); paramCount++; }
    if (transaction_id) { query += ` AND d.transaction_id = $${paramCount}`; params.push(Number(transaction_id)); paramCount++; }
    if (document_type) { query += ` AND d.document_type = $${paramCount}`; params.push(document_type); paramCount++; }
    if (uploaded_by) { query += ` AND d.uploaded_by = $${paramCount}::uuid`; params.push(uploaded_by); paramCount++; }
    
    query += ` ORDER BY d.created_at DESC LIMIT $${paramCount}`;
    params.push(Number(limit));

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("GET /api/documents ERROR:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const { order_id, transaction_id, document_type, document_name, file_path, file_url, 
            file_size, mime_type, description, is_public = false } = req.body;

    if (!document_type || !document_name) {
      return res.status(400).json({ error: "Missing required fields", required: ["document_type", "document_name"] });
    }

    const { rows } = await pool.query(
      `INSERT INTO "DocumentFiles" 
       (order_id, transaction_id, document_type, document_name, file_path, file_url, 
        file_size, mime_type, uploaded_by, description, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [order_id || null, transaction_id ? Number(transaction_id) : null, document_type, document_name,
       file_path || null, file_url || null, file_size ? Number(file_size) : null, mime_type || null,
       req.user?.id || null, description || null, is_public]
    );

    res.status(201).json({ success: true, message: "Document created successfully", data: rows[0] });
  } catch (err) {
    console.error("POST /api/documents ERROR:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `DELETE FROM "DocumentFiles" WHERE document_id = $1 RETURNING document_id, document_name`,
      [Number(id)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json({ success: true, message: "Document deleted successfully", data: rows[0] });
  } catch (err) {
    console.error("DELETE /api/documents/:id ERROR:", err.message);
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

