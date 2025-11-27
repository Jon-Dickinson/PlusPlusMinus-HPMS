-- Migration: add PermissionQueryAudit table

CREATE TABLE "PermissionQueryAudit" (
    "id" SERIAL NOT NULL,
    "callerId" INTEGER,
    "callerRole" TEXT,
    "targetUserId" INTEGER,
    "targetRole" TEXT,
    "categoryId" INTEGER,
    "endpoint" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "input" JSONB,
    "decision" TEXT NOT NULL,
    "reason" TEXT,
    "result" JSONB,
    "durationMs" INTEGER,
    "ip" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermissionQueryAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PermissionQueryAudit_callerId_idx" ON "PermissionQueryAudit" ("callerId");
CREATE INDEX "PermissionQueryAudit_targetUserId_idx" ON "PermissionQueryAudit" ("targetUserId");
CREATE INDEX "PermissionQueryAudit_endpoint_createdAt_idx" ON "PermissionQueryAudit" ("endpoint", "createdAt");
