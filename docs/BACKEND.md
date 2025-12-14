# Backend 아키텍처 및 정책

## 🏗️ 레이어 구조

```
API Route (Controller)
        ↓
    Service (비즈니스 로직)
        ↓
    Repository (DB 접근)
        ↓
    Prisma Client
```

---

## 📁 디렉토리 구조

```
src/server/
├── lib/                          # 공통 유틸리티
│   ├── prisma.ts                 # Prisma Client 싱글톤
│   ├── assert.ts                 # 검증 함수
│   ├── api-handler.ts            # 에러 핸들링 래퍼
│   └── api-response.ts           # 응답 헬퍼
│
├── repositories/                 # 데이터 접근 계층
│   ├── custom-extension.repository.ts
│   └── fixed-extension.repository.ts
│
└── services/                     # 비즈니스 로직 계층
    ├── custom-extension.service.ts
    └── fixed-extension.service.ts
```

---

## 🎯 각 레이어 역할

### Controller (API Route)
- HTTP 요청/응답 처리
- 요청 파라미터 추출
- Service 호출
- **비즈니스 로직 없음!**

```typescript
export const POST = withErrorHandler(async (request: Request) => {
  const { extension } = await request.json();
  assert(!!extension && typeof extension === "string", "확장자 필요");
  
  const created = await customExtensionService.add(extension);
  return ApiResponse.created(created);
});
```

### Service
- 비즈니스 로직 담당
- 유효성 검사 (assert)
- 여러 Repository 조합

```typescript
add: async (rawExtension: string) => {
  const extension = rawExtension.toLowerCase().trim();
  
  assert(extension.length <= 20, "20자 이하");
  assert(/^[a-z0-9]+$/.test(extension), "영문/숫자만");
  
  // 중복 체크
  const existing = await customExtensionRepository.findByExtension(extension);
  assert(!existing, "이미 존재", 409);
  
  return customExtensionRepository.create(extension);
}
```

### Repository
- DB CRUD만 담당
- Prisma 호출 래핑
- **비즈니스 로직 없음!**

```typescript
create: (extension: string) =>
  prisma.customExtension.create({ data: { extension } }),
```

---

## 🛡️ Soft Delete 정책

### 구현 방식
- `deletedAt` 필드 사용 (null = 활성, Date = 삭제)
- Prisma Client Extension으로 자동 필터링

### 자동 적용
```typescript
// prisma.ts - 모든 조회에 자동 적용
const READ_OPERATIONS = ["findFirst", "findMany", "count", ...];

if (isReadOperation(operation)) {
  args.where = { ...args.where, deletedAt: null };
}
```

### 복구 로직
- 삭제된 확장자 재추가 시 → 복구 (deletedAt = null)

---

## ✅ 유효성 검사 (assert)

### 사용법
```typescript
import { assert } from "@/server/lib/assert";

// 기본 (400 Bad Request)
assert(condition, "에러 메시지");

// 상태 코드 지정
assert(condition, "에러 메시지", 409);  // Conflict
```

### 검사 항목
| 항목 | 조건 | 상태 코드 |
|------|------|----------|
| 빈 값 | `extension.length > 0` | 400 |
| 길이 제한 | `length <= 20` | 400 |
| 문자 제한 | `/^[a-z0-9]+$/` | 400 |
| 중복 | `!existing` | 409 |
| 최대 개수 | `count < 200` | 400 |

---

## 🔄 에러 핸들링

### withErrorHandler
```typescript
export const POST = withErrorHandler(async (request) => {
  // try-catch 없이 비즈니스 로직만 작성
  // 에러 발생 시 자동으로 적절한 응답 반환
});
```

### 에러 응답 형식
```json
{
  "error": "에러 메시지"
}
```

---

## 📊 데이터베이스 스키마

### 네이밍 컨벤션
- 테이블명: `snake_case` (PostgreSQL 표준)
- 컬럼명: `snake_case`
- Prisma 모델: `PascalCase`

### 테이블 구조

```sql
-- fixed_extensions
CREATE TABLE fixed_extensions (
  id UUID PRIMARY KEY,
  extension VARCHAR(20) UNIQUE NOT NULL,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- custom_extensions
CREATE TABLE custom_extensions (
  id UUID PRIMARY KEY,
  extension VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

---

## 🌱 Seed 데이터

고정 확장자 초기 데이터:
- bat, cmd, com, cpl, exe, scr, js

```bash
npm run db:seed
```

