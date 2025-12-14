import { fixedExtensionRepository } from "@/server/repositories/fixed-extension.repository";

/**
 * 고정 확장자 Service
 * 비즈니스 로직 담당
 */
export const fixedExtensionService = {
  /** 전체 목록 조회 */
  getAll: () => fixedExtensionRepository.findAll(),

  /** 차단 상태 변경 */
  updateBlockStatus: (id: string, isBlocked: boolean) =>
    fixedExtensionRepository.updateBlockStatus(id, isBlocked),
};

