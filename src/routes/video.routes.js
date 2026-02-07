import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { deleteVideo, getAllVideos, getVideo, togglePublishStatus, updateThumbnail, updateVideoFile, updateVideoInfo, uploadVideo } from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.route("/upload-video").post(verifyJWT,
                                    upload.fields([
                                        {
                                            name:"videoFile", maxCount: 1
                                        },
                                        {
                                            name:"thumbnail",maxCount: 1
                                        }
                                    ])
                                   ,uploadVideo)


router.route("/").get(verifyJWT,getAllVideos);
router.route("/:id").get(verifyJWT,getVideo);

router.route("/update-videoFile/:id").patch(verifyJWT,
                                            upload.single("videoFile"),
                                            updateVideoFile);

router.route("/update-thumbnail/:id").patch(verifyJWT,
                                            upload.single("thumbnail"),
                                            updateThumbnail);
                                            
router.route("/update-videoInfo/:id").patch(verifyJWT,updateVideoInfo);
router.route("/togglePublish/:id").patch(verifyJWT,togglePublishStatus);

router.route("/delete-video/:id").delete(verifyJWT,deleteVideo);

export default router;