"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header" id="pa-header">
      <div
        className="container header-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        {/* Logo */}
        <Link href="/" className="logo-link" id="pa-logo-home">
          <img
            src="https://africa.possibilitiesafrica.org/wp-content/uploads/2021/08/2020-PA-Logo_Color.png"
            alt="Possibilities Africa Logo"
            className="logo-image"
          />
        </Link>

        {/* Center Title */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "#0d274d",
            lineHeight: 1.3,
          }}
        >
          Possibilities Africa Internal Community Planning & Reporting Form
        </div>

        {/* Navigation */}
        <nav
          className="nav"
          id="pa-nav-menu"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Link
            href="/"
            className={`nav-link ${pathname === "/" ? "active" : ""}`}
            id="nav-link-form"
          >
            Submit Form
          </Link>

          <Link
            href="/history"
            className={`nav-link ${
              pathname === "/history" ? "active" : ""
            }`}
            id="nav-link-history"
            title="Admin's Page"
            aria-label="Admin's Page"
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <User size={20} />
          </Link>
        </nav>
      </div>
    </header>
  );
}