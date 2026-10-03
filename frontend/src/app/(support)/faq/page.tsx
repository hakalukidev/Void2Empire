"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocaleStore } from "@/store/locale-store";
import { HelpCircle, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDecimalString } from "@/lib/utils/decimal";
import { REFERRAL_REWARD_PERCENT } from "@/services/referral.service";
import { TRADING_FEE_PERCENT } from "@/services/futures-fees.service";
import { KYC_LEVEL_RULES } from "@/services/kyc.service";

// REQ-071 asks for an FAQ page; it does not supply the answers, and the client
// has not given the FAQ copy either (DR-044). So every answer here has to be a
// rule that is already confirmed elsewhere in this build — a published fee rate,
// a KYC ceiling, the referral basis — with its figure read from the same constant
// the screens use. Anything the client has not answered (maker/taker rates,
// deposit and network fees, review times, custody or audit claims, minimum
// withdrawal amounts) stays off this page until it is written down.

export default function FAQPage() {
  const { t, locale } = useLocaleStore();
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const level1 = KYC_LEVEL_RULES[0];
  const level2 = KYC_LEVEL_RULES[1];

  const faqs = [
    {
      question: t("faq.q_deposit"),
      answer: t("faq.a_deposit"),
    },
    {
      question: t("faq.q_fees"),
      answer: `${t("faq.a_fees_before")} ${TRADING_FEE_PERCENT}% ${t("faq.a_fees_after")}`,
    },
    {
      question: t("faq.q_kyc"),
      answer: `${t("kyc.mandatory")} ${t("kyc.level_1_docs")} ${t("kyc.level_2_docs")}`,
    },
    {
      question: t("faq.q_live"),
      answer: t("faq.a_live"),
    },
    {
      question: t("faq.q_referral"),
      answer: `${t("faq.a_referral_before")} ${REFERRAL_REWARD_PERCENT}% ${t("faq.a_referral_after")}`,
    },
    {
      question: t("faq.q_withdraw"),
      // Same cap + period idiom the Profile page uses, so the two can never disagree.
      // The sentence terminator has to follow the locale: the caps are interpolated,
      // so no translated string can carry it.
      answer: `${t("faq.a_withdraw_intro")} $${formatDecimalString(level1.cap, 2)} / ${t(
        "kyc.per_day"
      )}${t("faq.a_withdraw_l2")} $${formatDecimalString(level2.cap, 2)}${
        locale === "bn" ? "।" : "."
      } ${t("faq.a_withdraw_funding")}`,
    },
  ].filter((faq) => {
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return (
      faq.question.toLowerCase().includes(needle) || faq.answer.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-8 min-h-[calc(100vh-4rem)] pt-6 sm:pt-12">
      <div className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("faq.title")}</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">{t("faq.subtitle")}</p>

        <div className="relative max-w-md mx-auto mt-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={t("faq.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 bg-card border-border rounded-full text-base"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {faqs.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">{t("faq.no_results")}</p>
        ) : (
          <div className="w-full flex flex-col divide-y divide-border">
            {faqs.map((faq) => (
              <div key={faq.question} className="w-full">
                <button
                  onClick={() => setOpenQuestion(openQuestion === faq.question ? null : faq.question)}
                  className="w-full text-left font-semibold text-[15px] hover:text-primary transition-colors py-5 px-6 flex items-center justify-between group"
                >
                  {faq.question}
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform ${
                      openQuestion === faq.question ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openQuestion === faq.question && (
                  <div className="px-6 pb-5 text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center pt-8">
        <p className="text-muted-foreground text-sm">
          {t("faq.still")}{" "}
          <Link href="/support" className="text-primary font-medium hover:underline">
            {t("faq.contact")}
          </Link>
        </p>
      </div>
    </div>
  );
}
