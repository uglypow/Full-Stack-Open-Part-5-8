const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog, findBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'superuser',
        username: 'root',
        password: '123'
      }
    })
    await request.post('/api/users', {
      data: {
        name: 'user1',
        username: 'user1',
        password: '123'
      }
    })
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.locator('h2').getByText('Login')).toBeVisible()

    const form = page.locator('form')
    await expect(form).toContainText('username')
    await expect(form).toContainText('assword')

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'root', '123')
      await expect(page.getByText('superuser logged-in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'root', 'wrong')

      const errorDiv = await page.locator('.error')
      await expect(errorDiv).toContainText('wrong username or password')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

      await expect(page.getByText('superuser logged-in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    const blog1 = {
      title: 'title1',
      author: 'author1',
      url: 'http://www.url1.com',
    }
    const blog2 = {
      title: 'title2',
      author: 'author2',
      url: 'http://www.url2.com',
    }

    beforeEach(async ({ page }) => {
      await loginWith(page, 'root', '123')
      await createBlog(page, blog1)
      await createBlog(page, blog2)
    })

    test('a new blog can be created', async ({ page }) => {
      await expect(page.getByText('title1 author1')).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      const blog = await findBlog(page, 'title1 author1')
      await blog.getByRole('button', { name: 'view' }).click()
      await blog.getByRole('button', { name: 'like' }).click()

      await expect(blog.getByText('likes 1')).toBeVisible()
    })

    test('a blog can be deleted', async ({ page }) => {
      const blog = await findBlog(page, 'title1 author1')
      await blog.getByRole('button', { name: 'view' }).click()

      page.on('dialog', async (dialog) => {
        await dialog.accept()
      })
      await blog.getByRole('button', { name: 'remove' }).click()

      await expect(blog.getByText('title1 author1')).not.toBeVisible()
    })

    test('only the creator of a blog can delete it', async ({ page }) => {
      await page.getByRole('button', { name: 'logout' }).click()

      await loginWith(page, 'user1', '123')
      const blog = await findBlog(page, 'title1 author1')
      await blog.getByRole('button', { name: 'view' }).click()

      await expect(blog.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })

    test('blogs are ordered according to likes', async ({ page }) => {
      const blog1 = await findBlog(page, 'title1 author1')
      const blog2 = await findBlog(page, 'title2 author2')

      await blog1.getByRole('button', { name: 'view' }).click()
      await blog2.getByRole('button', { name: 'view' }).click()

      await blog2.getByRole('button', { name: 'like' }).click()
      await blog2.getByText('likes 1').waitFor()

      const firstBlog = page.getByTestId('blog').first()
      await expect(firstBlog.getByText('title2 author2')).toBeVisible()
    })
  })
})