import type { SmsTemplateVariableMapping } from "../interfaces/ISmsWrapper.ts";
import { prisma } from "../lib/prisma.ts";

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
      orderBy: { created_at: "desc" },
    });
    return templates.map(toRecord);
  }

  async getById(id: string): Promise<SmsTemplateRecord | null> {
    const template = await prisma.smsTemplate.findUnique({
      where: { sms_template_id: id },
    });
    return template ? toRecord(template) : null;
  }

  async create(params: {
    provider: string;
    providerTemplateId: string;
    name: string;
    variableMapping: SmsTemplateVariableMapping;
  }): Promise<SmsTemplateRecord> {
    const template = await prisma.smsTemplate.create({
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
      where: { sms_template_id: id },
      data: {
        name: params.name,
        variable_mapping: params.variableMapping,
      },
    });
    return toRecord(template);
  }
}
