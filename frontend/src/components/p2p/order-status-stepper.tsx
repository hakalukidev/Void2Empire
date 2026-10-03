"use client";

import { OrderStatus } from "@/services/p2p.service";
import { useLocaleStore } from "@/store/locale-store";
import { Check } from "lucide-react";

const STEPS: { labelKey: string; status: OrderStatus }[] = [
  { labelKey: "p2p.step_placed", status: "pending" },
  { labelKey: "p2p.step_payment_sent", status: "paid" },
  { labelKey: "p2p.step_released", status: "released" },
  { labelKey: "p2p.step_completed", status: "completed" },
];

const STATUS_STEP_INDEX: Record<OrderStatus, number> = {
  pending: 0, paid: 1, released: 2, completed: 3, cancelled: -1, disputed: -1,
};

interface OrderStatusStepperProps {
  status: OrderStatus;
}

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const { t } = useLocaleStore();
  const currentStep = STATUS_STEP_INDEX[status];

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-danger font-medium">
        <span className="w-5 h-5 rounded-full bg-danger/20 border border-danger flex items-center justify-center text-xs">✕</span>
        {t("p2p.order_cancelled")}
      </div>
    );
  }

  if (status === "disputed") {
    return (
      <div className="flex items-center gap-2 text-warning font-medium">
        <span className="w-5 h-5 rounded-full bg-warning/20 border border-warning flex items-center justify-center text-xs">!</span>
        {t("p2p.dispute_raised")}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isDone = currentStep > i;
        const isActive = currentStep === i;
        return (
          <div key={step.status} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                isDone   ? "bg-success border-success text-success-fg" :
                isActive ? "bg-primary border-primary text-primary-foreground animate-pulse" :
                           "bg-secondary border-border text-muted-foreground"
              }`}>
                {isDone ? <Check className="w-4 h-4" /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap ${
                isDone ? "text-success" : isActive ? "text-primary" : "text-muted-foreground"
              }`}>{t(step.labelKey)}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-12 md:w-20 mb-5 mx-1 transition-all ${isDone ? "bg-success" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
