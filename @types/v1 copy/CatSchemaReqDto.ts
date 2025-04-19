/**
 * @description 고양이 Request DTO
 * @see {@link http://localhost:8080/api/v1/v3/api-docs/v1}
 * @property name - 고양이 이름
 * @property age - 고양이 나이
 * @property breed - 고양이 품종
 */
export type CatSchemaReqDto = {
    name?: string;
    age?: number;
    breed?: string;
};

