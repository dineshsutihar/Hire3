-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "amountLamports" INTEGER NOT NULL,
    "from_address" TEXT NOT NULL,
    "to_address" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_signature_key" ON "public"."Payment"("signature");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
