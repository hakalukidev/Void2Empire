"use client";

import { FileText } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8 min-h-[calc(100vh-4rem)] pt-6 sm:pt-12">
      <div className="space-y-4 border-b border-border pb-8">
        <div className="flex items-center gap-3 text-primary">
          <FileText className="w-8 h-8" />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
        </div>
        <p className="text-muted-foreground">Last Updated: September 2024</p>
      </div>

      <div className="prose prose-invert prose-p:text-muted-foreground prose-headings:text-foreground max-w-none space-y-6">
        
        <section className="space-y-3">
          <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
          <p>
            By accessing or using the Void2Empire platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">2. Risk Disclosure</h2>
          <p>
            Trading cryptocurrencies, futures, and binary options involves a significant amount of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite.
          </p>
          <p className="text-warning font-semibold bg-warning/10 p-3 rounded-md border border-warning/20">
            You should not invest money that you cannot afford to lose.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">3. Account Registration & KYC</h2>
          <p>
            To use our services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and update such information to keep it accurate, current, and complete. 
          </p>
          <p>
            We reserve the right to require Identity Verification (KYC) at any time to comply with international Anti-Money Laundering (AML) regulations. Failure to provide requested documentation may result in account suspension or termination.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">4. Prohibited Activities</h2>
          <p>You may not access or use the platform for any purpose other than that for which we make it available. Prohibited activity includes, but is not limited to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Engaging in unauthorized framing of or linking to the Site.</li>
            <li>Using the platform for any illegal activities, including money laundering or financing terrorism.</li>
            <li>Attempting to manipulate the market or use bots, scripts, or APIs in unauthorized ways to gain an unfair advantage.</li>
            <li>Interfering with, disrupting, or creating an undue burden on the platform or the networks connected to the platform.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">5. Fees and Execution</h2>
          <p>
            Void2Empire charges trading fees for executed trades. By trading on the platform, you agree to pay all applicable fees. We reserve the right to change our fee structure at any time. Notice of such changes will be provided on the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">6. Limitation of Liability</h2>
          <p>
            In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">7. Contact Information</h2>
          <p>For any questions regarding these Terms of Service, please contact us at <span className="font-medium text-foreground">legal@void2empire.com</span>.</p>
        </section>

      </div>
    </div>
  );
}
