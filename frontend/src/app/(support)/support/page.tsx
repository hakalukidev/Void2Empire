"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Headphones, Mail, MessageSquare, Clock, Globe } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8 min-h-[calc(100vh-4rem)] pt-6 sm:pt-12">
      
      <div className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <Headphones className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">How can we help you?</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Our support team is available 24/7 to assist you with any issues or questions regarding your Void2Empire account.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 bg-card border-border flex flex-col items-center text-center space-y-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-primary">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg">Live Chat</h3>
          <p className="text-sm text-muted-foreground">Chat with our support agents in real-time for immediate assistance.</p>
          <Button variant="outline" className="w-full mt-auto">Start Chat</Button>
        </Card>

        <Card className="p-6 bg-card border-border flex flex-col items-center text-center space-y-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-primary">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg">Email Support</h3>
          <p className="text-sm text-muted-foreground">Send us an email and we will respond within 24 hours.</p>
          <a href="mailto:support@void2empire.com" className="w-full mt-auto">
            <Button variant="primary" className="w-full">Email Us</Button>
          </a>
        </Card>

        <Card className="p-6 bg-card border-border flex flex-col items-center text-center space-y-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-primary">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg">Help Center</h3>
          <p className="text-sm text-muted-foreground">Browse our comprehensive guides and FAQs to find answers quickly.</p>
          <a href="/faq" className="w-full mt-auto">
            <Button variant="outline" className="w-full">View FAQ</Button>
          </a>
        </Card>
      </div>

      <Card className="p-8 bg-secondary/20 border-border max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-center">Submit a Ticket</h2>
        <form className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <Input placeholder="Your Name" className="bg-card" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <Input type="email" placeholder="you@example.com" className="bg-card" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Subject</label>
            <Input placeholder="Brief summary of your issue" className="bg-card" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Message</label>
            <textarea 
              className="w-full min-h-[150px] p-3 rounded-md bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              placeholder="Please describe your issue in detail..."
            ></textarea>
          </div>
          <Button variant="primary" className="w-full h-12 font-bold text-base mt-4">
            Submit Support Ticket
          </Button>
        </form>
      </Card>
    </div>
  );
}
