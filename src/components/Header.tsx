"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header" id="pa-header">
      <div className="container header-container">
        <Link href="/" className="logo-link" id="pa-logo-home">
          <img
            src="https://africa.possibilitiesafrica.org/wp-content/uploads/2021/08/2020-PA-Logo_Color.png"
            alt="Possibilities Africa Logo"
            className="logo-image"
          />
        </Link>
        <nav className="nav" id="pa-nav-menu">
          <Link
            href="/"
            className={`nav-link ${pathname === "/" ? "active" : ""}`}
            id="nav-link-form"
          >
            Submit Form
          </Link>
          <Link
            href="/history"
            className={`nav-link ${pathname === "/history" ? "active" : ""}`}
            id="nav-link-history"
            title="Admin's Page"
            aria-label="Admin's Page"
            style={{ display: "flex", alignItems: "center" }}
          >
            <User size={20} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
