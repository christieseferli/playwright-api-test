import { test, expect } from '@playwright/test';
import { beforeEach } from 'node:test';
import tags from '../test-data/tags.json'
import { request } from 'http';

test.beforeEach(async ({page}) => {
  // Mock API
  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })


  await page.goto('https://conduit.bondaracademy.com/')
  // Remove those steps since the authentication is setup are precondition
  // await page.getByText('Sign in').click()
  // await page.getByRole('textbox', {name: 'Email'}).fill('cstest@test.com')
  // await page.getByRole('textbox', {name: 'Password'}).fill('Welcome1')
  // await page.getByRole('button').click()

})

test('has title', async ({ page }) => {
  // intercept API response and modify it
  await page.route('*/**/api/articles*', async route => {
    // GET the api response
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = 'This is a MOCK test title'
    responseBody.articles[0].description = 'This is a MOCK test description'

    // fill the response
    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  await page.getByText('Global Feed').click()

  // Expect a title "to contain" a substring.
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await page.waitForTimeout(2000)
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK test description')


});

test('delete article', async ({page, request}) => {
  // "email": "cstest@test.com"
  // "username": "cstest"

  // Get the access token from the POST response
  // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
  //   data: {
  //     "user":{"email":"cstest@test.com","password":"Welcome1"}
  //   }
  // })
  // const resportBody = await response.json()
  // const accessToken = resportBody.user.token

  // Post an article
  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article":{"title":"test title","description":"test description","body":"test body","tagList":['playwright']}
    }
      // headers: {
      //   Authorization: `Token ${accessToken}`
      // }
  })
expect(articleResponse.status()).toEqual(201)

// Get article if it's created using UI - Intercept URL
// const getArticleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
// const getArticleResponseBody = await getArticleResponse.json()
// const slugID = getArticleResponseBody.article.slug

const articleResponseBody = await articleResponse.json()
const slugID = articleResponseBody.article.slug


// navigate to articles page
await page.getByText('GLobal Feed').click()
await page.getByText('test title').click()
// Delete article
const deleteResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugID}`, {
  // headers: {
  //   Authorization: `Token ${accessToken}`
  // }
})
expect(deleteResponse.status()).toEqual(204)
// validate article is deleted
await expect(page.locator('app-article-list h1').first()).not.toContainText('test title')
})