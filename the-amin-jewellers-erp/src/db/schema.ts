import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, numeric } from 'drizzle-orm/pg-core';

// Users table (using Firebase UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('user'),
  shopName: text('shop_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Gold Rates table
export const goldRates = pgTable('gold_rates', {
  id: serial('id').primaryKey(),
  karat: text('karat').notNull().unique(),
  rate: numeric('rate', { precision: 12, scale: 2 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Stock Items table
export const stockItems = pgTable('stock_items', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  nameBangla: text('name_bangla').notNull(),
  nameEnglish: text('name_english'),
  category: text('category').notNull(),
  karat: text('karat').notNull(),
  weight: numeric('weight', { precision: 12, scale: 3 }).notNull(),
  vori: integer('vori').default(0),
  ana: integer('ana').default(0),
  roti: integer('roti').default(0),
  point: integer('point').default(0),
  count: integer('count').default(1),
  minLimit: integer('min_limit').default(0),
  makingCharge: numeric('making_charge', { precision: 12, scale: 2 }),
  status: text('status').default('available'), // available, booked, sold
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Mortgages table
export const mortgages = pgTable('mortgages', {
  id: serial('id').primaryKey(),
  receiptNo: text('receipt_no').notNull().unique(),
  customerName: text('customer_name').notNull(),
  customerMobile: text('customer_mobile'),
  customerAddress: text('customer_address'),
  itemName: text('item_name').notNull(),
  itemPhoto: text('item_photo'),
  karat: text('karat').notNull(),
  weight: numeric('weight', { precision: 12, scale: 3 }).notNull(),
  vori: integer('vori').default(0),
  ana: integer('ana').default(0),
  roti: integer('roti').default(0),
  point: integer('point').default(0),
  principalAmount: numeric('principal_amount', { precision: 15, scale: 2 }).notNull(),
  interestRate: numeric('interest_rate', { precision: 5, scale: 2 }).notNull(),
  collectedInterest: numeric('collected_interest', { precision: 15, scale: 2 }).default('0'),
  monthsCount: integer('months_count').default(1),
  startDate: text('start_date').notNull(),
  expiryDate: text('expiry_date'),
  status: text('status').default('active'), // active, redeemed, expired
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Artisans table
export const artisans = pgTable('artisans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  mobile: text('mobile').notNull(),
  specialty: text('specialty'),
  goldBalance: numeric('gold_balance', { precision: 12, scale: 3 }).default('0'),
  wageBalance: numeric('wage_balance', { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Artisan Jobs table
export const artisanJobs = pgTable('artisan_jobs', {
  id: serial('id').primaryKey(),
  artisanId: integer('artisan_id').references(() => artisans.id).notNull(),
  itemName: text('item_name').notNull(),
  karat: text('karat').notNull(),
  givenWeight: numeric('given_weight', { precision: 12, scale: 3 }).notNull(),
  returnedWeight: numeric('returned_weight', { precision: 12, scale: 3 }),
  wastage: numeric('wastage', { precision: 12, scale: 3 }),
  wage: numeric('wage', { precision: 15, scale: 2 }).notNull(),
  paidWage: numeric('paid_wage', { precision: 15, scale: 2 }).default('0'),
  voucherNo: text('voucher_no'),
  date: text('date').notNull(),
  completedDate: text('completed_date'),
  status: text('status').default('pending'), // pending, completed
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const artisansRelations = relations(artisans, ({ many }) => ({
  jobs: many(artisanJobs),
}));

export const artisanJobsRelations = relations(artisanJobs, ({ one }) => ({
  artisan: one(artisans, {
    fields: [artisanJobs.artisanId],
    references: [artisans.id],
  }),
}));
