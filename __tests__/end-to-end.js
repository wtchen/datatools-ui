// @flow

import os from 'os'
import path from 'path'

import fs from 'fs-extra'
import {safeLoad} from 'js-yaml'
import md5File from 'md5-file/promise'
import moment from 'moment'
import puppeteer from 'puppeteer'

const config: {
  username: string,
  password: string
} = safeLoad(fs.readFileSync('configurations/end-to-end/env.yml'))

let browser
let page
const gtfsUploadFile = './configurations/end-to-end/test-gtfs-to-upload.zip'
const testTime = moment().format()
const testProjectName = `test-project-${testTime}`
const testFeedSourceName = `test-feed-source-${testTime}`
let testProjectId
let feedSourceId

// this can be turned off in development mode to skip some tests that do not
// need to be run in order for other tests to work properly
const doNonEssentialSteps = true

async function expectSelectorToContainHtml (selector: string, html: string) {
  const innerHTML = await page.$eval(selector, e => e.innerHTML)
  expect(innerHTML).toContain(html)
}

async function createProject (projectName: string) {
  await page.click('#context-dropdown')
  await page.waitForSelector('a[href="/project"]')
  await page.click('a[href="/project"]')
  await page.waitForSelector('[data-test-id="create-new-project-button"]')
  // wait for 2 seconds for projects to load
  await page.waitFor(5000)
  await page.click('[data-test-id="create-new-project-button"]')
  await page.waitForSelector('.project-name-editable input')
  await page.type('.project-name-editable input', projectName)
  await page.click('.project-name-editable button')
  // wait 2 seconds for project to get saved
  await page.waitFor(2000)
  // verify that the project is listed
  await expectSelectorToContainHtml('[data-test-id="project-list-table"]', projectName)
}

async function deleteProject (projectId: string) {
  // navigate to that project's settings
  await page.goto(
    `http://localhost:9966/project/${projectId}/settings`,
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
    `http://localhost:9966/project/${projectId}`,
    {
      waitUntil: 'networkidle0'
    }
  )
  await expectSelectorToContainHtml('.modal-body', 'Project ID does not exist')
  await page.click('[data-test-id="status-modal-close-button"]')
}

async function uploadGtfs () {
  // create new feed version by clicking on dropdown and upload link
  await page.click('#bg-nested-dropdown')
  // TODO replace with more specific selector
  await page.waitForSelector('[data-test-id="upload-feed-button"]')
  await page.click('[data-test-id="upload-feed-button"]')

  // set file to upload in modal dialog
  // TODO replace with more specific selector
  await page.waitForSelector('.modal-body input')
  const uploadInput = await page.$('.modal-body input')
  await uploadInput.uploadFile(gtfsUploadFile)

  // confirm file upload
  // TODO replace with more specific selector
  const footerButtons = await page.$$('.modal-footer button')
  await footerButtons[0].click()

  // wait for gtfs to be uploaded and processed
  await page.waitFor(15000)
  await page.waitForSelector('[data-test-id="clear-completed-jobs-button"]')
  await page.click('[data-test-id="clear-completed-jobs-button"]')
}

describe('end-to-end', async () => {
  beforeAll(async () => {
    browser = await puppeteer.launch({headless: false})
    page = await browser.newPage()
  })

  afterAll(async () => {
    // delete test project
    // await deleteProject(testProjectId)

    // close browser
    // browser.close()
  })

  it('should load the page', async () => {
    await page.goto('http://localhost:9966')
    await expectSelectorToContainHtml('h1', 'Conveyal Datatools')
  })

  it('should login', async () => {
    await page.goto('http://localhost:9966')
    await page.click('[data-test-id="header-log-in-button"]')
    await page.waitForSelector('#a0-signin_easy_email')
    await page.type('#a0-signin_easy_email', config.username)
    await page.type('#a0-signin_easy_password', config.password)
    await page.click('.a0-action button')
    await page.waitForSelector('#context-dropdown')
    // wait for 5 seconds for projects to load
    await page.waitFor(5000)
  }, 20000)

  describe('project', () => {
    it('should create a project', async () => {
      await createProject(testProjectName)

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
      await expectSelectorToContainHtml('#project-viewer-tabs', 'What is a feed source?')
    }, 30000)

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
      await expectSelectorToContainHtml('#project-viewer-tabs', 'test-otp-server')
    }, 30000)

    if (doNonEssentialSteps) {
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
        await createProject(testProjectToDeleteName)

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

        await deleteProject(projectToDeleteId)
      }, 30000)
    }
  })

  describe('feed source', () => {
    it('should create feed source', async () => {
      // go to project page
      await page.goto(
        `http://localhost:9966/project/${testProjectId}`,
        {
          waitUntil: 'networkidle0'
        }
      )
      await page.waitForSelector('[data-test-id="create-first-feed-source-button"]')
      await page.click('[data-test-id="create-first-feed-source-button"]')

      // TODO replace with less generic selector
      await page.waitForSelector('h4 input')
      await page.type('h4 input', testFeedSourceName)

      // TODO replace with less generic selector
      await page.click('h4 button')

      // wait for feed source to be created and saved
      await page.waitFor(2000)

      // verify that the feed source is listed
      await expectSelectorToContainHtml('#project-viewer-tabs', testFeedSourceName)

      // find feed source id
      // enter into feed source
      const feedSourceEls = await page.$$('h4 a')
      let feedSourceFound = false
      feedSourceId = ''
      for (const feedSourceEl of feedSourceEls) {
        const innerHtml = await page.evaluate(el => el.innerHTML, feedSourceEl)
        if (innerHtml.indexOf(testFeedSourceName) > -1) {
          const href = await page.evaluate(el => el.href, feedSourceEl)
          feedSourceId = href.match(/\/feed\/([\w-]*)/)[1]
          feedSourceFound = true
          await feedSourceEl.click()
          break
        }
      }
      if (!feedSourceFound) throw new Error('Created feedSource not found')

      await page.waitForSelector('#feed-source-viewer-tabs')
      // wait for 2 seconds for feed versions to load
      await page.waitFor(2000)
      expectSelectorToContainHtml(
        '#feed-source-viewer-tabs',
        'No versions exist for this feed source.'
      )
    }, 30000)

    it('should process uploaded gtfs', async () => {
      await uploadGtfs()

      // verify feed was uploaded
      await expectSelectorToContainHtml(
        '#feed-source-viewer-tabs',
        'Valid from Jan. 01, 2014 to Dec. 31, 2018'
      )
    }, 30000)

    // this test also sets the feed source as deployable
    it('should process fetched gtfs', async () => {
      // navigate to feed source settings
      await page.click('#feed-source-viewer-tabs-tab-settings')

      // make feed source deployable
      await page.waitForSelector(
        '[data-test-id="make-feed-source-deployable-button"]',
        { visible: true }
      )
      await page.click('[data-test-id="make-feed-source-deployable-button"]')

      // set fetch url
      await page.type(
        '[data-test-id="feed-source-url-input-group"] input',
        'https://github.com/catalogueglobal/datatools-ui/raw/end-to-end/configurations/end-to-end/test-gtfs-to-fetch.zip'
      )
      await page.click('[data-test-id="feed-source-url-input-group"] button')

      // wait for feed source to update
      await page.waitFor(2000)

      // go back to feed source GTFS tab
      await page.click('#feed-source-viewer-tabs-tab-')
      await page.waitForSelector(
        '#bg-nested-dropdown',
        { visible: true }
      )

      // create new version by fetching
      await page.click('#bg-nested-dropdown')
      await page.waitForSelector(
        '[data-test-id="fetch-feed-button"]',
        { visible: true }
      )
      await page.click('[data-test-id="fetch-feed-button"]')

      // wait for gtfs to be fetched and processed
      await page.waitFor(15000)
      await page.waitForSelector('[data-test-id="clear-completed-jobs-button"]')
      await page.click('[data-test-id="clear-completed-jobs-button"]')

      // verify that feed was fetched and processed
      await expectSelectorToContainHtml(
        '#feed-source-viewer-tabs',
        'Valid from Apr. 08, 2018 to Jun. 30, 2018'
      )
    }, 30000)

    if (doNonEssentialSteps) {
      it('should delete feed source', async () => {
        // create a new feed source to delete
        // go to project page
        await page.goto(
          `http://localhost:9966/project/${testProjectId}`,
          {
            waitUntil: 'networkidle0'
          }
        )
        await page.waitForSelector('[data-test-id="project-header-create-new-feed-source-button"]')
        await page.click('[data-test-id="project-header-create-new-feed-source-button"]')

        // TODO replace with less generic selector
        await page.waitForSelector('h4 input')
        const testFeedSourceToDeleteName = `test-feed-source-to-delete-${testTime}`
        await page.type('h4 input', testFeedSourceToDeleteName + String.fromCharCode(13))

        // wait for feed source to be created and saved
        await page.waitFor(2000)

        // find created feed source
        const listItemEls = await page.$$('.list-group-item')
        let feedSourceFound = false
        for (const listItemEl of listItemEls) {
          const feedSourceNameEl = await listItemEl.$('h4 a')
          const innerHtml = await page.evaluate(el => el.innerHTML, feedSourceNameEl)
          if (innerHtml.indexOf(testFeedSourceToDeleteName) > -1) {
            // hover over container to display FeedSourceDropdown
            // I tried to use the puppeteer hover method, but that didn't trigger
            // a mouseEnter event.  I needed to simulate the mouse being outside
            // the element and then moving inside
            const listItemBBox = await listItemEl.boundingBox()
            await page.mouse.move(
              listItemBBox.x - 10,
              listItemBBox.y
            )
            await page.mouse.move(
              listItemBBox.x + listItemBBox.width / 2,
              listItemBBox.y + listItemBBox.height / 2
            )
            await page.waitForSelector('#feed-source-action-button')

            // click dropdown and delete menu item button
            await page.click('#feed-source-action-button')
            await page.waitForSelector('[data-test-id="feed-source-dropdown-delete-project-button"]')
            await page.click('[data-test-id="feed-source-dropdown-delete-project-button"]')

            // confirm action in modal
            await page.waitForSelector('[data-test-id="modal-confirm-ok-button"]')
            await page.click('[data-test-id="modal-confirm-ok-button"]')

            // wait for data to refresh
            await page.waitFor(2000)
            feedSourceFound = true
            break
          }
        }
        if (!feedSourceFound) throw new Error('Created feedSource not found')

        // verify deletion
        const feedSourceEls = await page.$$('h4 a')
        let deletedFeedSourceFound = false
        for (const feedSourceEl of feedSourceEls) {
          const innerHtml = await page.evaluate(el => el.innerHTML, feedSourceEl)
          if (innerHtml.indexOf(testFeedSourceToDeleteName) > -1) {
            deletedFeedSourceFound = true
            break
          }
        }
        if (deletedFeedSourceFound) throw new Error('Feed source did not get deleted!')
      }, 30000)
    }
  })

  describe('feed version', () => {
    it('should download a feed version', async () => {
      await page.goto(`http://localhost:9966/feed/${feedSourceId}`)

      // for whatever reason, waitUntil: networkidle0 was not working with the
      // above goto, so wait for a few seconds here
      await page.waitFor(5000)

      await page.waitForSelector('[data-test-id="decrement-feed-version-button"]')
      await page.click('[data-test-id="decrement-feed-version-button"]')

      // wait for previous version to be active
      await page.waitFor(1000)
      await page.click('[data-test-id="download-feed-version-button"]')

      // wait for file to download
      await page.waitFor(5000)

      // file should get saved to the ~/Downloads directory, go looking for it
      // verify that file exists
      const downloadsDir = path.join(os.homedir(), 'Downloads')
      const files = await fs.readdir(downloadsDir)
      let feedVersionDownloadFile = ''
      // assume that this file will be the only one matching the feed source ID
      for (const file of files) {
        if (file.indexOf(feedSourceId.replace(/:/g, '')) > -1) {
          feedVersionDownloadFile = file
          break
        }
      }
      if (!feedVersionDownloadFile) {
        throw new Error('Feed Version gtfs file not found in Downloads folder!')
      }

      // verify that file has same hash as gtfs file that was uploaded
      expect(
        await md5File(path.join(downloadsDir, feedVersionDownloadFile))
      ).toEqual(await md5File(gtfsUploadFile))
    }, 30000)

    if (doNonEssentialSteps) {
      // this uploads a feed source again because we want to end up with 2
      // feed versions after this test takes place
      it('should delete a feed version', async () => {
        // browse to feed source page
        await page.goto(`http://localhost:9966/feed/${feedSourceId}`)

        // for whatever reason, waitUntil: networkidle0 was not working with the
        // above goto, so wait for a few seconds here
        await page.waitFor(5000)

        // upload gtfs
        await uploadGtfs()

        // click delete button
        await page.click('[data-test-id="delete-feed-version-button"]')

        // confirm action in modal
        await page.waitForSelector('[data-test-id="modal-confirm-ok-button"]')
        await page.click('[data-test-id="modal-confirm-ok-button"]')

        // wait for data to refresh
        await page.waitFor(2000)

        // verify that the fetched feed is now the displayed feed
        await expectSelectorToContainHtml(
          '#feed-source-viewer-tabs',
          'Valid from Apr. 08, 2018 to Jun. 30, 2018'
        )
      }, 30000)
    }
  })
})
