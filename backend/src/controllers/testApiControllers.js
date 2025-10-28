// backend/src/controllers/testApiControllers.js
import pool from "../config/db.js";

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

    const { rows } = await pool.query(
      `
      SELECT
        lc.company_id,
        lc.company_name AS name,
        lc.address,
        lc.phone,
        lc.rating,
        lc.description,
        COALESCE(
          (SELECT json_agg(DISTINCT cc.area_name)
           FROM "CompanyCoverage" cc
           WHERE cc.company_id = lc.company_id
             AND ($2 = '' OR cc.area_name ILIKE '%'||$2||'%')),
          '[]'::json
        ) AS areas,
        COALESCE(
          (SELECT json_agg(
                    json_build_object(
                      'vehicle_type', cr.vehicle_type,
                      'cost_per_km', cr.cost_per_km
                    )
                    ORDER BY cr.vehicle_type)
           FROM "CarrierRate" cr
           WHERE cr.company_id = lc.company_id
             AND ($3 = '' OR cr.vehicle_type ILIKE '%'||$3||'%')
             AND ($5::numeric IS NULL OR (cr.cost_per_km IS NOT NULL AND cr.cost_per_km <= $5::numeric))),
          '[]'::json
        ) AS rates
      FROM "LogisticsCompany" lc
      WHERE
        ($1 = '' OR lc.company_name ILIKE '%'||$1||'%' OR lc.address ILIKE '%'||$1||'%')
        AND ($4::numeric IS NULL OR lc.rating >= $4::numeric)
      ORDER BY lc.rating DESC NULLS LAST, lc.company_name ASC;
      `,
      [q, area, vehicle_type, min_rating, max_cost_per_km]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
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
        lc.address,
        lc.phone,
        lc.rating,
        lc.description,
        COALESCE((SELECT json_agg(DISTINCT cc.area_name)
                  FROM "CompanyCoverage" cc
                  WHERE cc.company_id = lc.company_id), '[]'::json) AS areas,
        COALESCE((SELECT json_agg(json_build_object('vehicle_type', cr.vehicle_type, 'cost_per_km', cr.cost_per_km)
                  ORDER BY cr.vehicle_type)
                  FROM "CarrierRate" cr
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
