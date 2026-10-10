BEGIN;

CREATE TYPE "SmsReminderType" AS ENUM ('upcoming_payment', 'overdue_no_class_entry');
CREATE TYPE "SmsSendStatus" AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE "SmsRecipientRole" AS ENUM ('student', 'parent');

ALTER TABLE "SmsTemplate" ADD COLUMN "reminder_type" "SmsReminderType";
CREATE UNIQUE INDEX "SmsTemplate_reminder_type_key" ON "SmsTemplate"("reminder_type");

CREATE TABLE "SmsSendAttempt" (
    "sms_send_attempt_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "enrolment_id" UUID NOT NULL,
    "sms_template_id" UUID NOT NULL,
    "reminder_type" "SmsReminderType" NOT NULL,
    "recipient_phone" TEXT NOT NULL,
    "recipient_role" "SmsRecipientRole" NOT NULL,
    "recipient_id" UUID NOT NULL,
    "status" "SmsSendStatus" NOT NULL DEFAULT 'pending',
    "provider_message_id" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "SmsSendAttempt_pkey" PRIMARY KEY ("sms_send_attempt_id")
);

CREATE UNIQUE INDEX "SmsSendAttempt_request_id_key" ON "SmsSendAttempt"("request_id");
CREATE INDEX "SmsSendAttempt_enrolment_id_reminder_type_status_idx" ON "SmsSendAttempt"("enrolment_id", "reminder_type", "status");
CREATE INDEX "SmsSendAttempt_enrolment_id_reminder_type_recipient_phone_idx" ON "SmsSendAttempt"("enrolment_id", "reminder_type", "recipient_phone");

ALTER TABLE "SmsSendAttempt" ADD CONSTRAINT "SmsSendAttempt_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "Enrolment"("enrolment_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SmsSendAttempt" ADD CONSTRAINT "SmsSendAttempt_sms_template_id_fkey" FOREIGN KEY ("sms_template_id") REFERENCES "SmsTemplate"("sms_template_id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
