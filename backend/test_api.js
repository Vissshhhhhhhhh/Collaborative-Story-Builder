const axios = require('axios');

const testAPI = async () => {
    try {
        // First, get a story ID
        const storiesRes = await axios.get('http://localhost:3000/api/stories/public');
        const stories = storiesRes.data.stories;
        
        const antmanStory = stories.find(s => s.title.includes('ANTMAN'));
        if (!antmanStory) {
            console.log('ANTMAN story not found');
            return;
        }
        
        console.log('Story ID:', antmanStory._id);
        console.log('Story Title:', antmanStory.title);
        console.log('\n--- Fetching Chapter Sidebar ---\n');
        
        // Fetch chapter sidebar
        const chaptersRes = await axios.get(`http://localhost:3000/api/chapters/public/${antmanStory._id}/sidebar`);
        const chapters = chaptersRes.data.chapters;
        
        console.log('Total chapters:', chapters.length);
        console.log('\nChapter Details:');
        chapters.forEach(ch => {
            console.log(`- ID: ${ch._id}`);
            console.log(`  Title: ${ch.title}`);
            console.log(`  isBranch: ${ch.isBranch}`);
            console.log(`  parentChapter: ${ch.parentChapter}`);
            console.log(`  order: ${ch.order}`);
            console.log('');
        });
        
        // Check filtering logic
        const normalChapters = chapters.filter(c => !c.parentChapter);
        const branches = chapters.filter(c => c.parentChapter);
        
        console.log('\n--- Filtering Results ---');
        console.log('Normal chapters:', normalChapters.length);
        normalChapters.forEach(c => console.log(`  - ${c.title}`));
        
        console.log('\nBranches:', branches.length);
        branches.forEach(b => console.log(`  - ${b.title} (parent: ${b.parentChapter})`));
        
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response:', err.response.data);
        }
    }
};

testAPI();
