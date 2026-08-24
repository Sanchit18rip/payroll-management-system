import { useState, useEffect, useRef } from 'react'
import { findFaqMatch, faqData, HR_SUPPORT_CONTACT } from '../data/faqData'
import { createTicket, addChatMessage, getEmployeeChatHistory } from '../services/ticketService'

function ChatbotWidget({ role, employeeId, employeeName }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [awaitingEscalationConfirm, setAwaitingEscalationConfirm] = useState(false)
  const [typing, setTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [hovered, setHovered] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const relevantFaqs = faqData.filter(
    faq => faq.audience === role || faq.audience === 'both'
  )

  useEffect(() => {
    if (open && role === 'employee' && employeeId && messages.length === 0) {
      getEmployeeChatHistory(employeeId).then(history => {
        if (history.length > 0) {
          setMessages(history.map(m => ({ sender: m.sender, text: m.message, time: m.created_at })))
        } else {
          pushBotMessage(`Hi ${employeeName || ''}! 👋 I'm your HR assistant. Ask me anything about payroll, leaves, attendance, or company policies.`)
        }
      })
    }

    if (open && role === 'hr' && messages.length === 0) {
      pushBotMessage('Hi! 👋 Ask me how to do something in the system, or tap a quick question below.')
    }

    if (open) {
      setUnreadCount(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  const pushBotMessage = (text) => {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { sender: 'bot', text, time: new Date().toISOString() }])
      if (!open) setUnreadCount(prev => prev + 1)
    }, 600 + Math.random() * 400)
  }

  const pushUserMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'user', text, time: new Date().toISOString() }])
  }

  const saveMessage = (sender, text) => {
    if (role === 'employee' && employeeId) {
      addChatMessage({ employee_id: employeeId, sender, message: text }).catch(err => console.log(err))
    }
  }

  const handleAsk = (text) => {
    if (!text.trim()) return

    pushUserMessage(text)
    saveMessage('user', text)
    setInput('')
    setAwaitingEscalationConfirm(false)

    const match = findFaqMatch(text, role)

    if (match) {
      pushBotMessage(match.answer)
      saveMessage('bot', match.answer)
      return
    }

    if (role === 'employee') {
      const fallback = `I couldn't find an answer to that. 📧 ${HR_SUPPORT_CONTACT.email} / 📞 ${HR_SUPPORT_CONTACT.phone}\n\nWould you like me to send this to HR as a support ticket?`
      pushBotMessage(fallback)
      saveMessage('bot', fallback)
      setAwaitingEscalationConfirm(true)
    } else {
      const fallback = `I couldn't find an answer to that. Please contact IT/Admin support at ${HR_SUPPORT_CONTACT.email} or ${HR_SUPPORT_CONTACT.phone}.`
      pushBotMessage(fallback)
    }
  }

  const handleEscalate = async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user')
    if (!lastUserMessage || !employeeId) return

    try {
      await createTicket({
        employee_id: employeeId,
        subject: lastUserMessage.text.slice(0, 80),
        description: lastUserMessage.text
      })
      const confirmMsg = "✅ Done! I've sent this to HR as a support ticket. They'll follow up with you soon."
      pushBotMessage(confirmMsg)
      saveMessage('bot', confirmMsg)
    } catch (err) {
      console.log(err)
      pushBotMessage('❌ Something went wrong while sending this to HR. Please try again.')
    }
    setAwaitingEscalationConfirm(false)
  }

  const formatTime = (isoStr) => {
    if (!isoStr) return ''
    try {
      return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  const categoryIcons = {
    payroll: '💰', attendance: '📅', leave: '🌴', performance: '⭐',
    general: '❓', policies: '📋', default: '💬'
  }

  const getCategoryIcon = (question) => {
    const q = question.toLowerCase()
    if (q.includes('salary') || q.includes('payroll') || q.includes('pay')) return categoryIcons.payroll
    if (q.includes('attendance') || q.includes('mark') || q.includes('check')) return categoryIcons.attendance
    if (q.includes('leave') || q.includes('holiday') || q.includes('vacation')) return categoryIcons.leave
    if (q.includes('performance') || q.includes('review') || q.includes('rating')) return categoryIcons.performance
    if (q.includes('policy') || q.includes('rule') || q.includes('policies')) return categoryIcons.policies
    return categoryIcons.default
  }

  return (
    <>
      {/* Floating Button with hover preview */}
      <div
        onMouseEnter={() => !open && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1500 }}
      >
        {/* Hover Preview Tooltip */}
        {hovered && !open && (
          <div style={hoverPreview}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>💬 Need help?</span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Ask me anything!</span>
          </div>
        )}
        <button onClick={() => setOpen(!open)} style={{
          ...bubbleButton,
          transform: open ? 'scale(0.9)' : 'scale(1)',
        }}>
          {open ? (
            <span style={{ fontSize: '18px', fontWeight: 700 }}>✕</span>
          ) : (
            <span style={{ fontSize: '22px' }}>🤖</span>
          )}
          {!open && unreadCount > 0 && (
            <span style={unreadBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      </div>

      {/* Chat Panel */}
      {open && (
        <div style={panel}>
          {/* Header */}
          <div style={panelHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
                boxShadow: '0 2px 12px rgba(59,130,246,0.35)'
              }}>🤖</div>
              <div>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>HR Assistant</span>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Always online • Ask anything</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', color: '#f8fafc',
              width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={messagesArea}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 10px', color: '#64748b' }}>
                <p style={{ fontSize: '28px', margin: '0 0 8px' }}>👋</p>
                <p style={{ fontSize: '13px', margin: 0 }}>Start a conversation</p>
              </div>
            )}

            {messages.map((m, i) => {
              const isUser = m.sender === 'user'
              return (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  marginBottom: '10px', animation: 'fadeIn 0.25s ease'
                }}>
                  {!isUser && (
                    <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '3px', marginLeft: '4px' }}>
                      HR Assistant
                    </span>
                  )}
                  <span style={isUser ? userBubble : botBubble}>
                    {m.text}
                  </span>
                  <span style={{
                    fontSize: '10px', color: '#475569', marginTop: '3px',
                    marginLeft: isUser ? '0' : '4px', marginRight: isUser ? '4px' : '0'
                  }}>
                    {formatTime(m.time)}
                  </span>
                </div>
              )
            })}

            {/* Typing Indicator */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={botBubble}>
                  <span style={typingDot} /><span style={{ ...typingDot, animationDelay: '0.15s' }} /><span style={{ ...typingDot, animationDelay: '0.3s' }} />
                </span>
              </div>
            )}

            {awaitingEscalationConfirm && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', animation: 'fadeIn 0.2s ease' }}>
                <button onClick={handleEscalate} style={smallPrimaryButton}>✅ Yes, send to HR</button>
                <button onClick={() => setAwaitingEscalationConfirm(false)} style={smallSecondaryButton}>No thanks</button>
              </div>
            )}
          </div>

          {/* Quick Questions - scrollable */}
          <div style={quickQuestionsArea}>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Questions</p>
            <div style={quickQuestionsScroll}>
              {relevantFaqs.map(faq => (
                <button key={faq.id} onClick={() => handleAsk(faq.question)} style={quickQuestionButton}>
                  <span style={{ marginRight: '6px', flexShrink: 0 }}>{getCategoryIcon(faq.question)}</span>
                  <span>{faq.question}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={inputRow}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk(input)}
              placeholder="Type your question..."
              style={inputStyle}
            />
            <button onClick={() => handleAsk(input)} style={{
              ...sendButton,
              opacity: input.trim() ? 1 : 0.5,
              transform: input.trim() ? 'scale(1)' : 'scale(0.95)',
            }}>
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Global animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes chatbotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </>
  )
}

/* ─── Styles ─── */

const bubbleButton = {
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 6px 24px rgba(37,99,235,0.45), 0 0 0 3px rgba(37,99,235,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.25s ease',
  animation: 'chatbotFloat 3s ease-in-out infinite',
}

const unreadBadge = {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  background: '#ef4444',
  color: '#fff',
  fontSize: '10px',
  fontWeight: 700,
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #1e293b',
}

const panel = {
  position: 'fixed',
  bottom: '92px',
  right: '24px',
  width: '360px',
  maxHeight: '520px',
  background: 'rgba(15, 23, 42, 0.92)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  borderRadius: '20px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1500,
  animation: 'fadeIn 0.25s ease',
  overflow: 'hidden',
}

const panelHeader = {
  padding: '14px 16px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
  color: '#f8fafc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'rgba(15, 23, 42, 0.6)',
}

const messagesArea = {
  flex: 1,
  overflowY: 'auto',
  padding: '14px',
  maxHeight: '280px',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(148,163,184,0.2) transparent',
}

const botBubble = {
  display: 'inline-block',
  background: 'rgba(51, 65, 85, 0.6)',
  backdropFilter: 'blur(8px)',
  color: '#f1f5f9',
  padding: '10px 14px',
  borderRadius: '14px 14px 14px 4px',
  fontSize: '13px',
  maxWidth: '82%',
  lineHeight: '1.6',
  border: '1px solid rgba(148, 163, 184, 0.08)',
}

const userBubble = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
  color: '#ffffff',
  padding: '10px 14px',
  borderRadius: '14px 14px 4px 14px',
  fontSize: '13px',
  maxWidth: '82%',
  lineHeight: '1.6',
  boxShadow: '0 2px 12px rgba(37,99,235,0.3)',
}

const typingDot = {
  display: 'inline-block',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: '#94a3b8',
  margin: '0 2px',
  animation: 'typingBounce 0.8s ease-in-out infinite',
}

const quickQuestionsArea = {
  padding: '12px 14px',
  borderTop: '1px solid rgba(148, 163, 184, 0.1)',
  maxHeight: '180px',
  display: 'flex',
  flexDirection: 'column',
}

const quickQuestionsScroll = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(148,163,184,0.2) transparent',
}

const quickQuestionButton = {
  textAlign: 'left',
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#cbd5e1',
  border: '1px solid rgba(148, 163, 184, 0.1)',
  borderRadius: '10px',
  padding: '8px 12px',
  fontSize: '12px',
  cursor: 'pointer',
  marginBottom: '6px',
  transition: 'all 0.15s ease',
  lineHeight: 1.4,
  width: '100%',
}

const inputRow = {
  display: 'flex',
  gap: '8px',
  padding: '12px 14px',
  borderTop: '1px solid rgba(148, 163, 184, 0.1)',
  background: 'rgba(15, 23, 42, 0.4)',
}

const inputStyle = {
  flex: 1,
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(148, 163, 184, 0.15)',
  background: 'rgba(2, 6, 23, 0.6)',
  color: '#f8fafc',
  fontSize: '13px',
  outline: 'none',
  transition: 'border-color 0.15s ease',
}

const sendButton = {
  padding: '10px 16px',
  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: '700',
  transition: 'all 0.15s ease',
  boxShadow: '0 2px 10px rgba(37,99,235,0.3)',
}

const hoverPreview = {
  position: 'absolute',
  bottom: '66px',
  right: 0,
  background: 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(148, 163, 184, 0.12)',
  borderRadius: '14px',
  padding: '10px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  animation: 'fadeIn 0.2s ease',
  whiteSpace: 'nowrap',
}

const smallPrimaryButton = {
  padding: '8px 16px',
  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600',
}

const smallSecondaryButton = {
  padding: '8px 16px',
  background: 'rgba(51, 65, 85, 0.5)',
  color: '#cbd5e1',
  border: '1px solid rgba(148, 163, 184, 0.15)',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '12px',
}

export default ChatbotWidget
