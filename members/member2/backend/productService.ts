import { db } from '../../../server/src/config/db.js';
import { calculateVariantPrice } from '../../../shared/utils/index.js';
import { ODOO_BRAND_MODIFIER } from '../../../shared/constants/index.js';

export class ProductService {
  static async getProducts(params?: { search?: string; type?: string; isActive?: boolean }) {
    let products = await db.product.findMany({
      where: params?.isActive !== undefined ? { isActive: params.isActive } : undefined,
    });

    if (params?.type) {
      products = products.filter((p: any) => p.type === params.type);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      products = products.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    return products;
  }

  static async getProductById(id: string) {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error(`Product with ID ${id} not found.`);
    }
    return product;
  }

  static async createProduct(data: {
    name: string;
    type: 'SOFTWARE' | 'SERVICE' | 'PHYSICAL' | 'ADD_ON';
    salesPrice: number;
    costPrice: number;
    notes?: string | null;
    isActive?: boolean;
    variants?: Array<{
      name: string;
      priceModifier?: number;
      sku?: string | null;
      isActive?: boolean;
    }>;
  }) {
    const createdProduct = await db.product.create({
      data: {
        name: data.name,
        type: data.type,
        salesPrice: data.salesPrice,
        costPrice: data.costPrice,
        notes: data.notes || null,
        isActive: data.isActive ?? true,
      },
    });

    // Create variants if provided
    if (data.variants && data.variants.length > 0) {
      for (const v of data.variants) {
        // If variant name contains "Odoo" and modifier not explicitly specified or 0, apply +560
        let modifier = v.priceModifier ?? 0;
        if (/odoo/i.test(v.name) && modifier === 0) {
          modifier = ODOO_BRAND_MODIFIER;
        }

        await db.productVariant.create({
          data: {
            productId: createdProduct.id,
            name: v.name,
            priceModifier: modifier,
            sku: v.sku || null,
            isActive: v.isActive ?? true,
          },
        });
      }
    }

    return this.getProductById(createdProduct.id);
  }

  static async updateProduct(
    id: string,
    data: {
      name?: string;
      type?: 'SOFTWARE' | 'SERVICE' | 'PHYSICAL' | 'ADD_ON';
      salesPrice?: number;
      costPrice?: number;
      notes?: string | null;
      isActive?: boolean;
    }
  ) {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) throw new Error('Product not found.');

    const updated = await db.product.update({
      where: { id },
      data,
    });
    return this.getProductById(updated.id);
  }

  static async deleteProduct(id: string) {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) throw new Error('Product not found.');
    return db.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async addVariant(
    productId: string,
    variant: {
      name: string;
      priceModifier?: number;
      sku?: string | null;
      isActive?: boolean;
    }
  ) {
    let modifier = variant.priceModifier ?? 0;
    if (/odoo/i.test(variant.name) && modifier === 0) {
      modifier = ODOO_BRAND_MODIFIER;
    }

    const created = await db.productVariant.create({
      data: {
        productId,
        name: variant.name,
        priceModifier: modifier,
        sku: variant.sku || null,
        isActive: variant.isActive ?? true,
      },
    });

    return created;
  }

  /**
   * Calculates dynamic unit price combining base product and variant modifier
   * E.g. Base: 1200 + Odoo Brand: 560 = 1760
   */
  static async calculatePrice(productId: string, variantId?: string | null): Promise<number> {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error(`Product ${productId} not found.`);

    let modifier = 0;
    if (variantId) {
      const variant = await db.productVariant.findUnique({ where: { id: variantId } });
      if (variant) {
        modifier = Number(variant.priceModifier);
      }
    }

    return calculateVariantPrice(Number(product.salesPrice), undefined, modifier);
  }
}
