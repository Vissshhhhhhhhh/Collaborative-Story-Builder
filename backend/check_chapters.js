const mongoose = require('mongoose');
require('dotenv').config();

const Chapter = require('./src/models/Chapter');

async function checkChapters() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all chapters for the ANTMAN story
    const storyId = '698c03b4096227c79e9435e6'; // ANTMAN story ID
    
    const chapters = await Chapter.find({ story: storyId })
      .select('title parentChapter isBranch order')
      .sort({ order: 1 });

    console.log('\n=== All Chapters ===');
    chapters.forEach(ch => {
      console.log(`\nID: ${ch._id}`);
      console.log(`Title: ${ch.title}`);
      console.log(`isBranch: ${ch.isBranch}`);
      console.log(`parentChapter: ${ch.parentChapter}`);
      console.log(`order: ${ch.order}`);
    });

    console.log('\n=== Summary ===');
    console.log(`Total chapters: ${chapters.length}`);
    console.log(`Chapters with parentChapter: ${chapters.filter(c => c.parentChapter).length}`);
    console.log(`Chapters marked as isBranch: ${chapters.filter(c => c.isBranch).length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkChapters();
