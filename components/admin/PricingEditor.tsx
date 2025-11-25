"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import TextInput from "./TextInput";

interface PricingPlan {
  title: string;
  price: string;
  duration: string;
  details: string[];
}

interface PricingEditorProps {
  plans: PricingPlan[];
  onChange: (plans: PricingPlan[]) => void;
}

export default function PricingEditor({ plans, onChange }: PricingEditorProps) {
  const updatePlan = (index: number, field: keyof PricingPlan, value: string | string[]) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    onChange(newPlans);
  };

  const addDetail = (planIndex: number) => {
    const newPlans = [...plans];
    newPlans[planIndex].details.push('New detail');
    onChange(newPlans);
  };

  const updateDetail = (planIndex: number, detailIndex: number, value: string) => {
    const newPlans = [...plans];
    newPlans[planIndex].details[detailIndex] = value;
    onChange(newPlans);
  };

  const removeDetail = (planIndex: number, detailIndex: number) => {
    const newPlans = [...plans];
    newPlans[planIndex].details.splice(detailIndex, 1);
    onChange(newPlans);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan, planIndex) => (
        <div key={planIndex} className="bg-black/5 p-6 space-y-4">
          <TextInput
            label="Plan Title"
            value={plan.title}
            onChange={(value) => updatePlan(planIndex, 'title', value)}
          />
          <TextInput
            label="Price"
            value={plan.price}
            onChange={(value) => updatePlan(planIndex, 'price', value)}
            placeholder="e.g. £140"
          />
          <TextInput
            label="Duration"
            value={plan.duration}
            onChange={(value) => updatePlan(planIndex, 'duration', value)}
            placeholder="e.g. (Min 2 Hours)"
          />

          <div className="space-y-2">
            <label className="block text-sm tracking-wide text-black/70 uppercase">
              Details
            </label>
            {plan.details.map((detail, detailIndex) => (
              <div key={detailIndex} className="flex gap-2">
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => updateDetail(planIndex, detailIndex, e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-black/20 text-black text-sm focus:outline-none focus:border-black"
                />
                <button
                  onClick={() => removeDetail(planIndex, detailIndex)}
                  className="p-2 text-black/40 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addDetail(planIndex)}
              className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Detail
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
