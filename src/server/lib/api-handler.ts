import { NextResponse } from "next/server";
import { ApiError } from "./assert";
import { ApiResponse } from "./api-response";

type ApiHandler = (request: Request) => Promise<NextResponse>;

/**
 * API 핸들러 래퍼
 * - try-catch 자동 처리
 * - ApiError는 해당 status로 응답
 * - 그 외 에러는 500으로 응답
 *
 * @example
 * export const POST = withErrorHandler(async (request) => {
 *   assert(condition, "에러 메시지");
 *   return ApiResponse.success(data);
 * });
 */
export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      // ApiError (assert 실패)
      if (error instanceof ApiError) {
        return ApiResponse.error(error.message, error.status);
      }

      // 예상치 못한 에러
      console.error("Unexpected error:", error);
      return ApiResponse.serverError();
    }
  };
}

