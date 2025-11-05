import pool from "../config/db.js";
import bcrypt from "bcrypt";

export const createUser = async (name, phone, email, password, role = 'user') => {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const query = `
    INSERT INTO users (name, phone, email, password, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, phone, email, role, created_at
  `;
  
  const result = await pool.query(query, [name, phone, email, hashedPassword, role]);
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

