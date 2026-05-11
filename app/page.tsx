import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  ClipboardCheck,
  Droplets,
  Gauge,
  MessageCircle,
  Microscope,
  ShieldCheck,
  Sparkles,
  Wrench
} from "lucide-react";
import { Footer } from "@/components/footer";
import { PcConfigurator } from "@/components/pc-configurator";
import { SiteNav } from "@/components/site-nav";
import { whatsappLink } from "@/lib/whatsapp";

const adviceCards = [
  {
    icon: BrainCircuit,
    title: "Advice before parts",
    copy: "We explain bottlenecks, failure causes, and upgrade paths before recommending a repair or build."
  },
  {
    icon: Gauge,
    title: "Stress-tested decisions",
    copy: "Thermals, stability, and real workload checks guide every premium PC handover."
  },
  {
    icon: ClipboardCheck,
    title: "Transparent quotes",
    copy: "You see the repair logic and price comparison before committing."
  }
];

const repairCards = [
  {
    icon: Wrench,
    title: "Laptop Hospital",
    copy: "Screen, battery, hinge, keyboard, and IC-level motherboard repairs for daily drivers and creator laptops."
  },
  {
    icon: Droplets,
    title: "Water Damage Recovery",
    copy: "Board cleaning, corrosion treatment, diagnostics, and recovery planning with clear risk communication."
  },
  {
    icon: Microscope,
    title: "Motherboard & IC Work",
    copy: "Component-level inspection for dead laptops, charging faults, shorts, and power rail issues."
  }
];

const prices = [
  ["Laptop screen replacement", "Rs. 5,500", "From Rs. 4,299"],
  ["Battery replacement", "Rs. 4,200", "From Rs. 3,299"],
  ["Motherboard IC repair", "Rs. 5,000", "From Rs. 3,499"],
  ["Water damage diagnosis", "Rs. 1,500", "Rs. 799"]
];

const process = [
  ["Diagnosis", "We inspect the device, isolate the fault, and explain the likely cause."],
  ["Quote", "You receive a repair path, pricing, and realistic success expectations."],
  ["Repair", "The engineer works on the approved job with parts and progress tracked."],
  ["Stress Test", "Repaired devices and PCs go through workload, thermal, and stability checks."],
  ["Handover", "You receive the device, invoice, and post-repair usage guidance."]
];

const gallery = [
  {
    title: "Liquid-cooled PC builds",
    copy: "Clean cable routing, airflow planning, and thermal validation.",
    className: "gallery-build"
  },
  {
    title: "Repair bench diagnostics",
    copy: "Fault isolation before the quote, not guesswork after payment.",
    className: "gallery-diagnosis"
  },
  {
    title: "Board-level repair",
    copy: "IC, charging, short, and power rail inspection for dead devices.",
    className: "gallery-board"
  },
  {
    title: "Stress-test handover",
    copy: "Load testing and final guidance before the customer takes it home.",
    className: "gallery-test"
  }
];

export default function Home() {
  return (
    <main className="site-shell">
      <SiteNav />
      <section className="hero">
        <div className="hero-image" aria-hidden="true">
          <Image
            src="/images/wefix-hero-pc.png"
            alt=""
            priority
            fill
            sizes="100vw"
          />
        </div>
        <div className="container hero-content">
          <div>
            <div className="eyebrow">
              <Sparkles size={15} />
              The Tech Advisor
            </div>
            <h1>Your Tech Advisors for Life.</h1>
            <p className="hero-copy">
              Premium custom PC builds and expert hardware repairs with the part you rarely get from repair shops:
              clear technical education before you spend.
            </p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href={whatsappLink("Hi WeFix, I want help building a custom PC.")}
                target="_blank"
                rel="noreferrer"
              >
                Build My PC
                <ArrowRight size={18} />
              </a>
              <a
                className="button button-secondary"
                href={whatsappLink("Hi WeFix, I need a device repair quote.")}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} />
                Fix My Device
              </a>
            </div>
          </div>
          <div className="trust-bar">
            <div className="trust-item">
              <span className="icon-tile">
                <ShieldCheck size={20} />
              </span>
              <div>
                <strong>Lowest Market Price</strong>
                <span>Parts matched against current local quotes.</span>
              </div>
            </div>
            <div className="trust-item">
              <span className="icon-tile">
                <BadgeCheck size={20} />
              </span>
              <div>
                <strong>Certified Engineers</strong>
                <span>Hardware specialists for builds and board repair.</span>
              </div>
            </div>
            <div className="trust-item">
              <span className="icon-tile">
                <Activity size={20} />
              </span>
              <div>
                <strong>48-Hour Stress Testing</strong>
                <span>Thermal, power, and stability checks before handover.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="advice">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-kicker">Understand first</p>
              <h2 className="section-title">Do not just fix it. Understand it.</h2>
            </div>
            <p className="section-copy">
              WeFix positions the engineer as an advisor, so every customer leaves with a working device and a better
              grasp of what happened.
            </p>
          </div>
          <div className="glass-grid">
            {adviceCards.map((card) => {
              const Icon = card.icon;
              return (
                <article className="glass-card" key={card.title}>
                  <span className="icon-tile">
                    <Icon size={20} />
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="build">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-kicker">PC build configurator</p>
              <h2 className="section-title">A build brief in under a minute.</h2>
            </div>
            <p className="section-copy">
              Pick the workload, budget band, and CPU preference. The summary becomes a WhatsApp-ready advisor request.
            </p>
          </div>
          <PcConfigurator />
        </div>
      </section>

      <section className="section" id="repair">
        <div className="container repair-layout">
          <div>
            <p className="section-kicker">Repair hub</p>
            <h2 className="section-title">Hardware repairs with a visible process.</h2>
            <p className="section-copy">
              From water damage to motherboard faults, WeFix combines diagnosis, repair, stress testing, and status
              visibility.
            </p>
            <div className="timeline" style={{ marginTop: 34 }}>
              {process.map(([title, copy]) => (
                <div className="timeline-item" key={title}>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-grid" style={{ gridTemplateColumns: "1fr" }}>
            {repairCards.map((card) => {
              const Icon = card.icon;
              return (
                <article className="glass-card" key={card.title}>
                  <span className="icon-tile">
                    <Icon size={20} />
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="gallery">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-kicker">Gallery</p>
              <h2 className="section-title">Builds, benches, and repairs.</h2>
            </div>
            <p className="section-copy">
              A visual snapshot of the work WeFix wants customers to see clearly: premium builds, measured repairs,
              and disciplined testing.
            </p>
          </div>
          <div className="gallery-grid">
            {gallery.map((item) => (
              <article className={`gallery-card ${item.className}`} key={item.title}>
                <div>
                  <span>WeFix work log</span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-kicker">Price comparison</p>
              <h2 className="section-title">Market average vs WeFix price.</h2>
            </div>
            <Link className="button button-secondary" href="/check-status">
              Track a repair
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="panel">
            <table className="price-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Market Average</th>
                  <th>WeFix Price</th>
                </tr>
              </thead>
              <tbody>
                {prices.map(([service, market, wefix]) => (
                  <tr key={service}>
                    <td>{service}</td>
                    <td>{market}</td>
                    <td>{wefix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="panel config-summary">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <div>
                <p className="section-kicker">Priority consultation</p>
                <h2 className="section-title">Book the advisor call before parts move.</h2>
                <p className="section-copy">
                  Use a small token consultation flow with Razorpay later, then adjust it in the final bill.
                </p>
              </div>
              <a
                className="button button-primary"
                href={whatsappLink("Hi WeFix, I want to book a Rs. 299 priority tech advisor call.")}
                target="_blank"
                rel="noreferrer"
              >
                Book Priority Call
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
