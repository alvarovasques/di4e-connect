import RoleManagementTable from '@/components/admin/role-management-table';
import { MOCK_ROLES } from '@/lib/mock-data';

export default function RoleManagementPage() {
  return (
    <div className="space-y-6">
      <RoleManagementTable roles={MOCK_ROLES} />
    </div>
  );
}
