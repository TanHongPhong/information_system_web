import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import testRouter from "./src/routes/testRouter.js";

// Controllers để truy xuất dữ liệu từ Neon (PostgreSQL)
import {
  getCompanies,
  getCompanyById,
} from "./src/controllers/testApiControllers.js";
import authRouter from "./src/routes/authRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();

// Middlewares
app.use(express.json());

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
