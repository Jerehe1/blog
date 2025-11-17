import { useState } from "react"

const BlogForm = ({ createBlog }) => {  // Changed to capital B
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [url, setUrl] = useState('')

    const addBlog = (event) => {
        event.preventDefault()
        createBlog({
            title: title,
            author: author,
            url: url
        }) 
        setTitle('')
        setAuthor('')
        setUrl('')
    }

    return (
        <div className='new-blog-wrapper'>
            <div className='new-blog-container'>
                <h3>Create New Blog</h3>
                <form className='new-blog-form' onSubmit={addBlog}>
                    <div className='form-group'>
                        <label>Title</label>
                        <input
                            type="text"
                            value={title}
                            placeholder="Blog Title"
                            onChange={({ target }) => setTitle(target.value)}
                        />
                    </div>
                    <div className='form-group'>
                        <label>Author</label>
                        <input
                            type="text"
                            value={author}
                            placeholder="Blog Author"
                            onChange={({ target }) => setAuthor(target.value)}
                        />
                    </div>
                    <div className='form-group'>
                        <label>URL</label>
                        <input
                            type="text"
                            value={url}
                            placeholder="Blog URL"
                            onChange={({ target }) => setUrl(target.value)}
                        />
                    </div>
                    <button className='add-blog-button' type="submit">
                        Add New Blog
                    </button>
                </form>
            </div>
        </div>
    )
}

export default BlogForm