import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

// .env.local 우선, 없으면 .env 사용
config({ path: ".env.local" });
config({ path: ".env" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// 고정 확장자 목록 (보안상 자주 차단되는 실행 파일 확장자들)
const FIXED_EXTENSIONS = [
  "bat",  // Windows 배치 파일
  "cmd",  // Windows 명령 스크립트
  "com",  // DOS 실행 파일
  "cpl",  // Windows 제어판 확장
  "exe",  // Windows 실행 파일
  "scr",  // Windows 화면 보호기
  "js",   // JavaScript (Node.js 실행 가능)
];

async function main() {
  console.log("🌱 Seeding database...");

  let created = 0;
  let skipped = 0;

  // 고정 확장자 초기 데이터 삽입
  for (const ext of FIXED_EXTENSIONS) {
    // 이미 존재하는지 확인 (활성 상태만)
    const existing = await prisma.fixedExtension.findFirst({
      where: { extension: ext, deletedAt: null },
    });

    if (existing) {
      skipped++;
      continue;
    }

    // 없으면 생성
    await prisma.fixedExtension.create({
      data: {
        extension: ext,
        isBlocked: false, // 기본값은 체크 해제
      },
    });
    created++;
  }

  console.log(`✅ 고정 확장자: ${created}개 생성, ${skipped}개 스킵 (이미 존재)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
