-- CreateTable
CREATE TABLE "fixed_extensions" (
    "id" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "fixed_extensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_extensions" (
    "id" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "custom_extensions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fixed_extensions_extension_key" ON "fixed_extensions"("extension");

-- CreateIndex
CREATE UNIQUE INDEX "custom_extensions_extension_key" ON "custom_extensions"("extension");
