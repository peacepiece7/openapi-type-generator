/**
 * @description 에러 응답 DTO
 * @see {@link http://localhost:8080/api/v1/v3/api-docs/v1}
 * @property message - 에러 메시지
 */
export type ErrorTestDto = {
    message?: string;
    error_code?: ErrorTestDto.error_code;
};
export namespace ErrorTestDto {
    /**
     * 에러 코드
     * E500: 서버오류
     * E400: 잘못된 요청
     * E401: 인증 실패
     * E403: 권한 없음
     * E404: 리소스 없음
     * E409: 리소스 충돌
     */
    export enum error_code {
    '서버오류' = 'E500',
    '잘못된요청' = 'E400',
    '인증실패' = 'E401',
    '권한없음' = 'E403',
    '리소스없음' = 'E404',
    '리소스충돌' = 'E409',
    }
}

