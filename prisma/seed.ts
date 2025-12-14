import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

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

  // 고정 확장자 초기 데이터 삽입
  for (const ext of FIXED_EXTENSIONS) {
    await prisma.fixedExtension.upsert({
      where: { extension: ext },
      update: {},
      create: {
        extension: ext,
        isBlocked: false, // 기본값은 체크 해제
      },
    });
  }

  console.log(`✅ ${FIXED_EXTENSIONS.length}개의 고정 확장자가 추가되었습니다.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

