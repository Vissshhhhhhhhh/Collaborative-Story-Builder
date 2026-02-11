const mongoose = require('mongoose');
require('dotenv').config();

const Story = require('./src/models/Story');
const Chapter = require('./src/models/Chapter');

async function findStoryAndChapters() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find ANTMAN story
    const story = await Story.findOne({ title: /ANTMAN/i });
    
    if (!story) {
      console.log('ANTMAN story not found!');
      
      // List all stories
      const allStories = await Story.find().select('title isPublished');
      console.log('\n=== All Stories ===');
      allStories.forEach(s => {
        console.log(`- ${s.title} (ID: ${s._id}, Published: ${s.isPublished})`);
      });
      
      await mongoose.disconnect();
      return;
    }

    console.log(`\nFound story: ${story.title}`);
    console.log(`Story ID: ${story._id}`);
    console.log(`Published: ${story.isPublished}`);

    // Find all chapters for this story
    const chapters = await Chapter.find({ story: story._id })
      .select('title parentChapter isBranch order')
      .sort({ order: 1 });

    console.log(`\n=== Chapters for ${story.title} ===`);
    console.log(`Total: ${chapters.length}\n`);
    
    chapters.forEach(ch => {
      console.log(`ID: ${ch._id}`);
      console.log(`  Title: ${ch.title}`);
      console.log(`  isBranch: ${ch.isBranch}`);
      console.log(`  parentChapter: ${ch.parentChapter || 'null'}`);
      console.log(`  order: ${ch.order}`);
      console.log('');
    });

    console.log('=== Summary ===');
    console.log(`Chapters with parentChapter set: ${chapters.filter(c => c.parentChapter).length}`);
    console.log(`Chapters marked as isBranch: ${chapters.filter(c => c.isBranch).length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

findStoryAndChapters();
