const Blog = ({ blog }) => (
  <div>
    <p>Title: {blog.title}</p>
    <p>Author: {blog.author}</p>
    <p>URL: {blog.url}</p>
    <p>{blog.likes} likes</p>
    <p>{blog.user.name}</p>
  </div>  
)

export default Blog