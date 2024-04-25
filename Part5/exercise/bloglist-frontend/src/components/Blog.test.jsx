import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('Blog', () => {
    const blog = {
        title: 'title',
        author: 'author',
        url: 'url',
        likes: 0,
        user: { username: 'username', name: 'name', id: 'id' }
    }

    test('blog renders the blogs title and author, but does not render its URL or likes by default', () => {
        render(<Blog blog={blog} />)

        screen.getByText('title author')
        // blogs URL and number of likes are not shown by default
        expect(screen.queryByText('url')).toBeNull()
        expect(screen.queryByText('likes 0')).toBeNull()
    })

    test('blogs URL and number of likes are shown after button has been clicked', async () => {
        const userDetail = {
            username: 'username',
            name: 'name',
            id: 'id'
        }

        render(<Blog blog={blog} user={userDetail} />)

        const user = userEvent.setup()

        const button = screen.getByText('view')
        await user.click(button)

        screen.getByText('url')
        screen.getByText('likes 0')
    })

    test('clicking like twice calls event handler twice', async () => {
        const user = userEvent.setup()
        const updateBlog = vi.fn()

        render(<Blog blog={blog} user={user} updateBlog={updateBlog} />)

        const button = screen.getByText('view')
        await user.click(button)

        const likeButton = screen.getByText('like')
        await user.click(likeButton)
        await user.click(likeButton)

        expect(updateBlog.mock.calls).toHaveLength(2)
    })
})

