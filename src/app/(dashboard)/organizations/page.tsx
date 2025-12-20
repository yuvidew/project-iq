
import { OrganizationView } from '@/features/organization/view/organization_view';
import { requireAuthAndResolveOrg } from '@/lib/auth-utils';

export default async function OrganizationsPage() {
  await requireAuthAndResolveOrg()
  return (<OrganizationView />);
}