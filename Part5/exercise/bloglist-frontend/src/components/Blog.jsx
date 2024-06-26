import { useState } from 'react'

const Blog = ({ blog, user, updateBlog, removeBlog }) => {
  const [showDetail, setShowDetail] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const handleView = () => {
    setShowDetail(!showDetail)
  }

  const handleLike = () => {
    updateBlog(blog.id, { ...blog, likes: blog.likes + 1 })
  }

  const handleRemove = () => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      removeBlog(blog.id)
    }
  }

  return (
    <div style={blogStyle} data-testid='blog'>
      {showDetail ?
        <div>
          <div>
            {blog.title} {blog.author}
            <button onClick={handleView}>hide</button>
          </div>
          <a href={blog.url} target="_blank" rel="noreferrer"><div>{blog.url}</div></a>
          <div>
            likes {blog.likes}
            <button onClick={handleLike}>like</button>
          </div>
          <div>{blog.user.name}</div>
          {user.username === blog.user.username ?
            <button onClick={handleRemove}>remove</button>
            :
            null
          }
        </div>
        :
        <div>
          {blog.title} {blog.author}
          <button onClick={handleView}>view</button>
        </div>
      }
    </div>
  )
}

export default Blog