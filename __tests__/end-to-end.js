// @flow

import fs from 'fs'

import {safeLoad} from 'js-yaml'
import moment from 'moment'
import puppeteer from 'puppeteer'

const config: {
  username: string,
  password: string
} = safeLoad(fs.readFileSync('configurations/end-to-end/env.yml'))

const testTime = moment().format()
const testProjectName = `test-project-${testTime}`

describe('end-to-end', async () => {
  let browser
  let page

  beforeAll(async () => {
    browser = await puppeteer.launch({headless: false})
    page = await browser.newPage()
  })

  afterAll(async () => {
    // browser.close()
  })

  it('should load the page', async () => {
    await page.goto('http://localhost:9966')
    const html = await page.$eval('h1', e => e.innerHTML)
    expect(html).toContain('Conveyal Datatools')
  })

  it('should login', async () => {
    await page.goto('http://localhost:9966')
    await page.click('[data-test-id="header-log-in-button"]')
    await page.waitForSelector('#a0-signin_easy_email')
    await page.type('#a0-signin_easy_email', config.username)
    await page.type('#a0-signin_easy_password', config.password)
    await page.click('.a0-action button')
    await page.waitForSelector('#context-dropdown')
    // wait for 2 seconds for projects to load
    await page.waitFor(2000)
  }, 10000)

  describe('projects', () => {
    it('should create a project', async () => {
      await page.click('#context-dropdown')
      await page.waitForSelector('a[href="/project"]')
      await page.click('a[href="/project"]')
      await page.waitForSelector('[data-test-id="create-new-project-button"]')
      // wait for 2 seconds for projects to load
      await page.waitFor(2000)
      await page.click('[data-test-id="create-new-project-button"]')
      await page.waitForSelector('.project-name-editable input')
      await page.type('.project-name-editable input', testProjectName)
      await page.click('.project-name-editable button')
      // wait for project to get saved
      // verify that the project is listed
    })
  })
})
