import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { PostService } from "./post.service";
import pick from "../../../shared/pick";

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["page", "limit", "kind", "status", "mine", "saved"]);
  const result = await PostService.getAllPosts(filters, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Posts retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.getPostById(req.params.id, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Post retrieved successfully!",
    data: result,
  });
});

const createPost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.createPost(req);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Post created successfully!",
    data: result,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.updatePost(req.params.id, req.body, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Post updated successfully!",
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.deletePost(req.params.id, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Post deleted successfully!",
    data: result,
  });
});

const toggleHelpful = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.toggleHelpful(req.params.id, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Updated helpful status!",
    data: result,
  });
});

const toggleSave = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.toggleSave(req.params.id, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Updated save status!",
    data: result,
  });
});

const createComment = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.createComment(req.params.id, req.body, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Comment added successfully!",
    data: result,
  });
});

const toggleCommentLike = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.toggleCommentLike(req.params.commentId, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Updated comment like status!",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const result = await PostService.deleteComment(req.params.commentId, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Comment deleted successfully!",
    data: result,
  });
});

export const PostController = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleHelpful,
  toggleSave,
  createComment,
  toggleCommentLike,
  deleteComment,
};
