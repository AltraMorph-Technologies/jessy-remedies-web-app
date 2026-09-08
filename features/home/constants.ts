export const HOME_ASSURANCES = [
  'Clear repayment breakdown',
  'Flexible loan products',
  'Local support in Lagos',
] as const;

export const COMPANY_HIGHLIGHTS = [
  ['Since 2020', 'Helping individuals and businesses move forward'],
  ['Lagos based', 'A local team you can speak with'],
  ['24–48 hours', 'Typical processing after successful verification'],
] as const;

export const LOAN_PRODUCTS = [
  {
    number: '01',
    name: 'Business Loan',
    description:
      'Working capital for stock, equipment and the everyday needs that keep your business moving.',
    details: [
      'Up to ₦500k: 4% monthly flat',
      'Above ₦500k: 5% monthly flat',
      'Monthly repayment',
    ],
    tone: 'bg-[#e9f7f3] text-[#236d63]',
  },
  {
    number: '02',
    name: 'Weekly Business Loan',
    description:
      'A short-cycle option for traders and businesses whose cash flow works better week by week.',
    details: [
      '4% indicative rate',
      'Weekly repayment',
      'Business verification',
    ],
    tone: 'bg-[#edf2fb] text-[#173a76]',
  },
  {
    number: '03',
    name: 'Employee Loan',
    description:
      'Predictable monthly support for salaried employees handling planned or unexpected expenses.',
    details: ['5% monthly flat', 'Monthly repayment', 'Income verification'],
    tone: 'bg-[#fff5df] text-[#8f6317]',
  },
  {
    number: '04',
    name: 'Special Loan',
    description:
      'A reducing-balance option for eligible borrowers with repayment needs outside standard products.',
    details: [
      '10% reducing balance',
      'Variable monthly interest',
      'Eligibility review',
    ],
    tone: 'bg-[#f5edfb] text-[#71448f]',
  },
] as const;

export const HOME_BENEFITS = [
  {
    number: '01',
    title: 'See the numbers first',
    description:
      'Use the calculator to understand the estimated interest, instalment and total repayment before you apply.',
  },
  {
    number: '02',
    title: 'A product that fits',
    description:
      'Choose between employee, monthly business, weekly business and special loan options.',
  },
  {
    number: '03',
    title: 'People you can reach',
    description:
      'Speak with a local loan officer by phone, WhatsApp or at the Egbeda office.',
  },
  {
    number: '04',
    title: 'A guided process',
    description:
      'From verification to approval, each step and requirement is clearly explained.',
  },
] as const;

export const COMPANY_VALUES = [
  'Integrity',
  'Swift service',
  'Innovation',
  'Teamwork',
] as const;

export const APPLICATION_STEPS = [
  {
    title: 'Tell us what you need',
    description:
      'Select a product, calculate your estimate and contact our loan desk to begin.',
  },
  {
    title: 'Complete verification',
    description:
      'Provide the required identification, income or business information for review.',
  },
  {
    title: 'Receive a decision',
    description:
      'We assess affordability and eligibility, then communicate the approved terms clearly.',
  },
  {
    title: 'Get funded',
    description:
      'After acceptance and final verification, successful loans are prepared for disbursement.',
  },
] as const;

export const CONTACT_LINKS = [
  { label: '+234 803 477 0629', href: 'tel:+2348034770629' },
  { label: '+234 702 534 8787', href: 'tel:+2347025348787' },
  { label: 'info@jesseremedies.com', href: 'mailto:info@jesseremedies.com' },
] as const;

export const FOOTER_LINKS = [
  'Privacy enquiries',
  'Terms enquiries',
  'Complaints',
] as const;
