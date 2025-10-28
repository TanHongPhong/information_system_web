import { createUser, findUserByEmail, verifyPassword } from "../models/User.js";

export const signup = async (req, res) => {
  try {
    const { name, phone, email, password, role } = req.body;
    
    // Kiểm tra email đã tồn tại
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email đã được sử dụng" });
    }
    
    // Tạo user mới
    const user = await createUser(name, phone, email, password, role);
    
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
    const { email, password, role } = req.body;
    
    // Tìm user theo email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }
    
    // Kiểm tra mật khẩu
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }
    
    // Kiểm tra role (optional - nếu bạn muốn verify role)
    if (role && user.role !== role) {
      return res.status(403).json({ error: "Vai trò không đúng" });
    }
    
    res.json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

