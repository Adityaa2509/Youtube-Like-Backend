import { Router } from "express";
import { deleteComment, getComment, getComments, postComment, updateComment, updateLikeOnComment } from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/getComments/:videoId").get(getComment);
router.route("/getComment/:videoId/:commentId").get(getComments);

//secure routes

router.route("/post-comment/:videoId").post(verifyJWT,postComment);
router.route("/update-comment/:videoId/:commentId").patch(verifyJWT,updateComment);
router.route("/update-like/:videoId/:commentId").patch(verifyJWT,updateLikeOnComment);
router.route("/delete-comment/:commentId").delete(verifyJWT,deleteComment);

