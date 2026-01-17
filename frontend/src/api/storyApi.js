import axios from "axios";

/* INTERNAL STORIES (your backend) */
const INTERNAL_API = axios.create({
  baseURL: "http://localhost:5000/api/stories",
  withCredentials: true,
});

/* EXTERNAL STORIES (Gutenberg) */
const EXTERNAL_API = axios.create({
  baseURL: "https://gutendex.com",
});

/* ===== CREATE STORY ===== */
export const createStory = (data) => INTERNAL_API.post("/", data);

/* ===== DASHBOARD STORIES ===== */

// ongoing stories (author + collaborators)
export const getOngoingStories = () => INTERNAL_API.get("/my/ongoing");

// published stories (author + collaborators)
export const getMyPublishedStories = () => INTERNAL_API.get("/my/published");

/* ===== PUBLIC STORIES (for reader) ===== */
export const getPublicPublishedStories = () => INTERNAL_API.get("/published");

/* ===== COLLABORATORS ===== */

// add collaborator (author only)
export const addCollaborator = (storyId, email) =>
  INTERNAL_API.post(`/${storyId}/collaborators`, { email });

// get collaborators list (author only)
export const getCollaborators = (storyId) =>
  INTERNAL_API.get(`/${storyId}/collaborators`);

// remove collaborator (author only)
export const removeCollaborator = (storyId, collaboratorId) =>
  INTERNAL_API.delete(`/${storyId}/collaborators/${collaboratorId}`);

/* ===== STORY ACTIONS ===== */

// publish/unpublish (author only)
export const publishToggle = (storyId) =>
  INTERNAL_API.patch(`/${storyId}/publish`);

// delete story (author only)
export const deleteStory = (storyId) => INTERNAL_API.delete(`/${storyId}`);

/* ===== EXTERNAL: public-domain books ===== */
export const getExternalStories = () => EXTERNAL_API.get("/books");
