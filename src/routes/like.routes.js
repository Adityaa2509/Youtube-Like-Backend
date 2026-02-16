import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/:videoId").post(verifyJWT);
router.route("/allLiked").get(verifyJWT);
router.route("/:videoId").get(verifyJWT);

export default router;