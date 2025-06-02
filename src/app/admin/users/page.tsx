import UserManagementTable from '@/components/admin/user-management-table';
import { MOCK_USERS } from '@/lib/mock-data';

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <UserManagementTable users={MOCK_USERS} />
    </div>
  );
}
