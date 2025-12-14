-- ============================================
-- Partial Unique Index 추가 (Soft Delete 지원)
-- deletedAt이 NULL인 경우에만 extension unique
-- ============================================

-- Custom Extensions
-- 기존 unique index 삭제 (Prisma는 UNIQUE INDEX로 생성함)
DROP INDEX IF EXISTS "custom_extensions_extension_key";

-- Partial Unique Index 추가
CREATE UNIQUE INDEX "custom_extensions_extension_active_unique" 
ON "custom_extensions" ("extension") 
WHERE "deleted_at" IS NULL;

-- Fixed Extensions
-- 기존 unique index 삭제
DROP INDEX IF EXISTS "fixed_extensions_extension_key";

-- Partial Unique Index 추가
CREATE UNIQUE INDEX "fixed_extensions_extension_active_unique" 
ON "fixed_extensions" ("extension") 
WHERE "deleted_at" IS NULL;
