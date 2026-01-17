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
