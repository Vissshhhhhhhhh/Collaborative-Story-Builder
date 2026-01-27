import axios from "axios";

const CHAPTER_API = axios.create({
  baseURL: "http://localhost:5000/api/chapters",
  withCredentials: true,
});

// sidebar list
export const getChapterSidebar = (storyId) =>
  CHAPTER_API.get(`/sidebar/${storyId}`);

// chapter content
export const getChapterContent = (chapterId) =>
  CHAPTER_API.get(`/content/${chapterId}`);

// save chapter content
export const saveChapterContent = (chapterId, content) =>
  CHAPTER_API.patch(`/${chapterId}`, { content });

// lock/unlock
export const lockChapter = (chapterId) =>
  CHAPTER_API.post(`/${chapterId}/lock`);

export const unlockChapter = (chapterId) =>
  CHAPTER_API.post(`/${chapterId}/unlock`);

export const createChapter = (storyId, title, parentChapter = null) =>
  CHAPTER_API.post(`/${storyId}`, {
    title,
    parentChapter,
  });

// ✅ Public chapters list (for Reader - no login)
export const getPublicChapterSidebar = (storyId) =>
  CHAPTER_API.get(`/public/sidebar/${storyId}`);

// ✅ Public chapter content (for Reader - no login)
export const getPublicChapterContent = (chapterId) =>
  CHAPTER_API.get(`/public/content/${chapterId}`);

//rename api
export const renameChapter = (chapterId, title) =>
  CHAPTER_API.patch(`/${chapterId}/rename`, { title });
//delete api
export const deleteChapter = (chapterId) =>
  CHAPTER_API.delete(`/${chapterId}`);
