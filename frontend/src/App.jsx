import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/blogform'
import blogService from './services/blogs'
import loginService from './services/login'
import likeBlog from './components/Like'
import './index.css'
import Toggle from './components/toggle'
import DeleteBlog from './components/delete.jsx'

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

// Login function

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })

      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (error) {
      if (error.response) {
        
        if (error.response.status === 401) {
          setErrorMessage('Invalid username or password')
        } else if (error.response.status === 400) {
          setErrorMessage('Username and password are required')
        } else {
          setErrorMessage('Login failed. Please try again later')
        }
      } else if (error.request) {
        
        setErrorMessage('Cannot connect to server. Please check your connection')
      } else {
       
        setErrorMessage('An unexpected error occurred')
      }
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
    blogService.setToken(null)
  }

  // Blog message box functions

  const handleLike = async (blog) => {
    try {
      const updatedBlog = await likeBlog(blog)
      setBlogs(blogs.map(b => b.id !== blog.id ? b : updatedBlog))
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage('Session expired. Please log in again')
        handleLogout()
      } else {
        setErrorMessage('Failed to update likes')
      }
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
    }
  }

  const handleDelete = async (blog) => {
    try {
      await DeleteBlog(blog)
      setBlogs(blogs.filter(b => b.id !== blog.id))
    } catch {
      setErrorMessage('Failed to delete blog')
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
    }
  }

  const addBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.Create(blogObject)
      setBlogs(blogs.concat(returnedBlog))

      setSuccessMessage(`A new blog "${blogObject.title}" by ${blogObject.author} added`)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage('Session expired. Please log in again')
        handleLogout()
      } else if (error.response?.status === 400) {
        setErrorMessage(error.response.data.error || 'Invalid blog data')
      } else {
        setErrorMessage('Creating blog failed')
      }
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
            <p className='user-info'>There are a  {blogs.length} blogs </p>
            <p className='user-info'> There is a total of {blogs.reduce((sum, blog) => sum + blog.likes, 0)} likes</p>
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
            {blogs.sort((a, b) => b.likes - a.likes).map(blog =>
              <Blog key={blog.id} blog={blog} handleLike={handleLike} handleDelete={handleDelete} />
            )}

            <Toggle buttonLabel="New Blog" buttonClass="new-blog-button">
              {(closeForm) => (
                <BlogForm createBlog={addBlog} onClose={closeForm} />
              )}
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

if (process.env.NODE_ENV === 'test') {
    const testingRouter = require('./controllers/testing')
    app.use('/api/testing', testingRouter)
}