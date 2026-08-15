import express from "express";
import { PostController } from "./post.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "@/app/utils/fileUploader";
import { PostValidation } from "./post.validation";

const router = express.Router();

const requiredRoles = auth(
  UserRole.CUSTOMER,
  UserRole.ADMIN,
  UserRole.SHOP_MANAGER,
  UserRole.MEDIA_MANAGER,
);

const parsePostData = (req: express.Request, _res: express.Response, next: express.NextFunction) => {
  try {
    if (req.body?.data) {
      req.body = PostValidation.createPostSchema.parse(JSON.parse(req.body.data));
    }
    next();
  } catch (error) {
    next(error);
  }
};

const parseUpdateData = (req: express.Request, _res: express.Response, next: express.NextFunction) => {
  try {
    if (typeof req.body?.data === "string") {
      req.body = PostValidation.updatePostSchema.parse(JSON.parse(req.body.data));
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.get("/", requiredRoles, PostController.getAllPosts);

router.post(
  "/",
  requiredRoles,
  fileUploader.singleUpload("image"),
  parsePostData,
  PostController.createPost,
);

router.get("/:id", requiredRoles, PostController.getPostById);

router.patch(
  "/:id",
  requiredRoles,
  fileUploader.singleUpload("image"),
  parseUpdateData,
  PostController.updatePost,
);

router.delete("/:id", requiredRoles, PostController.deletePost);

router.post("/:id/helpful", requiredRoles, PostController.toggleHelpful);

router.post("/:id/save", requiredRoles, PostController.toggleSave);

router.post("/:id/comments", requiredRoles, PostController.createComment);

router.post("/comments/:commentId/like", requiredRoles, PostController.toggleCommentLike);

router.delete("/comments/:commentId", requiredRoles, PostController.deleteComment);

export const PostRoutes = router;
