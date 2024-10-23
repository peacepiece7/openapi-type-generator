import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import OpenAPI from 'openapi-typescript-codegen'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const outputPath = path.resolve(path.join(__dirname, '..', '__generated__'))
const format = 'yaml'
const docFilePath = path.join(outputPath, `spec.${format}`)

const SPEC_URL_MAP = [
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/행정지원공통',
    name: '행정지원공통',
    output: '행정지원공통',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/체육회비납부',
    name: '체육회비납부',
    output: '체육회비납부',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/전문선수반',
    name: '전문선수반',
    output: '전문선수반',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/예제모음',
    name: '예제모음',
    output: '예제모음',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/신청관련정보',
    name: '신청관련정보',
    output: '신청관련정보',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/신청 관리',
    name: '신청_관리',
    output: '신청_관리',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/시스템관리',
    name: '시스템관리',
    output: '시스템관리',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/스포츠클럽 시설현황',
    name: '시설정보',
    output: '시설정보',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/스포츠클럽 현황',
    name: '스포츠클럽_현황',
    output: '스포츠클럽_현황',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/스포츠클럽 등록신청 관리',
    name: '스포츠클럽_등록신청_관리',
    output: '스포츠클럽_등록신청_관리',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/순회지도',
    name: '순회지도',
    output: '순회지도',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/사용자관리',
    name: '사용자관리',
    output: '사용자관리',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/메인포탈관리',
    name: '메인포탈관리',
    output: '메인포탈관리',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/대시보드',
    name: '대시보드',
    output: '대시보드',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/공모현황',
    name: '공모현황',
    output: '공모현황',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/IT서비스관리',
    name: 'IT서비스관리',
    output: 'IT서비스관리',
  },
]

const accessAsync = promisify(fs.access)
const mkdirAsync = promisify(fs.mkdir)
const writeFileAsync = promisify(fs.writeFile)

run()

async function run() {
  try {
    await ready()

    for (const { url, name, output } of SPEC_URL_MAP) {
      const response = await fetch(url)
      const data = await response.text()

      await makeDirectory(outputPath)
      await writeFileAsync(docFilePath, data)

      await OpenAPI.generate({
        input: docFilePath,
        output: makeOutputPath(output),
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

async function ready() {
  return makeDirectory(
    path.resolve(path.join(__dirname, '..', '__generated__'))
  )
}

function makeOutputPath(...str) {
  return path.resolve(path.join(__dirname, '..', '__generated__', ...str))
}
