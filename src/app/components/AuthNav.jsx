"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "../utils/AuthContext";
import { useState } from "react";

export default function AuthNav() {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleSignOut = async () => {
    if (logoutLoading) return; // Prevent multiple clicks
    setLogoutLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  // Show loading only if not in logout process
  if (loading && !logoutLoading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  // Hide logout button on session pages, password reset page, and login page
  if (pathname.startsWith("/session/") || pathname === "/reset-password" || pathname === "/login") {
    return null;
  }

  // Show logout button if user is logged in OR if logout is in progress
  if (user || logoutLoading) {
    return (
      <button
        onClick={handleSignOut}
        disabled={logoutLoading}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
      >
        {logoutLoading ? "Logging out..." : "Logout"}
      </button>
    );
  }

  // No user and not loading - return null (user will be redirected to login)
  return null;
} 