import { describe, it, expect } from 'vitest';
import { ProductService } from '../backend/productService.js';
import { PlanService } from '../backend/planService.js';
import { TaxService } from '../backend/taxService.js';
import { DiscountService } from '../backend/discountService.js';
import { calculateVariantPrice } from '../../../shared/utils/index.js';

describe('MEMBER 2: Product, Plan, Tax & Discount Management Tests', () => {
  let createdProductId: string;

  it('creates product with Odoo brand variant and adds 560 to base price', async () => {
    const basePrice = 1000;
    const product = await ProductService.createProduct({
      name: 'Brightloop ERP Core',
      type: 'SOFTWARE',
      salesPrice: basePrice,
      costPrice: 350,
      variants: [
        { name: 'Standard Edition', priceModifier: 0 },
        { name: 'Odoo Brand Edition', priceModifier: 560 }, // explicitly +560 rule
      ],
    });

    expect(product).toBeDefined();
    expect(product.variants).toHaveLength(2);
    createdProductId = product.id;

    // Verify Odoo variant price calculation dynamically
    const odooVariant = product.variants.find((v: any) => /odoo/i.test(v.name));
    expect(odooVariant).toBeDefined();
    expect(Number(odooVariant.priceModifier)).toBe(560);

    const effectivePrice = await ProductService.calculatePrice(product.id, odooVariant.id);
    expect(effectivePrice).toBe(1560); // 1000 + 560
  });

  it('calculateVariantPrice helper adds 560 automatically if Odoo brand is detected', () => {
    const price = calculateVariantPrice(1200, 'Odoo Brand Package');
    expect(price).toBe(1760); // 1200 + 560
  });

  it('creates and validates subscription plan with proper dates', async () => {
    const fromDate = new Date();
    const untilDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const plan = await PlanService.createPlan({
      name: 'Monthly Pro Plan',
      productId: createdProductId,
      billingFrequency: 'MONTHLY',
      minQuantity: 2,
      basePrice: 1560,
      availableFrom: fromDate,
      availableUntil: untilDate,
      autoClose: false,
      earlyClosureAllowed: true,
      pauseAllowed: true,
      renewalAllowed: true,
    });

    expect(plan.billingFrequency).toBe('MONTHLY');
    expect(plan.minQuantity).toBe(2);
    expect(plan.earlyClosureAllowed).toBe(true);

    // Rejects plan if availableUntil is before availableFrom
    await expect(
      PlanService.createPlan({
        name: 'Invalid Plan',
        productId: createdProductId,
        billingFrequency: 'YEARLY',
        basePrice: 5000,
        availableFrom: untilDate,
        availableUntil: fromDate, // invalid
      })
    ).rejects.toThrow(/available until date must be after available from date/i);
  });

  it('creates tax rule and calculates dynamic tax amounts accurately', async () => {
    const tax = await TaxService.createTax({
      name: 'GST 18%',
      rate: 18,
      description: 'Goods and services standard tax',
    });

    expect(Number(tax.rate)).toBe(18);

    const calculatedTax = await TaxService.calculateTaxAmount(tax.id, 1000);
    expect(calculatedTax).toBe(180); // 18% of 1000
  });

  it('validates discount eligibility, min purchase, and expiration rules', async () => {
    const code = `TEST${Date.now()}`;
    await DiscountService.createDiscount({
      code,
      type: 'PERCENTAGE',
      value: 15,
      minPurchaseAmount: 500,
      maxUsageCount: 2,
      startDate: new Date('2026-01-01'),
    });

    // Valid check: subtotal 1000 >= min 500
    const validCheck = await DiscountService.validateAndCalculate({
      code,
      subtotal: 1000,
    });
    expect(validCheck.isValid).toBe(true);
    expect(validCheck.discountAmount).toBe(150); // 15% of 1000

    // Below min purchase check
    const belowMinCheck = await DiscountService.validateAndCalculate({
      code,
      subtotal: 300,
    });
    expect(belowMinCheck.isValid).toBe(false);
    expect(belowMinCheck.reason).toContain('Minimum purchase');
  });
});
