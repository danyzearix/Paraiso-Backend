import express from "express";
import { getMisas, createMisa } from "../controllers/misaController.mjs";

const router = express.Router();

router.get("/", getMisas);
router.post("/", createMisa);

export default router;
