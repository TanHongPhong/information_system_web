import dotenv from "dotenv";
dotenv.config();

/**
 * Cấu hình Sepay Payment Gateway
 * 
 * Các biến môi trường cần thiết:
 * - SEPAY_API_KEY: API Key từ Sepay
 * - SEPAY_API_SECRET: API Secret để verify webhook signature
 * - SEPAY_ACCOUNT: Số tài khoản/điện thoại ví nhận tiền
 * - SEPAY_BANK: Mã ngân hàng (VD: BIDV, VCB, MB, TCB...)
 * - SEPAY_WEBHOOK_SECRET: Secret key để validate webhook (nếu có)
 */
export const sepayConfig = {
  // API Credentials
  apiKey: process.env.SEPAY_API_KEY || "",
  apiSecret: process.env.SEPAY_API_SECRET || "",
  
  // Thông tin tài khoản nhận tiền
  account: process.env.SEPAY_ACCOUNT || "",
  bank: process.env.SEPAY_BANK || "BIDV",
  
  // Webhook
  webhookSecret: process.env.SEPAY_WEBHOOK_SECRET || "",
  webhookUrl: process.env.SEPAY_WEBHOOK_URL || `${process.env.BACKEND_URL || "http://localhost:5001"}/api/sepay/webhook`,
  
  // QR Code Settings
  qrTemplate: process.env.SEPAY_QR_TEMPLATE || "compact", // "compact" | "standard"
  
  // API Base URL
  apiBaseUrl: process.env.SEPAY_API_BASE_URL || "https://api.sepay.vn", // Nếu Sepay có API
  
  // QR Image URL
  qrImageUrl: process.env.SEPAY_QR_IMAGE_URL || "https://qr.sepay.vn/img",
  
  // Environment
  environment: process.env.SEPAY_ENVIRONMENT || "production", // "sandbox" | "production"
};

/**
 * Validate Sepay config
 * Kiểm tra các thông tin cần thiết đã được cấu hình chưa
 */
export function validateSepayConfig() {
  const required = ["account", "bank"];
  const missing = required.filter(key => !sepayConfig[key] || sepayConfig[key].trim() === "");
  
  if (missing.length > 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`⚠️  Sepay config missing: ${missing.join(", ")}`);
      console.warn("💡 Sepay features sẽ không hoạt động cho đến khi được cấu hình");
    }
    return false;
  }
  
  return true;
}

/**
 * Build Sepay QR Code URL
 * Tạo URL để hiển thị QR code thanh toán
 */
export function buildSepayQrUrl({ amount, description }) {
  const { qrImageUrl, account, bank, qrTemplate } = sepayConfig;
  
  // Validate required config
  if (!account || account.trim() === "" || !bank || bank.trim() === "") {
    const error = new Error("Sepay account and bank must be configured. Vui lòng cập nhật SEPAY_ACCOUNT và SEPAY_BANK trong .env");
    error.code = "SEPAY_NOT_CONFIGURED";
    throw error;
  }
  
  try {
    const url = new URL(qrImageUrl);
    url.searchParams.set("acc", account.trim());
    url.searchParams.set("bank", bank.trim());
    
    if (amount && amount > 0) {
      url.searchParams.set("amount", String(Math.round(amount)));
    }
    
    if (description) {
      url.searchParams.set("des", description.trim());
    }
    
    if (qrTemplate) {
      url.searchParams.set("template", qrTemplate);
    }
    
    return url.toString();
  } catch (err) {
    console.error("Error building Sepay QR URL:", err);
    throw new Error(`Failed to build Sepay QR URL: ${err.message}`);
  }
}

/**
 * Verify Webhook Signature (nếu Sepay hỗ trợ)
 * Validate webhook request từ Sepay để đảm bảo an toàn
 */
export function verifyWebhookSignature(payload, signature, timestamp) {
  const { webhookSecret } = sepayConfig;
  
  if (!webhookSecret) {
    console.warn("⚠️  SEPAY_WEBHOOK_SECRET not set, skipping signature verification");
    return true; // Nếu không có secret thì skip validation (development)
  }
  
  // TODO: Implement signature verification logic theo docs của Sepay
  // Ví dụ: HMAC SHA256 với secret key
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', webhookSecret)
  //   .update(JSON.stringify(payload) + timestamp)
  //   .digest('hex');
  // return expectedSignature === signature;
  
  return true; // Tạm thời return true, sẽ implement sau khi có docs từ Sepay
}

