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
      origin_region = "",
      destination_region = "",
    } = req.query;

    // Log để debug
    if (origin_region || destination_region) {
      console.log("🔍 GET /api/transport-companies - Filter by route:", {
        origin_region,
        destination_region,
        q,
        area
      });
    }

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
        AND (
          -- Nếu không có origin_region hoặc destination_region, hiển thị tất cả
          $6 = '' OR $7 = '' OR
          -- Ưu tiên: Tìm companies có route chính xác
          EXISTS (
            SELECT 1 FROM "Routes" r
            WHERE r.company_id = lc.company_id
              AND r.is_active = TRUE
              AND (
                (TRIM(r.origin_region) = TRIM($6) AND TRIM(r.destination_region) = TRIM($7))
                OR (TRIM(r.origin_region) = TRIM($7) AND TRIM(r.destination_region) = TRIM($6))
              )
          )
          -- Fallback: Nếu không có route chính xác, tìm companies có CompanyAreas phù hợp
          -- Company phải có cả origin_region VÀ destination_region trong CompanyAreas
          OR (
            EXISTS (
              SELECT 1 FROM "CompanyAreas" ca1
              WHERE ca1.company_id = lc.company_id
                AND ca1.area = $6
            )
            AND EXISTS (
              SELECT 1 FROM "CompanyAreas" ca2
              WHERE ca2.company_id = lc.company_id
                AND ca2.area = $7
            )
          )
        )
      ORDER BY 
        -- Ưu tiên companies có route chính xác trước
        CASE WHEN $6 != '' AND $7 != '' AND EXISTS (
          SELECT 1 FROM "Routes" r
          WHERE r.company_id = lc.company_id
            AND r.is_active = TRUE
            AND (
              (TRIM(r.origin_region) = TRIM($6) AND TRIM(r.destination_region) = TRIM($7))
              OR (TRIM(r.origin_region) = TRIM($7) AND TRIM(r.destination_region) = TRIM($6))
            )
        ) THEN 0 ELSE 1 END,
        lc.rating DESC NULLS LAST, 
        lc.company_name ASC
      LIMIT 50;
      `,
      [q, area, vehicle_type, min_rating, max_cost_per_km, origin_region, destination_region]
    );

    // Log kết quả
    if (origin_region || destination_region) {
      console.log(`✅ GET /api/transport-companies: Found ${rows.length} companies for route ${origin_region} → ${destination_region}`);
    }

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

    const { status = "", origin_region = "", destination_region = "" } = req.query;

    console.log("📋 GET /api/transport-companies/:id/vehicles", {
      companyId,
      origin_region,
      destination_region,
      status
    });
    
    // Nếu có origin_region (điểm đi) và destination_region, filter xe phải ở vị trí origin_region
    // QUAN TRỌNG: origin_region = điểm đi = nơi xe phải ở để bốc hàng
    //            destination_region = điểm đến = nơi xe sẽ đến
    if (origin_region && destination_region) {
      try {
        // Sử dụng function mới để filter theo vị trí hiện tại và điểm đến
        const { rows } = await pool.query(
          `SELECT * FROM get_available_vehicles_by_location_and_destination($1, $2, $3)`,
          [companyId, origin_region, destination_region]
        );
        
        // Filter theo status nếu có
        let filteredRows = rows;
        if (status) {
          filteredRows = rows.filter(v => v.status === status);
        }
        
        return res.json(filteredRows);
      } catch (funcErr) {
        // Nếu function chưa tồn tại, fallback về query cũ
        console.error("Error in get_available_vehicles_by_location_and_destination:", funcErr.message);
      }
    } else if (destination_region) {
      // Chỉ có destination_region, không có origin_region
      try {
        const { rows } = await pool.query(
          `SELECT * FROM get_available_vehicles_by_route($1, $2)`,
          [companyId, destination_region]
        );
        
        let filteredRows = rows;
        if (status) {
          filteredRows = rows.filter(v => v.status === status);
        }
        
        return res.json(filteredRows);
      } catch (funcErr) {
        console.warn("Function get_available_vehicles_by_route not found, using fallback query:", funcErr.message);
      }
    }

    // Query cũ (fallback hoặc khi không có destination_region)
    // SỬA: Sử dụng DISTINCT ON để tránh duplicate vehicles khi có nhiều routes
    const params = [companyId];
    let paramCount = 2;
    
    let query = `
      SELECT DISTINCT ON (v.vehicle_id)
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
        lc.company_name,
        r.route_id,
        r.route_name,
        r.origin_region,
        r.destination_region,
        CASE 
          WHEN v.current_location ILIKE '%hà nội%' OR v.current_location ILIKE '%ha noi%' OR v.current_location ILIKE '%hanoi%' THEN 'Hà Nội'
          WHEN v.current_location ILIKE '%hcm%' OR v.current_location ILIKE '%tp.hcm%' OR v.current_location ILIKE '%hồ chí minh%' OR v.current_location ILIKE '%ho chi minh%' THEN 'HCM'
          WHEN v.current_location ILIKE '%đà nẵng%' OR v.current_location ILIKE '%da nang%' THEN 'Đà Nẵng'
          WHEN v.current_location ILIKE '%cần thơ%' OR v.current_location ILIKE '%can tho%' THEN 'Cần Thơ'
          ELSE NULL
        END as vehicle_region
    `;
    
    // Thêm availability nếu có destination_region
    if (destination_region) {
      query += `, get_vehicle_availability(v.vehicle_id, $${paramCount}) as availability`;
      params.push(destination_region);
      paramCount++;
    } else {
      query += `, NULL::jsonb as availability`;
    }
    
    query += `
      FROM "Vehicles" v
      INNER JOIN "LogisticsCompany" lc ON v.company_id = lc.company_id
    `;

    // Nếu có filter theo route, join với VehicleRoutes và Routes
    if (origin_region && destination_region) {
      query += `
        INNER JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
        INNER JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
      `;
    } else {
      query += `
        LEFT JOIN "VehicleRoutes" vr ON v.vehicle_id = vr.vehicle_id AND vr.is_active = TRUE
        LEFT JOIN "Routes" r ON vr.route_id = r.route_id AND r.is_active = TRUE
      `;
    }

    query += ` WHERE v.company_id = $1`;

    if (status) {
      query += ` AND v.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Filter theo vị trí và route
    if (origin_region && destination_region) {
      // Khi có cả origin và destination: 
      // Ưu tiên hiển thị xe ở origin_region (không cần route)
      // Nhưng nếu có route phù hợp thì tốt hơn (sẽ được ưu tiên trong ORDER BY sau)
      query += ` AND (
        -- Xe phải ở vị trí origin_region (điểm đi) - dùng pattern matching
        (
          ($${paramCount} = 'Hà Nội' AND (v.current_location ILIKE '%hà nội%' OR v.current_location ILIKE '%ha noi%' OR v.current_location ILIKE '%hanoi%'))
          OR ($${paramCount} = 'HCM' AND (v.current_location ILIKE '%hcm%' OR v.current_location ILIKE '%tp.hcm%' OR v.current_location ILIKE '%hồ chí minh%' OR v.current_location ILIKE '%ho chi minh%'))
          OR ($${paramCount} = 'Đà Nẵng' AND (v.current_location ILIKE '%đà nẵng%' OR v.current_location ILIKE '%da nang%'))
          OR ($${paramCount} = 'Cần Thơ' AND (v.current_location ILIKE '%cần thơ%' OR v.current_location ILIKE '%can tho%'))
        )
      )`;
      params.push(origin_region, destination_region);
      paramCount += 2;
    } else if (origin_region) {
      // CHỈ có origin_region: chỉ filter theo vị trí, KHÔNG cần route
      // Đây là trường hợp đặt đơn ban đầu - chỉ cần xe ở vị trí pickup
      query += ` AND (
        ($${paramCount} = 'Hà Nội' AND (v.current_location ILIKE '%hà nội%' OR v.current_location ILIKE '%ha noi%' OR v.current_location ILIKE '%hanoi%'))
        OR ($${paramCount} = 'HCM' AND (v.current_location ILIKE '%hcm%' OR v.current_location ILIKE '%tp.hcm%' OR v.current_location ILIKE '%hồ chí minh%' OR v.current_location ILIKE '%ho chi minh%'))
        OR ($${paramCount} = 'Đà Nẵng' AND (v.current_location ILIKE '%đà nẵng%' OR v.current_location ILIKE '%da nang%'))
        OR ($${paramCount} = 'Cần Thơ' AND (v.current_location ILIKE '%cần thơ%' OR v.current_location ILIKE '%can tho%'))
      )`;
      params.push(origin_region);
      paramCount++;
    } else if (destination_region) {
      // Nếu chỉ có destination_region, filter xe theo vị trí hiện tại
      // Xe phải ở vị trí có route đến destination_region
      query += ` AND (
        EXISTS(
          SELECT 1 FROM "VehicleRoutes" vr2
          INNER JOIN "Routes" r2 ON vr2.route_id = r2.route_id
          WHERE vr2.vehicle_id = v.vehicle_id
            AND vr2.is_active = TRUE
            AND r2.is_active = TRUE
            AND (
              -- Xe ở Hà Nội có route đến destination_region
              ((v.current_location ILIKE '%hà nội%' OR v.current_location ILIKE '%ha noi%' OR v.current_location ILIKE '%hanoi%') AND r2.origin_region = 'Hà Nội' AND r2.destination_region = $${paramCount})
              -- Xe ở HCM có route đến destination_region
              OR ((v.current_location ILIKE '%hcm%' OR v.current_location ILIKE '%tp.hcm%' OR v.current_location ILIKE '%hồ chí minh%' OR v.current_location ILIKE '%ho chi minh%') AND r2.origin_region = 'HCM' AND r2.destination_region = $${paramCount})
              -- Xe ở Đà Nẵng có route đến destination_region
              OR ((v.current_location ILIKE '%đà nẵng%' OR v.current_location ILIKE '%da nang%') AND r2.origin_region = 'Đà Nẵng' AND r2.destination_region = $${paramCount})
              -- Xe ở Cần Thơ có route đến destination_region
              OR ((v.current_location ILIKE '%cần thơ%' OR v.current_location ILIKE '%can tho%') AND r2.origin_region = 'Cần Thơ' AND r2.destination_region = $${paramCount})
              -- Route ngược lại
              OR (r2.destination_region = $${paramCount} AND (
                (v.current_location ILIKE '%hà nội%' OR v.current_location ILIKE '%ha noi%' OR v.current_location ILIKE '%hanoi%') AND r2.origin_region = 'Hà Nội'
                OR (v.current_location ILIKE '%hcm%' OR v.current_location ILIKE '%tp.hcm%' OR v.current_location ILIKE '%hồ chí minh%' OR v.current_location ILIKE '%ho chi minh%') AND r2.origin_region = 'HCM'
                OR (v.current_location ILIKE '%đà nẵng%' OR v.current_location ILIKE '%da nang%') AND r2.origin_region = 'Đà Nẵng'
                OR (v.current_location ILIKE '%cần thơ%' OR v.current_location ILIKE '%can tho%') AND r2.origin_region = 'Cần Thơ'
              ))
              -- Nếu không có location, chỉ cần có route đến destination_region
              OR (v.current_location IS NULL AND r2.destination_region = $${paramCount})
            )
        )
      )`;
      params.push(destination_region);
      paramCount++;
    }

    // DISTINCT ON yêu cầu ORDER BY phải bắt đầu với vehicle_id
    query += ` ORDER BY v.vehicle_id, v.vehicle_type ASC, v.license_plate ASC;`;

    const { rows } = await pool.query(query, params);

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

/** GET /api/transport-companies/:id/routes */
export const getRoutesByCompany = async (req, res) => {
  try {
    const companyId = Number(req.params.id);
    if (!Number.isInteger(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    const { rows } = await pool.query(
      `
      SELECT
        route_id,
        company_id,
        route_name,
        origin_region,
        destination_region,
        estimated_distance_km,
        estimated_duration_hours,
        is_active,
        created_at,
        updated_at
      FROM "Routes"
      WHERE company_id = $1
        AND is_active = TRUE
      ORDER BY route_name ASC;
      `,
      [companyId]
    );

    res.json(rows);
  } catch (err) {
    console.error("=== GET /api/transport-companies/:id/routes ERROR ===");
    console.error("Error message:", err.message);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/** GET /api/transport-companies/:id/available-regions */
export const getAvailableRegionsByCompany = async (req, res) => {
  try {
    const companyId = Number(req.params.id);
    if (!Number.isInteger(companyId)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    // Lấy danh sách các region có sẵn từ routes của công ty
    const { rows } = await pool.query(
      `
      SELECT DISTINCT
        origin_region as region,
        'origin' as type
      FROM "Routes"
      WHERE company_id = $1 AND is_active = TRUE
      UNION
      SELECT DISTINCT
        destination_region as region,
        'destination' as type
      FROM "Routes"
      WHERE company_id = $1 AND is_active = TRUE
      ORDER BY region ASC;
      `,
      [companyId]
    );

    // Tạo danh sách regions và routes
    const regions = [...new Set(rows.map(r => r.region))];
    const routes = await pool.query(
      `SELECT route_id, route_name, origin_region, destination_region
       FROM "Routes"
       WHERE company_id = $1 AND is_active = TRUE
       ORDER BY route_name ASC`,
      [companyId]
    );

    res.json({
      regions,
      routes: routes.rows,
    });
  } catch (err) {
    console.error("=== GET /api/transport-companies/:id/available-regions ERROR ===");
    console.error("Error message:", err.message);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/** GET /api/transport-companies/available-regions */
export const getAllAvailableRegions = async (req, res) => {
  try {
    // 4 điểm chính mặc định
    const mainRegions = ['Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'HCM'];
    let regions = [...mainRegions];
    
    try {
      // Thử lấy từ Routes trước
      const routesQuery = await pool.query(`
        SELECT DISTINCT origin_region as region
        FROM "Routes"
        WHERE is_active = TRUE AND origin_region IS NOT NULL
        UNION
        SELECT DISTINCT destination_region as region
        FROM "Routes"
        WHERE is_active = TRUE AND destination_region IS NOT NULL
      `);
      
      if (routesQuery.rows && routesQuery.rows.length > 0) {
        const routeRegions = routesQuery.rows
          .map(r => r.region)
          .filter(r => r && r.trim() !== '');
        if (routeRegions.length > 0) {
          regions = [...new Set([...mainRegions, ...routeRegions])];
        }
      }
    } catch (routesErr) {
      console.warn("⚠️ Error querying Routes, trying CompanyAreas:", routesErr.message);
      
      // Nếu lỗi Routes, thử lấy từ CompanyAreas
      try {
        const areasQuery = await pool.query(`
          SELECT DISTINCT area as region
          FROM "CompanyAreas"
          WHERE area IS NOT NULL
        `);
        
        if (areasQuery.rows && areasQuery.rows.length > 0) {
          const areaRegions = areasQuery.rows
            .map(r => r.region)
            .filter(r => r && r.trim() !== '');
          if (areaRegions.length > 0) {
            regions = [...new Set([...mainRegions, ...areaRegions])];
          }
        }
      } catch (areasErr) {
        console.warn("⚠️ Error querying CompanyAreas, using default regions:", areasErr.message);
        // Dùng 4 điểm chính
        regions = mainRegions;
      }
    }

    // Sort và loại bỏ null/empty
    const allRegions = [...new Set(regions)]
      .filter(r => r && r.trim() !== '')
      .sort();

    console.log(`✅ GET /api/transport-companies/available-regions: Returning ${allRegions.length} regions`);

    res.json({
      regions: allRegions.length > 0 ? allRegions : mainRegions,
    });
  } catch (err) {
    console.error("=== GET /api/transport-companies/available-regions ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    
    // Fallback: luôn trả về 4 điểm chính
    res.status(200).json({
      regions: ['Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'HCM'],
    });
  }
};

/** GET /api/warehouse/hcm-info */
export const getWarehouseHCMInfo = async (req, res) => {
  try {
    console.log("📋 GET /api/warehouse/hcm-info");
    
    // Thử gọi function
    try {
      const { rows } = await pool.query(
        `SELECT * FROM get_warehouse_hcm_info()`
      );

      if (rows.length === 0) {
        console.log("⚠️ Function returned no rows, using default");
        return res.json({
          warehouse_name: "Kho HCM",
          address: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
          full_address: "Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
        });
      }

      console.log("✅ Function returned:", rows[0]);
      return res.json(rows[0]);
    } catch (funcErr) {
      // Nếu function không tồn tại, trả về giá trị mặc định
      console.warn("⚠️ Function get_warehouse_hcm_info not found, using default:", funcErr.message);
      return res.json({
        warehouse_name: "Kho HCM",
        address: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
        full_address: "Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
      });
    }
  } catch (err) {
    console.error("=== GET /api/warehouse/hcm-info ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    
    // Trả về giá trị mặc định ngay cả khi có lỗi
    res.json({
      warehouse_name: "Kho HCM",
      address: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
      full_address: "Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
    });
  }
};

/** GET /api/warehouse/by-region?region=HCM */
export const getWarehouseByRegion = async (req, res) => {
  try {
    const { region } = req.query;
    
    console.log("📋 GET /api/warehouse/by-region", { region });
    
    if (!region) {
      return res.status(400).json({
        error: "Missing region parameter",
        message: "Please provide region parameter (e.g., ?region=HCM)"
      });
    }

    // Tìm warehouse theo region
    // Sử dụng get_region_from_address để tìm warehouse có địa chỉ match với region
    const { rows } = await pool.query(`
      SELECT 
        w.warehouse_id,
        w.warehouse_name,
        w.address,
        COALESCE(w.warehouse_name || ' - ' || w.address, w.warehouse_name) as full_address,
        get_region_from_address(w.address) as warehouse_region,
        get_region_from_address(w.warehouse_name) as name_region
      FROM "Warehouses" w
      WHERE w.status = 'ACTIVE'
        AND (
          get_region_from_address(w.address) = $1
          OR get_region_from_address(w.warehouse_name) = $1
          OR w.warehouse_name ILIKE '%' || $1 || '%'
          OR w.address ILIKE '%' || $1 || '%'
        )
      ORDER BY 
        CASE 
          WHEN get_region_from_address(w.address) = $1 THEN 1
          WHEN get_region_from_address(w.warehouse_name) = $1 THEN 2
          ELSE 3
        END,
        w.warehouse_id
      LIMIT 1;
    `, [region]);

    if (rows.length > 0) {
      console.log("✅ Found warehouse:", rows[0]);
      return res.json({
        warehouse_name: rows[0].warehouse_name,
        address: rows[0].address,
        full_address: rows[0].full_address,
        region: rows[0].warehouse_region || rows[0].name_region || region
      });
    }

    // Nếu không tìm thấy, trả về giá trị mặc định theo region
    console.log("⚠️ No warehouse found for region, using default");
    const defaultWarehouses = {
      'HCM': {
        warehouse_name: "Kho HCM",
        address: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
        full_address: "Kho HCM - 123 Đường ABC, Quận 1, TP. Hồ Chí Minh"
      },
      'Cần Thơ': {
        warehouse_name: "Kho Cần Thơ",
        address: "456 Đường XYZ, Ninh Kiều, Cần Thơ",
        full_address: "Kho Cần Thơ - 456 Đường XYZ, Ninh Kiều, Cần Thơ"
      },
      'Hà Nội': {
        warehouse_name: "Kho Hà Nội",
        address: "789 Đường DEF, Quận Hoàn Kiếm, Hà Nội",
        full_address: "Kho Hà Nội - 789 Đường DEF, Quận Hoàn Kiếm, Hà Nội"
      },
      'Đà Nẵng': {
        warehouse_name: "Kho Đà Nẵng",
        address: "321 Đường GHI, Quận Hải Châu, Đà Nẵng",
        full_address: "Kho Đà Nẵng - 321 Đường GHI, Quận Hải Châu, Đà Nẵng"
      },
      'Hải Phòng': {
        warehouse_name: "Kho Hải Phòng",
        address: "654 Đường JKL, Quận Ngô Quyền, Hải Phòng",
        full_address: "Kho Hải Phòng - 654 Đường JKL, Quận Ngô Quyền, Hải Phòng"
      }
    };

    const defaultWarehouse = defaultWarehouses[region] || {
      warehouse_name: `Kho ${region}`,
      address: `Địa chỉ kho tại ${region}`,
      full_address: `Kho ${region} - Địa chỉ kho tại ${region}`
    };

    return res.json(defaultWarehouse);
  } catch (err) {
    console.error("=== GET /api/warehouse/by-region ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    
    // Trả về giá trị mặc định
    const { region = 'HCM' } = req.query;
    res.json({
      warehouse_name: `Kho ${region}`,
      address: `Địa chỉ kho tại ${region}`,
      full_address: `Kho ${region} - Địa chỉ kho tại ${region}`
    });
  }
};


