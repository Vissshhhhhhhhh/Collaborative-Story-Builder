import { useEffect, useState } from "react";
import {
  getMyPublishedStories,
  publishToggle,
  deleteStory,
} from "../../api/storyApi";
import StoryCard from "../story/StoryCard";
import { useAuth } from "../../context/AuthContext";
import CollaboratorsModal from "../story/Collaborators";
import ConfirmModal from "../common/ConfirmModal";

function PublishedStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, loading: authLoading } = useAuth();

  const [activeStoryId, setActiveStoryId] = useState(null);
  const [activeStoryTitle, setActiveStoryTitle] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchStories = async () => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const res = await getMyPublishedStories();
      setStories(res.data.stories);
    } catch (error) {
      console.error(
        "Error fetching stories:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [authLoading, isAuthenticated]);

  // ✅ View collaborators (view only - no remove)
  const openViewCollaboratorsModal = (storyId, storyTitle) => {
    setActiveStoryId(storyId);
    setActiveStoryTitle(storyTitle);
    setShowViewModal(true);
  };

  // ✅ Delete confirmation
  const openDeleteConfirm = (storyId, storyTitle) => {
    setActiveStoryId(storyId);
    setActiveStoryTitle(storyTitle);
    setShowDeleteModal(true);
  };

  // ✅ Publish / Unpublish
  const handlePublishToggle = async (storyId) => {
    try {
      await publishToggle(storyId);
      fetchStories();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // ✅ Delete story
  const handleDeleteStory = async () => {
    try {
      await deleteStory(activeStoryId);
      setStories((prev) => prev.filter((s) => s._id !== activeStoryId));
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setShowDeleteModal(false);
      setActiveStoryId(null);
      setActiveStoryTitle("");
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-8 text-gray-800">
        My Published Stories
      </h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No published stories yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              source="internal"
              mode="dashboard"
              hideAddCollaborator={true} // ✅ hide add collaborator in published
              viewOnlyCollaborators={true} // ✅ view-only text in menu
              onViewCollaborators={() =>
                openViewCollaboratorsModal(story._id, story.title)
              }
              onPublishToggle={() => handlePublishToggle(story._id)}
              onDeleteStory={() => openDeleteConfirm(story._id, story.title)}
            />
          ))}
        </div>
      )}

      {/* ✅ View Collaborators Modal (NO Remove here) */}
      {showViewModal && (
        <CollaboratorsModal
          storyId={activeStoryId}
          storyTitle={activeStoryTitle}
          viewOnly={true}
          onClose={() => {
            setShowViewModal(false);
            setActiveStoryId(null);
            setActiveStoryTitle("");
          }}
        />
      )}

      {/* ✅ Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          title="Delete Story"
          message={`This will permanently delete "${activeStoryTitle}" and all its chapters. Are you sure?`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteStory}
          onCancel={() => {
            setShowDeleteModal(false);
            setActiveStoryId(null);
            setActiveStoryTitle("");
          }}
        />
      )}
    </>
  );
}

export default PublishedStories;
