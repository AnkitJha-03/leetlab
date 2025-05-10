import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getAllSubmissionForProblem, getAllSubmissions, getSubmissionsForProblem } from "../controllers/submission.controllers.js";

const submissionRoutes = express.Router();

submissionRoutes.get("/get-all-submissions", authMiddleware, getAllSubmissions);
submissionRoutes.get("/get-submissions/:id", authMiddleware,getSubmissionsForProblem);
submissionRoutes.get("/get-submissions-count/:id", authMiddleware, getAllSubmissionForProblem);

export default submissionRoutes;