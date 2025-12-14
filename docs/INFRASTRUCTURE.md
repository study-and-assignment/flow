# Infrastructure 구성

## 🏛️ 아키텍처 개요

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│     Client      │────▶│     Vercel      │────▶│      Neon       │
│    (Browser)    │     │   (Next.js)     │     │  (PostgreSQL)   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## ☁️ 배포 플랫폼

### Vercel
- **용도**: Next.js 애플리케이션 호스팅
- **특징**:
  - 자동 빌드 및 배포 (GitHub 연동)
  - Edge Functions 지원
  - 자동 HTTPS
  - Preview 배포 (PR별)

### 환경 변수 설정
```
DATABASE_URL=postgresql://...
```

---

## 🗄️ 데이터베이스

### Neon PostgreSQL
- **용도**: Serverless PostgreSQL
- **특징**:
  - 자동 스케일링
  - 브랜치 기능 (개발/스테이징)
  - Connection Pooling (기본 제공)

### Region
- ap-southeast-1 (싱가포르) - 서울 미지원

### 연결 설정
```typescript
// Prisma 7 Driver Adapter 사용
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });
```

---

## 🔄 CI/CD 파이프라인

### GitHub → Vercel (자동)
1. `main` 브랜치 푸시
2. Vercel 자동 빌드 트리거
3. 빌드 성공 시 프로덕션 배포

### PR Preview
1. PR 생성
2. Preview 환경 자동 생성
3. 고유 URL로 테스트 가능

---

## 📊 Prisma 마이그레이션

### 로컬 개발
```bash
# 스키마 변경 후 마이그레이션 생성
npx prisma migrate dev --name <migration_name>

# 시드 데이터 추가
npm run db:seed
```

### 프로덕션 배포
```bash
# Vercel 빌드 시 자동 실행 (package.json)
"postinstall": "prisma generate",
"build": "prisma migrate deploy && next build"
```

### 마이그레이션 파일 위치
```
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
    └── 20241214113059_init/
        └── migration.sql
```

---

## 🔐 환경 변수

### 로컬 (.env.local)
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### Vercel Dashboard
1. Project Settings → Environment Variables
2. `DATABASE_URL` 추가
3. Production, Preview, Development 체크

---

## 📈 모니터링

### Vercel Analytics (선택)
- Core Web Vitals
- 페이지 로드 시간
- 에러 로깅

### Neon Dashboard
- 쿼리 성능
- 연결 수
- 스토리지 사용량

---

## 💰 인프라 항목

### Vercel (Hobby Plan - 무료)
- 무제한 배포
- 월 100GB 대역폭
- Serverless Functions 포함

### Neon (Free Tier)
- 0.5GB 스토리지
- 무제한 컴퓨팅 (활성 시간 제한)
- 1개 브랜치

