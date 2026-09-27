CREATE TABLE "OwingSmsSend" (
    "enrolment_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "phone_number" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OwingSmsSend_pkey" PRIMARY KEY ("enrolment_id", "term_id", "template_id", "phone_number"),
    CONSTRAINT "OwingSmsSend_enrolment_id_fkey" FOREIGN KEY ("enrolment_id") REFERENCES "Enrolment"("enrolment_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OwingSmsSend_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "SmsTemplate"("sms_template_id") ON DELETE CASCADE ON UPDATE CASCADE
);
ALTER TABLE "OwingSmsSend" ENABLE ROW LEVEL SECURITY;
