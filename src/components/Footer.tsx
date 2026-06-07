"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="pa-footer">
      <div className="container footer-content">
        <div className="footer-info">
          <img
            src="https://africa.possibilitiesafrica.org/wp-content/uploads/2022/04/2020-PA-Logo_white.png"
            alt="Possibilities Africa White Logo"
            className="footer-logo"
            id="footer-logo-img"
          />
          <p className="footer-text">
            Possibilities Africa is a Christian ministry equipping and partnering with local church leaders in rural Africa to build communities that are spiritually developed, economically productive, and socially responsible.
          </p>
        </div>
        <div>
          <h4 style={{ color: "#ffffff", marginBottom: "0.5rem", fontSize: "0.95rem" }}>Quick Links</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.85rem" }}>
            <li>
              <a
                href="https://africa.possibilitiesafrica.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#a0aec0" }}
                className="hover-white"
              >
                Official Website
              </a>
            </li>
            <li>
              <a
                href="https://africa.possibilitiesafrica.org/who-we-are/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#a0aec0" }}
                className="hover-white"
              >
                Who We Are
              </a>
            </li>
            <li>
              <a
                href="https://africa.possibilitiesafrica.org/what-we-do/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#a0aec0" }}
                className="hover-white"
              >
                What We Do
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container">
        <div className="footer-copyright" id="footer-copyright-text">
          &copy; {currentYear} Possibilities Africa. All rights reserved. Registered Christian NGO.
        </div>
      </div>
    </footer>
  );
}
