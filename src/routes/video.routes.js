import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getAllVideos, getVideo, uploadVideo } from "../controllers/video.controllers.js";
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
export default router;