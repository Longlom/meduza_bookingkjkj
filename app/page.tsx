import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <div className="card">
        <div className="header">
          <div>
            <div className="title">Meduza</div>
            <div className="subtitle">Restaurant-lounge booking</div>
          </div>
          <div className="subtitle">Vietnam time</div>
        </div>

        <p className="subtitle">
          Use the booking form to request a table. A hostess will confirm your
          booking in Telegram/phone.
        </p>

        <div className="actions">
          <Link className="button" href="/booking">
            Open booking form
          </Link>
        </div>
      </div>
    </main>
  );
}

