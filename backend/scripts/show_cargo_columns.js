import pool from "../src/config/db.js";

async function main() {
  try {
    const { rows } = await pool.query(
      `SELECT column_name
         FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'CargoOrders'
        ORDER BY ordinal_position`
    );

    console.log("Columns in CargoOrders:");
    for (const row of rows) {
      console.log(`- ${row.column_name}`);
    }
  } catch (error) {
    console.error("Error fetching columns:", error.message);
  } finally {
    await pool.end();
  }
}

main();

