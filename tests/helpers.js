const loginUser = async (page, username = 'Tester', password = 'password123') => {
  const loginButton = page.getByRole('button', { name: /Log in/i });
  await loginButton.click();
  await page.getByLabel('Username:').fill(username);
  await page.getByLabel('Password:').fill(password);
  await page.getByRole('button', { name: /Submit/i }).click();
};

const createBlog = async (page, title, author, url) => {
  const createBlogButton = page.getByRole('button', { name: /New Blog/i });
  await createBlogButton.click();
  await page.getByPlaceholder('Blog Title').fill(title);
  await page.getByPlaceholder('Blog Author').fill(author);
  await page.getByPlaceholder('Blog URL').fill(url);
  await page.getByRole('button', { name: /Create/i }).click();
};

module.exports = { loginUser, createBlog };
