import { withErrorHandler } from "@/server/lib/api-handler";
import { ApiResponse } from "@/server/lib/api-response";
import { assert } from "@/server/lib/assert";
import { customExtensionService } from "@/server/services/custom-extension.service";

// 커스텀 확장자 목록 조회
export const GET = withErrorHandler(async () => {
  const extensions = await customExtensionService.getAll();
  return ApiResponse.success(extensions);
});

// 커스텀 확장자 추가
export const POST = withErrorHandler(async (request: Request) => {
  const { extension } = await request.json();

  assert(!!extension && typeof extension === "string", "확장자를 입력해주세요.");

  const created = await customExtensionService.add(extension);
  return ApiResponse.created(created);
});

// 커스텀 확장자 삭제 (Soft Delete)
export const DELETE = withErrorHandler(async (request: Request) => {
  const id = new URL(request.url).searchParams.get("id");

  assert(!!id && typeof id === "string", "ID is required");

  await customExtensionService.remove(id);
  return ApiResponse.success({ success: true });
});
