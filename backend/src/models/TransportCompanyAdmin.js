import pool from "../config/db.js";
import bcrypt from "bcrypt";

/**
 * Tìm admin theo email
 */
export const findAdminByEmail = async (email) => {
  const query = `
    SELECT 
      tca.*,
      lc.company_name,
      lc.address as company_address
    FROM "TransportCompanyAdmin" tca
    INNER JOIN "LogisticsCompany" lc ON tca.company_id = lc.company_id
    WHERE tca.email = $1 AND tca.is_active = TRUE
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

/**
 * Tạo admin mới
 */
export const createAdmin = async (company_id, name, phone, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const query = `
    INSERT INTO "TransportCompanyAdmin" (company_id, name, phone, email, password)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING admin_id, company_id, name, phone, email, is_active, created_at
  `;
  
  const result = await pool.query(query, [
    company_id,
    name,
    phone,
    email,
    hashedPassword,
  ]);
  return result.rows[0];
};

/**
 * Xác thực mật khẩu
 */
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Lấy admin theo company_id
 */
export const findAdminByCompanyId = async (company_id) => {
  const query = `
    SELECT 
      tca.*,
      lc.company_name
    FROM "TransportCompanyAdmin" tca
    INNER JOIN "LogisticsCompany" lc ON tca.company_id = lc.company_id
    WHERE tca.company_id = $1 AND tca.is_active = TRUE
  `;
  const result = await pool.query(query, [company_id]);
  return result.rows;
};

