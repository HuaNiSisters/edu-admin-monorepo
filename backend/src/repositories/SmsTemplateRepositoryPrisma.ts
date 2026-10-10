import type { ReminderType, SmsTemplateVariableMapping } from "../interfaces/ISmsWrapper.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

// Ordinary template operations also work before reminder tracking is deployed.
const templateSelect = {
  sms_template_id: true,
  sms_provider: true,
  provider_template_id: true,
  name: true,
  variable_mapping: true,
} satisfies Prisma.SmsTemplateSelect;

export interface SmsTemplateRecord {
  id: string;
  provider: string;
  providerTemplateId: string;
  name: string;
  variableMapping: SmsTemplateVariableMapping;
}

function toRecord(template: {
  sms_template_id: string;
  sms_provider: string;
  provider_template_id: string;
  name: string;
  variable_mapping: unknown;
}): SmsTemplateRecord {
  return {
    id: template.sms_template_id,
    provider: template.sms_provider,
    providerTemplateId: template.provider_template_id,
    name: template.name,
    variableMapping: template.variable_mapping as SmsTemplateVariableMapping,
  };
}

export class SmsTemplateRepositoryPrisma {
  async getAll(): Promise<SmsTemplateRecord[]> {
    const templates = await prisma.smsTemplate.findMany({
      select: templateSelect,
      orderBy: { created_at: "desc" },
    });
    return templates.map(toRecord);
  }

  async getById(id: string): Promise<SmsTemplateRecord | null> {
    const template = await prisma.smsTemplate.findUnique({
      select: templateSelect,
      where: { sms_template_id: id },
    });
    return template ? toRecord(template) : null;
  }

  async getReminderById(id: string): Promise<{ reminderType: ReminderType | null } | null> {
    const template = await prisma.smsTemplate.findUnique({
      where: { sms_template_id: id },
      select: { reminder_type: true },
    });
    return template ? { reminderType: template.reminder_type } : null;
  }

  async create(params: {
    provider: string;
    providerTemplateId: string;
    name: string;
    variableMapping: SmsTemplateVariableMapping;
  }): Promise<SmsTemplateRecord> {
    const template = await prisma.smsTemplate.create({
      select: templateSelect,
      data: {
        sms_provider: params.provider,
        provider_template_id: params.providerTemplateId,
        name: params.name,
        variable_mapping: params.variableMapping,
      },
    });
    return toRecord(template);
  }

  async update(
    id: string,
    params: { name: string; variableMapping: SmsTemplateVariableMapping },
  ): Promise<SmsTemplateRecord> {
    const template = await prisma.smsTemplate.update({
      select: templateSelect,
      where: { sms_template_id: id },
      data: {
        name: params.name,
        variable_mapping: params.variableMapping,
      },
    });
    return toRecord(template);
  }
}
