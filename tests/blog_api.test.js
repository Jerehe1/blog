const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('assert')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/users')
const bcrypt = require('bcrypt')

const api = supertest(app)
let token = null

beforeEach(async () => {
  
  await Blog.deleteMany({})
  await User.deleteMany({})

  
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash
  })
  await user.save()

   // Login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'sekret' })

  if (loginResponse.status !== 200) {
    console.error('Login failed:', loginResponse.status, loginResponse.body)
    throw new Error('Login failed in beforeEach')
  }

  token = loginResponse.body.token

 
  const blogsWithUser = helper.initialBlogs.map(blog => ({
    ...blog,
    user: user._id
  }))
  await Blog.insertMany(blogsWithUser)
})

test('blogs are returned as json', { timeout: 10000 }, async () => {
  await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .expect('Content-Type', /application\/json/)
    .expect(200)
})

test('there are two blogs', { timeout: 10000 }, async () => {
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
  if (response.body.length !== helper.initialBlogs.length) {
    throw new Error(`Expected ${helper.initialBlogs.length} blogs, but got ${response.body.length}`)
  }
})

test('a specific blog is within the returned blogs', { timeout: 10000 }, async () => {
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`)

  const titles = response.body.map(r => r.title)
  assert(titles.includes('Test Blog2'))
})

test('all blogs are returned', { timeout: 10000 }, async () => {
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
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
    .set('Authorization', `Bearer ${token}`)
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
    .set('Authorization', `Bearer ${token}`)
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
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsinDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
  const titles = blogsAtEnd.map(b => b.title)
  assert(!titles.includes(blogToDelete.title))
})

test('a HTTP get request gets correct amount of blogs', { timeout: 10000 }, async () => {
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('likes default to 0 if missing', { timeout: 10000 }, async () => {
  const newBlog = {
    title: 'Blog without likes',
    author: 'Author',
    url: 'http://example.com'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
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
    .set('Authorization', `Bearer ${token}`)
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
    .set('Authorization', `Bearer ${token}`)
    .send(updatedBlog)
    .expect(200)

  const blogsAtEnd = await helper.blogsinDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  const titles = blogsAtEnd.map(b => b.title)
  assert(titles.includes('Updated Title'))
})

test('a blog has unique identifier property id', { timeout: 10000 }, async () => {
  const response = await api
    .get('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
  response.body.forEach(blog => {
    assert(blog.id, 'Blog is missing id property')
  })
})

test('creating a blog fails with status 401 if token is not provided', { timeout: 10000 }, async () => {
  const newBlog = {
    title: 'Unauthorized Blog',
    author: 'Author',
    url: 'http://example.com',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)

  const blogsAtEnd = await helper.blogsinDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

after(() => {
  mongoose.connection.close()
})
