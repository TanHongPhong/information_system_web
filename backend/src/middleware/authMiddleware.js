// backend/src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * Middleware để verify JWT token từ Authorization header
 * Token có format: "Bearer <token>"
 */
export const verifyToken = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "No token provided or invalid format" 
      });
    }

    const token = authHeader.substring(7); // Bỏ "Bearer " prefix
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Thêm thông tin user vào request để các route sau có thể dùng
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Token expired" 
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Invalid token" 
      });
    }
    return res.status(500).json({ 
      error: "Server error", 
      message: error.message 
    });
  }
};

/**
 * Optional middleware - chỉ verify nếu có token, không bắt buộc
 */
export const optionalVerifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Nếu có lỗi, vẫn tiếp tục nhưng không có req.user
    next();
  }
};

