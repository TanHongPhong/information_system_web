// Script kiểm tra và tạo routes cho các công ty
import pool from '../src/config/db.js';

const MAIN_ROUTES = [
  { from: 'Hà Nội', to: 'HCM', distance: 1700, duration: 24 },
  { from: 'HCM', to: 'Hà Nội', distance: 1700, duration: 24 },
  { from: 'Hà Nội', to: 'Đà Nẵng', distance: 750, duration: 12 },
  { from: 'Đà Nẵng', to: 'Hà Nội', distance: 750, duration: 12 },
  { from: 'HCM', to: 'Cần Thơ', distance: 170, duration: 3 },
  { from: 'Cần Thơ', to: 'HCM', distance: 170, duration: 3 },
  { from: 'HCM', to: 'Đà Nẵng', distance: 950, duration: 15 },
  { from: 'Đà Nẵng', to: 'HCM', distance: 950, duration: 15 },
  { from: 'Hà Nội', to: 'Cần Thơ', distance: 1870, duration: 27 },
  { from: 'Cần Thơ', to: 'Hà Nội', distance: 1870, duration: 27 },
  { from: 'Đà Nẵng', to: 'Cần Thơ', distance: 1120, duration: 18 },
  { from: 'Cần Thơ', to: 'Đà Nẵng', distance: 1120, duration: 18 },
];

async function checkAndCreateRoutes() {
  try {
    console.log('🔍 Kiểm tra và tạo routes cho các công ty...\n');

    // Lấy tất cả công ty ACTIVE
    const companiesResult = await pool.query(`
      SELECT company_id, company_name
      FROM "LogisticsCompany"
      WHERE status = 'ACTIVE'
      ORDER BY company_id
    `);

    console.log(`Tìm thấy ${companiesResult.rows.length} công ty ACTIVE\n`);

    let totalCreated = 0;
    let totalExisting = 0;

    for (const company of companiesResult.rows) {
      console.log(`📦 ${company.company_name} (ID: ${company.company_id}):`);

      for (const route of MAIN_ROUTES) {
        // Kiểm tra route đã tồn tại chưa
        const checkResult = await pool.query(`
          SELECT route_id, route_name
          FROM "Routes"
          WHERE company_id = $1
            AND origin_region = $2
            AND destination_region = $3
            AND is_active = TRUE
          LIMIT 1
        `, [company.company_id, route.from, route.to]);

        if (checkResult.rows.length > 0) {
          console.log(`   ✅ Đã có: ${route.from} → ${route.to}`);
          totalExisting++;
        } else {
          // Tạo route mới
          const routeName = `${route.from} - ${route.to}`;
          try {
            await pool.query(`
              INSERT INTO "Routes" (
                company_id,
                route_name,
                origin_region,
                destination_region,
                estimated_distance_km,
                estimated_duration_hours,
                is_active,
                created_at,
                updated_at
              )
              VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW(), NOW())
            `, [
              company.company_id,
              routeName,
              route.from,
              route.to,
              route.distance,
              route.duration
            ]);
            console.log(`   ➕ Đã tạo: ${route.from} → ${route.to} (${route.distance}km, ${route.duration}h)`);
            totalCreated++;
          } catch (insertErr) {
            console.error(`   ❌ Lỗi khi tạo route ${route.from} → ${route.to}:`, insertErr.message);
          }
        }
      }
      console.log('');
    }

    console.log(`\n📊 Tổng kết:`);
    console.log(`   - Routes đã có: ${totalExisting}`);
    console.log(`   - Routes mới tạo: ${totalCreated}`);
    console.log(`   - Tổng routes: ${totalExisting + totalCreated}`);

    // Kiểm tra lại
    console.log(`\n🔍 Kiểm tra lại routes:`);
    const verifyResult = await pool.query(`
      SELECT 
        origin_region,
        destination_region,
        COUNT(*) as count
      FROM "Routes"
      WHERE is_active = TRUE
      GROUP BY origin_region, destination_region
      ORDER BY origin_region, destination_region
    `);

    verifyResult.rows.forEach(r => {
      console.log(`   ${r.origin_region} → ${r.destination_region}: ${r.count} routes`);
    });

    console.log('\n✅ Hoàn tất!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkAndCreateRoutes();

