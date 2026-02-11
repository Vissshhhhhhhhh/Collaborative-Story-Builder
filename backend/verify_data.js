const mongoose = require('mongoose');
const Chapter = require('./src/models/Chapter');
const Story = require('./src/models/Story');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB')

        const story = await Story.findOne({ title: "ANTMAN and the WASP" });
        if (!story) {
            console.log("Story not found");
            return;
        }
        console.log(`Story Found: ${story.title} (${story._id})`);

        const chapters = await Chapter.find({ story: story._id }).lean();
        console.log(`Total Chapters: ${chapters.length}`);
        
        chapters.forEach(ch => {
            console.log(`- [${ch._id}] ${ch.title} | isBranch: ${ch.isBranch} | parent: ${ch.parentChapter} | order: ${ch.order}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
