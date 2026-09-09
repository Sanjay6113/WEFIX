"use client";

import { useState } from "react";
import { useSiteContent, WhatsAppLink } from "./site-content";
import { budgetRange } from "@/lib/domain";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  MonitorPlay,
  PenTool,
  WalletCards,
} from "lucide-react";

const useCases = [
  {
    label: "Gaming",
    detail: "High FPS, thermals, upgrade path",
    icon: MonitorPlay,
  },
  {
    label: "Video Editing",
    detail: "Timeline performance and render speed",
    icon: PenTool,
  },
  {
    label: "Office",
    detail: "Quiet, reliable daily productivity",
    icon: WalletCards,
  },
];

const cpuPrefs = [
  { label: "Intel", detail: "Great single-core and creator workflows" },
  { label: "AMD", detail: "Efficient performance and platform value" },
  { label: "Advisor Pick", detail: "We choose after current market pricing" },
];

export function PcConfigurator() {
  const { budgets } = useSiteContent();
  const [useCase, setUseCase] = useState(useCases[0].label);
  const [budget, setBudget] = useState("mid");
  const [cpu, setCpu] = useState(cpuPrefs[2].label);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const selectedBudget =
    budgets.find((item) => item.id === budget) ?? budgets[0];

  return (
    <div className="configurator">
      <div className="panel config-panel">
        <div className="step-label">
          <span>Step 01</span>
          <span>Choose the workload</span>
        </div>
        <div className="choice-grid">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`choice ${useCase === item.label ? "active" : ""}`}
                key={item.label}
                onClick={() => setUseCase(item.label)}
                aria-pressed={useCase === item.label}
                type="button"
              >
                <span>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </span>
                <Icon size={20} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="panel config-panel">
        <div className="step-label">
          <span>Step 02</span>
          <span>Budget and core preference</span>
        </div>
        <div className="choice-grid">
          {budgets.map((item) => (
            <button
              className={`choice ${budget === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => setBudget(item.id)}
              aria-pressed={budget === item.id}
              type="button"
            >
              <span>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </span>
              <strong>{budgetRange(item)}</strong>
            </button>
          ))}
          {cpuPrefs.map((item) => (
            <button
              className={`choice ${cpu === item.label ? "active" : ""}`}
              key={item.label}
              onClick={() => setCpu(item.label)}
              aria-pressed={cpu === item.label}
              type="button"
            >
              <span>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </span>
              <Cpu size={20} />
            </button>
          ))}
        </div>
      </div>

      <div className="panel config-summary">
        <div className="eyebrow">
          <CheckCircle2 size={15} />
          Advisor-ready brief
        </div>
        <h3 style={{ marginTop: 18 }}>Build request snapshot</h3>
        <div className="summary-list">
          <div className="summary-row">
            <span>Use case</span>
            <strong>{useCase}</strong>
          </div>
          <div className="summary-row">
            <span>Budget</span>
            <strong>{budgetRange(selectedBudget)}</strong>
          </div>
          <div className="summary-row">
            <span>CPU path</span>
            <strong>{cpu}</strong>
          </div>
        </div>
        <div className="input-grid">
          <input
            aria-label="Name"
            className="field"
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            value={name}
          />
          <input
            aria-label="Phone or WhatsApp"
            type="tel"
            className="field"
            onChange={(event) => setContact(event.target.value)}
            placeholder="Phone or WhatsApp"
            value={contact}
          />
        </div>
        <WhatsAppLink
          className="button button-primary"
          template="configurator"
          variables={{
            use_case: useCase,
            budget: selectedBudget.label,
            budget_range: budgetRange(selectedBudget),
            cpu,
            name,
            contact,
          }}
          style={{ marginTop: 14 }}
        >
          Send to WhatsApp
          <ArrowRight size={18} />
        </WhatsAppLink>
      </div>
    </div>
  );
}
