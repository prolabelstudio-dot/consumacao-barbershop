-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "pointsAward" INTEGER NOT NULL DEFAULT 10,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "licenseKey" TEXT,
    "shopName" TEXT,
    "isActivated" BOOLEAN NOT NULL DEFAULT false,
    "lastCheckDate" DATETIME,
    "machineId" TEXT,
    "activationDate" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_licenseKey_key" ON "Config"("licenseKey");
