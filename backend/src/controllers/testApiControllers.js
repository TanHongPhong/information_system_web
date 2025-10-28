// backend/src/controllers/testApiControllers.js
import pool from "../config/db.js";

/** GET /api/test - Test API connection */
export const getData = async (req, res) => {
  try {
    // Test database connection
    const { rows } = await pool.query("SELECT NOW() as current_time");
    res.json({ 
      message: "API is working! ✅", 
      database: "Connected to Neon PostgreSQL",
      timestamp: rows[0].current_time 
    });
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
};

/** GET /api/transport-companies */
export const getCompanies = async (req, res) => {
  try {
    const {
      q = "",
      area = "",
      vehicle_type = "",
      min_rating = null,
      max_cost_per_km = null,
    } = req.query;

    // Full query with proper joins for areas and rates
    const { rows } = await pool.query(
      `
      SELECT
        lc.company_id,
        lc.company_name AS name,
        lc.address,
        lc.phone,
        lc.rating,
        COALESCE(
          (SELECT json_agg(DISTINCT ca.area)
           FROM "CompanyAreas" ca
           WHERE ca.company_id = lc.company_id
             AND ($2 = '' OR ca.area ILIKE '%'||$2||'%')),
          '[]'::json
        ) AS areas,
        COALESCE(
          (SELECT json_agg(
                    json_build_object(
                      'vehicle_type', cr.vehicle_type,
                      'cost_per_km', cr.cost_per_km
                    )
                    ORDER BY cr.vehicle_type)
           FROM "CompanyRates" cr
           WHERE cr.company_id = lc.company_id
             AND ($3 = '' OR cr.vehicle_type ILIKE '%'||$3||'%')
             AND ($5::numeric IS NULL OR (cr.cost_per_km IS NOT NULL AND cr.cost_per_km <= $5::numeric))),
          '[]'::json
        ) AS rates
      FROM "LogisticsCompany" lc
      WHERE
        ($1 = '' OR lc.company_name ILIKE '%'||$1||'%' OR lc.address ILIKE '%'||$1||'%')
        AND ($4::numeric IS NULL OR lc.rating >= $4::numeric)
      ORDER BY lc.rating DESC NULLS LAST, lc.company_name ASC
      LIMIT 50;
      `,
      [q, area, vehicle_type, min_rating, max_cost_per_km]
    );

    res.json(rows);
  } catch (err) {
    console.error("=== GET /api/transport-companies ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error details:", err.detail);
    console.error("Error hint:", err.hint);
    console.error("Full error:", err);
    res.status(500).json({ 
      error: "Server error", 
      message: err.message,
      details: err.detail,
      hint: err.hint
    });
  }
};

/** GET /api/transport-companies/:id */
export const getCompanyById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "Invalid id" });

    const { rows } = await pool.query(
      `
      SELECT
        lc.company_id,
        lc.company_name AS name,
        COALESCE(lc.address, '') AS address,
        lc.phone,
        COALESCE(lc.email, '') as email,
        lc.rating,
        COALESCE(lc.description, '') as description,
        COALESCE(lc.status, 'ACTIVE') as status,
        COALESCE(lc.has_cold, false) as has_cold,
        COALESCE(lc.has_dangerous_goods, false) as has_dangerous_goods,
        COALESCE(lc.has_loading_dock, false) as has_loading_dock,
        COALESCE(lc.has_insurance, false) as has_insurance,
        COALESCE((SELECT json_agg(DISTINCT ca.area)
                  FROM "CompanyAreas" ca
                  WHERE ca.company_id = lc.company_id), '[]'::json) AS areas,
        COALESCE((SELECT json_agg(json_build_object('vehicle_type', cr.vehicle_type, 'cost_per_km', cr.cost_per_km)
                  ORDER BY cr.vehicle_type)
                  FROM "CompanyRates" cr
                  WHERE cr.company_id = lc.company_id), '[]'::json) AS rates
      FROM "LogisticsCompany" lc
      WHERE lc.company_id = $1;
      `,
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
