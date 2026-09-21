"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/store/locale-store";

export default function AdminUsersPage() {
  const { t } = useLocaleStore();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">{t("admin_users.title")}</h1>
        <Button variant="primary">{t("admin_users.export")}</Button>
      </div>

      <Card className="p-0 overflow-hidden bg-card border-border">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-medium">{t("admin_users.name")}</th>
              <th className="px-6 py-4 font-medium">{t("admin_users.email")}</th>
              <th className="px-6 py-4 font-medium">{t("admin_users.status")}</th>
              <th className="px-6 py-4 font-medium">{t("admin_users.role")}</th>
              <th className="px-6 py-4 font-medium">{t("admin_users.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
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
                <Button variant="ghost" className="h-8 px-3 text-xs">{t("admin_users.edit")}</Button>
              </td>
            </tr>
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
                <Button variant="ghost" className="h-8 px-3 text-xs">{t("admin_users.edit")}</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}

