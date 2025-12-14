import { test, expect } from "@playwright/test";

test.describe("파일 확장자 차단 시스템", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("페이지가 정상적으로 로드된다", async ({ page }) => {
    // 제목 확인
    await expect(page.getByRole("heading", { name: "파일 확장자 차단" })).toBeVisible();
    
    // 고정 확장자 섹션 확인
    await expect(page.getByRole("heading", { name: "고정 확장자" })).toBeVisible();
    
    // 커스텀 확장자 섹션 확인
    await expect(page.getByRole("heading", { name: "커스텀 확장자", exact: true })).toBeVisible();
  });

  test.describe("고정 확장자", () => {
    test("고정 확장자 목록이 표시된다", async ({ page }) => {
      // 기본 고정 확장자들이 보이는지 확인
      const extensions = ["bat", "cmd", "com", "cpl", "exe", "scr", "js"];
      
      for (const ext of extensions) {
        await expect(page.getByText(ext, { exact: true })).toBeVisible();
      }
    });

    test("고정 확장자를 토글할 수 있다", async ({ page }) => {
      // exe 확장자의 체크박스 찾기
      const exeCheckbox = page.locator("label").filter({ hasText: "exe" }).getByRole("checkbox");
      
      // 초기 상태 확인 (체크 안됨)
      await expect(exeCheckbox).not.toBeChecked();
      
      // 클릭해서 체크
      await exeCheckbox.click();
      
      // 체크됨 확인
      await expect(exeCheckbox).toBeChecked();
      
      // 다시 클릭해서 체크 해제
      await exeCheckbox.click();
      
      // 체크 해제됨 확인
      await expect(exeCheckbox).not.toBeChecked();
    });
  });

  test.describe("커스텀 확장자", () => {
    test("커스텀 확장자를 추가할 수 있다", async ({ page }) => {
      const input = page.getByPlaceholder("확장자 입력 (예: pdf)");
      const addButton = page.getByRole("button", { name: "추가" });
      
      // 확장자 입력
      await input.fill("pdf");
      
      // 추가 버튼 클릭
      await addButton.click();
      
      // 추가된 확장자가 목록에 표시되는지 확인
      await expect(page.locator("section").last().getByText("pdf")).toBeVisible();
    });

    test("커스텀 확장자를 삭제할 수 있다", async ({ page }) => {
      const input = page.getByPlaceholder("확장자 입력 (예: pdf)");
      const addButton = page.getByRole("button", { name: "추가" });
      
      // 먼저 확장자 추가
      await input.fill("docx");
      await addButton.click();
      
      // 추가 확인
      await expect(page.locator("section").last().getByText("docx")).toBeVisible();
      
      // X 버튼 클릭해서 삭제 (aria-label 사용)
      const deleteButton = page.getByRole("button", { name: "docx 삭제" });
      await deleteButton.click();
      
      // 삭제 확인 (사라졌는지)
      await expect(page.locator("section").last().getByText("docx")).not.toBeVisible();
    });

    test("중복 확장자는 추가할 수 없다", async ({ page }) => {
      const input = page.getByPlaceholder("확장자 입력 (예: pdf)");
      const addButton = page.getByRole("button", { name: "추가" });
      
      // 첫 번째 추가
      await input.fill("xlsx");
      await addButton.click();
      await expect(page.locator("section").last().getByText("xlsx")).toBeVisible();
      
      // 같은 확장자 다시 추가 시도
      await input.fill("xlsx");
      await addButton.click();
      
      // 에러 메시지 확인
      await expect(page.getByText("이미 등록된 확장자입니다")).toBeVisible();
    });

    test("고정 확장자와 중복되는 확장자는 추가할 수 없다", async ({ page }) => {
      const input = page.getByPlaceholder("확장자 입력 (예: pdf)");
      const addButton = page.getByRole("button", { name: "추가" });
      
      // 고정 확장자(exe)와 같은 이름 추가 시도
      await input.fill("exe");
      await addButton.click();
      
      // 에러 메시지 확인
      await expect(page.getByText("고정 확장자에 이미 존재하는 확장자입니다")).toBeVisible();
    });

    test("20자를 초과하는 입력은 maxLength로 제한된다", async ({ page }) => {
      const input = page.getByPlaceholder("확장자 입력 (예: pdf)");
      
      // 30자 입력 시도
      await input.fill("a".repeat(30));
      
      // maxLength=20으로 인해 20자만 입력됨
      await expect(input).toHaveValue("a".repeat(20));
    });

    test("빈 확장자는 추가할 수 없다", async ({ page }) => {
      const addButton = page.getByRole("button", { name: "추가" });
      
      // 빈 상태로 추가 버튼 클릭
      await addButton.click();
      
      // 에러 메시지 확인
      await expect(page.getByText("확장자를 입력해주세요")).toBeVisible();
    });

    test("특수문자가 포함된 확장자는 추가할 수 없다", async ({ page }) => {
      const input = page.getByPlaceholder("확장자 입력 (예: pdf)");
      const addButton = page.getByRole("button", { name: "추가" });
      
      // 특수문자 포함 확장자 입력
      await input.fill("test@file");
      await addButton.click();
      
      // 에러 메시지 확인
      await expect(page.getByText("확장자는 영문과 숫자만 입력 가능합니다")).toBeVisible();
    });

    test("확장자 앞의 점(.)은 자동으로 제거된다", async ({ page }) => {
      const input = page.getByPlaceholder("확장자 입력 (예: pdf)");
      const addButton = page.getByRole("button", { name: "추가" });
      
      // 점으로 시작하는 확장자 입력
      await input.fill(".pptx");
      await addButton.click();
      
      // 점 없이 추가되었는지 확인
      await expect(page.locator("section").last().getByText("pptx")).toBeVisible();
    });

    test("커스텀 확장자 개수가 표시된다", async ({ page }) => {
      // 개수 표시 확인 (현재 X/200개 형식)
      await expect(page.getByText(/현재 \d+\/200개/)).toBeVisible();
    });
  });
});
