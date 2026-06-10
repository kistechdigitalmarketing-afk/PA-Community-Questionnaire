"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/components/Banner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HistoryList from "@/components/HistoryList";
import AuthForm from "@/components/AuthForm";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function HistoryPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. If Firebase is active, subscribe to Auth changes
      if (isFirebaseConfigured && auth) {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        // 2. Local storage simulation fallback
        const loggedInUser = localStorage.getItem("pa_logged_in_user");
        if (loggedInUser) {
          setIsLoggedIn(true);
        }
        setLoading(false);
      }
    }
  }, []);

  const handleLoginSuccess = (email: string) => {
    if (!isFirebaseConfigured) {
      localStorage.setItem("pa_logged_in_user", email);
    }
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Firebase Sign Out Error:", err);
      }
    } else {
      localStorage.removeItem("pa_logged_in_user");
      setIsLoggedIn(false);
    }
  };

  return (
    <>
      <Banner />
      <Header />
      <main className="container section-padding" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                border: "4px solid var(--border-color)",
                borderTopColor: "var(--pa-blue)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem auto"
              }}
            />
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Verifying session...</p>
          </div>
        ) : isLoggedIn ? (
          <HistoryList onLogout={handleLogout} />
        ) : (
          <AuthForm onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
      <Footer />
    </>
  );
}

