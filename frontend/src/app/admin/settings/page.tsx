"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformName: "Void2Empire",
    contactEmail: "support@void2empire.com",
    maintenanceMode: false,
    twitterUrl: "https://twitter.com/void2empire",
    telegramUrl: "https://t.me/void2empire",
  });

  const handleSave = () => {
    // Save logic
  };

  return (
    <div className="p-6 space-y-6 max-w-[800px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
        </div>
        <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Save className="w-4 h-4" /> Save Configuration
        </Button>
      </div>

      <Card className="p-6 bg-card border-border space-y-6">
        
        <div className="space-y-4">
          <h2 className="font-semibold text-lg border-b border-border pb-2">General Info</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Platform Name</label>
              <Input value={settings.platformName} onChange={e => setSettings({...settings, platformName: e.target.value})} className="bg-secondary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Support Email</label>
              <Input value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} className="bg-secondary/30" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="font-semibold text-lg border-b border-border pb-2">Social Links</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Twitter URL</label>
              <Input value={settings.twitterUrl} onChange={e => setSettings({...settings, twitterUrl: e.target.value})} className="bg-secondary/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Telegram URL</label>
              <Input value={settings.telegramUrl} onChange={e => setSettings({...settings, telegramUrl: e.target.value})} className="bg-secondary/30" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h2 className="font-semibold text-lg border-b border-border pb-2 text-warning">Danger Zone</h2>
          <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg border border-warning/20">
            <div>
              <p className="font-bold text-warning">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground mt-1">When active, users cannot log in or trade. Admins can still access the platform.</p>
            </div>
            <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${settings.maintenanceMode ? "bg-warning" : "bg-secondary border border-border"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${settings.maintenanceMode ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

      </Card>
    </div>
  );
}
