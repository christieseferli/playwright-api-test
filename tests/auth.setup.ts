import { test as setup } from '@playwright/test';
import user from '../.auth/user.json'
import fs from 'fs'

const authFile = '.auth/user.json'

setup('authentication', async({request}) => {
// UI Authentication    
//   await page.goto('https://conduit.bondaracademy.com/')
//   await page.getByText('Sign in').click()
//   await page.getByRole('textbox', {name: 'Email'}).fill('cstest@test.com')
//   await page.getByRole('textbox', {name: 'Password'}).fill('Welcome1')
//   await page.getByRole('button').click()    

//   await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags')
//   await page.context().storageState({path: authFile})

// or
// Using API for Authentication
  // Get the access token from the POST response
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
    data: {
      "user":{"email":"cstest@test.com","password":"Welcome1"}
    }
  })
  const resportBody = await response.json()
  const accessToken = resportBody.user.token

  // update the user object with the new value
  user.origins[0].localStorage[0].value = accessToken

  // save it in the file
  fs.writeFileSync(authFile, JSON.stringify(user))
  // reuse the same value inside the test
  process.env['ACCESS_TOKEN'] = accessToken
})