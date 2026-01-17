import { useParams } from "react-router-dom";
import EditorLayout from "../components/editor/EditorLayout";
import Navbar from "../components/common/Navbar";
function Editor() {
  const { storyId } = useParams();

  return (
    <div className="h-full w-full pt-16 flex overflow-hidden">
      <EditorLayout storyId={storyId} />
    </div>
  );
}

export default Editor;
