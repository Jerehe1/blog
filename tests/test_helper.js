const Blog = require('../models/blog');
const User = require('../models/users');

const initialBlogs = [
    {
        title: 'Test Blog1',
        author: 'Author1',
        url: 'http://testblog1.com',
        likes: 5
    },
    {
        title: 'Test Blog2',
        author: 'Author2',
        url: 'http://testblog2.com',
        likes: 10
    }
]

const nonexistingId = async () => {
    const blogInstance = new Blog({ title: 'willremovethissoon', author: 'temp', url: 'http://tempurl.com', likes: 0 })
    await blogInstance.save()
    await blogInstance.deleteOne()

    return blogInstance._id
}

const blogsinDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(b => b.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    initialBlogs,
    nonexistingId,
    blogsinDb,
    usersInDb,
}