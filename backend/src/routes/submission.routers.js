import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const submissionRoutes = express.Router();

submissionRoutes.get("/get-all-submissions", authMiddleware, getAllSubmissions);
submissionRoutes.get("/get-submission/:id", authMiddleware,getSubmissionsForProblem);
submissionRoutes.get("/get-submission-count/:id", authMiddleware, getAllSubmissionForProblem);

export default submissionRoutes;