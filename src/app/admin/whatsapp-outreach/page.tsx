"use client";

import { useEffect, useState, useCallback } from "react";

const DEFAULT_MESSAGE = `नमस्कार 🙏
मी शुभम रणदिवे.

Facebook वर तुमची जाहिरात पाहिली — म्हणून हे लिहितोय.

Facebook वर post टाकली की दुसऱ्या दिवशी दिसेनाशी होते — ही समस्या सोडवायला मी mahajob.in बनवलं आहे. महाराष्ट्रातील नोकरी शोधणाऱ्यांसाठी एक सोपी मराठी website — आता 200+ नोकऱ्या आहेत आणि रोज नवीन नोकरी शोधणारे भेट देतात.

तुमची जाहिरात इथे 30 दिवस दिसत राहील. नोकरी शोधणारे थेट तुम्हाला call करतील — कोणताही middleman नाही. registration नाही, payment नाही, पूर्णपणे मोफत.

👉 www.mahajob.in

काही प्रश्न असतील तर सांगा — मी नक्की मदत करेन. 🙏`;

export default function WhatsAppOutreachPage() {
  // Section 1 state
  const [numbers, setNumbers] = useState("");
  const [sourceGroup, setSourceGroup] = useState("");
  const [addResult, setAddResult] = useState("");
  const [adding, setAdding] = useState(false);

  // Section 2 state
  const [pendingCount, setPendingCount] = useState(0);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sendResult, setSendResult] = useState("");
  const [sending, setSending] = useState(false);

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
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult(`Sent: ${data.sent}, Failed: ${data.failed}`);
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-6">WhatsApp Outreach</h1>

      {/* SECTION 1 — Add Numbers */}
      <div className="bg-white rounded-xl p-4 mb-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h2 className="font-semibold text-gray-700 mb-3">Add Numbers</h2>

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
        <h2 className="font-semibold text-gray-700 mb-3">Send Messages</h2>

        <p className="text-sm text-gray-500 mb-3">
          Pending contacts: <span className="font-bold text-gray-800">{pendingCount}</span>
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={12}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 mb-3"
        />

        <button
          onClick={handleSend}
          disabled={sending || pendingCount === 0 || !message.trim()}
          className="w-full py-2.5 text-sm font-semibold rounded-lg transition disabled:opacity-50"
          style={{ backgroundColor: "#25D366", color: "#fff" }}
        >
          {sending ? "Sending..." : `Send WhatsApp to ${pendingCount} Pending Contacts`}
        </button>

        {sendResult && (
          <p className="mt-2 text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            {sendResult}
          </p>
        )}
      </div>
    </div>
  );
}
