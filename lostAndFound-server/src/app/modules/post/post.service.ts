import { PostKind, PostStatus } from "@prisma/client";
import { Request } from "express";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { optimizeAndSaveImage } from "@/app/utils/imageOptimizer";
import { PostValidation } from "./post.validation";

const AVATAR_COLORS = [
  "bg-teal-600",
  "bg-indigo-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-emerald-600",
  "bg-sky-600",
  "bg-fuchsia-600",
  "bg-slate-700",
];

const avatarColorFor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 9973;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const initialsFor = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

const mapAuthor = (author: { id: string; name: string | null; avatar: string | null }) => ({
  id: author.id,
  name: author.name || "Anonymous",
  initials: initialsFor(author.name || "?"),
  color: avatarColorFor(author.name || "?"),
  photoUrl: author.avatar || undefined,
});

interface CommentLikeRow {
  userId: string;
}

interface RawComment {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  createdAt: Date;
  author: { id: string; name: string | null; avatar: string | null };
  likes: CommentLikeRow[];
}

type CommentNode = {
  id: string;
  author: ReturnType<typeof mapAuthor>;
  body: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  replies: CommentNode[];
};

const buildCommentTree = (
  comments: RawComment[],
  likedCommentIds: Set<string>,
): CommentNode[] => {
  const byParent = new Map<string | null, RawComment[]>();
  comments.forEach((c) => {
    const key = c.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  });

  const toNode = (c: RawComment): CommentNode => ({
    id: c.id,
    author: mapAuthor(c.author),
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    likeCount: c.likes.length,
    isLiked: likedCommentIds.has(c.id),
    replies: (byParent.get(c.id) || []).map(toNode),
  });

  return (byParent.get(null) || []).map(toNode);
};

const getMeUser = async (session: any) => {
  if (session?.id) {
    return { id: session.id };
  }
  if (session?.email) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: session.email },
    });
    return { id: user.id };
  }
  throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
};

interface PostFilters {
  page?: number;
  limit?: number;
  kind?: string;
  status?: string;
  mine?: string;
  saved?: string;
}

const getAllPosts = async (filters: PostFilters, session: any) => {
  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.min(Math.max(Number(filters.limit) || 10, 1), 30);
  const skip = (page - 1) * limit;

  const where: any = {};

  const kind = filters.kind?.toUpperCase();
  if (kind === "LOST" || kind === "FOUND") {
    where.kind = kind as PostKind;
  }
  const status = filters.status?.toUpperCase();
  if (status === "OPEN" || status === "REUNITED") {
    where.status = status as PostStatus;
  }

  if (filters.mine === "true") {
    const me = await getMeUser(session);
    where.authorId = me.id;
  }

  if (filters.saved === "true") {
    const me = await getMeUser(session);
    where.saves = { some: { userId: me.id } };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const ids = posts.map((p) => p.id);

  let helpfulLikes: { postId: string; userId: string }[] = [];
  let saves: { postId: string; userId: string }[] = [];
  let comments: RawComment[] = [];

  if (ids.length) {
    const me = await getMeUser(session);
    [helpfulLikes, saves, comments] = await Promise.all([
      prisma.helpfulLike.findMany({
        where: { postId: { in: ids } },
        select: { postId: true, userId: true },
      }),
      prisma.save.findMany({
        where: { postId: { in: ids } },
        select: { postId: true, userId: true },
      }),
      prisma.comment.findMany({
        where: { postId: { in: ids } },
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          likes: { select: { userId: true } },
        },
      }),
    ]);
  }

  const helpfulCountByPost = new Map<string, number>();
  helpfulLikes.forEach((l) => {
    helpfulCountByPost.set(l.postId, (helpfulCountByPost.get(l.postId) || 0) + 1);
  });

  const likedByMe = new Set(
    helpfulLikes.filter((l) => l.userId === (session as any)?.id).map((l) => l.postId),
  );
  const savedByMe = new Set(
    saves.filter((l) => l.userId === (session as any)?.id).map((l) => l.postId),
  );

  const commentsByPost = new Map<string, RawComment[]>();
  comments.forEach((c) => {
    const list = commentsByPost.get(c.postId) || [];
    list.push(c);
    commentsByPost.set(c.postId, list);
  });

  const myCommentLikes = new Set(
    comments
      .filter((c) => c.likes.some((l) => l.userId === (session as any)?.id))
      .map((c) => c.id),
  );

  const data = posts.map((post) => {
    const postComments = commentsByPost.get(post.id) || [];
    const myId = (session as any)?.id;
    return {
      id: post.id,
      kind: post.kind.toLowerCase(),
      status: post.status.toLowerCase(),
      author: { ...mapAuthor(post.author), isSelf: myId === post.authorId },
      createdAt: post.createdAt.toISOString(),
      itemName: post.itemName,
      category: post.category,
      location: post.location,
      body: post.body,
      image: post.image || undefined,
      reward: post.reward || undefined,
      helpfulCount: helpfulCountByPost.get(post.id) || 0,
      comments: buildCommentTree(postComments, myCommentLikes),
      shareCount: 0,
      isHelpful: likedByMe.has(post.id),
      isSaved: savedByMe.has(post.id),
      isMine: myId === post.authorId,
    };
  });

  return {
    meta: { page, limit, total },
    data,
  };
};

const getPostById = async (id: string, session: any) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });

  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const [comments, helpfulLikes, saves] = await Promise.all([
    prisma.comment.findMany({
      where: { postId: id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        likes: { select: { userId: true } },
      },
    }),
    prisma.helpfulLike.findMany({
      where: { postId: id },
      select: { userId: true },
    }),
    prisma.save.findMany({
      where: { postId: id },
      select: { userId: true },
    }),
  ]);

  const myCommentLikes = new Set(
    comments
      .filter((c) => c.likes.some((l) => l.userId === (session as any)?.id))
      .map((c) => c.id),
  );

  return {
    id: post.id,
    kind: post.kind.toLowerCase(),
    status: post.status.toLowerCase(),
    author: { ...mapAuthor(post.author), isSelf: (session as any)?.id === post.authorId },
    createdAt: post.createdAt.toISOString(),
    itemName: post.itemName,
    category: post.category,
    location: post.location,
    body: post.body,
    image: post.image || undefined,
    reward: post.reward || undefined,
    helpfulCount: helpfulLikes.length,
    comments: buildCommentTree(comments as RawComment[], myCommentLikes),
    shareCount: 0,    isHelpful: helpfulLikes.some((l) => l.userId === (session as any)?.id),
    isSaved: saves.some((l) => l.userId === (session as any)?.id),
    isMine: (session as any)?.id === post.authorId,
  };
};

const createPost = async (req: Request) => {
  const session = (req as any).user;
  const me = await getMeUser(session);

  const parsed = PostValidation.createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      parsed.error.issues[0]?.message || "Invalid post data",
    );
  }
  const { kind, itemName, category, location, body, reward } = parsed.data;

  let imageUrl: string | null = null;
  if (req.file) {
    const filename = await optimizeAndSaveImage(req.file, "posts");
    imageUrl = `/uploads/posts/${filename}`;
  }

  const post = await prisma.post.create({
    data: {
      authorId: me.id,
      kind,
      itemName,
      category,
      location,
      body,
      reward: reward || null,
      image: imageUrl,
    },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });

  return {
    id: post.id,
    kind: post.kind.toLowerCase(),
    status: post.status.toLowerCase(),
    author: { ...mapAuthor(post.author), isSelf: true },
    createdAt: post.createdAt.toISOString(),
    itemName: post.itemName,
    category: post.category,
    location: post.location,
    body: post.body,
    image: post.image || undefined,
    reward: post.reward || undefined,
    helpfulCount: 0,
    comments: [],
    shareCount: 0,
    isHelpful: false,
    isSaved: false,
    isMine: true,
  };
};

const updatePost = async (id: string, payload: any, session: any) => {
  const me = await getMeUser(session);

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }
  if (existing.authorId !== me.id) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only edit your own posts");
  }

  const parsed = PostValidation.updatePostSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      parsed.error.issues[0]?.message || "Invalid update data",
    );
  }

  const updated = await prisma.post.update({
    where: { id },
    data: parsed.data,
  });

  return getPostById(updated.id, session);
};

const deletePost = async (id: string, session: any) => {
  const me = await getMeUser(session);

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }
  if (existing.authorId !== me.id) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only delete your own posts");
  }

  await prisma.post.delete({ where: { id } });
  return { message: "Post deleted successfully" };
};

const toggleHelpful = async (postId: string, session: any) => {
  const me = await getMeUser(session);

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const existing = await prisma.helpfulLike.findUnique({
    where: { postId_userId: { postId, userId: me.id } },
  });

  if (existing) {
    await prisma.helpfulLike.delete({ where: { id: existing.id } });
    return { isHelpful: false };
  }

  await prisma.helpfulLike.create({
    data: { postId, userId: me.id },
  });
  return { isHelpful: true };
};

const toggleSave = async (postId: string, session: any) => {
  const me = await getMeUser(session);

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const existing = await prisma.save.findUnique({
    where: { postId_userId: { postId, userId: me.id } },
  });

  if (existing) {
    await prisma.save.delete({ where: { id: existing.id } });
    return { isSaved: false };
  }

  await prisma.save.create({
    data: { postId, userId: me.id },
  });
  return { isSaved: true };
};

const createComment = async (postId: string, payload: any, session: any) => {
  const me = await getMeUser(session);

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  const parsed = PostValidation.createCommentSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      parsed.error.issues[0]?.message || "Invalid comment data",
    );
  }

  const { body, parentId } = parsed.data;

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (!parent || parent.postId !== postId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Parent comment not found");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: me.id,
      body,
      parentId: parentId || null,
    },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
    },
  });

  return {
    id: comment.id,
    author: { ...mapAuthor(comment.author), isSelf: true },
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    likeCount: 0,
    isLiked: false,
    replies: [],
  };
};

const toggleCommentLike = async (commentId: string, session: any) => {
  const me = await getMeUser(session);

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");
  }

  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId, userId: me.id } },
  });

  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
    return { isLiked: false };
  }

  await prisma.commentLike.create({
    data: { commentId, userId: me.id },
  });
  return { isLiked: true };
};

const deleteComment = async (commentId: string, session: any) => {
  const me = await getMeUser(session);

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");
  }
  if (comment.authorId !== me.id) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You can only delete your own comments");
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return { message: "Comment deleted successfully" };
};

export const PostService = {
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
