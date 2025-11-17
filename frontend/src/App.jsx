import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/blogform'
import blogService from './services/blogs'
import loginService from './services/login'
import "./index.css"
import Toggle from './components/toggle'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )  
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
      if (loggedUserJSON) {
        const user = JSON.parse(loggedUserJSON)
        setUser(user)
        blogService.setToken(user.token)
      }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })

      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('Login failed')
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
    blogService.setToken(null)
  }

  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.Create(blogObject)
      setBlogs(blogs.concat(returnedBlog))

      setSuccessMessage(`A new blog "${blogObject.title}" by ${blogObject.author} added`)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (exception) {
      setErrorMessage('Creating blog failed')
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
    }
  }

  const loginForm = () => (
    <div>
      <div className='login-header'>
        <h2>Blog Login</h2>
      </div>
      {errorMessage && (
        <div className='error-message'>
          {errorMessage}
        </div>
      )}
      <div className='login-box'>
        <Toggle buttonLabel="Log in">
          <form className='login-form' onSubmit={handleLogin}>
            <div>
              <label>
                Username:
                <input
                  type='text'
                  value={username}
                  onChange={({ target }) => setUsername(target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Password:
                <input
                  type='password'
                  value={password}
                  onChange={({ target }) => setPassword(target.value)}
                />
              </label>
            </div>
            <div>
              <button className='login-button' type="submit">
                Submit
              </button>
            </div>
          </form>
        </Toggle>
      </div>
    </div>
  )

  return (
    <div>
      {!user && loginForm()}
      {user && (
        <div>
          <div className='blog-box'>
            <div className='blog-header'>
              <h2>Welcome! {user.name} </h2>
            </div>
            <p className='user-info'>You have {blogs.length} blogs </p>
            <p className='user-info'> You have a total of {blogs.reduce((sum, blog) => sum + blog.likes, 0)} likes</p>
          </div>

          {successMessage && (
            <div className='success-message'>
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className='error-message'>
              {errorMessage}
            </div>
          )}
        
          <div className='blogs-container'>
            {blogs.map(blog =>
              <div key={blog.id} className='blog-item'>
                <Blog blog={blog} />
              </div>
            )}

            <Toggle buttonLabel="New Blog" buttonClass="toggle-form-button">
              <BlogForm createBlog={addBlog} />
            </Toggle>
          </div>
        
          <button className='logout-button' onClick={handleLogout}>
            logout
          </button>
        </div>
      )}
    </div>
  )
}

export default App