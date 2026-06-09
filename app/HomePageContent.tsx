"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function HomePageContent() {
  const { messages: m, messages: { common: c } } = useLanguage();

  return (
    <main className="page">
      <div className="card">
        <div className="header">
          <div>
            <div className="title">Meduza</div>
            <div className="subtitle">{m.home.subtitle}</div>
          </div>
          <div className="subtitle">{c.vietnamTime}</div>
        </div>

        <p className="subtitle">{m.home.description}</p>

        <div className="actions">
          <Link className="button" href="/booking">
            {m.home.openBooking}
          </Link>
        </div>
      </div>
    </main>
  );
}
