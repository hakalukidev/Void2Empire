"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Megaphone, Plus, Trash2 } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "System Maintenance Scheduled", type: "Warning", target: "All Users", date: "2024-09-21" },
    { id: 2, title: "New Trading Pairs Added", type: "Info", target: "All Users", date: "2024-09-20" },
  ]);

  const [form, setForm] = useState({ title: "", message: "", type: "Info" });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) return;
    setAnnouncements([{ id: Date.now(), title: form.title, type: form.type, target: "All Users", date: new Date().toISOString().split('T')[0] }, ...announcements]);
    setForm({ title: "", message: "", type: "Info" });
  };

  const deleteAnnouncement = (id: number) => setAnnouncements(prev => prev.filter(a => a.id !== id));

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3">
        <Megaphone className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <Card className="p-5 bg-card border-border lg:col-span-1 h-fit">
          <h2 className="font-semibold text-lg border-b border-border pb-2 mb-4">New Announcement</h2>
          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-secondary/30 mt-1" placeholder="Title" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-secondary/30 text-sm">
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Success">Success</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Message</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full mt-1 min-h-[100px] p-3 rounded-md bg-secondary/30 border border-border text-sm resize-y" placeholder="Message content..." />
            </div>
            <Button type="submit" className="w-full gap-2 bg-primary"><Plus className="w-4 h-4" /> Publish</Button>
          </form>
        </Card>

        {/* List */}
        <Card className="overflow-hidden bg-card border-border lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-medium">Title</th>
                  <th className="px-5 py-4 font-medium">Type</th>
                  <th className="px-5 py-4 font-medium">Target</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {announcements.map((a) => (
                  <tr key={a.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-4 font-medium">{a.title}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        a.type === 'Warning' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                      }`}>{a.type}</span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">{a.target}</td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">{a.date}</td>
                    <td className="px-5 py-4 text-right">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-danger hover:bg-danger/10" onClick={() => deleteAnnouncement(a.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
