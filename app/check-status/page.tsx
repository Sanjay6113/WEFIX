import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/footer";
import { RepairTracker } from "@/components/repair-tracker";
import { SiteNav } from "@/components/site-nav";

export default function CheckStatusPage() {
  return (
    <main className="tracker-shell">
      <SiteNav />
      <div className="container">
        <Link
          className="button button-ghost"
          href="/"
          style={{ marginBottom: 18 }}
        >
          <ArrowLeft size={18} />
          Back home
        </Link>
        <RepairTracker />
      </div>
      <Footer />
    </main>
  );
}
