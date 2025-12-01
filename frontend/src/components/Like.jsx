import blogService from '../services/blogs'

const likeBlog = async (blog) => {
  const updatedBlog = await blogService.update(blog.id, {
    ...blog,
    likes: blog.likes + 1,
    user: blog.user.id,
  })
  return updatedBlog
}

export default likeBlog