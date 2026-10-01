"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocaleStore } from "@/store/locale-store";
import { HelpCircle, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

const FAQS = [
  {
    question: "How do I deposit funds into my account?",
    answer: "You can deposit funds by navigating to the Wallet section, clicking on 'Deposit', selecting your preferred cryptocurrency (e.g., USDT, BTC), and transferring the funds to the provided unique wallet address via the correct network."
  },
  {
    question: "What are the fees for trading?",
    answer: "Our trading fees are highly competitive. Maker fees start at 0.02% and Taker fees start at 0.04% for spot and futures trading. Deposit fees are always zero, while withdrawal fees vary depending on the blockchain network."
  },
  {
    question: "How long does KYC verification take?",
    answer: "KYC (Identity Verification) is typically processed within 5 to 15 minutes. In some cases, manual review may be required, which can take up to 24 hours. Ensure your uploaded documents are clear and readable."
  },
  {
    question: "Is Void2Empire secure?",
    answer: "Security is our highest priority. We use industry-leading encryption, cold storage for 95% of user assets, two-factor authentication (2FA), and regular security audits to ensure your funds and data remain safe."
  },
  {
    question: "How does the Referral Program work?",
    answer: "You can earn up to 20% commission on the trading fees of users you invite. Simply share your unique referral link from the Referral page. Commissions are credited directly to your wallet in real-time."
  },
  {
    question: "What is the minimum withdrawal amount?",
    answer: "The minimum withdrawal amount depends on the cryptocurrency and the network you choose. For example, the minimum USDT withdrawal on TRC20 is usually 10 USDT. Please check the Withdrawal page for specific limits."
  }
];

export default function FAQPage() {
  const { t } = useLocaleStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-8 min-h-[calc(100vh-4rem)] pt-6 sm:pt-12">
      
      <div className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Find answers to common questions about trading, security, deposits, and account management on Void2Empire.
        </p>
        
        <div className="relative max-w-md mx-auto mt-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search for answers..." 
            className="pl-10 h-12 bg-card border-border rounded-full text-base"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="w-full flex flex-col divide-y divide-border">
          {FAQS.map((faq, index) => (
            <div key={index} className="w-full">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left font-semibold text-[15px] hover:text-primary transition-colors py-5 px-6 flex items-center justify-between group"
              >
                {faq.question}
                <ChevronDown className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform ${openIndex === index ? "rotate-180" : ""}`} />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-muted-foreground text-sm">
          Still have questions? <Link href="/support" className="text-primary font-medium hover:underline">Contact our Support Team</Link>
        </p>
      </div>
    </div>
  );
}
