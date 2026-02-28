"use client";

import { useState, useEffect } from "react";
import { JobType } from "@/lib/types";

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  // Login form
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Job types
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Check if already logged in by trying to fetch job types
  useEffect(() => {
    fetch("/api/admin/job-types")
      .then((res) => {
        if (res.ok) {
          setIsLoggedIn(true);
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (Array.isArray(data)) setJobTypes(data);
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      if (res.ok) {
        setIsLoggedIn(true);
        fetchJobTypes();
      } else {
        const data = await res.json();
        setLoginError(data.error || "लॉगिन अयशस्वी");
      }
    } catch {
      setLoginError("काहीतरी चूक झाली");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
    setJobTypes([]);
    setUserId("");
    setPassword("");
  };

  const fetchJobTypes = async () => {
    setLoadingTypes(true);
    try {
      const res = await fetch("/api/admin/job-types");
      if (res.ok) {
        const data = await res.json();
        setJobTypes(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    setAdding(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/job-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName.trim() }),
      });

      if (res.ok) {
        setNewTypeName("");
        setSuccessMsg("कामाचा प्रकार जोडला गेला!");
        fetchJobTypes();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "जोडता आले नाही");
      }
    } catch {
      setError("काहीतरी चूक झाली");
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    setDeletingId(id);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/job-types", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setSuccessMsg("कामाचा प्रकार काढला गेला!");
        fetchJobTypes();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "काढता आले नाही");
      }
    } catch {
      setError("काहीतरी चूक झाली");
    } finally {
      setDeletingId(null);
    }
  };

  if (checking) {
    return (
      <p className="text-center text-gray-500 text-lg py-8">लोड होत आहे...</p>
    );
  }

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="max-w-sm mx-auto mt-10">
        <div
          className="bg-white rounded-xl p-5"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <h1 className="text-xl font-bold text-gray-800 mb-5 text-center">
            Admin Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                युजर आयडी
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="युजर आयडी टाका"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                पासवर्ड
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="पासवर्ड टाका"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            {loginError && (
              <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn || !userId || !password}
              className="w-full text-base font-semibold py-3 rounded-xl transition disabled:opacity-50"
              style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
            >
              {loggingIn ? "लॉगिन होत आहे..." : "लॉगिन"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-500 transition"
        >
          Logout
        </button>
      </div>

      {/* Add new job type */}
      <div
        className="bg-white rounded-xl p-4 mb-4"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <h2 className="text-base font-bold text-gray-800 mb-3">
          नवीन कामाचा प्रकार जोडा
        </h2>

        <form onSubmit={handleAddType} className="flex gap-2">
          <input
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="उदा. पेंटर, टेलर..."
            className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-base focus:outline-none focus:border-[#FF6B00]"
          />
          <button
            type="submit"
            disabled={adding || !newTypeName.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 whitespace-nowrap"
            style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
          >
            {adding ? "..." : "जोडा"}
          </button>
        </form>

        {successMsg && (
          <p
            className="text-xs mt-2.5 px-3 py-2 rounded-lg"
            style={{ color: "#15803d", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
          >
            {successMsg}
          </p>
        )}
        {error && (
          <p className="text-red-600 text-xs mt-2.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* Job types list */}
      <div
        className="bg-white rounded-xl p-4"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <h2 className="text-base font-bold text-gray-800 mb-3">
          कामाचे प्रकार ({jobTypes.length})
        </h2>

        {loadingTypes ? (
          <p className="text-gray-400 text-sm py-4">लोड होत आहे...</p>
        ) : jobTypes.length === 0 ? (
          <p className="text-gray-400 text-sm py-4">कोणतेही कामाचे प्रकार नाहीत</p>
        ) : (
          <div className="space-y-1.5">
            {jobTypes.map((jt) => (
              <div
                key={jt.id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5"
                style={{ backgroundColor: "#fafafa" }}
              >
                <span className="text-sm text-gray-800">{jt.name}</span>
                <button
                  onClick={() => handleDeleteType(jt.id)}
                  disabled={deletingId === jt.id}
                  className="px-3 py-1.5 text-xs rounded-lg transition disabled:opacity-50 font-medium"
                  style={{
                    backgroundColor: "#fef2f2",
                    color: "#dc2626",
                  }}
                >
                  {deletingId === jt.id ? "..." : "काढा"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
