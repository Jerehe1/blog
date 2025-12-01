const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/users');
const middleware = require('../utils/middleware');



blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
    response.json(blogs);
});

blogsRouter.get('/:id', async (request, response) => {
    try {
        const blog = await Blog.findById(request.params.id);
        if (!blog) {
            return response.status(404).end();
        }
        response.json(blog);
    } catch (error) {
        response.status(400).json({ error: 'Invalid ID format' });
    }
});

blogsRouter.post('/',middleware.userExtractor, async (request, response) => {
    const user = request.user;
    const body = request.body;

    if(!user){
        return response.status(401).json({error: 'token missing or invalid'});
    }

    
    if (!body.title || !body.url) {
        return response.status(400).json({ error: 'Title and URL are required' });
    }
   
    const blog = new Blog({
        title: body.title,
        author: body.author || user.name, 
        url: body.url,
        likes: body.likes || 0,
        user: user._id
    });

    const savedBlog = await blog.save();
    
   
    user.blogs = (user.blogs || []).concat(savedBlog._id);
    await user.save();

    response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    const user = request.user;

    if(!user) {
        return response.status(401).json({error: 'Unathorized'});
    }
    const blog = await Blog.findById(request.params.id);
    if (!blog) {
        return response.status(404).json({error: 'Blog not found' });
    }
    if (blog.user.toString() !== user._id.toString()) {
        return response.status(403).json({error:'Only the creator can delete this blog'})
    }
    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
})

blogsRouter.put('/:id', async (request, response) => {
    const { title, author, url, likes } = request.body;

    try {
        const updatedBlog = await Blog
        .findByIdAndUpdate(
            request.params.id,
            { title, author, url, likes },
            { new: true, runValidators: true }
        ).populate('user', { username: 1, name: 1 });

        if (!updatedBlog) {
            return response.status(404).end();
        }

        response.json(updatedBlog);
    } catch (error) {
        response.status(400).json({ error: error.message });
    }
});

module.exports = blogsRouter;