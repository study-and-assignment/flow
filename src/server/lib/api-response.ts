import { NextResponse } from "next/server";

/**
 * API 응답 헬퍼
 * 일관된 응답 형식을 제공
 */
export const ApiResponse = {
  /** 성공 응답 (200) */
  success: <T>(data: T) => NextResponse.json(data, { status: 200 }),

  /** 생성 성공 (201) */
  created: <T>(data: T) => NextResponse.json(data, { status: 201 }),

  /** 에러 응답 (커스텀 상태 코드) */
  error: (message: string, status: number) =>
    NextResponse.json({ error: message }, { status }),

  /** Bad Request (400) */
  badRequest: (message: string) =>
    NextResponse.json({ error: message }, { status: 400 }),

  /** Not Found (404) */
  notFound: (message = "Not found") =>
    NextResponse.json({ error: message }, { status: 404 }),

  /** Conflict (409) */
  conflict: (message: string) =>
    NextResponse.json({ error: message }, { status: 409 }),

  /** Internal Server Error (500) */
  serverError: (message = "Internal server error") =>
    NextResponse.json({ error: message }, { status: 500 }),
};

