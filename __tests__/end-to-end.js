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
let testProjectId

async function createProject (page: any, projectName: string) {
  await page.click('#context-dropdown')
  await page.waitForSelector('a[href="/project"]')
  await page.click('a[href="/project"]')
  await page.waitForSelector('[data-test-id="create-new-project-button"]')
  // wait for 2 seconds for projects to load
  await page.waitFor(2000)
  await page.click('[data-test-id="create-new-project-button"]')
  await page.waitForSelector('.project-name-editable input')
  await page.type('.project-name-editable input', projectName)
  await page.click('.project-name-editable button')
  // wait 2 seconds for project to get saved
  await page.waitFor(2000)
  // verify that the project is listed
  await expectSelectorToContainHtml(page, '[data-test-id="project-list-table"]', projectName)
}

async function expectSelectorToContainHtml (page: any, selector: string, html: string) {
  const innerHTML = await page.$eval(selector, e => e.innerHTML)
  expect(innerHTML).toContain(html)
}

describe('end-to-end', async () => {
  let browser
  let page

  beforeAll(async () => {
    browser = await puppeteer.launch({headless: false})
    page = await browser.newPage()
  })

  afterAll(async () => {
    // delete test project

    // close browser
    // browser.close()
  })

  it('should load the page', async () => {
    await page.goto('http://localhost:9966')
    await expectSelectorToContainHtml(page, 'h1', 'Conveyal Datatools')
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
      await createProject(page, testProjectName)

      // go into the project page and verify that it looks ok-ish
      const projectEls = await page.$$('.project-name-editable a')

      let projectFound = false
      for (const projectEl of projectEls) {
        const innerHtml = await page.evaluate(el => el.innerHTML, projectEl)
        if (innerHtml.indexOf(testProjectName) > -1) {
          const href = await page.evaluate(el => el.href, projectEl)
          testProjectId = href.match(/\/project\/([\w-]*)/)[1]
          await projectEl.click()
          projectFound = true
          break
        }
      }
      if (!projectFound) throw new Error('Created project not found')

      await page.waitForSelector('#project-viewer-tabs')
      await expectSelectorToContainHtml(page, '#project-viewer-tabs', 'What is a feed source?')
    }, 20000)

    it('should update a project by adding a otp server', async () => {
      // open settings tab
      await page.click('#project-viewer-tabs-tab-settings')

      // navigate to deployments
      await page.waitForSelector('[data-test-id="deployment-settings-link"]', { visible: true })
      await page.click('[data-test-id="deployment-settings-link"]')
      await page.waitForSelector('[data-test-id="add-server-button"]')

      // add a server
      await page.click('[data-test-id="add-server-button"]')
      await page.waitForSelector('input[name="otpServers.$index.name"]')
      await page.type('input[name="otpServers.$index.name"]', 'test-otp-server')
      await page.type('input[name="otpServers.$index.publicUrl"]', 'http://localhost:8080')
      await page.type('input[name="otpServers.$index.internalUrl"]', 'http://localhost:8080/otp')
      await page.click('[data-test-id="save-settings-button"]')

      // reload page an verify test server persists
      await page.reload({ waitUntil: 'networkidle0' })
      await expectSelectorToContainHtml(page, '#project-viewer-tabs', 'test-otp-server')
    }, 20000)

    it('should delete a project', async () => {
      const testProjectToDeleteName = `test-project-that-will-get-deleted-${testTime}`

      // navigate to home project view
      await page.goto(
        `http://localhost:9966/home/${testProjectId}`,
        {
          waitUntil: 'networkidle0'
        }
      )
      await page.waitForSelector('#context-dropdown')

      // create a new project
      await createProject(page, testProjectToDeleteName)

      // get the created project id
      // go into the project page and verify that it looks ok-ish
      const projectEls = await page.$$('.project-name-editable a')

      let projectFound = false
      let projectToDeleteId = ''
      for (const projectEl of projectEls) {
        const innerHtml = await page.evaluate(el => el.innerHTML, projectEl)
        if (innerHtml.indexOf(testProjectToDeleteName) > -1) {
          const href = await page.evaluate(el => el.href, projectEl)
          projectToDeleteId = href.match(/\/project\/([\w-]*)/)[1]
          projectFound = true
          break
        }
      }
      if (!projectFound) throw new Error('Created project not found')

      // navigate to that project's settings
      await page.goto(
        `http://localhost:9966/project/${projectToDeleteId}/settings`,
        {
          waitUntil: 'networkidle0'
        }
      )

      // delete that project
      await page.click('[data-test-id="delete-project-button"]')
      await page.waitForSelector('[data-test-id="modal-confirm-ok-button"]')
      await page.click('[data-test-id="modal-confirm-ok-button"]')

      // verify deletion
      await page.goto(
        `http://localhost:9966/project/${projectToDeleteId}`,
        {
          waitUntil: 'networkidle0'
        }
      )
      await expectSelectorToContainHtml(page, '.modal-body', 'Project ID does not exist')
      await page.click('[data-test-id="status-modal-close-button"]')
    }, 20000)
  })
})
