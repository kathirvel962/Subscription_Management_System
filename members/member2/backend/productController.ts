import { Request, Response } from 'express';
import { ProductService } from './productService.js';
import { ProductSchema, ProductVariantSchema } from './validation.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';

export class ProductController {
  static async getProducts(req: Request, res: Response): Promise<any> {
    try {
      const search = req.query.search as string;
      const type = req.query.type as string;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

      const products = await ProductService.getProducts({ search, type, isActive });
      return sendSuccess(res, products, 'Products retrieved successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getProductById(req: Request, res: Response): Promise<any> {
    try {
      const product = await ProductService.getProductById(req.params.id);
      return sendSuccess(res, product, 'Product details retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async createProduct(req: Request, res: Response): Promise<any> {
    try {
      const parsed = ProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const product = await ProductService.createProduct(parsed.data as any);
      return sendSuccess(res, product, 'Product created successfully.', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async updateProduct(req: Request, res: Response): Promise<any> {
    try {
      const updated = await ProductService.updateProduct(req.params.id, req.body);
      return sendSuccess(res, updated, 'Product updated successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async deleteProduct(req: Request, res: Response): Promise<any> {
    try {
      await ProductService.deleteProduct(req.params.id);
      return sendSuccess(res, null, 'Product archived successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async addVariant(req: Request, res: Response): Promise<any> {
    try {
      const parsed = ProductVariantSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const variant = await ProductService.addVariant(req.params.id, parsed.data);
      return sendSuccess(res, variant, 'Variant added successfully.', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
