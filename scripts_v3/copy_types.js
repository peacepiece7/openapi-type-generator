import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const GENERATED_DIR = path.resolve(path.join(__dirname, '..', '__generated__'))
const TYPES_DIR = path.resolve(path.join(__dirname, '..', '@types'))

async function copyTypes() {
  try {
    // @types 디렉토리가 없으면 생성
    await fs.mkdir(TYPES_DIR, { recursive: true })

    // v1, v2 디렉토리 찾기
    const versionDirs = await fs.readdir(GENERATED_DIR)
    const validVersionDirs = versionDirs.filter((dir) => dir.startsWith('v'))

    // @types 디렉토리의 모든 파일 목록 가져오기
    const existingTypesFiles = await glob('**/*.ts', {
      cwd: TYPES_DIR,
      absolute: false,
    })

    // 복사할 파일 목록
    const filesToCopy = new Set()

    for (const versionDir of validVersionDirs) {
      const sourceModelsDir = path.join(GENERATED_DIR, versionDir, 'models')
      const targetTypesDir = path.join(TYPES_DIR, versionDir)

      // models 디렉토리가 존재하는지 확인
      try {
        await fs.access(sourceModelsDir)
      } catch {
        console.log(`No models directory found for ${versionDir}, skipping...`)
        continue
      }

      // 버전별 types 디렉토리 생성
      await fs.mkdir(targetTypesDir, { recursive: true })

      // models 디렉토리에서 모든 .ts 파일 찾기
      const files = await glob('**/*.ts', {
        cwd: sourceModelsDir,
        absolute: false,
      })

      // 각 파일을 복사
      for (const file of files) {
        const sourcePath = path.join(sourceModelsDir, file)
        const targetPath = path.join(targetTypesDir, file)
        const relativePath = path.join(versionDir, file)

        // 대상 디렉토리가 없으면 생성
        await fs.mkdir(path.dirname(targetPath), { recursive: true })

        // 파일 복사
        await fs.copyFile(sourcePath, targetPath)
        console.log(`Copied: ${relativePath}`)
        filesToCopy.add(relativePath)
      }
    }

    // __generated__에 없는 파일 삭제
    for (const file of existingTypesFiles) {
      if (!filesToCopy.has(file)) {
        const filePath = path.join(TYPES_DIR, file)
        await fs.unlink(filePath)
        console.log(`Deleted: ${file}`)
      }
    }

    console.log(
      'All TypeScript files have been copied and cleaned up successfully!'
    )
  } catch (error) {
    console.error('Error:', error)
  }
}

copyTypes()
