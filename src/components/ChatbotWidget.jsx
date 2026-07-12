import { useState, useEffect, useRef } from 'react'
import { findFaqMatch, faqData, HR_SUPPORT_CONTACT } from '../data/faqData'
import { createTicket, addChatMessage, getEmployeeChatHistory } from '../services/ticketService'

function ChatbotWidget({ role, employeeId, employeeName }) {

    console.log('ChatbotWidget received employeeId:', employeeId)

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [awaitingEscalationConfirm, setAwaitingEscalationConfirm] = useState(false)
  const scrollRef = useRef(null)

  const relevantFaqs = faqData.filter(
    faq => faq.audience === role || faq.audience === 'both'
  )

  useEffect(() => {

    if (open && role === 'employee' && employeeId && messages.length === 0) {

      getEmployeeChatHistory(employeeId).then(history => {

        if (history.length > 0) {
          setMessages(history.map(m => ({ sender: m.sender, text: m.message })))
        } else {
          pushBotMessage(`Hi ${employeeName || ''}! I'm your HR assistant. Ask me anything, or tap a question below.`)
        }

      })

    }

    if (open && role === 'hr' && messages.length === 0) {
      pushBotMessage('Hi! Ask me how to do something in the system, or tap a question below.')
    }

  }, [open])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const pushBotMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'bot', text }])
  }

  const pushUserMessage = (text) => {
    setMessages(prev => [...prev, { sender: 'user', text }])
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

      const fallback = `I couldn't find an answer to that. Connect to HR Support: ${HR_SUPPORT_CONTACT.email} / ${HR_SUPPORT_CONTACT.phone}. Would you also like me to send this to HR as a ticket?`
      pushBotMessage(fallback)
      saveMessage('bot', fallback)
      setAwaitingEscalationConfirm(true)

    } else {

      const fallback = `I couldn't find an answer to that. Please contact IT/Admin support directly at ${HR_SUPPORT_CONTACT.email} or ${HR_SUPPORT_CONTACT.phone}.`
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

      const confirmMsg = "Done - I've sent this to HR as a support ticket. They'll follow up with you soon."
      pushBotMessage(confirmMsg)
      saveMessage('bot', confirmMsg)

    }

    catch (err) {
      console.log(err)
      pushBotMessage('Something went wrong while sending this to HR. Please try again.')
    }

    setAwaitingEscalationConfirm(false)

  }

  return (
    <>
      <button onClick={() => setOpen(!open)} style={bubbleButton}>
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div style={panel}>
          <div style={panelHeader}>
            <span style={{ fontWeight: 700 }}>Help Assistant</span>
          </div>

          <div ref={scrollRef} style={messagesArea}>
            {messages.map((m, i) => (
              <div key={i} style={{ textAlign: m.sender === 'user' ? 'right' : 'left', marginBottom: '8px' }}>
                <span style={m.sender === 'user' ? userBubble : botBubble}>
                  {m.text}
                </span>
              </div>
            ))}

            {awaitingEscalationConfirm && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button onClick={handleEscalate} style={smallPrimaryButton}>Yes, send to HR</button>
                <button onClick={() => setAwaitingEscalationConfirm(false)} style={smallSecondaryButton}>No</button>
              </div>
            )}
          </div>

          <div style={quickQuestionsArea}>
            {relevantFaqs.slice(0, 4).map(faq => (
              <button key={faq.id} onClick={() => handleAsk(faq.question)} style={quickQuestionButton}>
                {faq.question}
              </button>
            ))}
          </div>

          <div style={inputRow}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk(input)}
              placeholder="Type your question..."
              style={inputStyle}
            />
            <button onClick={() => handleAsk(input)} style={sendButton}>Send</button>
          </div>
        </div>
      )}
    </>
  )
}

const bubbleButton = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  fontSize: '22px',
  cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
  zIndex: 1500
}

const panel = {
  position: 'fixed',
  bottom: '92px',
  right: '24px',
  width: '340px',
  maxHeight: '480px',
  background: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1500
}

const panelHeader = {
  padding: '14px 16px',
  borderBottom: '1px solid #334155',
  color: '#f8fafc'
}

const messagesArea = {
  flex: 1,
  overflowY: 'auto',
  padding: '12px 14px',
  maxHeight: '240px'
}

const botBubble = {
  display: 'inline-block',
  background: '#334155',
  color: '#f8fafc',
  padding: '8px 12px',
  borderRadius: '10px',
  fontSize: '13px',
  maxWidth: '85%',
  lineHeight: '1.5'
}

const userBubble = {
  display: 'inline-block',
  background: '#2563eb',
  color: '#ffffff',
  padding: '8px 12px',
  borderRadius: '10px',
  fontSize: '13px',
  maxWidth: '85%',
  lineHeight: '1.5'
}

const quickQuestionsArea = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  padding: '10px 14px',
  borderTop: '1px solid #334155'
}

const quickQuestionButton = {
  textAlign: 'left',
  background: '#0f172a',
  color: '#94a3b8',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '8px 10px',
  fontSize: '12px',
  cursor: 'pointer'
}

const inputRow = {
  display: 'flex',
  gap: '8px',
  padding: '10px 14px',
  borderTop: '1px solid #334155'
}

const inputStyle = {
  flex: 1,
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f8fafc',
  fontSize: '13px',
  outline: 'none'
}

const sendButton = {
  padding: '10px 14px',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600'
}

const smallPrimaryButton = {
  padding: '6px 12px',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '12px'
}

const smallSecondaryButton = {
  padding: '6px 12px',
  background: '#334155',
  color: '#f8fafc',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '12px'
}

export default ChatbotWidget
