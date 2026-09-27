-- CreateTable
CREATE TABLE "SmsTemplate" (
    "sms_template_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sms_provider" TEXT NOT NULL,
    "provider_template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variable_mapping" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsTemplate_pkey" PRIMARY KEY ("sms_template_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmsTemplate_sms_provider_provider_template_id_key" ON "SmsTemplate"("sms_provider", "provider_template_id");
