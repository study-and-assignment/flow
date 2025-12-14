/**
 * 확장자 관련 타입
 */

/** 고정 확장자 */
export interface FixedExtension {
  id: string;
  extension: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/** 커스텀 확장자 */
export interface CustomExtension {
  id: string;
  extension: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

