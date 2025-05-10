import express from "express";
import { executeCode } from "../controllers/executeCode.controllers.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const executionRoutes = express.Router();

executionRoutes.post("/", authMiddleware, executeCode);

export default executionRoutes;