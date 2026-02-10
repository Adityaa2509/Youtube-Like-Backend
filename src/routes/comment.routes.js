import { Router } from "express";
import { deleteComment, getComment, getCommentOfUser, getComments, getCommentsOfUserOnVideo, postComment, updateComment, updateDislikeOnComment, updateLikeOnComment } from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/getComments/:videoId").get(getComments);
router.route("/getComment/:commentId").get(getComment);

//secure routes

router.route("/post-comment/:videoId").post(verifyJWT,postComment);
router.route("/update-comment/:commentId").patch(verifyJWT,updateComment);
router.route("/update-like/:videoId/:commentId").patch(verifyJWT,updateLikeOnComment);
router.route("/update-dislike/:videoId/:commentId").patch(verifyJWT,updateDislikeOnComment);
router.route("/delete-comment/:commentId").delete(verifyJWT,deleteComment);

//additional feature logic
router.route("/getCommentsUserVideo/:videoId/:userId").get(verifyJWT,getCommentsOfUserOnVideo);
router.route("/getCommentsUser/:userId").get(verifyJWT,getCommentOfUser);


export default router;