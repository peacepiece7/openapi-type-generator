import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOMAIN = 'http://localhost:8080'
const SWAGGER_URL = `${DOMAIN}/api/v1/swagger-ui/index.html`

async function getSwaggerOptions() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  try {
    await page.goto(SWAGGER_URL)

    // select 요소가 로드될 때까지 대기
    await page.waitForSelector('#select')

    // 옵션들을 가져옴
    const options = await page.evaluate((domain) => {
      const select = document.querySelector('#select')
      if (!select) return []

      const options = Array.from(select.querySelectorAll('option'))
      return options.map((option) => ({
        link: `${domain}${option.value}`,
        name: option.textContent.trim().replaceAll(' ', '_'),
      }))
    }, DOMAIN)

    // 결과를 파일로 저장
    const outputPath = path.join(__dirname, 'swagger_options.json')
    await fs.writeFile(outputPath, JSON.stringify(options, null, 2))

    console.log('Options saved to:', outputPath)
    console.log('Options:', options)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await browser.close()
  }
}

getSwaggerOptions()
