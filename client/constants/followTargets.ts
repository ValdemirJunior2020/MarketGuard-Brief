export type FollowCategory =
  | 'Government'
  | 'Central Banks'
  | 'Regulators'
  | 'CEOs'
  | 'Economic Agencies'
  | 'Custom Keywords';

export type FollowTarget = {
  id: string;
  name: string;
  category: FollowCategory;
  description: string;
  defaultSelected?: boolean;
};

export const DEFAULT_TARGETS: FollowTarget[] = [
  { id: 'us-president', name: 'U.S. President', category: 'Government', description: 'Public remarks, policy comments, and official statements.', defaultSelected: true },
  { id: 'federal-reserve-chair', name: 'Federal Reserve Chair', category: 'Central Banks', description: 'Comments that may affect rate expectations.', defaultSelected: true },
  { id: 'us-treasury-secretary', name: 'U.S. Treasury Secretary', category: 'Government', description: 'Fiscal, debt, banking, and bond market remarks.', defaultSelected: true },
  { id: 'sec-chair', name: 'SEC Chair', category: 'Regulators', description: 'Securities, crypto, fintech, and market structure announcements.', defaultSelected: true },
  { id: 'cftc-chair', name: 'CFTC Chair', category: 'Regulators', description: 'Derivatives, commodities, and crypto-related remarks.' },
  { id: 'european-central-bank', name: 'European Central Bank', category: 'Central Banks', description: 'Euro-area monetary policy and inflation remarks.' },
  { id: 'bank-of-england', name: 'Bank of England', category: 'Central Banks', description: 'U.K. rate, inflation, and stability comments.' },
  { id: 'bank-of-japan', name: 'Bank of Japan', category: 'Central Banks', description: 'Japan rate policy and yen-sensitive remarks.' },
  { id: 'bls', name: 'BLS', category: 'Economic Agencies', description: 'Labor market data releases and public updates.', defaultSelected: true },
  { id: 'cpi', name: 'CPI', category: 'Economic Agencies', description: 'Inflation-related releases and remarks.', defaultSelected: true },
  { id: 'fomc', name: 'FOMC', category: 'Central Banks', description: 'Federal Reserve policy statements and minutes.', defaultSelected: true },
  { id: 'tariffs', name: 'Tariffs', category: 'Government', description: 'Trade policy remarks that may affect sector sentiment.', defaultSelected: true },
  { id: 'oil', name: 'Oil', category: 'Economic Agencies', description: 'Energy market comments and official updates.' },
  { id: 'crypto-regulation', name: 'Crypto regulation', category: 'Regulators', description: 'Public regulatory comments affecting digital assets.' }
];

export const FOLLOW_CATEGORIES: FollowCategory[] = [
  'Government',
  'Central Banks',
  'Regulators',
  'CEOs',
  'Economic Agencies',
  'Custom Keywords'
];
