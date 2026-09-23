"use client";

import { OrderStatus } from "@/services/p2p.service";
import { Check } from "lucide-react";

const STEPS: { label: string; status: OrderStatus }[] = [
  { label: "Order Placed", status: "pending" },
  { label: "Payment Sent", status: "paid" },
  { label: "USDT Released", status: "released" },
  { label: "Completed", status: "completed" },
];

const STATUS_STEP_INDEX: Record<OrderStatus, number> = {
  pending: 0, paid: 1, released: 2, completed: 3, cancelled: -1, disputed: -1,
};

interface OrderStatusStepperProps {
  status: OrderStatus;
}

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const currentStep = STATUS_STEP_INDEX[status];

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-danger font-medium">
        <span className="w-5 h-5 rounded-full bg-danger/20 border border-danger flex items-center justify-center text-xs">✕</span>
        Order Cancelled
      </div>
    );
  }

  if (status === "disputed") {
    return (
      <div className="flex items-center gap-2 text-warning font-medium">
        <span className="w-5 h-5 rounded-full bg-warning/20 border border-warning flex items-center justify-center text-xs">!</span>
        Dispute Raised — Awaiting Admin Review
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
                isDone   ? "bg-success border-success text-white" :
                isActive ? "bg-primary/20 border-primary text-primary animate-pulse" :
                           "bg-secondary border-border text-muted-foreground"
              }`}>
                {isDone ? <Check className="w-4 h-4" /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap ${
                isDone ? "text-success" : isActive ? "text-primary" : "text-muted-foreground"
              }`}>{step.label}</span>
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
