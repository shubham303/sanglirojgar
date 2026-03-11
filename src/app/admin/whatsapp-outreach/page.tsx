"use client";

import { useEffect, useState, useCallback } from "react";

const TEMPLATES = [
  { value: "employer_outreach", label: "Employer Outreach" },
  { value: "job_seeker_intro", label: "Job Seeker Intro" },
  { value: "hello_world_test", label: "Hello World (Test)" },
];

export default function WhatsAppOutreachPage() {
  // Section 1 state
  const [numbers, setNumbers] = useState("");
  const [sourceGroup, setSourceGroup] = useState("");
  const [addResult, setAddResult] = useState("");
  const [adding, setAdding] = useState(false);

  // Section 2 state
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("employer_outreach");
  const [sendResult, setSendResult] = useState("");
  const [sending, setSending] = useState(false);

  // Test message state
  const [testPhone, setTestPhone] = useState("9284408873");
  const [testTemplate, setTestTemplate] = useState("hello_world_test");
  const [testResult, setTestResult] = useState("");
  const [testSending, setTestSending] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/whatsapp-outreach");
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.pendingCount);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async () => {
    if (!numbers.trim()) return;
    setAdding(true);
    setAddResult("");
    try {
      const res = await fetch("/api/admin/whatsapp-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numbers, source_group: sourceGroup }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddResult(`${data.added} added, ${data.duplicates} already existed`);
        setNumbers("");
        fetchData();
      } else {
        setAddResult(data.error || "Error adding numbers");
      }
    } catch {
      setAddResult("Server error");
    } finally {
      setAdding(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    setSendResult("");
    try {
      const res = await fetch("/api/admin/send-whatsapp-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_name: selectedTemplate }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult(`Sent: ${data.sent}, Failed: ${data.failed}${data.errors?.length ? ` — ${data.errors.join(", ")}` : ""}`);
        fetchData();
      } else {
        setSendResult(data.error || "Error sending messages");
      }
    } catch {
      setSendResult("Server error");
    } finally {
      setSending(false);
    }
  };

  const handleTestSend = async () => {
    setTestSending(true);
    setTestResult("");
    try {
      const res = await fetch("/api/admin/wati-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone, template_name: testTemplate }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult("Message sent successfully!");
      } else {
        setTestResult(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch {
      setTestResult("Server error");
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-6">WhatsApp Outreach</h1>

      {/* SECTION 0 — Test Message */}
      <div className="bg-white rounded-xl p-4 mb-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderLeft: "3px solid #2563eb" }}>
        <h2 className="font-semibold text-gray-700 mb-3">🧪 Test Message</h2>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="Phone number"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-400"
          />
          <select
            value={testTemplate}
            onChange={(e) => setTestTemplate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          >
            {TEMPLATES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleTestSend}
          disabled={testSending || !testPhone.trim()}
          className="w-full py-2.5 text-sm font-semibold rounded-lg transition disabled:opacity-50"
          style={{ backgroundColor: "#2563eb", color: "#fff" }}
        >
          {testSending ? "Sending..." : "Send Test Message"}
        </button>

        {testResult && (
          <p className={`mt-2 text-sm font-medium px-3 py-2 rounded-lg ${testResult.includes("success") ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"}`}>
            {testResult}
          </p>
        )}
      </div>

      {/* SECTION 1 — Add Numbers */}
      <div className="bg-white rounded-xl p-4 mb-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h2 className="font-semibold text-gray-700 mb-3">Add Employer Numbers</h2>

        <textarea
          value={numbers}
          onChange={(e) => setNumbers(e.target.value)}
          placeholder="Paste phone numbers — one per line"
          rows={6}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-orange-400 mb-3"
        />

        <input
          type="text"
          value={sourceGroup}
          onChange={(e) => setSourceGroup(e.target.value)}
          placeholder="Source group (optional — e.g. Facebook group name)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 mb-3"
        />

        <button
          onClick={handleAdd}
          disabled={adding || !numbers.trim()}
          className="w-full py-2.5 text-sm font-semibold rounded-lg transition disabled:opacity-50"
          style={{ backgroundColor: "#FF6B00", color: "#fff" }}
        >
          {adding ? "Adding..." : "Submit Numbers"}
        </button>

        {addResult && (
          <p className="mt-2 text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            {addResult}
          </p>
        )}
      </div>

      {/* SECTION 2 — Send Messages */}
      <div className="bg-white rounded-xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h2 className="font-semibold text-gray-700 mb-3">Send to Pending Employers</h2>

        <p className="text-sm text-gray-500 mb-3">
          Pending contacts: <span className="font-bold text-gray-800">{pendingCount}</span>
          <span className="text-xs text-gray-400 ml-1">(sends 10 per batch)</span>
        </p>

        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 mb-3"
        >
          {TEMPLATES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <button
          onClick={handleSend}
          disabled={sending || pendingCount === 0}
          className="w-full py-2.5 text-sm font-semibold rounded-lg transition disabled:opacity-50"
          style={{ backgroundColor: "#25D366", color: "#fff" }}
        >
          {sending ? "Sending..." : `Send to ${pendingCount} Pending Contacts`}
        </button>

        {sendResult && (
          <p className={`mt-2 text-sm font-medium px-3 py-2 rounded-lg ${sendResult.includes("Failed: 0") || !sendResult.includes("Failed") ? "text-green-700 bg-green-50" : "text-amber-700 bg-amber-50"}`}>
            {sendResult}
          </p>
        )}
      </div>
    </div>
  );
}
