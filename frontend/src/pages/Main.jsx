import { useEffect, useState } from "react";
import { getPublicPublishedStories , getExternalStories } from "../api/storyApi";
import StoryCard from "../components/story/StoryCard";

function Main(){
  const [internalStories, setInternalStories] = useState([]);
  const [externalStories, setExternalStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const fetchAllStories = async () =>{
      try{
        const [internalRes, externalRes] = await Promise.all([
          getExternalStories,
          getExternalStories
        ]);

        setInternalStories(internalRes.data);
        setExternalStories(externalRes.data.results.slice(0,12));
      }
      finally{
        setLoading(false);
      }
    };

    fetchAllStories();
  },[]);

  if(loading){
    return <div className="p-6">Loading stories...</div>;
  }

  return (
    <div className="p-6 space-y-12">
      {/* Internal Stories */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Community Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {internalStories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              source="internal"
            />
          ))}
        </div>
      </section>

      {/* External stories */}
      
      <section>
        <h2 className="text-2xl font-bold mb-4">Classic Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {externalStories.map((book) => (
            <StoryCard
              key={book.id}
              story={book}
              source="external"
            />
          ))}
        </div>
      </section>
    </div>
  )
}



export default Main;