const {test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('assert')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const initialBlogs = helper.initialBlogs



beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(initialBlogs)
})

const api = supertest(app)

test('blogs are returned as json', { timeout: 10000 }, async () => {
    await api
        .get('/api/blogs')
        .expect('Content-Type', /application\/json/)
        .expect(200)
})

test('there are two blogs', { timeout: 10000 }, async () => {
    const response = await api.get('/api/blogs')
    console.log(response.body)
    if (response.body.length !== 2) {
        throw new Error(`Expected 2 blogs, but got ${response.body.length}`)
    }
})
test('a specific blog is within the returned blogs', { timeout: 10000 }, async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)
    assert(titles.includes('Test Blog2'))
})

test('all blogs are returned', { timeout: 10000 }, async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('a valid blog can be added', { timeout: 10000 }, async () => {
    const newBlog = {
        title: 'New Test Blog',
        author: 'New Author',
        url: 'http://newtestblog.com',
        likes: 0
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

    const blogsAtEnd = await helper.blogsinDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    const titles = blogsAtEnd.map(b => b.title)
    assert(titles.includes('New Test Blog'))
})


test('a specific blog can be viewed', { timeout: 10000 }, async () => {
    const blogsAtStart = await helper.blogsinDb()
    const blogToView = blogsAtStart[0]

    const response = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.title, blogToView.title)
    assert.strictEqual(response.body.author, blogToView.author)
    assert.strictEqual(response.body.url, blogToView.url)
    assert.strictEqual(response.body.likes, blogToView.likes)
})

test('a blog can be deleted', { timeout: 10000 }, async () => {
  const blogsAtStart = await helper.blogsinDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsinDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

  const titles = blogsAtEnd.map(b => b.title)
  assert(!titles.includes(blogToDelete.title))
})

test('a HTTP get request gets correct amount of blogs', { timeout: 10000 }, async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
})

test('likes default to 0 if missing', { timeout: 10000 }, async () => {
    const newBlog = {
        title: 'Blog without likes',
        author: 'Author',
        url: 'http://example.com'
    }

    const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)

    assert.strictEqual(response.body.likes, 0)
})

test('blog without title and url is not added', { timeout: 10000 }, async () => {
    const newBlog = {
        author: 'New Author',
        likes: 0
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

    const blogsAtEnd = await helper.blogsinDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

test('updating a blog works', { timeout: 10000 }, async () => {
    const blogsAtStart = await helper.blogsinDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = {
        title: 'Updated Title',
        author: 'Updated Author',
        url: 'http://updatedurl.com',
        likes: 5
    }

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)

    const blogsAtEnd = await helper.blogsinDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)

    const titles = blogsAtEnd.map(b => b.title)
    assert(titles.includes('Updated Title'))
})

test('a blog with unique identifier property id', { timeout: 10000 }, async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
        assert(blog.id, 'Blog is missing id property')
    })
}) 

after(() => {
    mongoose.connection.close() 
})