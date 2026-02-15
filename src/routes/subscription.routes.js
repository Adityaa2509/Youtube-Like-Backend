import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getChannelSubscribers, getSubscribedChannel, toogleSubscription } from "../controllers/subscription.controllers.js";

const router = Router();

router.route("/toggle/:channelId").post(verifyJWT,toogleSubscription);
router.route("/getSubscribers").get(verifyJWT,getChannelSubscribers);
router.route("/getSubscribedChannel/:subscriberId").get(verifyJWT,getSubscribedChannel)

export default router;