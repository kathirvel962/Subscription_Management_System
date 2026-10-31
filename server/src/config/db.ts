import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';

// Real Prisma Client Instance
export const realPrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// In-Memory store fallback for standalone/offline operation when Postgres container is not running
class InMemoryDB {
  users: any[] = [];
  customerProfiles: any[] = [];
  products: any[] = [];
  productVariants: any[] = [];
  subscriptionPlans: any[] = [];
  taxes: any[] = [];
  discounts: any[] = [];
  discountUsages: any[] = [];
  quotationTemplates: any[] = [];
  quotations: any[] = [];
  quotationLines: any[] = [];
  subscriptions: any[] = [];
  subscriptionLines: any[] = [];
  subscriptionStatusHistories: any[] = [];
  invoices: any[] = [];
  invoiceLines: any[] = [];
  payments: any[] = [];
  resetTokens: any[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('Admin@12345', salt);
    const staffPasswordHash = bcrypt.hashSync('Staff@12345', salt);
    const customerPasswordHash = bcrypt.hashSync('Customer@12345', salt);

    // 1. Users
    const adminUser = {
      id: 'usr-admin-1',
      email: 'admin@brightloop.io',
      passwordHash: adminPasswordHash,
      name: 'Sarah Connor (Admin)',
      role: 'ADMIN',
      phone: '+91 98765 43210',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    const staffUser = {
      id: 'usr-staff-1',
      email: 'staff@brightloop.io',
      passwordHash: staffPasswordHash,
      name: 'Alex Vance (Sales Staff)',
      role: 'STAFF',
      phone: '+91 98765 43211',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    const customerUser1 = {
      id: 'usr-cust-1',
      email: 'customer@acme.com',
      passwordHash: customerPasswordHash,
      name: 'Bruce Wayne',
      role: 'CUSTOMER',
      phone: '+91 98765 43212',
      isActive: true,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05'),
    };

    const customerUser2 = {
      id: 'usr-cust-2',
      email: 'david@globex.org',
      passwordHash: customerPasswordHash,
      name: 'David Banner',
      role: 'CUSTOMER',
      phone: '+91 98765 43213',
      isActive: true,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10'),
    };

    this.users.push(adminUser, staffUser, customerUser1, customerUser2);

    // 2. Customer Profiles
    const custProfile1 = {
      id: 'prof-cust-1',
      userId: customerUser1.id,
      companyName: 'Acme Software Labs Pvt Ltd',
      address: '100 Tech Park, Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560103',
      country: 'India',
      taxId: '29ABCDE1234F1Z5',
      notes: 'Strategic Enterprise Customer',
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-05'),
    };

    const custProfile2 = {
      id: 'prof-cust-2',
      userId: customerUser2.id,
      companyName: 'Globex Media Corp',
      address: '42 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400020',
      country: 'India',
      taxId: '27ABCDE5678F1Z9',
      notes: 'Quarterly billing client',
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-10'),
    };

    this.customerProfiles.push(custProfile1, custProfile2);

    // 3. Products
    const prod1 = {
      id: 'prod-1',
      name: 'Brightloop ERP Suite',
      type: 'SOFTWARE',
      salesPrice: 1200.00,
      costPrice: 400.00,
      notes: 'Full-featured enterprise resource planning software',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    const prod2 = {
      id: 'prod-2',
      name: 'Brightloop CRM Pro',
      type: 'SOFTWARE',
      salesPrice: 800.00,
      costPrice: 250.00,
      notes: 'Lead tracking and customer relationship management',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    const prod3 = {
      id: 'prod-3',
      name: 'Priority 24/7 SLA Support',
      type: 'SERVICE',
      salesPrice: 500.00,
      costPrice: 150.00,
      notes: 'Dedicated support engineer with 15-minute response SLA',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    this.products.push(prod1, prod2, prod3);

    // 4. Product Variants (Odoo Brand adds 560 to price)
    const var1 = {
      id: 'var-1',
      productId: prod1.id,
      name: 'Standard Edition',
      priceModifier: 0.00,
      sku: 'BL-ERP-STD',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    const var2 = {
      id: 'var-2',
      productId: prod1.id,
      name: 'Odoo Brand Edition', // Choosing Odoo brand adds 560
      priceModifier: 560.00,
      sku: 'BL-ERP-ODOO',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    const var3 = {
      id: 'var-3',
      productId: prod1.id,
      name: 'Enterprise Cloud',
      priceModifier: 1200.00,
      sku: 'BL-ERP-ENT',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    this.productVariants.push(var1, var2, var3);

    // 5. Subscription Plans
    const plan1 = {
      id: 'plan-1',
      name: 'Monthly Professional Plan',
      description: 'Ideal for small-to-medium businesses billed monthly',
      productId: prod1.id,
      billingFrequency: 'MONTHLY',
      minQuantity: 1,
      basePrice: 1200.00,
      availableFrom: new Date('2026-01-01'),
      availableUntil: null,
      autoClose: false,
      earlyClosureAllowed: true,
      pauseAllowed: true,
      renewalAllowed: true,
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    const plan2 = {
      id: 'plan-2',
      name: 'Annual Enterprise Plan',
      description: 'Annual commitment with discounted rates',
      productId: prod1.id,
      billingFrequency: 'YEARLY',
      minQuantity: 5,
      basePrice: 12000.00,
      availableFrom: new Date('2026-01-01'),
      availableUntil: null,
      autoClose: false,
      earlyClosureAllowed: false,
      pauseAllowed: true,
      renewalAllowed: true,
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    const plan3 = {
      id: 'plan-3',
      name: 'Weekly Growth Starter',
      description: 'Weekly flexible plan for testing startups',
      productId: prod2.id,
      billingFrequency: 'WEEKLY',
      minQuantity: 1,
      basePrice: 250.00,
      availableFrom: new Date('2026-01-01'),
      availableUntil: null,
      autoClose: true,
      earlyClosureAllowed: true,
      pauseAllowed: false,
      renewalAllowed: true,
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    this.subscriptionPlans.push(plan1, plan2, plan3);

    // 6. Taxes
    const tax1 = {
      id: 'tax-1',
      name: 'GST 18%',
      rate: 18.00,
      description: 'Goods and Services Tax standard rate',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    const tax2 = {
      id: 'tax-2',
      name: 'Tech Cess 5%',
      rate: 5.00,
      description: 'Information technology state cess',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    this.taxes.push(tax1, tax2);

    // 7. Discounts
    const disc1 = {
      id: 'disc-1',
      code: 'STARTUP20',
      description: '20% off for verified early stage startups',
      type: 'PERCENTAGE',
      value: 20.00,
      minPurchaseAmount: 1000.00,
      minQuantity: 1,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      maxUsageCount: 100,
      currentUsageCount: 4,
      applicableTo: 'WHOLE_SUBSCRIPTION',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    const disc2 = {
      id: 'disc-2',
      code: 'FLAT500',
      description: 'Flat ₹500 discount on annual billing',
      type: 'FIXED_AMOUNT',
      value: 500.00,
      minPurchaseAmount: 5000.00,
      minQuantity: 1,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      maxUsageCount: 50,
      currentUsageCount: 1,
      applicableTo: 'WHOLE_SUBSCRIPTION',
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    this.discounts.push(disc1, disc2);

    // 8. Quotation Templates
    const qTemplate1 = {
      id: 'tmpl-1',
      name: 'Standard SaaS Onboarding Template',
      description: 'Default template with 1 ERP license and 1 SLA Support line',
      planId: plan1.id,
      validityDays: 30,
      isActive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      lines: [
        {
          id: 'tmpl-line-1',
          templateId: 'tmpl-1',
          productId: prod1.id,
          variantId: var2.id, // Odoo Brand
          quantity: 2,
          unitPrice: 1760.00,
        },
      ],
    };
    this.quotationTemplates.push(qTemplate1);

    // 9. Quotations
    const quote1 = {
      id: 'quo-1',
      quotationNumber: 'QUO-2026-0001',
      customerId: custProfile1.id,
      planId: plan1.id,
      status: 'CONFIRMED',
      validityDate: new Date('2026-03-31'),
      subtotal: 3520.00,
      taxAmount: 633.60,
      discountAmount: 704.00, // 20%
      totalAmount: 3449.60,
      notes: 'Initial quotation with Odoo Brand Edition',
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-15'),
    };
    this.quotations.push(quote1);

    // 10. Subscriptions
    const sub1 = {
      id: 'sub-1',
      subscriptionNumber: 'SUB-2026-0001',
      customerId: custProfile1.id,
      planId: plan1.id,
      quotationId: quote1.id,
      status: 'ACTIVE',
      startDate: new Date('2026-01-15'),
      expiryDate: new Date('2027-01-15'),
      billingFrequency: 'MONTHLY',
      nextBillingDate: new Date('2026-02-15'),
      autoClose: false,
      earlyClosureAllowed: true,
      pauseAllowed: true,
      renewalAllowed: true,
      paymentTerms: 'Net 15',
      subtotal: 3520.00,
      taxAmount: 633.60,
      discountAmount: 704.00,
      totalAmount: 3449.60,
      notes: 'Active monthly subscription with Odoo brand bundle',
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-15'),
    };

    const sub1Line = {
      id: 'subline-1',
      subscriptionId: sub1.id,
      productId: prod1.id,
      variantId: var2.id,
      description: 'Brightloop ERP Suite - Odoo Brand Edition',
      quantity: 2,
      unitPrice: 1760.00, // 1200 + 560
      taxId: tax1.id,
      taxAmount: 633.60,
      discountAmount: 704.00,
      total: 3449.60,
    };

    const sub2 = {
      id: 'sub-2',
      subscriptionNumber: 'SUB-2026-0002',
      customerId: custProfile2.id,
      planId: plan2.id,
      quotationId: null,
      status: 'ACTIVE',
      startDate: new Date('2026-01-01'),
      expiryDate: new Date('2027-01-01'),
      billingFrequency: 'YEARLY',
      nextBillingDate: new Date('2027-01-01'),
      autoClose: false,
      earlyClosureAllowed: false,
      pauseAllowed: true,
      renewalAllowed: true,
      paymentTerms: 'Net 30',
      subtotal: 12000.00,
      taxAmount: 2160.00,
      discountAmount: 500.00,
      totalAmount: 13660.00,
      notes: 'Yearly enterprise contract',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    this.subscriptions.push(sub1, sub2);
    this.subscriptionLines.push(sub1Line);

    // 11. Invoices
    const inv1 = {
      id: 'inv-1',
      invoiceNumber: 'INV-2026-0001',
      subscriptionId: sub1.id,
      customerId: custProfile1.id,
      status: 'PAID',
      invoiceDate: new Date('2026-01-15'),
      dueDate: new Date('2026-01-30'),
      billingPeriodStart: new Date('2026-01-15'),
      billingPeriodEnd: new Date('2026-02-14'),
      billingPeriodKey: `${sub1.subscriptionNumber}_2026-01-15`,
      subtotal: 3520.00,
      taxAmount: 633.60,
      discountAmount: 704.00,
      totalAmount: 3449.60,
      amountPaid: 3449.60,
      balance: 0.00,
      notes: 'January 2026 billing cycle - fully paid',
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-18'),
    };

    const inv2 = {
      id: 'inv-2',
      invoiceNumber: 'INV-2026-0002',
      subscriptionId: sub1.id,
      customerId: custProfile1.id,
      status: 'CONFIRMED',
      invoiceDate: new Date('2026-02-15'),
      dueDate: new Date('2026-03-02'),
      billingPeriodStart: new Date('2026-02-15'),
      billingPeriodEnd: new Date('2026-03-14'),
      billingPeriodKey: `${sub1.subscriptionNumber}_2026-02-15`,
      subtotal: 3520.00,
      taxAmount: 633.60,
      discountAmount: 704.00,
      totalAmount: 3449.60,
      amountPaid: 1000.00, // Partial payment
      balance: 2449.60,
      notes: 'February 2026 billing cycle - partially paid',
      createdAt: new Date('2026-02-15'),
      updatedAt: new Date('2026-02-20'),
    };

    const inv3 = {
      id: 'inv-3',
      invoiceNumber: 'INV-2026-0003',
      subscriptionId: sub2.id,
      customerId: custProfile2.id,
      status: 'CONFIRMED',
      invoiceDate: new Date('2026-01-01'),
      dueDate: new Date('2026-01-31'), // Overdue!
      billingPeriodStart: new Date('2026-01-01'),
      billingPeriodEnd: new Date('2026-12-31'),
      billingPeriodKey: `${sub2.subscriptionNumber}_2026-01-01`,
      subtotal: 12000.00,
      taxAmount: 2160.00,
      discountAmount: 500.00,
      totalAmount: 13660.00,
      amountPaid: 0.00,
      balance: 13660.00,
      notes: 'Annual invoice - currently overdue for collection',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    this.invoices.push(inv1, inv2, inv3);

    // 12. Payments
    const pay1 = {
      id: 'pay-1',
      paymentReference: 'PAY-2026-0001',
      invoiceId: inv1.id,
      customerId: custProfile1.id,
      amount: 3449.60,
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: new Date('2026-01-18'),
      notes: 'HDFC Bank NEFT Ref: N987654321',
      recordedByUserId: staffUser.id,
      createdAt: new Date('2026-01-18'),
      updatedAt: new Date('2026-01-18'),
    };

    const pay2 = {
      id: 'pay-2',
      paymentReference: 'PAY-2026-0002',
      invoiceId: inv2.id,
      customerId: custProfile1.id,
      amount: 1000.00,
      paymentMethod: 'UPI',
      paymentDate: new Date('2026-02-20'),
      notes: 'UPI Ref: 405123984712',
      recordedByUserId: adminUser.id,
      createdAt: new Date('2026-02-20'),
      updatedAt: new Date('2026-02-20'),
    };

    this.payments.push(pay1, pay2);
  }
}

export const inMemoryDB = new InMemoryDB();

// Database status checker: checks if Postgres connection is established
export let isPostgresConnected = false;

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await realPrisma.$queryRaw`SELECT 1`;
    isPostgresConnected = true;
    logger.info('Connected to PostgreSQL successfully.');
    return true;
  } catch (err: any) {
    isPostgresConnected = false;
    logger.warn('PostgreSQL is not reachable. Operating in resilient standalone In-Memory fallback mode.');
    return false;
  }
}

export const initDatabaseConnection = checkDatabaseConnection;

export function getIsPostgresConnected() {
  return isPostgresConnected;
}

// Universal database abstraction: uses real Prisma if connected, else uses inMemoryDB
export const db = {
  get isPostgres() {
    return isPostgresConnected;
  },

  get user() {
    return {
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.user.findUnique(args);
        if (args.where?.id) return inMemoryDB.users.find(u => u.id === args.where.id) || null;
        if (args.where?.email) return inMemoryDB.users.find(u => u.email.toLowerCase() === args.where.email.toLowerCase()) || null;
        return null;
      },
      findFirst: async (args: any) => {
        if (isPostgresConnected) return realPrisma.user.findFirst(args);
        return inMemoryDB.users[0] || null;
      },
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.user.findMany(args);
        let list = [...inMemoryDB.users];
        if (args.where?.role) list = list.filter(u => u.role === args.where.role);
        if (args.where?.isActive !== undefined) list = list.filter(u => u.isActive === args.where.isActive);
        return list;
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.user.create(args);
        const record = {
          id: args.data.id || `usr-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDB.users.push(record);
        return record;
      },
      update: async (args: any) => {
        if (isPostgresConnected) return realPrisma.user.update(args);
        const idx = inMemoryDB.users.findIndex(u => u.id === args.where.id);
        if (idx !== -1) {
          inMemoryDB.users[idx] = { ...inMemoryDB.users[idx], ...args.data, updatedAt: new Date() };
          return inMemoryDB.users[idx];
        }
        return null;
      },
      count: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.user.count(args);
        let list = [...inMemoryDB.users];
        if (args.where?.role) list = list.filter(u => u.role === args.where.role);
        return list.length;
      },
    };
  },

  get customerProfile() {
    return {
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.customerProfile.findUnique(args);
        if (args.where?.id) {
          const prof = inMemoryDB.customerProfiles.find(p => p.id === args.where.id);
          if (prof && args.include?.user) {
            prof.user = inMemoryDB.users.find(u => u.id === prof.userId);
          }
          return prof || null;
        }
        if (args.where?.userId) {
          const prof = inMemoryDB.customerProfiles.find(p => p.userId === args.where.userId);
          if (prof && args.include?.user) {
            prof.user = inMemoryDB.users.find(u => u.id === prof.userId);
          }
          return prof || null;
        }
        return null;
      },
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.customerProfile.findMany(args);
        return inMemoryDB.customerProfiles.map(p => ({
          ...p,
          user: inMemoryDB.users.find(u => u.id === p.userId),
        }));
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.customerProfile.create(args);
        const record = {
          id: args.data.id || `prof-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDB.customerProfiles.push(record);
        return record;
      },
      update: async (args: any) => {
        if (isPostgresConnected) return realPrisma.customerProfile.update(args);
        const idx = inMemoryDB.customerProfiles.findIndex(p => p.id === args.where.id || p.userId === args.where.userId);
        if (idx !== -1) {
          inMemoryDB.customerProfiles[idx] = { ...inMemoryDB.customerProfiles[idx], ...args.data, updatedAt: new Date() };
          return inMemoryDB.customerProfiles[idx];
        }
        return null;
      },
      count: async () => {
        if (isPostgresConnected) return realPrisma.customerProfile.count();
        return inMemoryDB.customerProfiles.length;
      },
    };
  },

  get product() {
    return {
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.product.findMany(args);
        let list = [...inMemoryDB.products];
        if (args.where?.isActive !== undefined) list = list.filter(p => p.isActive === args.where.isActive);
        return list.map(p => ({
          ...p,
          variants: inMemoryDB.productVariants.filter(v => v.productId === p.id),
        }));
      },
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.product.findUnique(args);
        const prod = inMemoryDB.products.find(p => p.id === args.where.id);
        if (!prod) return null;
        return {
          ...prod,
          variants: inMemoryDB.productVariants.filter(v => v.productId === prod.id),
        };
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.product.create(args);
        const record = {
          id: args.data.id || `prod-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDB.products.push(record);
        return record;
      },
      update: async (args: any) => {
        if (isPostgresConnected) return realPrisma.product.update(args);
        const idx = inMemoryDB.products.findIndex(p => p.id === args.where.id);
        if (idx !== -1) {
          inMemoryDB.products[idx] = { ...inMemoryDB.products[idx], ...args.data, updatedAt: new Date() };
          return inMemoryDB.products[idx];
        }
        return null;
      },
      delete: async (args: any) => {
        if (isPostgresConnected) return realPrisma.product.delete(args);
        const idx = inMemoryDB.products.findIndex(p => p.id === args.where.id);
        if (idx !== -1) {
          const deleted = inMemoryDB.products.splice(idx, 1)[0];
          return deleted;
        }
        return null;
      },
    };
  },

  get productVariant() {
    return {
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.productVariant.findMany(args);
        let list = [...inMemoryDB.productVariants];
        if (args.where?.productId) list = list.filter(v => v.productId === args.where.productId);
        return list;
      },
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.productVariant.findUnique(args);
        return inMemoryDB.productVariants.find(v => v.id === args.where.id) || null;
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.productVariant.create(args);
        const record = {
          id: args.data.id || `var-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDB.productVariants.push(record);
        return record;
      },
      update: async (args: any) => {
        if (isPostgresConnected) return realPrisma.productVariant.update(args);
        const idx = inMemoryDB.productVariants.findIndex(v => v.id === args.where.id);
        if (idx !== -1) {
          inMemoryDB.productVariants[idx] = { ...inMemoryDB.productVariants[idx], ...args.data, updatedAt: new Date() };
          return inMemoryDB.productVariants[idx];
        }
        return null;
      },
      delete: async (args: any) => {
        if (isPostgresConnected) return realPrisma.productVariant.delete(args);
        const idx = inMemoryDB.productVariants.findIndex(v => v.id === args.where.id);
        if (idx !== -1) {
          return inMemoryDB.productVariants.splice(idx, 1)[0];
        }
        return null;
      },
    };
  },

  get subscriptionPlan() {
    return {
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.subscriptionPlan.findMany(args);
        let list = [...inMemoryDB.subscriptionPlans];
        if (args.where?.isActive !== undefined) list = list.filter(p => p.isActive === args.where.isActive);
        return list.map(p => ({
          ...p,
          product: inMemoryDB.products.find(prod => prod.id === p.productId),
        }));
      },
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.subscriptionPlan.findUnique(args);
        const plan = inMemoryDB.subscriptionPlans.find(p => p.id === args.where.id);
        if (!plan) return null;
        return {
          ...plan,
          product: inMemoryDB.products.find(prod => prod.id === plan.productId),
        };
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.subscriptionPlan.create(args);
        const record = {
          id: args.data.id || `plan-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDB.subscriptionPlans.push(record);
        return record;
      },
      update: async (args: any) => {
        if (isPostgresConnected) return realPrisma.subscriptionPlan.update(args);
        const idx = inMemoryDB.subscriptionPlans.findIndex(p => p.id === args.where.id);
        if (idx !== -1) {
          inMemoryDB.subscriptionPlans[idx] = { ...inMemoryDB.subscriptionPlans[idx], ...args.data, updatedAt: new Date() };
          return inMemoryDB.subscriptionPlans[idx];
        }
        return null;
      },
    };
  },

  get tax() {
    return {
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.tax.findMany(args);
        let list = [...inMemoryDB.taxes];
        if (args.where?.isActive !== undefined) list = list.filter(t => t.isActive === args.where.isActive);
        return list;
      },
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.tax.findUnique(args);
        return inMemoryDB.taxes.find(t => t.id === args.where.id) || null;
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.tax.create(args);
        const record = {
          id: args.data.id || `tax-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDB.taxes.push(record);
        return record;
      },
      update: async (args: any) => {
        if (isPostgresConnected) return realPrisma.tax.update(args);
        const idx = inMemoryDB.taxes.findIndex(t => t.id === args.where.id);
        if (idx !== -1) {
          inMemoryDB.taxes[idx] = { ...inMemoryDB.taxes[idx], ...args.data, updatedAt: new Date() };
          return inMemoryDB.taxes[idx];
        }
        return null;
      },
    };
  },

  get discount() {
    return {
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.discount.findMany(args);
        let list = [...inMemoryDB.discounts];
        if (args.where?.isActive !== undefined) list = list.filter(d => d.isActive === args.where.isActive);
        return list;
      },
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.discount.findUnique(args);
        if (args.where?.id) return inMemoryDB.discounts.find(d => d.id === args.where.id) || null;
        if (args.where?.code) return inMemoryDB.discounts.find(d => d.code.toUpperCase() === args.where.code.toUpperCase()) || null;
        return null;
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.discount.create(args);
        const record = {
          id: args.data.id || `disc-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDB.discounts.push(record);
        return record;
      },
      update: async (args: any) => {
        if (isPostgresConnected) return realPrisma.discount.update(args);
        const idx = inMemoryDB.discounts.findIndex(d => d.id === args.where.id);
        if (idx !== -1) {
          inMemoryDB.discounts[idx] = { ...inMemoryDB.discounts[idx], ...args.data, updatedAt: new Date() };
          return inMemoryDB.discounts[idx];
        }
        return null;
      },
    };
  },

  get quotationTemplate() {
    return {
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.quotationTemplate.findMany(args);
        return inMemoryDB.quotationTemplates.map(t => ({
          ...t,
          plan: inMemoryDB.subscriptionPlans.find(p => p.id === t.planId),
        }));
      },
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.quotationTemplate.findUnique(args);
        const tmpl = inMemoryDB.quotationTemplates.find(t => t.id === args.where.id);
        if (!tmpl) return null;
        return {
          ...tmpl,
          plan: inMemoryDB.subscriptionPlans.find(p => p.id === tmpl.planId),
        };
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.quotationTemplate.create(args);
        const record = {
          id: args.data.id || `tmpl-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDB.quotationTemplates.push(record);
        return record;
      },
      update: async (args: any) => {
        if (isPostgresConnected) return realPrisma.quotationTemplate.update(args);
        const idx = inMemoryDB.quotationTemplates.findIndex(t => t.id === args.where.id);
        if (idx !== -1) {
          inMemoryDB.quotationTemplates[idx] = { ...inMemoryDB.quotationTemplates[idx], ...args.data, updatedAt: new Date() };
          return inMemoryDB.quotationTemplates[idx];
        }
        return null;
      },
    };
  },

  get quotation() {
    return {
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.quotation.findMany(args);
        let list = [...inMemoryDB.quotations];
        if (args.where?.customerId) list = list.filter(q => q.customerId === args.where.customerId);
        if (args.where?.status) list = list.filter(q => q.status === args.where.status);
        return list.map(q => ({
          ...q,
          customer: inMemoryDB.customerProfiles.find(c => c.id === q.customerId),
          plan: inMemoryDB.subscriptionPlans.find(p => p.id === q.planId),
        }));
      },
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.quotation.findUnique(args);
        const quo = inMemoryDB.quotations.find(q => q.id === args.where.id || q.quotationNumber === args.where.quotationNumber);
        if (!quo) return null;
        return {
          ...quo,
          customer: inMemoryDB.customerProfiles.find(c => c.id === quo.customerId),
          plan: inMemoryDB.subscriptionPlans.find(p => p.id === quo.planId),
          lines: inMemoryDB.quotationLines.filter(l => l.quotationId === quo.id),
        };
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.quotation.create(args);
        const record = {
          id: args.data.id || `quo-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDB.quotations.push(record);
        return record;
      },
      update: async (args: any) => {
        if (isPostgresConnected) return realPrisma.quotation.update(args);
        const idx = inMemoryDB.quotations.findIndex(q => q.id === args.where.id);
        if (idx !== -1) {
          inMemoryDB.quotations[idx] = { ...inMemoryDB.quotations[idx], ...args.data, updatedAt: new Date() };
          return inMemoryDB.quotations[idx];
        }
        return null;
      },
    };
  },

  get subscription() {
    return {
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.subscription.findMany(args);
        let list = [...inMemoryDB.subscriptions];
        if (args.where?.customerId) list = list.filter(s => s.customerId === args.where.customerId);
        if (args.where?.status) list = list.filter(s => s.status === args.where.status);
        return list.map(s => ({
          ...s,
          customer: inMemoryDB.customerProfiles.find(c => c.id === s.customerId),
          plan: inMemoryDB.subscriptionPlans.find(p => p.id === s.planId),
          lines: inMemoryDB.subscriptionLines.filter(l => l.subscriptionId === s.id),
        }));
      },
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.subscription.findUnique(args);
        const sub = inMemoryDB.subscriptions.find(s => s.id === args.where.id || s.subscriptionNumber === args.where.subscriptionNumber);
        if (!sub) return null;
        return {
          ...sub,
          customer: inMemoryDB.customerProfiles.find(c => c.id === sub.customerId),
          plan: inMemoryDB.subscriptionPlans.find(p => p.id === sub.planId),
          lines: inMemoryDB.subscriptionLines.filter(l => l.subscriptionId === sub.id),
          statusHistory: inMemoryDB.subscriptionStatusHistories.filter(h => h.subscriptionId === sub.id),
          invoices: inMemoryDB.invoices.filter(i => i.subscriptionId === sub.id),
        };
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.subscription.create(args);
        const record = {
          id: args.data.id || `sub-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDB.subscriptions.push(record);
        return record;
      },
      update: async (args: any) => {
        if (isPostgresConnected) return realPrisma.subscription.update(args);
        const idx = inMemoryDB.subscriptions.findIndex(s => s.id === args.where.id);
        if (idx !== -1) {
          inMemoryDB.subscriptions[idx] = { ...inMemoryDB.subscriptions[idx], ...args.data, updatedAt: new Date() };
          return inMemoryDB.subscriptions[idx];
        }
        return null;
      },
      count: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.subscription.count(args);
        let list = [...inMemoryDB.subscriptions];
        if (args.where?.status) list = list.filter(s => s.status === args.where.status);
        return list.length;
      },
    };
  },

  get subscriptionLine() {
    return {
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.subscriptionLine.create(args);
        const record = {
          id: args.data.id || `subline-${Date.now()}-${Math.random()}`,
          ...args.data,
        };
        inMemoryDB.subscriptionLines.push(record);
        return record;
      },
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.subscriptionLine.findMany(args);
        let list = [...inMemoryDB.subscriptionLines];
        if (args.where?.subscriptionId) list = list.filter(l => l.subscriptionId === args.where.subscriptionId);
        return list;
      },
    };
  },

  get subscriptionStatusHistory() {
    return {
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.subscriptionStatusHistory.create(args);
        const record = {
          id: args.data.id || `hist-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
        };
        inMemoryDB.subscriptionStatusHistories.push(record);
        return record;
      },
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.subscriptionStatusHistory.findMany(args);
        let list = [...inMemoryDB.subscriptionStatusHistories];
        if (args.where?.subscriptionId) list = list.filter(h => h.subscriptionId === args.where.subscriptionId);
        return list;
      },
    };
  },

  get invoice() {
    return {
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.invoice.findMany(args);
        let list = [...inMemoryDB.invoices];
        if (args.where?.customerId) list = list.filter(i => i.customerId === args.where.customerId);
        if (args.where?.subscriptionId) list = list.filter(i => i.subscriptionId === args.where.subscriptionId);
        if (args.where?.status) list = list.filter(i => i.status === args.where.status);
        return list.map(inv => ({
          ...inv,
          customer: inMemoryDB.customerProfiles.find(c => c.id === inv.customerId),
          subscription: inMemoryDB.subscriptions.find(s => s.id === inv.subscriptionId),
          lines: inMemoryDB.invoiceLines.filter(l => l.invoiceId === inv.id),
          payments: inMemoryDB.payments.filter(p => p.invoiceId === inv.id),
        }));
      },
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.invoice.findUnique(args);
        const inv = inMemoryDB.invoices.find(i => i.id === args.where.id || i.invoiceNumber === args.where.invoiceNumber || (args.where.billingPeriodKey && i.billingPeriodKey === args.where.billingPeriodKey));
        if (!inv) return null;
        return {
          ...inv,
          customer: inMemoryDB.customerProfiles.find(c => c.id === inv.customerId),
          subscription: inMemoryDB.subscriptions.find(s => s.id === inv.subscriptionId),
          lines: inMemoryDB.invoiceLines.filter(l => l.invoiceId === inv.id),
          payments: inMemoryDB.payments.filter(p => p.invoiceId === inv.id),
        };
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.invoice.create(args);
        // Duplicate billing protection
        if (args.data.billingPeriodKey) {
          const exists = inMemoryDB.invoices.some(i => i.billingPeriodKey === args.data.billingPeriodKey);
          if (exists) {
            throw new Error(`Duplicate invoice rejected: billingPeriodKey ${args.data.billingPeriodKey} already billed.`);
          }
        }
        const record = {
          id: args.data.id || `inv-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDB.invoices.push(record);
        return record;
      },
      update: async (args: any) => {
        if (isPostgresConnected) return realPrisma.invoice.update(args);
        const idx = inMemoryDB.invoices.findIndex(i => i.id === args.where.id);
        if (idx !== -1) {
          inMemoryDB.invoices[idx] = { ...inMemoryDB.invoices[idx], ...args.data, updatedAt: new Date() };
          return inMemoryDB.invoices[idx];
        }
        return null;
      },
      count: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.invoice.count(args);
        let list = [...inMemoryDB.invoices];
        if (args.where?.status) list = list.filter(i => i.status === args.where.status);
        return list.length;
      },
    };
  },

  get invoiceLine() {
    return {
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.invoiceLine.create(args);
        const record = {
          id: args.data.id || `invline-${Date.now()}-${Math.random()}`,
          ...args.data,
        };
        inMemoryDB.invoiceLines.push(record);
        return record;
      },
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.invoiceLine.findMany(args);
        let list = [...inMemoryDB.invoiceLines];
        if (args.where?.invoiceId) list = list.filter(l => l.invoiceId === args.where.invoiceId);
        return list;
      },
    };
  },

  get payment() {
    return {
      findMany: async (args: any = {}) => {
        if (isPostgresConnected) return realPrisma.payment.findMany(args);
        let list = [...inMemoryDB.payments];
        if (args.where?.customerId) list = list.filter(p => p.customerId === args.where.customerId);
        if (args.where?.invoiceId) list = list.filter(p => p.invoiceId === args.where.invoiceId);
        return list.map(pay => ({
          ...pay,
          invoice: inMemoryDB.invoices.find(i => i.id === pay.invoiceId),
          customer: inMemoryDB.customerProfiles.find(c => c.id === pay.customerId),
        }));
      },
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.payment.findUnique(args);
        const pay = inMemoryDB.payments.find(p => p.id === args.where.id || p.paymentReference === args.where.paymentReference);
        if (!pay) return null;
        return {
          ...pay,
          invoice: inMemoryDB.invoices.find(i => i.id === pay.invoiceId),
          customer: inMemoryDB.customerProfiles.find(c => c.id === pay.customerId),
        };
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.payment.create(args);
        const record = {
          id: args.data.id || `pay-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        inMemoryDB.payments.push(record);
        return record;
      },
      count: async () => {
        if (isPostgresConnected) return realPrisma.payment.count();
        return inMemoryDB.payments.length;
      },
    };
  },

  get passwordResetToken() {
    return {
      findUnique: async (args: any) => {
        if (isPostgresConnected) return realPrisma.passwordResetToken.findUnique(args);
        return inMemoryDB.resetTokens.find(t => t.token === args.where.token) || null;
      },
      create: async (args: any) => {
        if (isPostgresConnected) return realPrisma.passwordResetToken.create(args);
        const record = {
          id: args.data.id || `tok-${Date.now()}`,
          ...args.data,
          createdAt: new Date(),
        };
        inMemoryDB.resetTokens.push(record);
        return record;
      },
      update: async (args: any) => {
        if (isPostgresConnected) return realPrisma.passwordResetToken.update(args);
        const idx = inMemoryDB.resetTokens.findIndex(t => t.id === args.where.id);
        if (idx !== -1) {
          inMemoryDB.resetTokens[idx] = { ...inMemoryDB.resetTokens[idx], ...args.data };
          return inMemoryDB.resetTokens[idx];
        }
        return null;
      },
    };
  },

  async $transaction(callback: (tx: any) => Promise<any>) {
    if (isPostgresConnected) {
      return realPrisma.$transaction(callback);
    }
    return callback(this);
  },
};
