import { Project, SyntaxKind } from 'ts-morph'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import SPEC_URL_MAP from './swagger_options.json' assert { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const outputRootPath = './__generated__'
const OUTPUT_DIR = path.resolve(path.join(__dirname, '..', 'converted_enums'))

async function main() {
  const project = new Project()

  // 출력 디렉토리 생성
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  for (const { link, name } of SPEC_URL_MAP) {
    const filesPath = path.join(outputRootPath, name, 'models')
    const files = await fs.readdir(filesPath)

    for (const file of files) {
      if (!file.endsWith('.ts')) continue
      const filePath = path.join(filesPath, file)
      const sourceFile = project.addSourceFileAtPath(filePath)

      console.log(`${sourceFile.getBaseName()} 파일 변환을 시작합니다.`)

      const typeAliases = sourceFile.getTypeAliases()

      for (const typeAlias of typeAliases) {
        /** @type {import('ts-morph').ModuleDeclaration | undefined} */
        const namespace = sourceFile.getModule(typeAlias.getName())

        if (!namespace) continue

        const enums = namespace.getEnums()
        for (const enumDecl of enums) {
          const docs = enumDecl.getJsDocs()
          if (docs.length === 0) continue

          const docText = docs[0].getInnerText()
          const lines = docText.split('\n')
          const descriptions = lines
            .filter((line) => line.includes(':'))
            .map((line) => {
              const [code, desc] = line.split(':').map((s) => s.trim())
              return {
                code,
                desc: desc.replace(/\s+/g, ''), // 공백 제거
              }
            })

          if (descriptions.length > 0) {
            const newEnumName = enumDecl.getName()
            const outputPath = path.join(OUTPUT_DIR, `${newEnumName}.ts`)
            const newSourceFile = project.createSourceFile(outputPath, '', {
              overwrite: true,
            })

            newSourceFile.addEnum({
              name: newEnumName,
              isExported: true,
              members: descriptions.map(({ code, desc }) => ({
                name: desc,
                value: code, // 따옴표 제거
              })),
            })

            await newSourceFile.save()
            console.log(`✅ ${outputPath} 파일 생성 완료`)
          }
        }
      }
    }
  }

  console.log('🎉 모든 파일 변환 완료!')
}

main()
