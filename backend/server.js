import express from "express";
import taskRoute from "./src/routes/taskRouters.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import testRouter from "./src/routes/testRouter.js";

dotenv.config();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();

// middlewares
app.use(express.json());

app.use("/api/test", testRouter);

if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: "http://localhost:5173" }));
}
+app.use("/api/tasks", taskRoute);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
