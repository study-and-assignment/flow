# 파일 확장자 차단 시스템

파일 첨부 시 보안을 위해 특정 확장자를 차단하는 웹 애플리케이션입니다.

## 🚀 배포 URL

- **Production**: [Vercel 배포 후 URL 추가]

## 📋 기능 요약

- ✅ **고정 확장자 차단**: bat, cmd, com, cpl, exe, scr, js 등 체크박스로 선택
- ✅ **커스텀 확장자 추가/삭제**: 사용자 정의 확장자 관리
- ✅ **Soft Delete**: 삭제된 데이터 복구 가능
- ✅ **유효성 검사**: 최대 20자, 영문/숫자만, 중복 체크

---

## 🏗️ 프로젝트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 메인 페이지 (FE)
│   ├── layout.tsx                # 레이아웃
│   └── api/                      # API Routes (Controller)
│       └── extensions/
│           ├── custom/route.ts
│           └── fixed/route.ts
│
├── components/                   # FE 컴포넌트
│   └── ui/                       # shadcn/ui 컴포넌트
│
├── lib/                          # FE 유틸리티
│   └── utils.ts                  # shadcn/ui 헬퍼
│
├── server/                       # BE 전용
│   ├── lib/                      # BE 유틸리티
│   │   ├── prisma.ts             # Prisma Client + Soft Delete Extension
│   │   ├── assert.ts             # 검증 유틸
│   │   ├── api-handler.ts        # 에러 핸들링 래퍼
│   │   └── api-response.ts       # 응답 헬퍼
│   ├── repositories/             # 데이터 접근 계층
│   └── services/                 # 비즈니스 로직 계층
│
└── shared/                       # FE + BE 공용
    ├── constants/                # 상수
    └── types/                    # 타입 정의
```

---

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui** (컴포넌트 라이브러리)

### Backend
- **Next.js API Routes**
- **Prisma ORM** (v7)
- **PostgreSQL** (Neon Serverless)

### Infrastructure
- **Vercel** (배포)
- **Neon** (Database)

---

## 🔧 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:

```env
DATABASE_URL="postgresql://..."
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev
```

### 4. 시드 데이터 추가

```bash
npm run db:seed
```

### 5. 개발 서버 실행

```bash
npm run dev
```

---

## 🔗 타입 공유 (FE ↔ BE)

Next.js 풀스택 환경의 장점을 활용하여, **별도의 도구 없이 타입을 공유**합니다.

```typescript
// src/shared/types/extension.types.ts - 타입 정의 (한 곳!)
export interface CustomExtension { ... }

// FE에서 import해서 사용
import type { CustomExtension } from "@/shared/types/extension.types";
```

자세한 내용은 [FE 문서](./docs/FRONTEND.md#-타입-공유-fe--be)를 참고하세요.

---

## 📚 문서

- [BE 아키텍처 및 정책](./docs/BACKEND.md)
- [FE 아키텍처 및 정책](./docs/FRONTEND.md)
- [인프라 구성](./docs/INFRASTRUCTURE.md)
- [코드 스타일 가이드](./docs/CODE_STYLE.md)

---

## 📝 API 엔드포인트

### 고정 확장자

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/extensions/fixed` | 고정 확장자 목록 조회 |
| PATCH | `/api/extensions/fixed` | 차단 상태 변경 |

### 커스텀 확장자

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/extensions/custom` | 커스텀 확장자 목록 조회 |
| POST | `/api/extensions/custom` | 확장자 추가 |
| DELETE | `/api/extensions/custom?id=xxx` | 확장자 삭제 (Soft Delete) |

---