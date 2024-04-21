import { useState, useEffect, useRef } from 'react'

import Blog from './components/Blog'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'

import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [message, setMessage] = useState({ text: null, type: null })
  const [user, setUser] = useState(null)
  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const addBlog = (blogObject) => {
    blogService
      .create(blogObject)
      .then(returnedBlog => {
        blogFormRef.current.toggleVisibility()
        setBlogs(blogs.concat(returnedBlog))
        setMessage({
          text: `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`,
          type: 'success'
        })
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
      .catch(error => {
        setMessage({
          text: error.response.data.error,
          type: 'error'
        })
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
  }

  const updateBlog = (id, blogObject) => {
    blogService
      .update(id, blogObject)
      .then(returnedBlog => {
        setBlogs(blogs.map(blog => blog.id !== id ? blog : returnedBlog))
      })
      .catch(error => {
        setMessage({
          text: error.response.data.error,
          type: 'error'
        })
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
  }

  const removeBlog = (id) => {
    blogService
      .remove(id)
      .then(() => {
        setBlogs(blogs.filter(blog => blog.id !== id))
      })
      .catch(error => {
        setMessage({
          text: error.response.data.error,
          type: 'error'
        })
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
  }

  const handleLogin = (userObject) => {
    loginService
      .login(userObject)
      .then(user => {
        window.localStorage.setItem(
          'loggedNoteappUser', JSON.stringify(user)
        )
        blogService.setToken(user.token)
        setUser(user)
      })
      .catch(error => {
        setMessage({
          text: 'wrong username or password',
          type: 'error'
        })
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedNoteappUser')
    setUser(null)
  }

  blogs.sort((a, b) => b.likes - a.likes)

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={message} />
      {user === null ?
        <LoginForm handleLogin={handleLogin} />
        :
        <div>
          <p>
            {user.name} logged-in
            <button onClick={handleLogout}>logout</button>
          </p>
          <h2>create new</h2>
          <Togglable buttonLabel="new blog" ref={blogFormRef} >
            <BlogForm createBlog={addBlog} />
          </Togglable>
          {blogs.map(blog =>
            <Blog
              key={blog.id}
              blog={blog}
              user={user}
              updateBlog={updateBlog}
              removeBlog={removeBlog}
            />
          )}
        </div>
      }

    </div>
  )
}

export default App