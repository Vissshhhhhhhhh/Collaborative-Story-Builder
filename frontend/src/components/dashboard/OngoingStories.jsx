import { useEffect, useState } from "react";
import {
  getOngoingStories,
  publishToggle,
  deleteStory,
} from "../../api/storyApi";
import StoryCard from "../story/StoryCard";
import { useAuth } from "../../context/AuthContext";
import AddCollaboratorModal from "../story/AddCollaborator";
import CollaboratorsModal from "../story/Collaborators";
import ConfirmModal from "../common/ConfirmModal";

function OngoingStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryTitle, setActiveStoryTitle] = useState("");

  const { isAuthenticated, loading: authLoading } = useAuth();

  const [activeStoryId, setActiveStoryId] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchStories = async () => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const res = await getOngoingStories();
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

  const openAddCollaboratorModal = (storyId, storyTitle) => {
    setActiveStoryId(storyId);
    setActiveStoryTitle(storyTitle);
    setShowAddModal(true);
  };

  const openViewCollaboratorsModal = (storyId, storyTitle) => {
    setActiveStoryId(storyId);
    setActiveStoryTitle(storyTitle);
    setShowViewModal(true);
  };

  const openDeleteConfirm = (storyId) => {
    setActiveStoryId(storyId);
    setShowDeleteModal(true);
  };

  const handlePublishToggle = async (storyId) => {
    try {
      await publishToggle(storyId);
      fetchStories();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDeleteStory = async () => {
    try {
      await deleteStory(activeStoryId);
      setStories((prev) => prev.filter((s) => s._id !== activeStoryId));
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setShowDeleteModal(false);
      setActiveStoryId(null);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-8 text-gray-800">
        My Ongoing Stories
      </h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No ongoing stories yet. Start creating!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              source="internal"
              mode="dashboard"
              onPublishToggle={() => handlePublishToggle(story._id)}
              onAddCollaborator={() => openAddCollaboratorModal(story._id, story.title)}
              onViewCollaborators={() => openViewCollaboratorsModal(story._id, story.title)}

              onDeleteStory={() => openDeleteConfirm(story._id)}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddCollaboratorModal
          storyId={activeStoryId}
          storyTitle={activeStoryTitle}
          onClose={() => {
            setShowAddModal(false);
            setActiveStoryId(null);
            setActiveStoryTitle("");
          }}
          onAdded={() => {
            // optional refresh if needed later
          }}
        />
      )}

      {showViewModal && (
        <CollaboratorsModal
          storyId={activeStoryId}
          storyTitle={activeStoryTitle}
          onClose={() => {
            setShowViewModal(false);
            setActiveStoryId(null);
            setActiveStoryTitle("");
          }}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Story"
          message="This will permanently delete your story and all its chapters. Are you sure?"
          confirmText="Yes, Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteStory}
          onCancel={() => {
            setShowDeleteModal(false);
            setActiveStoryId(null);
          }}
        />
      )}
    </>
  );
}

export default OngoingStories;
