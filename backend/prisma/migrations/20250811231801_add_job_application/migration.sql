-- CreateTable
CREATE TABLE "public"."JobApplication" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_user_id_job_id_key" ON "public"."JobApplication"("user_id", "job_id");

-- AddForeignKey
ALTER TABLE "public"."JobApplication" ADD CONSTRAINT "JobApplication_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobApplication" ADD CONSTRAINT "JobApplication_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
