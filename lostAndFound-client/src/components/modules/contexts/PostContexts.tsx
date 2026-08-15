"use client";

import { Comment, NewPostDraft, Post } from "@/types/post";
import { apiClient, toAssetUrl } from "@/lib/api-client";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const PAGE_SIZE = 10;

interface PostsContextValue {
  posts: Post[];
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  retry: () => void;
  addPost: (draft: NewPostDraft) => Promise<void>;
  toggleHelpful: (id: string) => Promise<void>;
  toggleSave: (id: string) => Promise<void>;
  markReunited: (id: string) => Promise<void>;
  addComment: (id: string, body: string, parentCommentId?: string) => Promise<void>;
  toggleCommentLike: (postId: string, commentId: string) => Promise<void>;
}

/** Applies fn to the matching comment anywhere in a reply tree. */
function mapComments(
  comments: Comment[],
  id: string,
  fn: (comment: Comment) => Comment,
): Comment[] {
  return comments.map((comment) =>
    comment.id === id
      ? fn(comment)
      : { ...comment, replies: mapComments(comment.replies, id, fn) },
  );
}

const normalizeComment = (comment: Comment): Comment => ({
  ...comment,
  author: { ...comment.author, photoUrl: toAssetUrl(comment.author.photoUrl) },
  replies: comment.replies.map(normalizeComment),
});

const normalizePost = (post: Post): Post => ({
  ...post,
  image: toAssetUrl(post.image),
  author: { ...post.author, photoUrl: toAssetUrl(post.author.photoUrl) },
  comments: post.comments.map(normalizeComment),
});

export function countComments(comments: Comment[]): number {
  return comments.reduce((total, comment) => total + 1 + countComments(comment.replies), 0);
}

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const hasMore = posts.length < total;

  const fetchPage = useCallback(async (nextPage: number) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsLoadingMore(true);
    setError(null);
    try {
      const result = await apiClient.get<Post[]>(
        `/api/v1/posts?page=${nextPage}&limit=${PAGE_SIZE}`,
      );
      setPosts((prev) => [...prev, ...(result.data || []).map(normalizePost)]);
      setTotal(result.meta?.total ?? 0);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not load more posts.");
    } finally {
      setIsLoadingMore(false);
      inFlight.current = false;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (isLoadingMore || error || !hasMore) return;
    void fetchPage(page + 1);
  }, [error, fetchPage, hasMore, isLoadingMore, page]);

  const retry = useCallback(() => {
    void fetchPage(page);
  }, [fetchPage, page]);

  const update = useCallback((id: string, fn: (post: Post) => Post) => {
    setPosts((prev) => prev.map((post) => (post.id === id ? fn(post) : post)));
  }, []);

  const addPost = useCallback(async (draft: NewPostDraft) => {
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        kind: draft.kind,
        itemName: draft.itemName,
        category: draft.category,
        location: draft.location,
        body: draft.body,
        reward: draft.reward || null,
      }),
    );
    if (draft.imageFile) {
      formData.append("image", draft.imageFile);
    }

    const result = await apiClient.postForm<Post>("/api/v1/posts", formData);
    setPosts((prev) => [normalizePost(result.data), ...prev]);
    setTotal((prev) => prev + 1);
  }, []);

  const toggleHelpful = useCallback(
    async (id: string) => {
      const previous = posts.find((post) => post.id === id);
      update(id, (post) => ({
        ...post,
        isHelpful: !post.isHelpful,
        helpfulCount: post.helpfulCount + (post.isHelpful ? -1 : 1),
      }));
      try {
        const result = await apiClient.postJson<{ isHelpful: boolean }>(
          `/api/v1/posts/${id}/helpful`,
          {},
        );
        update(id, (post) => ({ ...post, isHelpful: result.data.isHelpful }));
      } catch (err) {
        if (previous) update(id, () => previous);
      }
    },
    [posts, update],
  );

  const toggleSave = useCallback(
    async (id: string) => {
      const previous = posts.find((post) => post.id === id);
      update(id, (post) => ({ ...post, isSaved: !post.isSaved }));
      try {
        const result = await apiClient.postJson<{ isSaved: boolean }>(
          `/api/v1/posts/${id}/save`,
          {},
        );
        update(id, (post) => ({ ...post, isSaved: result.data.isSaved }));
      } catch (err) {
        if (previous) update(id, () => previous);
      }
    },
    [posts, update],
  );

  const markReunited = useCallback(async (id: string) => {
    const result = await apiClient.patchJson<Post>(`/api/v1/posts/${id}`, {
      status: "reunited",
    });
    update(id, () => normalizePost(result.data));
  }, [update]);

  const addComment = useCallback(
    async (id: string, body: string, parentCommentId?: string) => {
      const result = await apiClient.postJson<Comment>(
        `/api/v1/posts/${id}/comments`,
        {
          body,
          parentId: parentCommentId || null,
        },
      );
      const comment = normalizeComment(result.data);
      update(id, (post) =>
        parentCommentId
          ? {
              ...post,
              comments: mapComments(post.comments, parentCommentId, (parent) => ({
                ...parent,
                replies: [...parent.replies, comment],
              })),
            }
          : { ...post, comments: [...post.comments, comment] },
      );
    },
    [update],
  );

  const toggleCommentLike = useCallback(
    async (postId: string, commentId: string) => {
      update(postId, (post) => ({
        ...post,
        comments: mapComments(post.comments, commentId, (comment) => ({
          ...comment,
          isLiked: !comment.isLiked,
          likeCount: comment.likeCount + (comment.isLiked ? -1 : 1),
        })),
      }));
      try {
        const result = await apiClient.postJson<{ isLiked: boolean }>(
          `/api/v1/posts/comments/${commentId}/like`,
          {},
        );
        update(postId, (post) => ({
          ...post,
          comments: mapComments(post.comments, commentId, (comment) => ({
            ...comment,
            isLiked: result.data.isLiked,
          })),
        }));
      } catch (err) {
        update(postId, (post) => ({
          ...post,
          comments: mapComments(post.comments, commentId, (comment) => ({
            ...comment,
            isLiked: !comment.isLiked,
            likeCount: comment.likeCount + (comment.isLiked ? -1 : 1),
          })),
        }));
      }
    },
    [update],
  );

  const value = useMemo(
    () => ({
      posts,
      isLoadingMore,
      hasMore,
      error,
      loadMore,
      retry,
      addPost,
      toggleHelpful,
      toggleSave,
      markReunited,
      addComment,
      toggleCommentLike,
    }),
    [
      addComment,
      addPost,
      error,
      hasMore,
      isLoadingMore,
      loadMore,
      markReunited,
      posts,
      retry,
      toggleCommentLike,
      toggleHelpful,
      toggleSave,
    ],
  );

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts(): PostsContextValue {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside a PostsProvider");
  return ctx;
}
