# Frontend 아키텍처 및 정책

## 🏗️ 구조

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 메인 페이지
│   ├── layout.tsx                # 루트 레이아웃
│   └── globals.css               # 글로벌 스타일
│
├── components/                   # 컴포넌트
│   └── ui/                       # shadcn/ui 컴포넌트
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── input.tsx
│       └── badge.tsx
│
└── lib/                          # 유틸리티
    └── utils.ts                  # cn() 헬퍼 (Tailwind 병합)
```

---

## 🎨 UI 컴포넌트

### shadcn/ui 사용
- 커스터마이징 가능한 컴포넌트 라이브러리
- TailwindCSS 기반
- 복사 붙여넣기 방식 (의존성 없음)

### 사용 컴포넌트
| 컴포넌트 | 용도 |
|----------|------|
| `Card` | 메인 컨테이너 |
| `Checkbox` | 고정 확장자 선택 |
| `Input` | 커스텀 확장자 입력 |
| `Button` | 추가 버튼 |
| `Badge` | 확장자 태그 표시 |

---

## 🔄 상태 관리

### useState 사용
```typescript
const [fixedExtensions, setFixedExtensions] = useState<FixedExtension[]>([]);
const [customExtensions, setCustomExtensions] = useState<CustomExtension[]>([]);
const [newExtension, setNewExtension] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(true);
```

### 데이터 흐름
1. `useEffect`로 초기 데이터 로드
2. 사용자 액션 → API 호출
3. 성공 시 로컬 상태 업데이트
4. UI 리렌더링

---

## 🌐 API 통신

### Fetch API 사용
```typescript
const fetchExtensions = async () => {
  const [fixedRes, customRes] = await Promise.all([
    fetch("/api/extensions/fixed"),
    fetch("/api/extensions/custom"),
  ]);
  // ...
};
```

### 에러 처리
```typescript
if (!res.ok) {
  const data = await res.json();
  setError(data.error);  // 서버 에러 메시지 표시
  return;
}
```

---

## ✨ UX 고려사항

### 로딩 상태
```typescript
if (loading) {
  return <div>로딩 중...</div>;
}
```

### 실시간 피드백
- 에러 메시지 즉시 표시
- 성공 시 목록 즉시 업데이트
- Enter 키로 추가 지원

### 접근성
```typescript
<button aria-label={`${ext.extension} 삭제`}>
  <X className="h-3 w-3" />
</button>
```

---

## 🎯 타입 공유 (FE ↔ BE)

### 워크플로우

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  src/shared/types/extension.types.ts  ← 타입 정의 (한 곳!)   │
│                                                             │
│                    │                     │                  │
│                    ▼                     ▼                  │
│  ┌──────────────────────┐   ┌──────────────────────┐       │
│  │ BE (Server)          │   │ FE (Client)          │       │
│  │ Prisma가 자동 추론    │   │ import해서 사용       │       │
│  └──────────────────────┘   └──────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 사용 방법

```typescript
// FE에서 shared 타입 import
import type { FixedExtension, CustomExtension } from "@/shared/types/extension.types";

// 상태 정의 시 타입 사용
const [extensions, setExtensions] = useState<CustomExtension[]>([]);

// API 응답에 타입 적용
const data: CustomExtension[] = await res.json();
```

### 장점

| 항목 | 설명 |
|------|------|
| **단일 소스** | 타입 정의가 한 곳에만 존재 |
| **자동 동기화** | BE 타입 변경 시 FE 컴파일 에러로 감지 |
| **별도 도구 불필요** | OpenAPI, tRPC 등 추가 설정 없음 |

### 타입 정의 위치

```typescript
// src/shared/types/extension.types.ts
export interface FixedExtension {
  id: string;
  extension: string;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CustomExtension {
  id: string;
  extension: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
```

### ⚠️ 주의사항

- FE에서 타입 중복 정의 금지! 반드시 `@/shared/types`에서 import
- 새 엔티티 추가 시 `shared/types`에 먼저 정의

---

## 📐 스타일링

### TailwindCSS
- 유틸리티 퍼스트 CSS
- `cn()` 함수로 클래스 병합

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  condition && "conditional-class"
)} />
```

### 디자인 시스템
- 색상: slate 계열 (gray 대신)
- 그라데이션 배경
- 카드 기반 레이아웃
- 적절한 간격 (space-y, gap)

