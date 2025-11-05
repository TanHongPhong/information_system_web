import express from "express";
import { getData } from "../controllers/testControllers.js";
const router = express.Router();
// GET all users
router.get("/", getData);

export default router;
