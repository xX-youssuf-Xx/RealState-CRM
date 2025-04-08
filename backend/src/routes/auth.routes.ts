import express from "express";
import { login } from "../controllers/auth.controller";
import { checkDeleted } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/login", login);

export default router;
