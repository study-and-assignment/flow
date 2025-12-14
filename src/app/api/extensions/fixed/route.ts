import { withErrorHandler } from "@/server/lib/api-handler";
import { ApiResponse } from "@/server/lib/api-response";
import { assert } from "@/server/lib/assert";
import { fixedExtensionService } from "@/server/services/fixed-extension.service";

// 고정 확장자 목록 조회
export const GET = withErrorHandler(async () => {
  const extensions = await fixedExtensionService.getAll();
  return ApiResponse.success(extensions);
});

// 고정 확장자 차단 상태 변경
export const PATCH = withErrorHandler(async (request: Request) => {
  const { id, isBlocked } = await request.json();

  assert(!!id && typeof id === "string", "ID is required");
  assert(typeof isBlocked === "boolean", "isBlocked must be boolean");

  const updated = await fixedExtensionService.updateBlockStatus(id, isBlocked);
  return ApiResponse.success(updated);
});
