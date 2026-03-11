"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Seeker {
  phone: string;
  name: string;
  created_at: string;
  last_contacted_at: string | null;
}

export default function WhatsAppOutreachPage() {
  // ── Test message state ──
  const [testPhone, setTestPhone] = useState("9284408873");
  const [testResult, setTestResult] = useState("");
  const [testSending, setTestSending] = useState(false);

  // ── Employer state ──
  const [empNumbers, setEmpNumbers] = useState("");
  const [empSource, setEmpSource] = useState("");
  const [empAddResult, setEmpAddResult] = useState("");
  const [empAdding, setEmpAdding] = useState(false);
  const [empPending, setEmpPending] = useState(0);
  const [empSendResult, setEmpSendResult] = useState("");
  const [empSending, setEmpSending] = useState(false);

  // ── Job seeker state ──
  const seekerFileRef = useRef<HTMLInputElement>(null);
  const [seekerNumbers, setSeekerNumbers] = useState("");
  const [seekerAddResult, setSeekerAddResult] = useState("");
  const [seekerAdding, setSeekerAdding] = useState(false);
  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [seekerTotal, setSeekerTotal] = useState(0);
  const [seekerLoading, setSeekerLoading] = useState(true);
  const [seekerSendResult, setSeekerSendResult] = useState("");
  const [seekerSending, setSeekerSending] = useState(false);

  // ── Fetch employer pending count ──
  const fetchEmpData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/whatsapp-outreach");
      if (res.ok) {
        const data = await res.json();
        setEmpPending(data.pendingCount);
      }
    } catch { /* ignore */ }
  }, []);

  // ── Fetch job seekers ──
  const fetchSeekers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/job-seekers");
      if (res.ok) {
        const data = await res.json();
        setSeekers(data.seekers);
        setSeekerTotal(data.total);
      }
    } catch { /* ignore */ }
    finally { setSeekerLoading(false); }
  }, []);

  useEffect(() => {
    fetchEmpData();
    fetchSeekers();
  }, [fetchEmpData, fetchSeekers]);

  const neverContacted = seekers.filter((s) => !s.last_contacted_at).length;

  // ── Handlers ──

  const handleTestSend = async () => {
    setTestSending(true);
    setTestResult("");
    try {
      const res = await fetch("/api/admin/wati-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone, template_name: "hello_world_test" }),
      });
      const data = await res.json();
      setTestResult(res.ok ? "Message sent successfully!" : `Failed: ${data.error || "Unknown error"}`);
    } catch {
      setTestResult("Server error");
    } finally {
      setTestSending(false);
    }
  };

  const handleEmpAdd = async () => {
    if (!empNumbers.trim()) return;
    setEmpAdding(true);
    setEmpAddResult("");
    try {
      const res = await fetch("/api/admin/whatsapp-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers: empNumbers, source_group: empSource }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmpAddResult(`${data.added} added, ${data.duplicates} already existed`);
        setEmpNumbers("");
        fetchEmpData();
      } else {
        setEmpAddResult(data.error || "Error adding numbers");
      }
    } catch {
      setEmpAddResult("Server error");
    } finally {
      setEmpAdding(false);
    }
  };

  const handleEmpSend = async () => {
    setEmpSending(true);
    setEmpSendResult("");
    try {
      const res = await fetch("/api/admin/send-whatsapp-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_name: "employer_message" }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmpSendResult(`Sent: ${data.sent}, Failed: ${data.failed}${data.errors?.length ? ` — ${data.errors.join(", ")}` : ""}`);
        fetchEmpData();
      } else {
        setEmpSendResult(data.error || "Error sending messages");
      }
    } catch {
      setEmpSendResult("Server error");
    } finally {
      setEmpSending(false);
    }
  };

  const handleSeekerAddNumbers = async () => {
    if (!seekerNumbers.trim()) return;
    setSeekerAdding(true);
    setSeekerAddResult("");
    try {
      const lines = seekerNumbers.split("\n").filter((l) => l.trim());
      const rows = lines.map((line) => {
        const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 2) return { name: parts[0], phone: parts[1] };
        return { name: "", phone: parts[0] };
      });
      const res = await fetch("/api/admin/job-seekers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (res.ok) {
        setSeekerAddResult(`${data.added} added, ${data.duplicates} already existed`);
        setSeekerNumbers("");
        fetchSeekers();
      } else {
        setSeekerAddResult(data.error || "Error adding");
      }
    } catch {
      setSeekerAddResult("Server error");
    } finally {
      setSeekerAdding(false);
    }
  };

  const handleSeekerCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSeekerAdding(true);
    setSeekerAddResult("");
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      const rows: { name: string; phone: string }[] = [];
      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 2) rows.push({ name: parts[0], phone: parts[1] });
        else if (parts[0]) rows.push({ name: "", phone: parts[0] });
      }
      if (rows.length === 0) { setSeekerAddResult("No valid rows"); return; }
      const res = await fetch("/api/admin/job-seekers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (res.ok) {
        setSeekerAddResult(`${data.added} added, ${data.duplicates} already existed`);
        fetchSeekers();
      } else {
        setSeekerAddResult(data.error || "Upload failed");
      }
    } catch {
      setSeekerAddResult("Error reading file");
    } finally {
      setSeekerAdding(false);
      if (seekerFileRef.current) seekerFileRef.current.value = "";
    }
  };

  const handleSeekerSend = async () => {
    setSeekerSending(true);
    setSeekerSendResult("");
    try {
      const res = await fetch("/api/admin/send-job-seeker-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_name: "job_seeker_intro" }),
      });
      const data = await res.json();
      if (res.ok) {
        setSeekerSendResult(`Sent: ${data.sent}, Failed: ${data.failed}${data.errors?.length ? ` — ${data.errors.join(", ")}` : ""}`);
        fetchSeekers();
      } else {
        setSeekerSendResult(data.error || "Error sending messages");
      }
    } catch {
      setSeekerSendResult("Server error");
    } finally {
      setSeekerSending(false);
    }
  };

  // ── Render helpers ──
  const ResultBanner = ({ result, success }: { result: string; success?: boolean }) => {
    if (!result) return null;
    const isOk = success ?? (result.includes("success") || result.includes("added") || (result.includes("Sent") && !result.includes("Failed: 1")));
    return (
      <p className={`mt-2 text-sm font-medium px-3 py-2 rounded-lg ${isOk ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"}`}>
        {result}
      </p>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-6">WhatsApp Outreach</h1>

      {/* ════════════════ TEST MESSAGE ════════════════ */}
      <div className="bg-white rounded-xl p-4 mb-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderLeft: "3px solid #2563eb" }}>
        <h2 className="font-semibold text-gray-700 mb-3">🧪 Test Message</h2>
        <p className="text-xs text-gray-400 mb-2">Sends <span className="font-mono">hello_world_test</span> template</p>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="Phone number"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={handleTestSend}
            disabled={testSending || !testPhone.trim()}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition disabled:opacity-50"
            style={{ backgroundColor: "#2563eb", color: "#fff" }}
          >
            {testSending ? "..." : "Send"}
          </button>
        </div>

        <ResultBanner result={testResult} />
      </div>

      {/* ════════════════ EMPLOYERS ════════════════ */}
      <div className="bg-white rounded-xl p-4 mb-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderLeft: "3px solid #FF6B00" }}>
        <h2 className="font-semibold text-gray-700 mb-3">Employers</h2>

        {/* Add numbers */}
        <textarea
          value={empNumbers}
          onChange={(e) => setEmpNumbers(e.target.value)}
          placeholder="Paste employer phone numbers — one per line"
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-orange-400 mb-2"
        />
        <input
          type="text"
          value={empSource}
          onChange={(e) => setEmpSource(e.target.value)}
          placeholder="Source group (optional — e.g. Facebook group name)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 mb-2"
        />
        <button
          onClick={handleEmpAdd}
          disabled={empAdding || !empNumbers.trim()}
          className="w-full py-2 text-sm font-semibold rounded-lg transition disabled:opacity-50 mb-2"
          style={{ backgroundColor: "#FF6B00", color: "#fff" }}
        >
          {empAdding ? "Adding..." : "Add Employer Numbers"}
        </button>
        <ResultBanner result={empAddResult} />

        {/* Send to pending */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            Pending: <span className="font-bold text-gray-800">{empPending}</span>
            <span className="text-xs text-gray-400 ml-1">(sends 10/batch · template: <span className="font-mono">employer_message</span>)</span>
          </p>
          <button
            onClick={handleEmpSend}
            disabled={empSending || empPending === 0}
            className="w-full py-2 text-sm font-semibold rounded-lg transition disabled:opacity-50"
            style={{ backgroundColor: "#25D366", color: "#fff" }}
          >
            {empSending ? "Sending..." : `Send to ${empPending} Employers`}
          </button>
          <ResultBanner result={empSendResult} />
        </div>
      </div>

      {/* ════════════════ JOB SEEKERS ════════════════ */}
      <div className="bg-white rounded-xl p-4 mb-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderLeft: "3px solid #25D366" }}>
        <h2 className="font-semibold text-gray-700 mb-3">Job Seekers</h2>

        {/* Add numbers (text) */}
        <textarea
          value={seekerNumbers}
          onChange={(e) => setSeekerNumbers(e.target.value)}
          placeholder="Paste job seeker numbers — one per line, or name,phone"
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-green-400 mb-2"
        />
        <button
          onClick={handleSeekerAddNumbers}
          disabled={seekerAdding || !seekerNumbers.trim()}
          className="w-full py-2 text-sm font-semibold rounded-lg transition disabled:opacity-50 mb-2"
          style={{ backgroundColor: "#25D366", color: "#fff" }}
        >
          {seekerAdding ? "Adding..." : "Add Job Seeker Numbers"}
        </button>

        {/* Or CSV upload */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-400">or upload CSV:</span>
          <input
            ref={seekerFileRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleSeekerCSV}
            disabled={seekerAdding}
            className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-600 hover:file:bg-green-100 disabled:opacity-50"
          />
        </div>
        <ResultBanner result={seekerAddResult} />

        {/* Send to pending */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            Not contacted: <span className="font-bold text-gray-800">{neverContacted}</span>
            <span className="text-xs text-gray-400 ml-1">/ {seekerTotal} total (sends 10/batch · template: <span className="font-mono">job_seeker_intro</span>)</span>
          </p>
          <button
            onClick={handleSeekerSend}
            disabled={seekerSending || neverContacted === 0}
            className="w-full py-2 text-sm font-semibold rounded-lg transition disabled:opacity-50"
            style={{ backgroundColor: "#25D366", color: "#fff" }}
          >
            {seekerSending ? "Sending..." : `Send to ${neverContacted} Job Seekers`}
          </button>
          <ResultBanner result={seekerSendResult} />
        </div>
      </div>

      {/* ════════════════ JOB SEEKERS LIST ════════════════ */}
      <div className="bg-white rounded-xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h2 className="font-semibold text-gray-700 mb-3">
          All Job Seekers
          <span className="text-xs font-normal text-gray-400 ml-2">
            {seekerTotal} total, {neverContacted} never contacted
          </span>
        </h2>

        {seekerLoading ? (
          <p className="text-sm text-gray-400 py-4 text-center">Loading...</p>
        ) : seekers.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No job seekers yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b">
                  <th className="pb-1.5 pr-3">Name</th>
                  <th className="pb-1.5 pr-3">Phone</th>
                  <th className="pb-1.5 pr-3">Added</th>
                  <th className="pb-1.5">Contacted</th>
                </tr>
              </thead>
              <tbody>
                {seekers.map((s) => (
                  <tr key={s.phone} className="border-b border-gray-50">
                    <td className="py-1.5 pr-3 text-gray-700">{s.name || "—"}</td>
                    <td className="py-1.5 pr-3 font-mono text-xs text-gray-500">{s.phone}</td>
                    <td className="py-1.5 pr-3 text-xs text-gray-400">
                      {new Date(s.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-1.5 text-xs">
                      {s.last_contacted_at ? (
                        <span className="text-green-600">
                          {new Date(s.last_contacted_at).toLocaleDateString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
