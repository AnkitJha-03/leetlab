import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { addProblemsToSheet, createSheet, deleteSheet, getAllSheets, getSheetById, removeProblemsFromSheet } from "../controllers/sheets.controllers.js";

const sheetsRoutes = express.Router();

sheetsRoutes.get("/", authMiddleware, getAllSheets);
sheetsRoutes.get("/get-sheet/:id", authMiddleware, getSheetById);
sheetsRoutes.post("/create-sheet", authMiddleware, createSheet);
sheetsRoutes.delete("/delete-sheet/:id", authMiddleware, deleteSheet);
sheetsRoutes.post("/:sheetId/add-problems", authMiddleware, addProblemsToSheet);
sheetsRoutes.delete("/:sheetId/remove-problems", authMiddleware, removeProblemsFromSheet);

export default sheetsRoutes;