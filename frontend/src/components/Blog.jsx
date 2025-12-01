import Toggle from './toggle.jsx'

const Blog = ({ blog, handleLike, handleDelete }) => (
  <div className="blog-item">
    <h2>{blog.title}</h2>
    <Toggle  buttonClass='MainBlog-Toggle' buttonLabel={'View'} cancelLabel='Hide'>
      <h3>Author: {blog.author}</h3>
      <h4>URL: {blog.url}</h4>
      <p className="blog-likes">
        {blog.likes} likes
        <button className='Like-button' onClick={() => handleLike(blog)}>
          Like
        </button>
      </p>
      <p className="blog-user">{blog.user.name}</p>
      <button className='delete-blog-button' onClick={() => handleDelete(blog)}>Delete</button>
    </Toggle>
  </div>
)

export default Blog