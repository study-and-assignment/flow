# 코드 스타일 가이드

## 📁 파일/폴더 네이밍

| 대상 | 컨벤션 | 예시 |
|------|--------|------|
| 폴더 | `kebab-case` | `custom-extension/` |
| 컴포넌트 파일 | `kebab-case.tsx` | `button.tsx` |
| 유틸리티 파일 | `kebab-case.ts` | `api-handler.ts` |
| 타입 파일 | `*.types.ts` | `extension.types.ts` |
| 상수 파일 | `*.constants.ts` | `extension.constants.ts` |
| Repository | `*.repository.ts` | `custom-extension.repository.ts` |
| Service | `*.service.ts` | `custom-extension.service.ts` |

---

## 🏷️ 네이밍 컨벤션

### TypeScript

| 대상 | 컨벤션 | 예시 |
|------|--------|------|
| 변수/함수 | `camelCase` | `fetchExtensions` |
| 상수 | `UPPER_SNAKE_CASE` | `MAX_EXTENSION_LENGTH` |
| 타입/인터페이스 | `PascalCase` | `FixedExtension` |
| React 컴포넌트 | `PascalCase` | `CardHeader` |
| API Route 핸들러 | `UPPER_CASE` | `GET`, `POST`, `PATCH` |

### Database (PostgreSQL)

| 대상 | 컨벤션 | 예시 |
|------|--------|------|
| 테이블명 | `snake_case` | `custom_extensions` |
| 컬럼명 | `snake_case` | `is_blocked`, `deleted_at` |
| Prisma 모델 | `PascalCase` | `CustomExtension` |

---

## 📝 코드 패턴

### API Route (Controller)

```typescript
// ✅ Good - 간결하고 명확
export const POST = withErrorHandler(async (request: Request) => {
  const { extension } = await request.json();
  assert(!!extension && typeof extension === "string", "확장자 필요");
  
  const created = await customExtensionService.add(extension);
  return ApiResponse.created(created);
});

// ❌ Bad - 비즈니스 로직이 Controller에 있음
export async function POST(request: Request) {
  try {
    const { extension } = await request.json();
    if (!extension) {
      return NextResponse.json({ error: "..." }, { status: 400 });
    }
    // 검증 로직...
    // DB 직접 호출...
  } catch (error) {
    // 에러 처리...
  }
}
```

### Service

```typescript
// ✅ Good - 비즈니스 로직 집중
export const customExtensionService = {
  add: async (rawExtension: string) => {
    const extension = rawExtension.toLowerCase().trim();
    
    assert(extension.length <= MAX_EXTENSION_LENGTH, "20자 이하");
    
    const existing = await customExtensionRepository.findByExtension(extension);
    assert(!existing, "이미 존재", 409);
    
    return customExtensionRepository.create(extension);
  },
};

// ❌ Bad - try-catch, HTTP 응답 코드 포함
export const customExtensionService = {
  add: async (rawExtension: string) => {
    try {
      // ...
      return { data: created, status: 201 };
    } catch (error) {
      return { error: "...", status: 500 };
    }
  },
};
```

### Repository

```typescript
// ✅ Good - DB 접근만
export const customExtensionRepository = {
  findAll: () =>
    prisma.customExtension.findMany({
      orderBy: { createdAt: "desc" },
    }),
    
  create: (extension: string) =>
    prisma.customExtension.create({
      data: { extension },
    }),
};

// ❌ Bad - 비즈니스 로직 포함
export const customExtensionRepository = {
  create: async (extension: string) => {
    if (extension.length > 20) throw new Error("Too long");  // ❌
    return prisma.customExtension.create({ data: { extension } });
  },
};
```

---

## 🔍 유효성 검사

### assert 사용

```typescript
// ✅ Good - 간결한 검증
assert(!!value, "값이 필요합니다.");
assert(value.length <= 20, "20자 이하로 입력해주세요.");
assert(/^[a-z0-9]+$/.test(value), "영문과 숫자만 가능합니다.");
assert(!exists, "이미 존재합니다.", 409);

// ❌ Bad - if문 중첩
if (!value) {
  return { error: "값이 필요합니다." };
}
if (value.length > 20) {
  return { error: "20자 이하로..." };
}
```

---

## 🌐 API 응답

### ApiResponse 사용

```typescript
// ✅ Good
return ApiResponse.success(data);
return ApiResponse.created(data);
return ApiResponse.error("에러 메시지", 400);

// ❌ Bad
return NextResponse.json(data, { status: 200 });
return NextResponse.json({ error: "..." }, { status: 400 });
```

---

## 📦 Import 순서

```typescript
// 1. 외부 라이브러리
import { NextResponse } from "next/server";

// 2. 내부 모듈 (경로 별칭 사용)
import { prisma } from "@/server/lib/prisma";
import { assert } from "@/server/lib/assert";
import { customExtensionService } from "@/server/services/custom-extension.service";

// 3. 타입
import type { CustomExtension } from "@/shared/types/extension.types";
```

---

## 💅 스타일 규칙

### TailwindCSS

```typescript
// ✅ Good - 논리적 그룹핑
<div className="
  flex items-center gap-2
  p-4 rounded-lg
  bg-slate-50
  hover:bg-slate-100 transition-colors
">

// ❌ Bad - 무작위 나열
<div className="bg-slate-50 flex p-4 hover:bg-slate-100 gap-2 rounded-lg items-center transition-colors">
```

### cn() 함수 활용

```typescript
// ✅ Good - 조건부 클래스
<div className={cn(
  "base-styles",
  isActive && "active-styles",
  variant === "primary" && "primary-styles"
)}>

// ❌ Bad - 템플릿 리터럴
<div className={`base-styles ${isActive ? "active-styles" : ""}`}>
```

---

## 📋 주석 규칙

### JSDoc 사용

```typescript
/**
 * 조건이 false면 ApiError를 throw
 * @param condition 조건 (true면 통과, false면 에러)
 * @param message 에러 메시지
 * @param status HTTP 상태 코드 (기본: 400)
 */
export function assert(
  condition: boolean,
  message: string,
  status: number = 400
): asserts condition {
  // ...
}
```

### 섹션 구분

```typescript
// 데이터 로드
useEffect(() => { ... }, []);

// 고정 확장자 체크 상태 변경
const handleFixedToggle = async () => { ... };

// 커스텀 확장자 추가
const handleAddCustom = async () => { ... };
```

---

## ⚠️ 금지 사항

1. **any 타입 사용 금지** (불가피한 경우 주석으로 이유 명시)
2. **console.log 배포 금지** (console.error만 에러 핸들러에서 사용)
3. **하드코딩 금지** (상수 파일로 분리)
4. **인라인 스타일 금지** (TailwindCSS 사용)
5. **비동기 함수에서 .then() 사용 금지** (async/await 사용)
6. **FE에서 타입 중복 정의 금지** (반드시 `@/shared/types`에서 import)

---

## 🔗 타입 공유 규칙

### ✅ Good
```typescript
// FE에서 shared 타입 import
import type { CustomExtension } from "@/shared/types/extension.types";

const [extensions, setExtensions] = useState<CustomExtension[]>([]);
```

### ❌ Bad
```typescript
// FE에서 타입 중복 정의 - 금지!
interface CustomExtension {
  id: string;
  extension: string;
}
```

### 타입 정의 위치
- **엔티티 타입**: `src/shared/types/*.types.ts`
- **상수**: `src/shared/constants/*.constants.ts`
- **BE 전용 타입**: `src/server/lib/` 또는 해당 파일 내부

