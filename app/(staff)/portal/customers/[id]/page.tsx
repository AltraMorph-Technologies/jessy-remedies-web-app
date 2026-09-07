import type { Metadata } from 'next';
import { StaffCustomerDetails } from '../../../../../components/staff-customer-details';

export const metadata: Metadata = {
  title: 'Customer details | Jesse Remedies Staff',
  description: 'Review customer onboarding and loan details.',
};

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StaffCustomerDetails customerId={id} />;
}
