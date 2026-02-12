import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { addVideoInPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoInPlaylist, renamePlaylist } from "../controllers/playlist.controllers.js";

const router = Router();

router.route("/create").post(verifyJWT,createPlaylist);

router.route("/rename/:playlistId").patch(verifyJWT,renamePlaylist);
router.route("/add/:playlistId/:videoId").patch(verifyJWT,addVideoInPlaylist);
router.route("/remove/:playlistId/:videoId").patch(verifyJWT,removeVideoInPlaylist);

router.route("/get").get(verifyJWT,getUserPlaylists);
router.route("/get/:playlistId").get(verifyJWT,getPlaylistById);

router.route("/delete/:playlistId").delete(verifyJWT,deletePlaylist);



export default router;