import blogService from '../services/blogs'

const DeleteBlog = async (blog) => {
  if (window.confirm(`Are you sure you want to delete the blog: ${blog.title} by ${blog.author}?`)) {
    await blogService.remove(blog.id)
    return true
  }
  return false
}

export default DeleteBlog