const loginWith = async (page, username, password) => {
    await page.getByPlaceholder('Username').fill(username)
    await page.getByPlaceholder('Password').fill(password)
    await page.getByRole('button', { name: 'Login' }).click()
}

const createBlog = async (page, blog) => {
    await page.getByRole('button', { name: 'new blog' }).click()
    await page.getByPlaceholder('Title').fill(blog.title)
    await page.getByPlaceholder('Author').fill(blog.author)
    await page.getByPlaceholder('Url').fill(blog.url)
    await page.getByRole('button', { name: 'Create' }).click()
    await page.getByText(`${blog.title} ${blog.author}`).waitFor()
}

const findBlog = async (page, text) => {
    const blogText = await page.getByText(text)
    const blogTextParent = await blogText.locator('..')
    return blogTextParent
}

export { loginWith, createBlog, findBlog }