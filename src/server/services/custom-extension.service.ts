import { customExtensionRepository } from "@/server/repositories/custom-extension.repository";
import { fixedExtensionRepository } from "@/server/repositories/fixed-extension.repository";
import { assert } from "@/server/lib/assert";
import {
  MAX_CUSTOM_EXTENSIONS,
  MAX_EXTENSION_LENGTH,
} from "@/shared/constants/extension.constants";

/**
 * 커스텀 확장자 Service
 * 비즈니스 로직 담당
 */
export const customExtensionService = {
  /** 전체 목록 조회 */
  getAll: () => customExtensionRepository.findAll(),

  /** 확장자 추가 (중복 시 복구) */
  add: async (rawExtension: string) => {
    // 정규화 (소문자, 공백 제거, 점 제거)
    const extension = rawExtension.toLowerCase().trim().replace(/^\./, "");

    // 유효성 검사
    assert(extension.length > 0, "확장자를 입력해주세요.");
    assert(
      extension.length <= MAX_EXTENSION_LENGTH,
      `확장자는 ${MAX_EXTENSION_LENGTH}자 이하로 입력해주세요.`
    );
    assert(
      /^[a-z0-9]+$/.test(extension),
      "확장자는 영문과 숫자만 입력 가능합니다."
    );

    // 중복 체크: 커스텀 확장자 (soft delete 포함)
    const existingCustom =
      await customExtensionRepository.findByExtensionIncludeDeleted(extension);

    if (existingCustom) {
      // soft delete된 항목이면 복구
      if (existingCustom.deletedAt !== null) {
        return customExtensionRepository.restore(existingCustom.id);
      }
      // 이미 활성 상태
      assert(false, "이미 등록된 확장자입니다.", 409);
    }

    // 중복 체크: 고정 확장자
    const existingFixed =
      await fixedExtensionRepository.findByExtension(extension);
    assert(!existingFixed, "고정 확장자에 이미 존재하는 확장자입니다.", 409);

    // 최대 개수 체크
    const count = await customExtensionRepository.count();
    assert(
      count < MAX_CUSTOM_EXTENSIONS,
      `커스텀 확장자는 최대 ${MAX_CUSTOM_EXTENSIONS}개까지 추가 가능합니다.`
    );

    // 생성
    return customExtensionRepository.create(extension);
  },

  /** 확장자 삭제 (Soft Delete) */
  remove: (id: string) => customExtensionRepository.softDelete(id),
};

