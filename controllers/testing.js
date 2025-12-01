const testingRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/users');

testingRouter.post('/reset', async (request, response) => {
    try {
        const deletedBlogs = await Blog.deleteMany({});
        const deletedUsers = await User.deleteMany({});
        
        console.log(`✅ Database reset: ${deletedBlogs.deletedCount} blogs, ${deletedUsers.deletedCount} users deleted`);
        
        response.status(204).end();
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        response.status(500).json({ error: 'Failed to reset database' });
    }
});

module.exports = testingRouter;
