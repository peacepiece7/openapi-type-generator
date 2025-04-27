/**
 * 고양이 Request DTO
 */
export type CatSchemaReqDto = {
        /**
         * 고양이 이름
         */
        name?: string;
        /**
         * 고양이 나이
         */
        age?: number;
        /**
         * 고양이 품종
         */
        breed?: string;
    };
