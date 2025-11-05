// backend/src/controllers/companyControllers.js
import pool from "../config/db.js";

/** GET /api/transport-companies */
export const getCompanies = async (req, res) => {
  try {
    // Check connection string first
    const connectionString = process.env.PSQLDB_CONNECTIONSTRING;
    const isPlaceholder = !connectionString || 
      connectionString === "postgresql://user:password@host:port/database" ||
      connectionString.includes("user:password") ||
      connectionString.includes("host:port");
    
    if (isPlaceholder) {
      return res.status(503).json({
        error: "Database not configured",
        message: "PSQLDB_CONNECTIONSTRING chưa được cấu hình",
        hint: "Vui lòng cập nhật PSQLDB_CONNECTIONSTRING trong file backend/.env",
        help: {
          neon: "https://console.neon.tech",
          format: "postgresql://username:password@host:port/database"
        }
      });
    }

    // Check if table exists first
    try {
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'LogisticsCompany'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        return res.status(503).json({
          error: "Database tables not found",
          message: "Bảng LogisticsCompany chưa được tạo",
          hint: "Vui lòng chạy database migrations trước",
          help: {
            migration_file: "backend/migrations/005_create_logistics_company_tables.sql",
            steps: [
              "1. Kết nối đến database",
              "2. Chạy file: backend/migrations/005_create_logistics_company_tables.sql",
              "3. Chạy file: backend/migrations/002_create_vehicles_table.sql (nếu chưa có)"
            ]
          }
        });
      }
    } catch (checkErr) {
      // If check fails, might be connection issue
      return res.status(500).json({
        error: "Database connection failed",
        message: checkErr.message,
        hint: "Kiểm tra database connection và đảm bảo PSQLDB_CONNECTIONSTRING đã được cấu hình"
      });
    }

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
        COALESCE(lc.address, '') AS address,
        COALESCE(lc.phone, '') AS phone,
        COALESCE(lc.rating, 0) AS rating,
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
      WHERE lc.status = 'ACTIVE'
        AND ($1 = '' OR lc.company_name ILIKE '%'||$1||'%' OR lc.address ILIKE '%'||$1||'%')
        AND ($4::numeric IS NULL OR COALESCE(lc.rating, 0) >= $4::numeric)
      ORDER BY lc.rating DESC NULLS LAST, lc.company_name ASC
      LIMIT 50;
      `,
      [q, area, vehicle_type, min_rating, max_cost_per_km]
    );

    res.json(rows || []);
  } catch (err) {
    console.error("=== GET /api/transport-companies ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error details:", err.detail);
    console.error("Error hint:", err.hint);
    console.error("Full error:", err);
    
    // Provide detailed error response
    let errorMessage = "Server error";
    let errorDetails = {
      hint: "Kiểm tra database connection và migrations đã được chạy chưa"
    };
    let statusCode = 500;
    
    if (err.message.includes("does not exist") || err.message.includes("relation") || err.code === "42P01") {
      errorMessage = "Database table not found";
      errorDetails = {
        hint: "Bảng LogisticsCompany chưa được tạo. Cần chạy migrations:",
        migrations: [
          "backend/migrations/005_create_logistics_company_tables.sql",
          "backend/migrations/002_create_vehicles_table.sql"
        ]
      };
      statusCode = 503;
    } else if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
      errorMessage = "Cannot connect to database";
      errorDetails = {
        hint: "Kiểm tra PSQLDB_CONNECTIONSTRING trong .env",
        check: [
          "Connection string đúng chưa?",
          "Database server đang chạy không?",
          "Network/firewall có chặn không?"
        ]
      };
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      message: err.message,
      details: errorDetails,
      code: err.code || "UNKNOWN"
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
        lc.tax_code,
        lc.website,
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

/** GET /api/transport-companies/:id/vehicles */
export const getVehiclesByCompany = async (req, res) => {
  try {
    const companyId = Number(req.params.id);
    if (!Number.isInteger(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    const { status = "" } = req.query;

    const { rows } = await pool.query(
      `
      SELECT
        v.vehicle_id,
        v.company_id,
        v.license_plate,
        v.vehicle_type,
        v.capacity_ton,
        v.driver_name,
        v.driver_phone,
        v.status,
        v.current_location,
        v.created_at,
        v.updated_at,
        lc.company_name
      FROM "Vehicles" v
      INNER JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
      WHERE v.company_id = $1
        AND ($2 = '' OR v.status = $2)
      ORDER BY v.vehicle_type ASC, v.license_plate ASC;
      `,
      [companyId, status]
    );

    res.json(rows);
  } catch (err) {
    console.error("=== GET /api/transport-companies/:id/vehicles ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    res.status(500).json({
      error: "Server error",
      message: err.message,
      details: err.detail,
      hint: err.hint,
    });
  }
};

