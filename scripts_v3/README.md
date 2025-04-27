# 사용법

1 open api spec url 생성

```sh
pwd
# ~/openapi-type-generator

npm run gen:v2:url
```

2 타입 생성

```sh
# open api spec 기반 타입 생성
npm run gen:v2:spec

# 나의 개인적인 컨벤션에 맞게 타입 변환(optional)
npm run gen:v2:convert

# 결과 확인
ls -al ./__generated__
```

3 타입 복사

@types 디렉토리에 타입이 복사 됩니다.

여기에 복사된 내용을 import 하여 프로젝트에 사용합니다.

```sh
npm run gen:v2:copy
```

## ETC

### \_\_generated\_\_를 바로 사용하지 않는다

네트워크상 오류나 서버 개발이 진행중일 경우 @types에 바로 변경사항을 적용하게되면 타입 에러가 발생합니다.

### @types 디렉터리를 직접 수정하지 않는다

api spec을 읨의로 변경해서 사용하지 않습니다.

수정이 필요하다면 다음과 같이 수정해서 사용합니다.

```ts
import { HectorResDto } from '@types/hector/hector-res-dto'
type HectorResClient = HectorResDto & {
  // 추가 필드
}

const store = () => {
    const hectorResClient : ref<HectorResDto>()
}
```
