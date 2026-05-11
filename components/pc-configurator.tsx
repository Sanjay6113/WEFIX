"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Cpu, MonitorPlay, PenTool, WalletCards } from "lucide-react";

const useCases = [
  { label: "Gaming", detail: "High FPS, thermals, upgrade path", icon: MonitorPlay },
  { label: "Video Editing", detail: "Timeline performance and render speed", icon: PenTool },
  { label: "Office", detail: "Quiet, reliable daily productivity", icon: WalletCards }
];

const budgets = [
  { label: "Entry", detail: "Smart value without weak parts", range: "Rs. 45k-75k" },
  { label: "Mid", detail: "Balanced performance for years", range: "Rs. 75k-1.4L" },
  { label: "Extreme", detail: "No-compromise cooling and compute", range: "Rs. 1.4L+" }
];

const cpuPrefs = [
  { label: "Intel", detail: "Great single-core and creator workflows" },
  { label: "AMD", detail: "Efficient performance and platform value" },
  { label: "Advisor Pick", detail: "We choose after current market pricing" }
];

export function PcConfigurator() {
  const [useCase, setUseCase] = useState(useCases[0].label);
  const [budget, setBudget] = useState(budgets[1].label);
  const [cpu, setCpu] = useState(cpuPrefs[2].label);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const selectedBudget = budgets.find((item) => item.label === budget) ?? budgets[1];

  const whatsappHref = useMemo(() => {
    const message = [
      "Hi WeFix, I want a custom PC build consultation.",
      `Use case: ${useCase}`,
      `Budget: ${budget} (${selectedBudget.range})`,
      `CPU preference: ${cpu}`,
      name ? `Name: ${name}` : "",
      contact ? `Contact: ${contact}` : ""
    ]
      .filter(Boolean)
      .join("\n");

    const phone = process.env.NEXT_PUBLIC_WEFIX_WHATSAPP || "919994428061";
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [budget, contact, cpu, name, selectedBudget.range, useCase]);

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
              className={`choice ${budget === item.label ? "active" : ""}`}
              key={item.label}
              onClick={() => setBudget(item.label)}
              type="button"
            >
              <span>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </span>
              <strong>{item.range}</strong>
            </button>
          ))}
          {cpuPrefs.map((item) => (
            <button
              className={`choice ${cpu === item.label ? "active" : ""}`}
              key={item.label}
              onClick={() => setCpu(item.label)}
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
            <strong>{selectedBudget.range}</strong>
          </div>
          <div className="summary-row">
            <span>CPU path</span>
            <strong>{cpu}</strong>
          </div>
        </div>
        <div className="input-grid">
          <input
            className="field"
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            value={name}
          />
          <input
            className="field"
            onChange={(event) => setContact(event.target.value)}
            placeholder="Phone or WhatsApp"
            value={contact}
          />
        </div>
        <a className="button button-primary" href={whatsappHref} rel="noreferrer" target="_blank" style={{ marginTop: 14 }}>
          Send to WhatsApp
          <ArrowRight size={18} />
        </a>
      </div>
    </div>
  );
}
