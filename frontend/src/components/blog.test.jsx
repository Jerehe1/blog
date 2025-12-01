import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { test, expect, vi } from 'vitest'
import Blog from './Blog.jsx'
import BlogForm from './blogform.jsx'
import Toggle from './toggle.jsx'

test('title visible by default; details hidden', async () => {
  const blog = {
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://testblog.com',
    likes: 5,
    user: { name: 'Test User' }
  }

  const mockHandleLike = vi.fn()
  const mockHandleDelete = vi.fn()
  const user = userEvent.setup()

  render(<Blog blog={blog} handleLike={mockHandleLike} handleDelete={mockHandleDelete} />)

 
  const title = screen.getByText('Test Blog')
  expect(title).toBeInTheDocument()
  expect(title).toBeVisible()

  
  const author = screen.getByText('Author: Test Author')
  const url = screen.getByText('URL: http://testblog.com')
  const likes = screen.getByText('5 likes')
  expect(author).not.toBeVisible()
  expect(url).not.toBeVisible()
  expect(likes).not.toBeVisible()

})

test('URL and likes are shown when view button is clicked', async () => {
  const blog = {
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://testblog.com',
    likes: 5,
    user: { name: 'Test User' }
  }

    const mockHandleLike = vi.fn()
    const mockHandleDelete = vi.fn()
    const user = userEvent.setup()

    render(<Blog blog={blog} handleLike={mockHandleLike} handleDelete={mockHandleDelete} />)

    const url = screen.getByText('URL: http://testblog.com')
    const likes = screen.getByText('5 likes')
    expect(url).not.toBeVisible()
    expect(likes).not.toBeVisible()

    const viewButton = screen.getByRole('button', { name: /view/i })
    await user.click(viewButton)
    expect(url).toBeVisible()
    expect(likes).toBeVisible()
})

test('new blog form calls createBlog with correct details', async () => {
  const mockCreateBlog = vi.fn()
  const user = userEvent.setup()

  render(
    <Toggle buttonLabel="New Blog" buttonClass="new-blog-button">
      <BlogForm createBlog={mockCreateBlog} onClose={() => {}} />
    </Toggle>
  )

  const blogButton = screen.getByRole('button', { name: /New Blog/i })
  await user.click(blogButton)

  const titleInput = screen.getByPlaceholderText('Blog Title')
  const authorInput = screen.getByPlaceholderText('Blog Author')
  const urlInput = screen.getByPlaceholderText('Blog URL')

  await user.type(titleInput, 'New Test Blog')
  await user.type(authorInput, 'New Test Author')
  await user.type(urlInput, 'http://newtestblog.com')

  const addButton = screen.getByRole('button', { name: /Create/i })
  await user.click(addButton)

  expect(mockCreateBlog).toHaveBeenCalledTimes(1)
  expect(mockCreateBlog).toHaveBeenCalledWith({
    title: 'New Test Blog',
    author: 'New Test Author',
    url: 'http://newtestblog.com'
  })
})

test('like button calls event handler twice when clicked twice', async () => {
  const blog = {
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://testblog.com',
    likes: 5,
    user: { name: 'Test User' }
  }

  const mockHandleLike = vi.fn()
  const mockHandleDelete = vi.fn()
  const user = userEvent.setup()

  render(<Blog blog={blog} handleLike={mockHandleLike} handleDelete={mockHandleDelete} />)

  const viewButton = screen.getByRole('button', { name: /view/i })
  await user.click(viewButton)
    const likeButton = screen.getByRole('button', { name: /like/i })
    await user.click(likeButton)
    await user.click(likeButton)
    expect(mockHandleLike).toHaveBeenCalledTimes(2)
})


