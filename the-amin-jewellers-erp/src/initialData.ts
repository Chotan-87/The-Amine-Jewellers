import { Mortgage, StockItem, Artisan, OldGoldPurchase } from './types';

export const initialOldGoldPurchases: OldGoldPurchase[] = [
  {
    id: 'OG-101',
    voucherNo: 'OG-2026-101',
    date: '2026-08-12',
    sellerName: 'মোহাম্মদ আলী',
    sellerMobile: '01819001122',
    sellerAddress: 'বন্দরটিলা, চট্টগ্রাম',
    sellerNid: '19881512345678901',
    karat: '21 Carat Gold',
    itemName: 'পুরাতন চেইন ও আংটি',
    grossWeight: 14.200,
    traditionalWeight: { vori: 1, ana: 3, roti: 2, point: 0 },
    wasteDeductionPct: 5,
    netWeight: 13.490,
    ratePerVori: 125000,
    totalPrice: 144531,
    paymentMethod: 'নগদ (Cash)',
    notes: 'জাতীয় পরিচয়পত্র এনআইডি ফটোকপি সংরক্ষিত'
  }
];

const defaultJewelryImage = "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=300&auto=format&fit=crop&q=80";

export const initialMortgages: Mortgage[] = [
  {
    id: '850',
    receiptNo: '850',
    customerName: 'সুমাইয়া আক্তার',
    customerMobile: '০১৮০৪৬৮৯৪৮৮',
    customerAddress: 'বন্দরটিলা',
    karat: '21',
    itemName: 'দুল এক জোড়া',
    weight: 13.851,
    traditionalWeight: { vori: 1, ana: 3, roti: 0, point: 0 },
    principalAmount: 12000,
    interestRate: 3,
    collectedInterest: 0,
    monthsCount: 1,
    itemPhoto: defaultJewelryImage,
    startDate: '2026-08-11',
    expiryDate: '2027-02-11',
    status: 'active'
  },
  {
    id: '852',
    receiptNo: 'LN-2026-852',
    customerName: 'হাছিনা বেগম',
    customerMobile: '01700000000',
    customerAddress: 'N/A',
    karat: '22K',
    itemName: 'দুল রিং এক জোড়া',
    weight: 13.486,
    traditionalWeight: { vori: 1, ana: 2, roti: 3, point: 0 },
    principalAmount: 6000,
    interestRate: 2,
    collectedInterest: 0,
    monthsCount: 1,
    itemPhoto: defaultJewelryImage,
    startDate: '2026-08-12',
    expiryDate: '2027-02-12',
    status: 'active'
  },
  {
    id: '853',
    receiptNo: 'LN-2026-853',
    customerName: 'নাজমা আক্তার',
    customerMobile: '০১৮২৪১৫৫২৪২',
    customerAddress: 'N/A',
    karat: '22K',
    itemName: 'আংটি একটি',
    weight: 13.486,
    traditionalWeight: { vori: 1, ana: 2, roti: 3, point: 0 },
    principalAmount: 13000,
    interestRate: 2,
    collectedInterest: 0,
    monthsCount: 1,
    itemPhoto: defaultJewelryImage,
    startDate: '2026-08-12',
    expiryDate: '2027-02-12',
    status: 'active'
  },
  {
    id: '854',
    receiptNo: '854',
    customerName: 'শিরিন আক্তার',
    customerMobile: '০১৮৭৯৯৪২৭০৬',
    customerAddress: 'N/A',
    karat: '22K',
    itemName: 'সুই সুতা এক জোড়া',
    weight: 13.122,
    traditionalWeight: { vori: 1, ana: 2, roti: 0, point: 0 },
    principalAmount: 3000,
    interestRate: 2,
    collectedInterest: 0,
    monthsCount: 1,
    itemPhoto: defaultJewelryImage,
    startDate: '2026-08-12',
    expiryDate: '2027-02-12',
    status: 'active'
  },
  {
    id: '778',
    receiptNo: '৭৭৮',
    customerName: 'জিনু আপা',
    customerMobile: '01700000000',
    customerAddress: 'N/A',
    karat: '22K',
    itemName: 'চেইন ১টি',
    weight: 11.664,
    traditionalWeight: { vori: 1, ana: 0, roti: 0, point: 0 },
    principalAmount: 30,
    interestRate: 2,
    collectedInterest: 0,
    monthsCount: 1,
    itemPhoto: defaultJewelryImage,
    startDate: '2026-08-14',
    expiryDate: '2027-02-12',
    status: 'active'
  }
];

export const initialStockItems: StockItem[] = [
  {
    id: 's1',
    code: 'AM-RG-101',
    nameBangla: '২২ক সোনার ডায়মন্ড কাট আংটি',
    nameEnglish: '22K Gold Ring',
    category: 'ring',
    karat: '22 Carat Gold',
    weight: 11.664,
    traditionalWeight: { vori: 1, ana: 0, roti: 0, point: 0 },
    count: 1,
    minLimit: 5,
    makingCharge: 2500,
    status: 'available'
  },
  {
    id: 's2',
    code: 'AM-NK-202',
    nameBangla: '২১ক গোল্ডেন ব্রাইডাল নেকলেস',
    nameEnglish: '21K Bridal Necklace',
    category: 'necklace',
    karat: '21 Carat Gold',
    weight: 23.328,
    traditionalWeight: { vori: 2, ana: 0, roti: 0, point: 0 },
    count: 1,
    minLimit: 2,
    makingCharge: 5000,
    status: 'available'
  }
];

export const initialArtisans: Artisan[] = [
  {
    id: 'A1',
    name: 'বিপ্লব কর্মকার',
    mobile: '018XXXXXXXX',
    specialty: 'আংটি ও নেকলেস',
    goldBalance: 23.328,
    wageBalance: 5000
  }
];
