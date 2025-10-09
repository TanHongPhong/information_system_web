// controllers/testApiControllers.js
import pool from "../config/db.js";

const getData = async (req, res) => {
  try {
    // Example query
    const result = await pool.query(
      "SELECT * FROM public.trainsport_companies"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

export { getData };
