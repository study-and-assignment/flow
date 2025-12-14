import { prisma } from "@/server/lib/prisma";

/**
 * 고정 확장자 Repository
 * DB 접근 로직만 담당
 */
export const fixedExtensionRepository = {
  /** 전체 목록 조회 (soft delete 자동 제외) */
  findAll: () =>
    prisma.fixedExtension.findMany({
      orderBy: { extension: "asc" },
    }),

  /** 확장자로 조회 (soft delete 자동 제외) */
  findByExtension: (extension: string) =>
    prisma.fixedExtension.findFirst({
      where: { extension },
    }),

  /** 차단 상태 변경 */
  updateBlockStatus: (id: string, isBlocked: boolean) =>
    prisma.fixedExtension.update({
      where: { id },
      data: { isBlocked },
    }),
};

