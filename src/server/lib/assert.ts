/**
 * API 에러 클래스
 * assert 실패 시 throw되며, withErrorHandler에서 처리됨
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * 조건이 false면 ApiError를 throw
 * @param condition 조건 (true면 통과, false면 에러)
 * @param message 에러 메시지
 * @param status HTTP 상태 코드 (기본: 400)
 *
 * @example
 * assert(typeof value === "string", "문자열이어야 합니다.");
 * assert(value.length <= 20, "20자 이하로 입력해주세요.");
 * assert(!exists, "이미 존재합니다.", 409);
 */
export function assert(
  condition: boolean,
  message: string,
  status: number = 400
): asserts condition {
  if (!condition) {
    throw new ApiError(message, status);
  }
}

