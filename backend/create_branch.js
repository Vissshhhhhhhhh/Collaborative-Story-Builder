const mongoose = require('mongoose');
require('dotenv').config();

const Story = require('./src/models/Story');
const Chapter = require('./src/models/Chapter');
const User = require('./src/models/User');

async function createBranch() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find ANTMAN story
    const story = await Story.findOne({ title: /ANTMAN/i });
    if (!story) {
      console.log('ANTMAN story not found!');
      await mongoose.disconnect();
      return;
    }

    console.log(`Found story: ${story.title} (${story._id})`);

    // Find chap1 to use as parent
    const chap1 = await Chapter.findOne({ story: story._id, title: 'chap1' });
    if (!chap1) {
      console.log('chap1 not found!');
      await mongoose.disconnect();
      return;
    }

    console.log(`Found chap1: ${chap1._id}`);

    // Get the story author to use as creator
    const author = await User.findById(story.author);
    if (!author) {
      console.log('Author not found!');
      await mongoose.disconnect();
      return;
    }

    // Create a branch of chap1
    const branch = new Chapter({
      title: 'chap1 - Branch A',
      content: '<p>This is a branch of chapter 1!</p>',
      story: story._id,
      createdBy: author._id,
      parentChapter: chap1._id,
      isBranch: true,
      order: 2  // Between chap1 (order 1) and chap2 (order 3)
    });

    await branch.save();
    console.log(`\n✅ Created branch: ${branch.title}`);
    console.log(`   ID: ${branch._id}`);
    console.log(`   Parent: ${branch.parentChapter}`);
    console.log(`   isBranch: ${branch.isBranch}`);
    console.log(`   order: ${branch.order}`);

    await mongoose.disconnect();
    console.log('\n✅ Done! Refresh the Reader page to see the branch.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createBranch();
