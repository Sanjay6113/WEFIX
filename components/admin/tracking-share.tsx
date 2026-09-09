"use client";
import { useState } from "react";
import {
  messageLink,
  renderTemplate,
  statusLabels,
  type OrderStatus,
} from "@/lib/domain";
export function TrackingShare({
  token,
  phone,
  name,
  ticket,
  status,
  template,
  siteUrl,
}: {
  token: string;
  phone: string;
  name: string;
  ticket: string;
  status: OrderStatus;
  template: string;
  siteUrl: string;
}) {
  const [feedback, setFeedback] = useState("");
  function trackingUrl() {
    return `${siteUrl || window.location.origin}/check-status/${token}`;
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(trackingUrl());
      setFeedback("Tracking link copied.");
    } catch {
      setFeedback(
        "Copy is unavailable. Open the tracking page and copy its address.",
      );
    }
  }
  function share() {
    const url = messageLink(
      phone,
      renderTemplate(template, {
        client_name: name,
        ticket,
        status: statusLabels[status],
        tracking_link: trackingUrl(),
      }),
    );
    window.open(url, "_blank", "noopener,noreferrer");
  }
  return (
    <div className="tracking-share">
      <p>
        This private link grants access to this order’s customer-facing details.
        Share it with the client.
      </p>
      <div className="admin-inline">
        <button
          type="button"
          className="button button-secondary"
          onClick={copy}
        >
          Copy tracking link
        </button>
        <button type="button" className="button button-primary" onClick={share}>
          Message client on WhatsApp
        </button>
        <a target="_blank" rel="noreferrer" href={`/check-status/${token}`}>
          Preview tracking ↗
        </a>
      </div>
      <p role="status">{feedback}</p>
    </div>
  );
}
