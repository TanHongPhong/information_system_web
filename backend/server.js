import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import testRouter from "./src/routes/testRouter.js";

// Controllers để truy xuất dữ liệu từ Neon (PostgreSQL)
import {
  getCompanies,
  getCompanyById,
  getVehiclesByCompany,
  getCargoOrders,
  createCargoOrder,
  getTransactions,
  createTransaction,
  sepayWebhook,
} from "./src/controllers/testApiControllers.js";
import {
  getSepayConfig,
  createSepayQr,
} from "./src/controllers/sepayControllers.js";
import authRouter from "./src/routes/authRoutes.js";

dotenv.config();

// Validate required environment variables on startup
const requiredEnvVars = {
  PSQLDB_CONNECTIONSTRING: process.env.PSQLDB_CONNECTIONSTRING,
};

const missingEnvVars = [];
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value || value.includes("user:password") || value.includes("host:port")) {
    missingEnvVars.push(key);
  }
}

if (missingEnvVars.length > 0) {
  console.warn("⚠️  Cảnh báo: Một số biến môi trường chưa được cấu hình:");
  missingEnvVars.forEach(key => {
    console.warn(`   - ${key}`);
  });
  console.warn("📝 Vui lòng cập nhật file backend/.env");
  console.warn("💡 Lấy PSQLDB_CONNECTIONSTRING từ Neon Dashboard: https://console.neon.tech");
}

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();

// Middlewares
// Sử dụng express.json() cho tất cả routes (bao gồm webhook)
// Express sẽ tự động parse JSON body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Bật CORS cho development (cho phép frontend gọi API)
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: "http://localhost:5173" }));
}

// ====== ROUTES ======
// Auth routes
app.use("/api/auth", authRouter);

// Test route
app.use("/api/test", testRouter);

// Transport Companies API (từ Neon database)
app.get("/api/transport-companies", getCompanies);
app.get("/api/transport-companies/:id", getCompanyById);
app.get("/api/transport-companies/:id/vehicles", getVehiclesByCompany);

// Cargo Orders API
app.get("/api/cargo-orders", getCargoOrders);
app.post("/api/cargo-orders", createCargoOrder);

// Transactions API
app.get("/api/transactions", getTransactions);
app.post("/api/transactions", createTransaction);

// Payment Webhook (Sepay)
app.post("/api/sepay/webhook", sepayWebhook);

// Sepay API
app.get("/api/sepay/config", getSepayConfig);
app.post("/api/sepay/create-qr", createSepayQr);

// ====== STATIC (production) ======
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
