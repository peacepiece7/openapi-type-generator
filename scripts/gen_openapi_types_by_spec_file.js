import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import OpenAPI from 'openapi-typescript-codegen'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const format = 'yaml'
const filePath = './scripts/sample.json'
const specURL =
  'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/%ED%96%89%EC%A0%95%EC%A7%80%EC%9B%90%EA%B3%B5%ED%86%B5'

const outputPath = path.resolve(path.join(__dirname, '..', '__generated__'))
const docFilePath = path.join(outputPath, `spec.${format}`)

const accessAsync = promisify(fs.access)
const mkdirAsync = promisify(fs.mkdir)
const writeFileAsync = promisify(fs.writeFile)

run()

/**
 * 메인 로직
 */
async function main() {
  try {
    const data = fs.readFileSync(filePath, 'utf8')

    await makeDirectory(outputPath)
    await writeFileAsync(docFilePath, data, 'utf8')

    await OpenAPI.generate({
      input: docFilePath,
      output: outputPath,
    })
  } catch (err) {
    console.error(err)
  }
}

async function makeDirectory(path) {
  try {
    await accessAsync(path)
  } catch (err) {
    if (err.code === 'ENOENT') {
      await mkdirAsync(path)
    } else {
      throw err
    }
  }
}
