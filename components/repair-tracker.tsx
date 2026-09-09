import { WhatsAppLink } from "./site-content";
export function RepairTracker() {
  return (
    <div className="panel tracker-card">
      <p className="section-kicker">Order tracking</p>
      <h1 style={{ fontSize: "clamp(2.4rem, 7vw, 5.3rem)" }}>Check Status</h1>
      <p className="section-copy">
        Open the private tracking link WeFix sent you on WhatsApp to see your
        order’s latest progress.
      </p>
      <p className="section-copy">
        Need your link or have a question? Message our team and we’ll help.
      </p>
      <WhatsAppLink
        template="footer"
        className="button button-primary"
        style={{ marginTop: 24 }}
      >
        Contact WeFix on WhatsApp
      </WhatsAppLink>
    </div>
  );
}
