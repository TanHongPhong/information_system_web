import { createUser, findUserByEmail, verifyPassword as verifyUserPassword } from "../models/User.js";
import { findAdminByEmail, verifyPassword as verifyAdminPassword } from "../models/TransportCompanyAdmin.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"; // 7 days

export const signup = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    
    // Kiểm tra email đã tồn tại trong users
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email đã được sử dụng" });
    }
    
    // Kiểm tra email đã tồn tại trong TransportCompanyAdmin
    const existingAdmin = await findAdminByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({ error: "Email đã được sử dụng" });
    }
    
    // Tạo user mới với role mặc định là 'user'
    const user = await createUser(name, phone, email, password, 'user');
    
    res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Thử tìm trong TransportCompanyAdmin trước (ưu tiên admin)
    let admin = await findAdminByEmail(email);
    
    if (admin) {
      // Đây là admin của công ty vận tải
      const isValidPassword = await verifyAdminPassword(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
      }
      
      // Tạo JWT token
      const tokenPayload = {
        id: admin.admin_id,
        email: admin.email,
        role: "transport_company",
        company_id: admin.company_id,
        type: "admin"
      };
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      
      return res.json({
        message: "Đăng nhập thành công",
        token, // Gửi token về frontend
        user: {
          id: admin.admin_id,
          name: admin.name,
          phone: admin.phone,
          email: admin.email,
          role: "transport_company",
          company_id: admin.company_id,
          company_name: admin.company_name
        },
        isAdmin: true
      });
    }
    
    // Nếu không phải admin, tìm trong bảng users
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }
    
    // Kiểm tra mật khẩu
    const isValidPassword = await verifyUserPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }
    
    // Tạo JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      type: "user"
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    // Log để debug
    console.log(`✅ Login successful: ${user.email} (role: ${user.role})`);
    
    // Trả về response với role từ database (có thể là user, driver, warehouse, etc.)
    res.json({
      message: "Đăng nhập thành công",
      token, // Gửi token về frontend
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role // Role từ database: user, driver, warehouse, transport_company
      },
      isAdmin: false
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

