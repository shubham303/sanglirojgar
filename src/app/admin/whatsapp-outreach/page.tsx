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
  const [empBatchSize, setEmpBatchSize] = useState("1");

  // ── Job seeker state ──
  const seekerFileRef = useRef<HTMLInputElement>(null);
  const [seekerNumbers, setSeekerNumbers] = useState("");
  const [seekerAddResult, setSeekerAddResult] = useState("");
  const [seekerAdding, setSeekerAdding] = useState(false);
  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [seekerTotal, setSeekerTotal] = useState(0);
  const [seekerSendResult, setSeekerSendResult] = useState("");
  const [seekerSending, setSeekerSending] = useState(false);
  const [seekerBatchSize, setSeekerBatchSize] = useState("1");

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
        body: JSON.stringify({ template_name: "employer_message", batch_size: parseInt(empBatchSize) || 1 }),
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
        body: JSON.stringify({ template_name: "job_seeker_intro", batch_size: parseInt(seekerBatchSize) || 1 }),
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
            <span className="text-xs text-gray-400 ml-1">(template: <span className="font-mono">employer_message</span>)</span>
          </p>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={1}
              max={500}
              value={empBatchSize}
              onChange={(e) => setEmpBatchSize(e.target.value)}
              className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-orange-400"
            />
            <button
              onClick={handleEmpSend}
              disabled={empSending || empPending === 0}
              className="flex-1 py-2 text-sm font-semibold rounded-lg transition disabled:opacity-50"
              style={{ backgroundColor: "#25D366", color: "#fff" }}
            >
              {empSending ? "Sending..." : `Send to Employers`}
            </button>
          </div>
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
            <span className="text-xs text-gray-400 ml-1">/ {seekerTotal} total (template: <span className="font-mono">job_seeker_intro</span>)</span>
          </p>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={1}
              max={500}
              value={seekerBatchSize}
              onChange={(e) => setSeekerBatchSize(e.target.value)}
              className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-green-400"
            />
            <button
              onClick={handleSeekerSend}
              disabled={seekerSending || neverContacted === 0}
              className="flex-1 py-2 text-sm font-semibold rounded-lg transition disabled:opacity-50"
              style={{ backgroundColor: "#25D366", color: "#fff" }}
            >
              {seekerSending ? "Sending..." : `Send to Job Seekers`}
            </button>
          </div>
          <ResultBanner result={seekerSendResult} />
        </div>
      </div>

    </div>
  );
}
