import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <Button variant="primary">Export CSV</Button>
      </div>

      <Card className="p-0 overflow-hidden bg-card border-border">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {/* Mock User 1 */}
            <tr className="hover:bg-secondary/20 transition-colors">
              <td className="px-6 py-4 font-medium">John Doe</td>
              <td className="px-6 py-4 text-muted-foreground">john@example.com</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 text-muted-foreground">User</td>
              <td className="px-6 py-4">
                <Button variant="ghost" className="h-8 px-3 text-xs">Edit</Button>
              </td>
            </tr>
            {/* Mock User 2 */}
            <tr className="hover:bg-secondary/20 transition-colors">
              <td className="px-6 py-4 font-medium">Jane Admin</td>
              <td className="px-6 py-4 text-muted-foreground">jane@void2empire.com</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 text-primary font-medium">Admin</td>
              <td className="px-6 py-4">
                <Button variant="ghost" className="h-8 px-3 text-xs">Edit</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
