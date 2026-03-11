"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Seeker {
  phone: string;
  name: string;
  created_at: string;
  last_contacted_at: string | null;
}

export default function JobSeekersAdminPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [uploadResult, setUploadResult] = useState("");
  const [uploading, setUploading] = useState(false);

  // Send state
  const [sendResult, setSendResult] = useState("");
  const [sending, setSending] = useState(false);

  const fetchSeekers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/job-seekers");
      if (res.ok) {
        const data = await res.json();
        setSeekers(data.seekers);
        setTotal(data.total);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeekers();
  }, [fetchSeekers]);

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult("");

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());

      // Parse CSV: expect "name,phone" or just "phone" per line
      const rows: { name: string; phone: string }[] = [];
      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 2) {
          // name,phone
          rows.push({ name: parts[0], phone: parts[1] });
        } else if (parts.length === 1 && parts[0]) {
          // just phone
          rows.push({ name: "", phone: parts[0] });
        }
      }

      if (rows.length === 0) {
        setUploadResult("No valid rows found in CSV");
        return;
      }

      const res = await fetch("/api/admin/job-seekers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (res.ok) {
        setUploadResult(`${data.added} added, ${data.duplicates} already existed`);
        fetchSeekers();
      } else {
        setUploadResult(data.error || "Upload failed");
      }
    } catch {
      setUploadResult("Error reading file");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSend = async () => {
    setSending(true);
    setSendResult("");
    try {
      const res = await fetch("/api/admin/send-job-seeker-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_name: "job_seeker_intro" }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult(`Sent: ${data.sent}, Failed: ${data.failed}${data.errors?.length ? ` — ${data.errors.join(", ")}` : ""}`);
        fetchSeekers();
      } else {
        setSendResult(data.error || "Error sending messages");
      }
    } catch {
      setSendResult("Server error");
    } finally {
      setSending(false);
    }
  };

  const neverContacted = seekers.filter((s) => !s.last_contacted_at).length;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-6">Job Seekers</h1>

      {/* Upload CSV */}
      <div className="bg-white rounded-xl p-4 mb-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h2 className="font-semibold text-gray-700 mb-2">Upload CSV</h2>
        <p className="text-xs text-gray-400 mb-3">
          Format: name,phone (one per line). Name can be empty.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleCSVUpload}
          disabled={uploading}
          className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 disabled:opacity-50"
        />

        {uploadResult && (
          <p className="mt-2 text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            {uploadResult}
          </p>
        )}
      </div>

      {/* Send WhatsApp */}
      <div className="bg-white rounded-xl p-4 mb-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderLeft: "3px solid #25D366" }}>
        <h2 className="font-semibold text-gray-700 mb-2">Send WhatsApp Message</h2>
        <p className="text-sm text-gray-500 mb-3">
          Not yet contacted: <span className="font-bold text-gray-800">{neverContacted}</span>
          <span className="text-xs text-gray-400 ml-1">(sends 10 per batch using job_seeker_intro template)</span>
        </p>

        <button
          onClick={handleSend}
          disabled={sending || neverContacted === 0}
          className="w-full py-2.5 text-sm font-semibold rounded-lg transition disabled:opacity-50"
          style={{ backgroundColor: "#25D366", color: "#fff" }}
        >
          {sending ? "Sending..." : `Send to ${neverContacted} Job Seekers`}
        </button>

        {sendResult && (
          <p className={`mt-2 text-sm font-medium px-3 py-2 rounded-lg ${sendResult.includes("Failed: 0") || !sendResult.includes("Failed") ? "text-green-700 bg-green-50" : "text-amber-700 bg-amber-50"}`}>
            {sendResult}
          </p>
        )}
      </div>

      {/* Stats & List */}
      <div className="bg-white rounded-xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <h2 className="font-semibold text-gray-700 mb-3">
          All Job Seekers
          <span className="text-xs font-normal text-gray-400 ml-2">
            {total} total, {neverContacted} never contacted
          </span>
        </h2>

        {loading ? (
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
