import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Brightloop database seeding...');

  // 1. Clean existing records safely in order
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.invoiceLine.deleteMany().catch(() => {});
  await prisma.invoice.deleteMany().catch(() => {});
  await prisma.subscriptionStatusHistory.deleteMany().catch(() => {});
  await prisma.subscriptionLine.deleteMany().catch(() => {});
  await prisma.subscription.deleteMany().catch(() => {});
  await prisma.quotationLine.deleteMany().catch(() => {});
  await prisma.quotation.deleteMany().catch(() => {});
  await prisma.quotationTemplateLine.deleteMany().catch(() => {});
  await prisma.quotationTemplate.deleteMany().catch(() => {});
  await prisma.discountUsage.deleteMany().catch(() => {});
  await prisma.discountProduct.deleteMany().catch(() => {});
  await prisma.discount.deleteMany().catch(() => {});
  await prisma.planProduct.deleteMany().catch(() => {});
  await prisma.subscriptionPlan.deleteMany().catch(() => {});
  await prisma.tax.deleteMany().catch(() => {});
  await prisma.productVariant.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.passwordResetToken.deleteMany().catch(() => {});
  await prisma.customerProfile.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  // 2. Passwords
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@12345', salt);
  const staffPasswordHash = await bcrypt.hash('Staff@12345', salt);
  const customerPasswordHash = await bcrypt.hash('Customer@12345', salt);

  // 3. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@brightloop.io',
      name: 'Sarah Connor',
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
      phone: '+91 98765 43210',
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@brightloop.io',
      name: 'Alex Vance',
      role: 'STAFF',
      passwordHash: staffPasswordHash,
      phone: '+91 98765 43211',
    },
  });

  const customerUser1 = await prisma.user.create({
    data: {
      email: 'customer@acme.com',
      name: 'Bruce Wayne',
      role: 'CUSTOMER',
      passwordHash: customerPasswordHash,
      phone: '+91 98765 43212',
    },
  });

  const customerUser2 = await prisma.user.create({
    data: {
      email: 'david@globex.org',
      name: 'David Banner',
      role: 'CUSTOMER',
      passwordHash: customerPasswordHash,
      phone: '+91 98765 43213',
    },
  });

  console.log('✅ Created demo Users (Admin, Staff, Customers)');

  // 4. Customer Profiles
  const profile1 = await prisma.customerProfile.create({
    data: {
      userId: customerUser1.id,
      companyName: 'Acme Software Labs Pvt Ltd',
      address: '100 Tech Park, Outer Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560103',
      country: 'India',
      taxId: '29ABCDE1234F1Z5',
      notes: 'Strategic Enterprise Customer',
    },
  });

  const profile2 = await prisma.customerProfile.create({
    data: {
      userId: customerUser2.id,
      companyName: 'Globex Media Corp',
      address: '42 Marine Drive',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400020',
      country: 'India',
      taxId: '27ABCDE5678F1Z9',
      notes: 'Quarterly client with multiple subscriptions',
    },
  });

  // 5. Products & Variants (including Odoo Brand +560)
  const product1 = await prisma.product.create({
    data: {
      name: 'Brightloop ERP Suite',
      type: 'SOFTWARE',
      salesPrice: 1200.00,
      costPrice: 400.00,
      notes: 'Unified ERP solution for inventory, accounting, and sales',
      variants: {
        create: [
          { name: 'Standard Edition', priceModifier: 0.00, sku: 'BL-ERP-STD' },
          { name: 'Odoo Brand Edition', priceModifier: 560.00, sku: 'BL-ERP-ODOO' }, // +560
          { name: 'Enterprise Cloud', priceModifier: 1200.00, sku: 'BL-ERP-ENT' },
        ],
      },
    },
    include: { variants: true },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Brightloop CRM Pro',
      type: 'SOFTWARE',
      salesPrice: 800.00,
      costPrice: 250.00,
      notes: 'Pipeline & deal tracking',
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Priority 24/7 SLA Support',
      type: 'SERVICE',
      salesPrice: 500.00,
      costPrice: 150.00,
      notes: 'High-touch SLA support',
    },
  });

  console.log('✅ Created Products and Variants (with +560 Odoo Brand)');

  // 6. Subscription Plans
  const plan1 = await prisma.subscriptionPlan.create({
    data: {
      name: 'Monthly Professional Plan',
      description: 'Monthly recurring plan with early closure & pause enabled',
      productId: product1.id,
      billingFrequency: 'MONTHLY',
      minQuantity: 1,
      basePrice: 1200.00,
      autoClose: false,
      earlyClosureAllowed: true,
      pauseAllowed: true,
      renewalAllowed: true,
    },
  });

  const plan2 = await prisma.subscriptionPlan.create({
    data: {
      name: 'Annual Enterprise Plan',
      description: 'Annual enterprise package with volume discount',
      productId: product1.id,
      billingFrequency: 'YEARLY',
      minQuantity: 5,
      basePrice: 12000.00,
      autoClose: false,
      earlyClosureAllowed: false,
      pauseAllowed: true,
      renewalAllowed: true,
    },
  });

  // 7. Taxes
  const tax18 = await prisma.tax.create({
    data: {
      name: 'GST 18%',
      rate: 18.00,
      description: 'Goods and Services Tax',
      isActive: true,
    },
  });

  // 8. Discounts
  const discStartup = await prisma.discount.create({
    data: {
      code: 'STARTUP20',
      description: '20% off for verified startups',
      type: 'PERCENTAGE',
      value: 20.00,
      minPurchaseAmount: 1000.00,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      maxUsageCount: 100,
      currentUsageCount: 1,
      applicableTo: 'WHOLE_SUBSCRIPTION',
    },
  });

  // 9. Subscriptions, Invoices, Payments
  const sub1 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0001',
      customerId: profile1.id,
      planId: plan1.id,
      status: 'ACTIVE',
      startDate: new Date('2026-01-15'),
      expiryDate: new Date('2027-01-15'),
      billingFrequency: 'MONTHLY',
      nextBillingDate: new Date('2026-02-15'),
      subtotal: 3520.00,
      taxAmount: 633.60,
      discountAmount: 704.00,
      totalAmount: 3449.60,
      lines: {
        create: [
          {
            productId: product1.id,
            variantId: product1.variants[1].id, // Odoo Brand
            description: 'Brightloop ERP Suite (Odoo Brand Edition)',
            quantity: 2,
            unitPrice: 1760.00,
            taxId: tax18.id,
            taxAmount: 633.60,
            discountAmount: 704.00,
            total: 3449.60,
          },
        ],
      },
    },
  });

  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0001',
      subscriptionId: sub1.id,
      customerId: profile1.id,
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
      lines: {
        create: [
          {
            productId: product1.id,
            description: 'Brightloop ERP Suite (Odoo Brand Edition) - Month 1',
            quantity: 2,
            unitPrice: 1760.00,
            taxId: tax18.id,
            taxAmount: 633.60,
            discountAmount: 704.00,
            total: 3449.60,
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      paymentReference: 'PAY-2026-0001',
      invoiceId: inv1.id,
      customerId: profile1.id,
      amount: 3449.60,
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: new Date('2026-01-18'),
      notes: 'NEFT Transfer HDFC49817264',
      recordedByUserId: staffUser.id,
    },
  });

  console.log('✅ Seeded demo subscriptions, invoices, and payments.');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
