import { prisma } from "@/server/lib/prisma";

/**
 * 커스텀 확장자 Repository
 * DB 접근 로직만 담당
 */
export const customExtensionRepository = {
  /** 전체 목록 조회 (soft delete 자동 제외) */
  findAll: () =>
    prisma.customExtension.findMany({
      orderBy: { createdAt: "desc" },
    }),

  /** 확장자로 조회 (soft delete 포함 - 복구용) */
  findByExtensionIncludeDeleted: (extension: string) =>
    prisma.customExtension.findUnique({
      where: { extension },
    }),

  /** 활성 확장자 개수 (soft delete 자동 제외) */
  count: () => prisma.customExtension.count(),

  /** 생성 */
  create: (extension: string) =>
    prisma.customExtension.create({
      data: { extension },
    }),

  /** 복구 (soft delete 해제) */
  restore: (id: string) =>
    prisma.customExtension.update({
      where: { id },
      data: { deletedAt: null },
    }),

  /** Soft Delete */
  softDelete: (id: string) =>
    prisma.customExtension.update({
      where: { id },
      data: { deletedAt: new Date() },
    }),
};

