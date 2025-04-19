/**
 * @description 고양이 응답 DTO
 * @see {@link http://localhost:8080/api/v1/v3/api-docs/v1}
 * @property name - 고양이 이름
 * @property breed - 품종
 * @property age - 나이
 */
export type CatResDto = {
    name?: string;
    breed?: string;
    age?: number;
};

