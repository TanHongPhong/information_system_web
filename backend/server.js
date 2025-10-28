import express from "express";
import taskRoute from "./src/routes/taskRouters.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import testRouter from "./src/routes/testRouter.js";
import taskRoute from "./src/routes/tasks.routes.js"; // đổi path đúng với project bạn

// controller mới để truy suất dữ liệu công ty
import {
  getCompanies,
  getCompanyById,
} from "./src/controllers/testApiControllers.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();

// middlewares
app.use(express.json());

// Bật CORS khi dev (đặt TRƯỚC khi khai báo route để preflight hoạt động ổn định)
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: "http://localhost:5173" }));
}

// ====== ROUTES ======
app.use("/api/test", testRouter);

// (dòng này trước có dấu '+' do copy từ diff, bỏ dấu '+' đi)
app.use("/api/tasks", taskRoute);

// NEW: endpoints truy suất Neon (LogisticsCompany + Coverage + CarrierRate)
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
