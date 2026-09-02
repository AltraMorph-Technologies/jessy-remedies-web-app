'use client';

import { Collapse } from 'antd';

const items = [
  {
    key: '1',
    label: 'How much can I borrow?',
    children: (
      <p>
        Available amounts depend on your selected product, affordability and the
        information confirmed during verification.
      </p>
    ),
  },
  {
    key: '2',
    label: 'How is loan interest calculated?',
    children: (
      <p>
        Most products use a flat monthly rate, while the Special Loan uses a
        reducing-balance method. The calculator explains the method before
        showing your estimate.
      </p>
    ),
  },
  {
    key: '3',
    label: 'How long does approval take?',
    children: (
      <p>
        After your information and supporting documents have been verified,
        successful applications are typically processed within 24–48 hours.
      </p>
    ),
  },
  {
    key: '4',
    label: 'What documents will I need?',
    children: (
      <p>
        Requirements vary by product. A loan officer will confirm the
        identification, income or business documents needed for your
        application.
      </p>
    ),
  },
];

export function FaqList() {
  return (
    <Collapse accordion items={items} bordered={false} className="site-faq" />
  );
}
