import { sepayConfig, buildSepayQrUrl, validateSepayConfig } from "../config/sepay.js";
import pool from "../config/db.js";

/**
 * GET /api/sepay/config
 * Lấy cấu hình Sepay cho frontend (chỉ trả về thông tin công khai, không có secret)
 */
export const getSepayConfig = async (req, res) => {
  try {
    // Kiểm tra config - nhưng vẫn trả về thông tin có sẵn nếu không đầy đủ
    const isConfigured = validateSepayConfig();
    
    if (!isConfigured) {
      // Trả về với warning nhưng không throw error
      return res.status(200).json({
        success: false,
        configured: false,
        message: "Sepay chưa được cấu hình đầy đủ. Một số tính năng có thể không hoạt động.",
        config: {
          account: sepayConfig.account || null,
          bank: sepayConfig.bank || "BIDV",
          qrTemplate: sepayConfig.qrTemplate,
          environment: sepayConfig.environment,
        },
      });
    }

    // Trả về config công khai (không có API key/secret)
    res.json({
      success: true,
      configured: true,
      config: {
        account: sepayConfig.account,
        bank: sepayConfig.bank,
        qrTemplate: sepayConfig.qrTemplate,
        environment: sepayConfig.environment,
      },
    });
  } catch (err) {
    console.error("=== GET /api/sepay/config ERROR ===");
    console.error(err);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

/**
 * POST /api/sepay/create-qr
 * Tạo QR code URL cho đơn hàng
 */
export const createSepayQr = async (req, res) => {
  try {
    const { amount, description, order_id } = req.body;

    // Validate Sepay config với message rõ ràng
    if (!validateSepayConfig()) {
      return res.status(400).json({
        error: "Sepay not configured",
        message: "Vui lòng cấu hình SEPAY_ACCOUNT và SEPAY_BANK trong file backend/.env",
        details: {
          account: sepayConfig.account ? "✓ Đã cấu hình" : "✗ Chưa cấu hình",
          bank: sepayConfig.bank ? "✓ Đã cấu hình" : "✗ Chưa cấu hình",
        },
      });
    }

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Số tiền phải lớn hơn 0",
      });
    }

    // Tạo description với order_id (4 chữ số)
    let qrDescription = description;
    if (!qrDescription && order_id) {
      // order_id giờ là VARCHAR(4), format thành "GMD1234"
      if (/^\d{4}$/.test(order_id)) {
        qrDescription = `GMD${order_id}`;
      } else {
        qrDescription = `ORDER-${order_id}`;
      }
    } else if (!qrDescription) {
      qrDescription = `ORDER-${Date.now()}`;
    }

    // Build QR URL
    let qrUrl;
    try {
      qrUrl = buildSepayQrUrl({
        amount: Number(amount),
        description: qrDescription,
      });
    } catch (err) {
      if (err.code === "SEPAY_NOT_CONFIGURED") {
        return res.status(400).json({
          error: "Sepay not configured",
          message: err.message,
        });
      }
      throw err;
    }

    res.json({
      success: true,
      qrUrl,
      description: qrDescription,
    });
  } catch (err) {
    console.error("=== POST /api/sepay/create-qr ERROR ===");
    console.error(err);
    res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
};

