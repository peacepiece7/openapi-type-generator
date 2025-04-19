import fs from 'fs/promises'
import path from 'path'
import { SPEC_URL_MAP } from './constants.js'

const outputRootPath = './__generated__'

await main()

async function main() {
  for (const { link, name } of SPEC_URL_MAP) {
    const filesPath = path.join(outputRootPath, name, 'models')
    const files = await fs.readdir(filesPath)
    for (const file of files) {
      if (file.endsWith('.ts')) {
        const filePath = path.join(filesPath, file)

        // .ts 파일을 읽어옵니다.
        let content = await fs.readFile(filePath, 'utf8')

        // 파일 내용을 줄 단위(line feed, carrage return)로 나눕니다.
        let strs = content.split('\n')

        /**
         *  @description 첫 네 줄을 제거합니다.
         */
        strs = removeFirst4Lines(strs)
        /**
         * @description 주석을 "@property ~" 형태로 변환합니다.
         */
        const properties = transformCommentsAndProperties(strs)

        strs = convertEnumToReadable(strs)

        /**
         * @description 지금까지 작업한 내용을 파일에 적용합니다.
         */
        strs = addDescriptionAnnotationAndPropertiesAndUrl(
          strs,
          properties,
          link
        )

        /**
         * @description 속성마다 붙어있는 기본 주석을 제거합니다.
         * vscode 기준 이 주석은 미리보기에 제공되지 않기에 필요 없습니다.
         */
        strs = removeCommentInType(strs)

        await fs.writeFile(filePath, strs?.join('\n') || '', 'utf8')
      }
    }
  }
}

// * UTILS
/**
 * @param {string[]} strs
 * @returns string[]
 */
function removeFirst4Lines(strs) {
  return strs.slice(4)
}

/**
 * @param {string[]} strs
 * @param {string[]} p
 * @returns string[]
 */
function addDescriptionAnnotationAndPropertiesAndUrl(strs, p, url) {
  let start = false
  let end = false
  let startComment = false
  for (let i = 0; i < strs.length; i++) {
    if (strs[i].includes('import')) start = true
    if (strs[i].includes('/**')) {
      start = true
      startComment = true
    }

    if (strs[i].includes('export type')) end = true

    // 대한 JsDoc 주석이 없는 경우
    if (end && !startComment && !start) {
      p.unshift(` * @see {@link ${url}}`)
      p.unshift('/**')
      p.push('*/')
      strs = p.concat(strs)
      break
    }

    if (!start || !startComment) continue

    // 대한 JsDoc 주석이 있는 경우
    strs[i + 1] = strs[i + 1].replace('*', '* @description')

    strs = strs
      .slice(0, i + 2)
      .concat([` * @see {@link ${url}}`])
      .concat(p)
      .concat(strs.slice(i + 2))
    break
  }

  return strs
}

/**
 * @param {string[]} strs
 * @returns string[]
 */
function transformCommentsAndProperties(strs) {
  const result = []
  let description = ''

  strs.forEach((line) => {
    const trimmedLine = line.trim()

    if (
      trimmedLine.includes('*') &&
      !trimmedLine.includes('/**') &&
      !trimmedLine.includes('*/')
    ) {
      description = trimmedLine.replace('*', '').trim()
    }

    const propertyMatch = trimmedLine.match(/^(\w+)\??: (\w+);/)
    if (propertyMatch) {
      const [, propName] = propertyMatch
      result.push(` * @property ${propName} - ${description}`)
    }
  })

  return result
}

/**
 * @param {string[]} strs
 * @returns string[]
 */
function removeCommentInType(strs) {
  if (!strs || strs.length === 0) return strs
  let start = false
  const removeIndex = []
  for (let i = 0; i < strs.length; i++) {
    if (strs[i].includes('export type')) start = true
    if (!start) continue
    if (strs[i].includes('*')) {
      removeIndex.push(i)
    }

    if (strs[i].includes('};')) break
  }

  removeIndex.forEach((idx) => {
    strs[idx] = null
  })

  return strs.filter((str) => str !== null)
}

/**
 * @param {stirng[]} str
 */
function convertEnumToReadable(strs) {
  let isInEnum = false
  let isInEnumDescription = false
  let isInNameSpace = false
  let enumMsgs = []

  for (let i = 0; i < strs.length; i++) {
    const line = strs[i].trim()

    // namespace 시작
    if (line.match(/export namespace/)) {
      isInNameSpace = true
      continue
    }

    // namespace 안이 아니면 종료
    if (!isInNameSpace) continue

    // namespace 종료
    if (!isInEnum && line.match(/}/)) isInNameSpace = false

    // enum description 시작/종료
    if (line.match(/\/\*\*/)) {
      isInEnumDescription = true
      continue
    } else if (line.match(/\*\//)) isInEnumDescription = false

    // enum 시작/종료
    if (line.match(/export enum/)) {
      isInEnum = true
      continue
    }
    if (line.match(/}/)) {
      isInEnum = false
      enumMsgs = []
      continue
    }

    if (isInEnumDescription) {
      const [key, value] = line.replace('*', '').trim().split(':')
      if (key && value)
        enumMsgs.push({ key: key.trim(), value: value.replaceAll(' ', '') })
    }

    if (isInEnum) {
      enumMsgs.forEach(({ key, value }) => {
        const isMatched = line.match(`${key} = '${key}'`)
        if (!isMatched) return
        strs[i] = '    ' + line.replace(key, `'${value}'`)
      })
    }
  }

  return strs
}
