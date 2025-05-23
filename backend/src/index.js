import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors"

import problemRoutes from "./routes/problem.routers.js";
import executionRoutes from "./routes/executeCode.routers.js";
import submissionRoutes from "./routes/submission.routers.js";
import sheetsRoutes from "./routes/sheets.routes.js";

dotenv.config();

const app = express();

// cors
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
)

// middleware
app.use(express.json());
app.use(cookieParser());

// Home route
app.get("/", (req, res) => {
  res.send("Hello Guys, Welcome to leetlab🔥");
});

// API routes
app.use("/api/v1/auth", authRoutes);

// problem routes
app.use("/api/v1/problems", problemRoutes);

// exicute code routes
app.use("/api/v1/execute", executionRoutes);

// submission routes
app.use("/api/v1/submissions", submissionRoutes);

// sheets routes
app.use("/api/v1/sheets", sheetsRoutes);

// 404 - Not Found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
