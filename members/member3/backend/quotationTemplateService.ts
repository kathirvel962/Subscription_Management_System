import { db } from '../../../server/src/config/db.js';

export class QuotationTemplateService {
  static async getTemplates() {
    return db.quotationTemplate.findMany();
  }

  static async getTemplateById(id: string) {
    const template = await db.quotationTemplate.findUnique({ where: { id } });
    if (!template) throw new Error(`Quotation template ${id} not found.`);
    return template;
  }

  static async createTemplate(data: {
    name: string;
    description?: string | null;
    planId?: string | null;
    validityDays?: number;
    isActive?: boolean;
    lines: Array<{
      productId: string;
      variantId?: string | null;
      quantity: number;
      unitPrice: number;
    }>;
  }) {
    const template = await db.quotationTemplate.create({
      data: {
        name: data.name,
        description: data.description || null,
        planId: data.planId || null,
        validityDays: data.validityDays || 30,
        isActive: data.isActive ?? true,
        lines: data.lines,
      },
    });

    return template;
  }
}
