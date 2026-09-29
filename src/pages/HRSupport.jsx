
import { useEffect, useMemo, useState } from 'react';
import {
  getAllTickets,
  updateTicket,
  getEmployeeChatHistory,
  subscribeToNewTickets,
  addChatMessage,
} from '../services/ticketService';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed'];
const FILTER_OPTIONS = ['All', ...STATUS_OPTIONS];

const STATUS_STYLES = {
  Open: 'bg-rose-100 text-rose-700 ',
  'In Progress': 'bg-amber-100 text-amber-700 ',
  Resolved: 'bg-emerald-100 text-emerald-700 ',
  Closed: 'bg-slate-200 text-slate-600 ',
};

export default function HRSupport() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  async function refreshTickets() {
    setLoading(true);
    try {
      const data = await getAllTickets(filter);
      setTickets(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshTickets();
  
  }, [filter]);

  useEffect(() => {
    const unsubscribe = subscribeToNewTickets((ticket) => {
      setToast(`🔔 New ticket: ${ticket.subject}`);
      refreshTickets();
      setTimeout(() => setToast(null), 5000);
    });
    return unsubscribe;
   
  }, []);

  async function openTicket(ticket) {
    setSelectedTicket(ticket);
    setReplyText(ticket.hr_reply || '');
    const history = await getEmployeeChatHistory(ticket.employee_id);
    setChatHistory(history);
  }

  async function handleStatusChange(ticket, status) {
    const updated = await updateTicket(ticket.id, { status });
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    if (selectedTicket?.id === updated.id) setSelectedTicket((prev) => ({ ...prev, ...updated }));
  }

  async function handleSendReply() {
    if (!selectedTicket || !replyText.trim()) return;
    const updated = await updateTicket(selectedTicket.id, {
      hr_reply: replyText.trim(),
      status: selectedTicket.status === 'Open' ? 'In Progress' : selectedTicket.status,
    });
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    setSelectedTicket((prev) => ({ ...prev, ...updated }));

    await addChatMessage({
      employee_id: selectedTicket.employee_id,
      sender: 'hr',
      message: replyText.trim()
    });
  }

  const counts = useMemo(() => {
    const base = { Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
    tickets.forEach((t) => {
      base[t.status] = (base[t.status] ?? 0) + 1;
    });
    return base;
  }, [tickets]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-8">
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-indigo-600 text-white text-sm px-4 py-3 shadow-lg animate-[slideUp_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 ">HR Support Dashboard</h1>
        <p className="text-sm text-slate-500 ">Manage AI Assistant escalations and employee support tickets.</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATUS_OPTIONS.map((status) => (
          <div key={status} className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
            <p className="text-xs text-slate-400">{status}</p>
            <p className="text-2xl font-bold text-slate-800 ">{counts[status] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-5">
        {/* Ticket list */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex gap-2 p-3 overflow-x-auto border-b border-slate-100 ">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === opt
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 :bg-slate-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="max-h-[65vh] overflow-y-auto divide-y divide-slate-100 ">
            {loading && <p className="p-4 text-sm text-slate-400">Loading tickets…</p>}
            {!loading && tickets.length === 0 && <p className="p-4 text-sm text-slate-400">No tickets found.</p>}
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => openTicket(ticket)}
                className={`w-full text-left p-4 hover:bg-slate-50 :bg-slate-700/50 transition-colors ${
                  selectedTicket?.id === ticket.id ? 'bg-indigo-50 ' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm text-slate-800 truncate">{ticket.subject}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{ticket.description}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {ticket.employees?.full_name ?? 'Employee'} · {ticket.employees?.department ?? '—'} ·{' '}
                  {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Ticket detail */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
          {!selectedTicket ? (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              Select a ticket to view details and chat history.
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 ">{selectedTicket.subject}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedTicket.employees?.full_name ?? 'Employee'} ({selectedTicket.employees?.employee_code ?? '—'}) ·{' '}
                      {selectedTicket.employees?.department ?? '—'}
                    </p>
                  </div>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket, e.target.value)}
                    className="rounded-lg text-xs px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-700 "
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
                  {selectedTicket.description}
                </p>
              </div>

              {/* HR reply box */}
              <div>
                <label className="text-xs font-medium text-slate-500 ">HR Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  placeholder="Type your reply to the employee…"
                  className="mt-1 w-full rounded-xl px-3 py-2 text-sm bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSendReply}
                    className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 transition-colors"
                  >
                    Send Reply
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTicket, 'Closed')}
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 :bg-slate-600 text-slate-600 text-sm font-medium px-4 py-2 transition-colors"
                  >
                    Close Ticket
                  </button>
                </div>
              </div>

              {/* Chat history */}
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Employee Chat History</p>
                <div className="max-h-64 overflow-y-auto space-y-2 rounded-xl bg-slate-50 p-3">
                  {chatHistory.length === 0 && <p className="text-xs text-slate-400">No chat history yet.</p>}
                  {chatHistory.map((m) => (
                    <div key={m.id} className={`text-xs ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      <span
                        className={`inline-block px-3 py-1.5 rounded-lg max-w-[85%] ${
                          m.sender === 'user'
                            ? 'bg-indigo-500 text-white'
                            : m.sender === 'hr'
                            ? 'bg-amber-100 text-amber-800 '
                            : 'bg-white text-slate-700 border border-slate-200 '
                        }`}
                      >
                        {m.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
