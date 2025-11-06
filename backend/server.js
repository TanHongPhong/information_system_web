import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
// Test router removed for production
// import testRouter from "./src/routes/testRouter.js";

// Controllers để truy xuất dữ liệu từ Neon (PostgreSQL)
import { getCompanies, getCompanyById, getVehiclesByCompany, getRoutesByCompany, getAvailableRegionsByCompany, getAllAvailableRegions, getWarehouseHCMInfo, getWarehouseByRegion } from "./src/controllers/companyControllers.js";
import { getCargoOrders, createCargoOrder, updateCargoOrder } from "./src/controllers/orderControllers.js";
import { getTransactions, createTransaction } from "./src/controllers/transactionControllers.js";
import { sepayWebhook } from "./src/controllers/paymentControllers.js";
import {
  getSepayConfig,
  createSepayQr,
} from "./src/controllers/sepayControllers.js";
import {
  getDriverVehicleInfo,
  recordDeparture,
  recordWarehouseArrival,
  acceptWarehouseEntry,
  loadOrder,
  recordMovementEvent,
  getMovementEvents,
} from "./src/controllers/driverControllers.js";
import {
  getWarehouseOperations,
  getWarehouseKPIs,
  scanQRCode,
  updateWarehouseOperation,
  getWarehouseInventory,
  createInventory,
  updateInventoryStatus,
} from "./src/controllers/warehouseControllers.js";
import {
  getOrderStatusHistory,
  getStatusHistory,
} from "./src/controllers/orderStatusHistoryControllers.js";
import {
  getPaymentMethods,
  getPaymentMethodByCode,
} from "./src/controllers/paymentMethodsControllers.js";
import {
  getUserPreferences,
  updateUserPreferences,
} from "./src/controllers/userPreferencesControllers.js";
import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "./src/controllers/documentFilesControllers.js";
import authRouter from "./src/routes/authRoutes.js";
import { cleanupPendingPaymentOrders } from "./src/utils/cleanupPendingOrders.js";

dotenv.config();

// Validate required environment variables on startup
const requiredEnvVars = {
  PSQLDB_CONNECTIONSTRING: process.env.PSQLDB_CONNECTIONSTRING,
};

const missingEnvVars = [];
const warnings = [];

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value || value.includes("user:password") || value.includes("host:port")) {
    missingEnvVars.push(key);
  }
}

// Check JWT_SECRET for production
if (process.env.NODE_ENV === "production") {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === "your-secret-key-change-in-production") {
    warnings.push("JWT_SECRET must be set to a strong random string in production!");
  }
}

if (missingEnvVars.length > 0) {
  console.error("❌ ERROR: Missing required environment variables:");
  missingEnvVars.forEach(key => {
    console.error(`   - ${key}`);
  });
  console.error("📝 Vui lòng cập nhật file backend/.env");
  console.error("💡 Lấy PSQLDB_CONNECTIONSTRING từ Neon Dashboard: https://console.neon.tech");
  if (process.env.NODE_ENV === "production") {
    process.exit(1); // Exit in production if required vars are missing
  }
}

if (warnings.length > 0) {
  console.warn("⚠️  SECURITY WARNINGS:");
  warnings.forEach(warning => {
    console.warn(`   - ${warning}`);
  });
}

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();

// Middlewares
// Sử dụng express.json() cho tất cả routes (bao gồm webhook)
// Express sẽ tự động parse JSON body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : (process.env.NODE_ENV === "production" ? [] : ["http://localhost:5173"]);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ====== ROUTES ======
// Auth routes
app.use("/api/auth", authRouter);

// Test route - removed for production
// app.use("/api/test", testRouter);

// Transport Companies API (từ Neon database)
app.get("/api/transport-companies", getCompanies);
app.get("/api/transport-companies/available-regions", getAllAvailableRegions);
app.get("/api/transport-companies/:id", getCompanyById);
app.get("/api/transport-companies/:id/vehicles", getVehiclesByCompany);
app.get("/api/transport-companies/:id/routes", getRoutesByCompany);
app.get("/api/transport-companies/:id/available-regions", getAvailableRegionsByCompany);

// Cargo Orders API
app.get("/api/cargo-orders", getCargoOrders);
app.post("/api/cargo-orders", createCargoOrder);
app.put("/api/cargo-orders/:id", updateCargoOrder);

// Transactions API
app.get("/api/transactions", getTransactions);
app.post("/api/transactions", createTransaction);

// Payment Webhook (Sepay)
app.post("/api/sepay/webhook", sepayWebhook);

// Sepay API
app.get("/api/sepay/config", getSepayConfig);
app.post("/api/sepay/create-qr", createSepayQr);

// Driver API
app.get("/api/driver/vehicle-info", getDriverVehicleInfo);
app.post("/api/driver/departure", recordDeparture);
app.post("/api/driver/warehouse-arrival", recordWarehouseArrival);
app.post("/api/driver/accept-warehouse-entry", acceptWarehouseEntry);
app.post("/api/driver/load-order", loadOrder);
app.post("/api/driver/movement-event", recordMovementEvent);
app.get("/api/driver/movement-events", getMovementEvents);

// Warehouse API
app.get("/api/warehouse/operations", getWarehouseOperations);
app.get("/api/warehouse/kpis", getWarehouseKPIs);
app.post("/api/warehouse/scan-qr", scanQRCode);
app.post("/api/warehouse/update-operation", updateWarehouseOperation);
app.get("/api/warehouse/inventory", getWarehouseInventory);
app.post("/api/warehouse/inventory/create", createInventory);
app.post("/api/warehouse/inventory/update-status", updateInventoryStatus);
app.get("/api/warehouse/hcm-info", getWarehouseHCMInfo);
app.get("/api/warehouse/by-region", getWarehouseByRegion);

// Order Status History API
app.get("/api/orders/:orderId/status-history", getOrderStatusHistory);
app.get("/api/orders/status-history", getStatusHistory);

// Payment Methods API
app.get("/api/payment-methods", getPaymentMethods);
app.get("/api/payment-methods/:code", getPaymentMethodByCode);

// User Preferences API
app.get("/api/user/preferences", getUserPreferences);
app.put("/api/user/preferences", updateUserPreferences);

// Document Files API
app.get("/api/documents", getDocuments);
app.post("/api/documents", createDocument);
app.delete("/api/documents/:id", deleteDocument);

// ====== STATIC FILES (optional - nếu không dùng Nginx riêng) ======
// Nếu dùng Nginx để serve frontend, comment out phần này
// Nếu muốn Express serve cả frontend, uncomment phần này
/*
if (process.env.NODE_ENV === "production" && process.env.SERVE_STATIC === "true") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}
*/

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`   Local: http://localhost:${PORT}`);
  }
  
  // Chạy cleanup đơn hàng chờ thanh toán mỗi 5 phút
  // Tự động xóa đơn hàng PENDING_PAYMENT sau 15 phút
  setInterval(async () => {
    try {
      await cleanupPendingPaymentOrders();
    } catch (err) {
      // Chỉ log lỗi nếu không phải timeout (để tránh spam log)
      if (!err.message.includes("timeout") && !err.message.includes("ETIMEDOUT")) {
        console.error("❌ Cleanup job error:", err.message);
      }
    }
  }, 5 * 60 * 1000); // 5 phút = 5 * 60 * 1000 ms
  
  console.log("🧹 Cleanup job đã được khởi động (chạy mỗi 5 phút)");
  
  // Chạy cleanup ngay lập tức khi server start (với delay để đợi DB kết nối)
  // Đợi 3 giây để database có thời gian kết nối
  setTimeout(async () => {
    try {
      await cleanupPendingPaymentOrders();
    } catch (err) {
      // Chỉ log nếu không phải timeout (database có thể chưa sẵn sàng ngay)
      if (!err.message.includes("timeout") && !err.message.includes("ETIMEDOUT")) {
        console.error("❌ Initial cleanup error:", err.message);
      }
      }
    }, 3000); // Đợi 3 giây trước khi chạy cleanup lần đầu
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
