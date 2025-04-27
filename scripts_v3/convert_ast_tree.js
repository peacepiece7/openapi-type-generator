import {
  ModuleDeclaration,
  Project,
  SyntaxKind,
  TypeAliasDeclaration,
} from 'ts-morph'
import path from 'path'
import fs from 'fs/promises'
import SPEC_URL_MAP from './swagger_options.json' assert { type: 'json' }

const outputRootPath = './__generated__'

await main()

async function main() {
  const project = new Project({
    // tsConfigFilePath: './tsconfig.json', // 경로 맞게 수정
    // skipAddingFilesFromTsConfig: true,
  })

  const specInformation = await Promise.all(
    SPEC_URL_MAP.map(async ({ link, name }) => {
      const filesPath = path.join(outputRootPath, name, 'models')
      const files = await fs.readdir(filesPath)
      return { filesPath, files }
    })
  )

  const filesInfomation = specInformation.flatMap(({ filesPath, files }) =>
    files
      .filter((file) => file.endsWith('.ts'))
      .map((file) => ({
        filePath: filesPath,
        fileName: file,
      }))
  )

  filesInfomation.forEach(async ({ filePath, fileName }) => {
    // 기존 파일
    const sourceFile = project.addSourceFileAtPath(
      path.join(filePath, fileName)
    )

    // 새롭게 교체할 파일
    const newSourceFile = project.createSourceFile(
      path.join(filePath, `${fileName}_converted`),
      '',
      { overwrite: true }
    )

    console.log(`${sourceFile.getBaseName()} 파일 변환을 시작합니다.\n`)

    sourceFile.getTypeAliases().forEach(async (typeAlias) => {
      /** @type {ModuleDeclaration | undefined} */
      const namespace = sourceFile.getModule(typeAlias.getName())

      // enum을 새로운 규칙으로 변환합니다.
      if (namespace) {
        namespace
          .getEnums()
          .forEach((enumDecl) =>
            newSourceFile.addEnum(getEnumDeclaration(enumDecl))
          )
      }

      // typeAlias을 새로운 규칙으로 변환합니다.
      newSourceFile.addTypeAlias(getTypeAliasDeclaration(typeAlias, namespace))
    })

    // 새로운 파일을 저장합니다.
    await newSourceFile.save()

    // 기존 파일 제거
    await fs.unlink(path.join(filePath, fileName))

    // 새로운 파일 이름 변경
    await fs.rename(
      path.join(filePath, `${fileName}_converted`),
      path.join(filePath, fileName)
    )

    console.log(`🎉 ${sourceFile.getBaseName()} 파일 변환 완료!\n`)
  })
}

/**
 *
 * @param {TypeAliasDeclaration} typeAlias
 * @param {ModuleDeclaration} namespace
 */
function getTypeAliasDeclaration(typeAlias, namespace) {
  let typeText = typeAlias.getTypeNodeOrThrow()?.getText()

  namespace?.getEnums()?.forEach((enumDecl) => {
    const oldRef = `${typeAlias.getName()}.${enumDecl.getName()}`
    const newRef = convertCamelCase(enumDecl.getName())
    typeText = typeText.replace(new RegExp(oldRef, 'g'), newRef)
  })

  return {
    name: typeAlias.getName(),
    type: typeText,
    isExported: typeAlias.isExported(),
    docs: typeAlias.getJsDocs().map((doc) => doc.getStructure()),
  }
}

/**
 * @description enum을 찾아서 새로운 이름으로 추가 (key를 주석에서 추출한다. 컨벤션이 강요된다.)
 * @param {EnumDeclaration} enumDecl
 * @returns {Object}
 */
function getEnumDeclaration(enumDecl) {
  const docs = enumDecl.getJsDocs()
  const descriptions = new Map()

  // JSDoc에서 코드와 설명을 추출
  if (docs.length > 0) {
    const docText = docs[0].getInnerText()
    const lines = docText.split('\n')
    lines
      .filter((line) => line.includes(':'))
      .forEach((line) => {
        const [code, desc] = line.split(':').map((s) => s.trim())
        descriptions.set(code, desc.replace(/\s+/g, '')) // 공백 제거
      })
  }

  return {
    name: convertCamelCase(enumDecl.getName()),
    isExported: enumDecl.isExported(),
    members: enumDecl.getMembers().map((member) => {
      const value = member.getValue()?.toString() ?? member.getName()
      const description = descriptions.get(value) || member.getName()
      return {
        name: description,
        value: value,
      }
    }),
    docs: enumDecl.getJsDocs().map((doc) => doc.getStructure()),
  }
}

/**
 * @description enum을 찾아서 새로운 이름으로 추가 (key, value가 동일하다.)
 * @param {EnumDeclaration} enumDecl
 * @returns {Object}
 */
function getEnumDeclarationOrignal(enumDecl) {
  return {
    name: convertCamelCase(enumDecl.getName()),
    isExported: enumDecl.isExported(),
    members: enumDecl.getMembers().map((member) => ({
      name: member.getName(),
      value: member.getValue()?.toString() ?? member.getName(),
    })),
    docs: enumDecl.getJsDocs().map((doc) => doc.getStructure()),
  }
}

function convertCamelCase(str) {
  return str.replace(/(?:^|_)(\w)/g, (_, char) => char.toUpperCase())
}
