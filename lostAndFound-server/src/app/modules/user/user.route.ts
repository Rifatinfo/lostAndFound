import express from "express";

import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "@/app/utils/fileUploader";
import { UserValidation } from "./user.validation";

const router = express.Router();

/* ===============================================
 ====================== Customer Created ============
 ============================================== */

router.post(
    "/create-customer",
    fileUploader.singleUpload("file"),
    (req, _res, next) => {
        try {
            if (!req.body?.data) {
                throw new Error("Customer data missing");
            }

            const parsed = JSON.parse(req.body.data);
            req.body = UserValidation.createUserValidationSchema.parse(parsed);

            next();
        } catch (error) {
            next(error);
        }
    },
    UserController.createCustomer
);

/* ===============================================
 ====================== Admin Created ============
 ============================================== */
router.post(
    "/create-admin",
    fileUploader.singleUpload("file"),
    (req, _res, next) => {
        try {
            if (!req.body?.data) {
                throw new Error("Admin data missing");
            }

            const parsed = JSON.parse(req.body.data);
            req.body = UserValidation.createAdminValidationSchema.parse(parsed);

            next();
        } catch (error) {
            next(error);
        }
    },
    UserController.createAdmin
);


router.get("/",   UserController.getAllFromDB);

/* ===============================================
 ====================== Profile ============
 ============================================== */

router.patch(
    "/me",
    auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SHOP_MANAGER, UserRole.MEDIA_MANAGER),
    UserController.updateMe
);

router.patch(
    "/me/avatar",
    auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SHOP_MANAGER, UserRole.MEDIA_MANAGER),
    fileUploader.singleUpload("file"),
    UserController.updateAvatar
);

router.patch(
    "/me/cover",
    auth(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SHOP_MANAGER, UserRole.MEDIA_MANAGER),
    fileUploader.singleUpload("file"),
    UserController.updateCover
);

export const UserRoutes = router;