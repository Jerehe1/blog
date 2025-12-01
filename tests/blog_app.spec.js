const {test, expect} = require('@playwright/test');
const { loginUser, createBlog } = require('./helpers');

const BASE_URL = 'http://localhost:5173/blog/';

test.describe('Blog app', () => {
    test.beforeEach(async ({ page, request }) => {
      
      await request.post(`http://localhost:5173/api/testing/reset`);
      await request.post(`http://localhost:5173/api/users`, {
          data: {
              username: 'Tester',
              name: 'Tester Name',
              password: 'password123'
          }
      });

      await page.goto(BASE_URL);
    });

  test('front page works', async ({ page }) => {
    const locator = page.getByText('Blog Login');
    await expect(locator).toBeVisible();
  });

  test('login form can be opened', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /Log in/i });
    await loginButton.click();

    const usernameInput = page.getByLabel('Username:');
    await expect(usernameInput).toBeVisible();
    const passwordInput = page.getByLabel('Password:');
    await expect(passwordInput).toBeVisible();
  });

  test('user can log in with correct credentials', async ({ page }) => {
    await loginUser(page);

    const welcomeMessage = page.getByText('Welcome! Tester Name');
    await expect(welcomeMessage).toBeVisible();
  });

  test('login fails with wrong password', async ({ page }) => {
    await loginUser(page, 'Tester', 'wrongpassword');

    const errorDiv = page.locator('.error-message');
    await expect(errorDiv).toContainText('Invalid username or password');
    await expect(errorDiv).toHaveCSS('color', 'rgb(224, 224, 224)');
    await expect(page.getByText('Welcome! Tester Name')).not.toBeVisible();
  });

  test('liking a blog post works', async ({ page }) => {
    await loginUser(page);

    await createBlog(page, 'Test Blog', 'Test Author', 'http://testblog.com');

    
    await page.waitForSelector('h2:has-text("Test Blog")');
    
    
    const heading = page.getByRole('heading', { name: 'Test Blog', exact: true });
    await expect(heading).toBeVisible();
    
    
    const blogContainer = page.locator('.blog-item').filter({ has: heading });
    
  
    await expect(blogContainer).toHaveCount(1);
    
   
    await blogContainer.getByRole('button', { name: 'View' }).click();

   
    await expect(blogContainer.getByText('0 likes')).toBeVisible();
    await blogContainer.getByRole('button', { name: 'Like' }).click();
    await expect(blogContainer.getByText('1 likes')).toBeVisible();
  });

  test('can create a new blog post', async ({ page }) => {
    await loginUser(page);
    await createBlog(page, 'E2E Test Blog', 'Playwright', 'http://e2etestblog.com');

    const newBlogTitle = page.getByRole('heading', { name: 'E2E Test Blog' });
    await expect(newBlogTitle).toBeVisible();

    const viewButton = page.getByRole('button', { name: /View/i }).last();
    await viewButton.click();

    const blogDetails = page.getByText('Author: Playwright');
    await expect(blogDetails).toBeVisible();
  });

  test('user who created a blog can delete it', async ({ page }) => {
    await loginUser(page);
    await createBlog(page, 'Deletable Blog', 'Deleter', 'http://deletableblog.com');

    const blogHeading = page.getByRole('heading', { name: 'Deletable Blog' });
    await expect(blogHeading).toBeVisible();
    
    const blogContainer = page.locator('.blog-item').filter({ has: blogHeading });
    await blogContainer.getByRole('button', { name: 'View' }).click();
    await blogContainer.getByRole('button', { name: 'Delete' }).click();

    await expect(blogHeading).not.toBeVisible();
  });

  test('blogs are ordered by likes in descending order', async ({ page }) => {
    await loginUser(page);

    await createBlog(page, 'Least Liked Blog', 'Author1', 'http://blog1.com');
    await createBlog(page, 'Medium Liked Blog', 'Author2', 'http://blog2.com');
    await createBlog(page, 'Most Liked Blog', 'Author3', 'http://blog3.com');

    const blogHeadings =
      page.getByRole('heading').filter({ hasText: /Blog$/ });
      
    const likeBlog = async (blogTitle, likes) => {
      const blogContainer = page.locator('.blog-item').filter({ has: page.getByRole('heading', { name: blogTitle }) });
      await blogContainer.getByRole('button', { name: 'View' }).click();
      const likeButton = blogContainer.getByRole('button', { name: 'Like' });
      for (let i = 0; i < likes; i++) {
        await likeButton.click();
        await page.waitForTimeout(100); 
      }
    };

    await likeBlog('Least Liked Blog', 1);
    await likeBlog('Medium Liked Blog', 3);
    await likeBlog('Most Liked Blog', 5);

    const blogs = page.locator('.blog-item');
    const blogCount = await blogs.count();
    let previousLikes = Infinity;

    for (let i = 0; i < blogCount; i++) {
      const blog = blogs.nth(i);
      await blog.getByRole('button', { name: 'View' }).click();
      const likesText = await blog.getByText(/likes/).innerText();
      const likes = parseInt(likesText.split(' ')[0], 10);
      expect(likes).toBeLessThanOrEqual(previousLikes);
      previousLikes = likes;
    }
  });

});
