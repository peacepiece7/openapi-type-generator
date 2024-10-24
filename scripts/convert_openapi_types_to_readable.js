import fs from 'fs/promises'
import path from 'path'

const outputRootPath = './__generated__'
const SPEC_URL_MAP = [
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/행정지원공통',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=행정지원공통',
    name: '행정지원공통',
    output: '행정지원공통',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/체육회비납부',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=체육회비납부',
    name: '체육회비납부',
    output: '체육회비납부',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/전문선수반',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=전문선수반',
    name: '전문선수반',
    output: '전문선수반',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/예제모음',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=예제모음',
    name: '예제모음',
    output: '예제모음',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/신청관련정보',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=신청관련정보',
    name: '신청관련정보',
    output: '신청관련정보',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/신청 관리',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=신청%20관리',
    name: '신청_관리',
    output: '신청_관리',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/시스템관리',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=시스템관리',
    name: '시스템관리',
    output: '시스템관리',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/스포츠클럽 시설현황',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=시설정보',
    name: '시설정보',
    output: '시설정보',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/스포츠클럽 현황',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=스포츠클럽%20현황',
    name: '스포츠클럽_현황',
    output: '스포츠클럽_현황',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/스포츠클럽 등록신청 관리',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=스포츠클럽%20등록신청%20관리',
    name: '스포츠클럽_등록신청_관리',
    output: '스포츠클럽_등록신청_관리',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/순회지도',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=순회지도',
    name: '순회지도',
    output: '순회지도',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/사용자관리',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=사용자관리',
    name: '사용자관리',
    output: '사용자관리',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/메인포탈관리',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=메인포탈관리',
    name: '메인포탈관리',
    output: '메인포탈관리',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/대시보드',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=대시보드',
    name: '대시보드',
    output: '대시보드',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/공모현황',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=공모현황',
    name: '공모현황',
    output: '공모현황',
  },
  {
    url: 'http://sportsclub-dev.sports.or.kr/api/support/v3/api-docs/IT서비스관리',
    link: 'https://sportsclub-dev.sports.or.kr/api/support/swagger-ui/index.html?urls.primaryName=IT서비스관리',
    name: 'IT서비스관리',
    output: 'IT서비스관리',
  },
]

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
