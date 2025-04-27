import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import OpenAPI from 'openapi-typescript-codegen'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import { dirname } from 'path'
import { rimraf } from 'rimraf'
import SPEC_URL_MAP from './swagger_options.json' assert { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const outputPath = path.resolve(path.join(__dirname, '..', '__generated__'))
const format = 'yaml'
const docFilePath = path.join(outputPath, `spec.${format}`)

const accessAsync = promisify(fs.access)
const mkdirAsync = promisify(fs.mkdir)
const writeFileAsync = promisify(fs.writeFile)

run()

async function run() {
  try {
    await prepare()

    for (const { link, name } of SPEC_URL_MAP) {
      const response = await fetch(link)
      const data = await response.text()

      await makeDirectory(outputPath)
      await writeFileAsync(docFilePath, data)

      await OpenAPI.generate({
        input: docFilePath,
        output: makeOutputPath(name),
      })
    }
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

async function prepare() {
  // Remove the output directory
  const outputPath = path.resolve(path.join(__dirname, '..', '__generated__'))
  await rimraf(outputPath)

  // Create the output directory
  return makeDirectory(outputPath)
}

function makeOutputPath(...str) {
  return path.resolve(path.join(__dirname, '..', '__generated__', ...str))
}
