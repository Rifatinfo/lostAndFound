import { z } from "zod";

const kindSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.toUpperCase() : v),
  z.enum(["LOST", "FOUND"], { required_error: "Post kind is required" }),
);

const statusSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.toUpperCase() : v),
  z.enum(["OPEN", "REUNITED"]),
);

const createPostSchema = z.object({
  kind: kindSchema,
  itemName: z.string().min(1, "Item name is required").max(150),
  category: z.string().min(1, "Category is required").max(100),
  location: z.string().min(1, "Location is required").max(200),
  body: z.string().min(1, "Details are required").max(5000),
  reward: z.string().max(100).optional().nullable(),
});

const updatePostSchema = z.object({
  itemName: z.string().min(1).max(150).optional(),
  category: z.string().min(1).max(100).optional(),
  location: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(5000).optional(),
  reward: z.string().max(100).optional().nullable(),
  status: statusSchema.optional(),
  removeImage: z.boolean().optional(),
});

const createCommentSchema = z.object({
  body: z.string().min(1, "Comment is required").max(2000),
  parentId: z.string().optional().nullable(),
});

export const PostValidation = {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
};
