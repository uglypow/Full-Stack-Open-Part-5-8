const dummy = (blogs) => {
    return 1;                                                                                       
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlogs = (blogs) => {
    const mostLikes = Math.max(...blogs.map(blog => blog.likes))

    return blogs.find(blog => blog.likes === mostLikes)
}

const mostBlogs = (blogs) => {
    let maxBlogs = 0
    let maxAuthor = ''
    const blogCount = {}
    for (const blog of blogs) {
        if (blog.author in blogCount) {
            blogCount[blog.author] += 1
        } else {
            blogCount[blog.author] = 1
        }
    }

    for (const author in blogCount) {
        if (blogCount[author] > maxBlogs) {
            maxBlogs = blogCount[author]
            maxAuthor = author
        }
    }

    return { author: maxAuthor, blogs: maxBlogs }
}

const mostLikes = (blogs) => {
    let maxLikes = 0
    let maxAuthor = ''
    const likeCount = {}
    for (const blog of blogs) {
        if (blog.author in likeCount) {
            likeCount[blog.author] += blog.likes
        } else {
            likeCount[blog.author] = blog.likes
        }
    }

    for (const author in likeCount) {
        if (likeCount[author] > maxLikes) {
            maxLikes = likeCount[author]
            maxAuthor = author
        }
    }

    return { author: maxAuthor, likes: maxLikes}
}

module.exports = {
    dummy, totalLikes, favoriteBlogs, mostBlogs, mostLikes
}
