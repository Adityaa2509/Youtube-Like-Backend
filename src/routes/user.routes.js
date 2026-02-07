import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, updateUserPassword, updateUserAvatar,updateUserCoverImage,updateUserProfile, getCurrentUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router  = Router();

router.route("/register").post(
    upload.fields([
        {name:"avatar",maxCount:1},
        {name:"coverImage",maxCount:1}
    ]),
    registerUser);

router.route("/login").post(loginUser);


//secure routes
router.route("/logout").post(
    verifyJWT,
    logoutUser
)
router.route("/refreshToken").post(refreshAccessToken)

router.route("/update-password").patch(verifyJWT,updateUserPassword)

router.route("/update-avatar").patch( verifyJWT,
                                    upload.single("avatar"),
                                    updateUserAvatar)

router.route("/update-coverImage").patch(verifyJWT,
                                         upload.single("coverImage"),
                                         updateUserCoverImage)

router.route("/update-profile").patch(verifyJWT,updateUserProfile)

router.route("/current-user").get(verifyJWT,getCurrentUser);


export default router;

