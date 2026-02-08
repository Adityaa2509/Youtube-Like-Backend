import { Router } from "express";
import { deleteComment, getComment, getComments, getCommentsOfUserOnVideo, postComment, updateComment, updateLikeOnComment } from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/getComments/:videoId").get(getComments);
router.route("/getComment/:commentId").get(getComment);

//secure routes

router.route("/post-comment/:videoId").post(verifyJWT,postComment);
router.route("/update-comment/:videoId/:commentId").patch(verifyJWT,updateComment);
router.route("/update-like/:videoId/:commentId").patch(verifyJWT,updateLikeOnComment);
router.route("/delete-comment/:commentId").delete(verifyJWT,deleteComment);

//additional feature logic
router.route("/getCommentsUserVideo/:videoId/:userId").get(verifyJWT,getCommentsOfUserOnVideo);
router.route("/getCommentsUser/:videoId/:userId").get(verifyJWT,getCommentsOfUserOnVideo);


export default router;