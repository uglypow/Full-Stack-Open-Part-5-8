const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')

const Blog = require('../models/blog')

const bcrypt = require('bcrypt')
const User = require('../models/user')

describe('blog api', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await User.deleteMany({})

        // Create user
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
        await user.save()

        // Create token
        const login = await api
            .post('/api/login')
            .send({ username: 'root', password: 'sekret' })

        // Create blogs
        for (let blog of helper.initialBlogs) {
            blog.user = user._id
            const blogObject = new Blog(blog)
            await blogObject.save()
        }

        global.token = `Bearer ${login.body.token}`
    })

    describe('note tests', () => {
        test('correct amount of blog posts in the JSON format.', async () => {
            await api
                .get('/api/blogs')
                .expect(200)
                .expect('Content-Type', /application\/json/)
        })

        test('unique identifier property of the blog posts is named id', async () => {
            const newBlog = {
                title: 'async/await simplifies making async calls',
                author: 'Robert C. Martin',
                url: 'https://fullstackopen.com/en/',
                likes: 0
            }

            const response = await api.post('/api/blogs')
                .send(newBlog)
                .set('Authorization', global.token)
                .expect(201)

            assert.ok(response.body.hasOwnProperty('id'))
        })

        test('successfully creates a new blog post', async () => {
            const blogsAtStart = await helper.blogsInDb()

            const newBlog = {
                title: 'async/await simplifies making async calls',
                author: 'Robert C. Martin',
                url: 'https://fullstackopen.com/en/',
                likes: 0
            }

            await api.post('/api/blogs')
                .send(newBlog)
                .set('Authorization', global.token)
                .expect(201)

            const blogsAtEnd = await helper.blogsInDb()

            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)
        })

        test('likes property is missing from the request', async () => {
            const newBlog = {
                title: 'async/await simplifies making async calls',
                author: 'Robert C. Martin',
                url: 'https://fullstackopen.com/en/'
            }

            const response = await api.post('/api/blogs')
                .send(newBlog)
                .set('Authorization', global.token)
                .expect(201)

            assert.strictEqual(response.body.likes, 0)
        })

        test('title or url properties are missing from the request data', async () => {
            const blogsAtStart = await helper.blogsInDb()

            const newBlog = {
                author: 'Robert C. Martin',
                likes: 0
            }

            await api.post('/api/blogs')
                .send(newBlog)
                .set('Authorization', global.token)
                .expect(400)

            const blogsAtEnd = await helper.blogsInDb()

            assert.strictEqual(blogsAtStart.length, blogsAtEnd.length)
        })

        test('delete succeeds with status code 204 if id is valid', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set('Authorization', global.token)
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()

            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

            assert(!blogsAtEnd.includes(blogToDelete))
        })

        test('updating the information of an individual blog post', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]

            blogToUpdate.likes = blogToUpdate.likes + 10

            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(blogToUpdate)
                .expect(200)

            const blogsAtEnd = await helper.blogsInDb()
            const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)

            assert.strictEqual(updatedBlog.likes, blogToUpdate.likes)
        })
    })

    describe('user tests', () => {
        test('invalid username', async () => {
            const usersAtStart = await helper.usersInDb()
            const newUser = {
                username: 'aa',
                name: 'aa',
                password: '123',
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtStart.length, usersAtEnd.length)

            const usernames = usersAtEnd.map(user => user.username)
            assert(!usernames.includes(newUser.username))
        })

        test('invalid password', async () => {
            const usersAtStart = await helper.usersInDb()
            const newUser = {
                username: 'aaa',
                name: 'aaa',
                password: '12',
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert.strictEqual(usersAtStart.length, usersAtEnd.length)

            const usernames = usersAtEnd.map(user => user.username)
            assert(!usernames.includes(newUser.username))
        })

        test('username already taken', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'root',
                name: 'Superuser',
                password: 'salainen',
            }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)

            const usersAtEnd = await helper.usersInDb()
            assert(result.body.error.includes('expected `username` to be unique'))

            assert.strictEqual(usersAtEnd.length, usersAtStart.length)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})