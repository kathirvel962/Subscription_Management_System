import { db } from '../../../server/src/config/db.js';

export class TaxService {
  static async getTaxes(isActive?: boolean) {
    return db.tax.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
    });
  }

  static async getTaxById(id: string) {
    const tax = await db.tax.findUnique({ where: { id } });
    if (!tax) throw new Error(`Tax ${id} not found.`);
    return tax;
  }

  static async createTax(data: {
    name: string;
    rate: number;
    description?: string | null;
    isActive?: boolean;
  }) {
    if (data.rate < 0 || data.rate > 100) {
      throw new Error('Tax rate must be between 0% and 100%.');
    }

    return db.tax.create({
      data: {
        name: data.name,
        rate: data.rate,
        description: data.description || null,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async updateTax(id: string, data: any) {
    const tax = await db.tax.findUnique({ where: { id } });
    if (!tax) throw new Error('Tax not found.');

    return db.tax.update({
      where: { id },
      data,
    });
  }

  /**
   * Calculates tax amount dynamically for a taxable base amount
   */
  static async calculateTaxAmount(taxId: string, taxableAmount: number): Promise<number> {
    const tax = await db.tax.findUnique({ where: { id: taxId } });
    if (!tax || !tax.isActive) return 0;
    return Number(((taxableAmount * Number(tax.rate)) / 100).toFixed(2));
  }
}
