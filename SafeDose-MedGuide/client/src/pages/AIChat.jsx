import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Plus, Trash2, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../utils/api';

export default function AIChat({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const medicineParam = searchParams.get('medicine');

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const chatEndRef = useRef(null);

  // Check login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch session histories on mount
  useEffect(() => {
    if (!user) return;
    fetchSessions();
  }, [user]);

  // Handle selected session change
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }
    const fetchSessionDetails = async () => {
      try {
        const res = await api.get(`/ai-chat/session/${currentSessionId}`);
        if (res.success && res.data?.session) {
          setMessages(res.data.session.messages);
        }
      } catch (err) {
        console.error(err);
        if (err.message && err.message.includes('not found')) {
          setCurrentSessionId('');
          fetchSessions();
        }
      }
    };
    fetchSessionDetails();
  }, [currentSessionId]);

  // Prefill search parameters
  useEffect(() => {
    if (medicineParam && sessions.length > 0 && messages.length === 0) {
      setInputMessage(`Tell me about ${medicineParam}. What is it used for, and what are its key side effects?`);
    }
  }, [medicineParam, sessions, messages]);

  // Scroll to bottom on messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchSessions = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/ai-chat/history');
      if (res.success && res.data?.sessions) {
        setSessions(res.data.sessions);
        if (res.data.sessions.length > 0 && !currentSessionId) {
          setCurrentSessionId(res.data.sessions[0].sessionId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const res = await api.post('/ai-chat/session/new');
      if (res.success && res.data?.sessionId) {
        const newSession = {
          sessionId: res.data.sessionId,
          title: 'New Chat Session',
          messages: []
        };
        setSessions([newSession, ...sessions]);
        setCurrentSessionId(res.data.sessionId);
        setMessages([]);
        setInputMessage(medicineParam ? `Tell me about ${medicineParam}. What is it used for, and what are its key side effects?` : '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      const res = await api.delete(`/ai-chat/session/${sessionId}`);
      if (res.success) {
        const updated = sessions.filter(s => s.sessionId !== sessionId);
        setSessions(updated);
        if (currentSessionId === sessionId) {
          setCurrentSessionId(updated.length > 0 ? updated[0].sessionId : '');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Append user message immediately
    const tempUserMsg = { role: 'user', content: messageText, _id: Date.now().toString() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.post('/ai-chat/send', {
        message: messageText,
        sessionId: currentSessionId
      });

      if (res.success && res.data) {
        const aiResponse = res.data.response;
        // Append AI response
        setMessages(prev => [...prev, { role: 'model', content: aiResponse, _id: (Date.now() + 1).toString() }]);
        
        // Update session list title if needed
        if (messages.length === 0) {
          const updatedSessions = sessions.map(s => {
            if (s.sessionId === currentSessionId || s.sessionId === res.data.sessionId) {
              return { ...s, title: messageText.substring(0, 30) + '...', sessionId: res.data.sessionId };
            }
            return s;
          });
          setSessions(updatedSessions);
        }
        if (res.data.sessionId && currentSessionId !== res.data.sessionId) {
          setCurrentSessionId(res.data.sessionId);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: `Sorry, I couldn't reach the AI model: ${err.message}. Please verify your server settings and GEMINI_API_KEY.`, _id: (Date.now() + 1).toString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    setInputMessage(prompt);
  };

  return (
    <div className="container animate-fade-in" style={{ height: 'calc(100vh - 120px)', marginTop: '10px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', paddingBottom: '20px' }}>
      
      {/* Sessions History Sidebar */}
      <aside className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <button onClick={handleCreateSession} className="btn btn-primary" style={{ width: '100%', gap: '8px', padding: '10px' }}>
            <Plus size={16} /> New Chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loadingHistory ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '20px' }}>Loading history...</p>
          ) : sessions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '20px' }}>No chat history.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sessions.map((s) => (
                <div
                  key={s.sessionId}
                  onClick={() => setCurrentSessionId(s.sessionId)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    backgroundColor: currentSessionId === s.sessionId ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                    border: currentSessionId === s.sessionId ? '1px solid rgba(6, 182, 212, 0.2)' : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => { if (currentSessionId !== s.sessionId) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
                  onMouseLeave={(e) => { if (currentSessionId !== s.sessionId) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <MessageSquare size={16} color={currentSessionId === s.sessionId ? 'var(--primary-teal)' : 'var(--text-dark)'} style={{ flexShrink: 0 }} />
                    <span style={{
                      fontSize: '0.85rem',
                      color: currentSessionId === s.sessionId ? 'var(--text-main)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {s.title || 'New Chat'}
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteSession(e, s.sessionId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dark)',
                      cursor: 'pointer',
                      opacity: currentSessionId === s.sessionId ? 1 : 0,
                      transition: 'opacity 0.2s ease'
                    }}
                    className="delete-sess-btn"
                  >
                    <Trash2 size={14} onMouseEnter={(e) => e.target.style.color = 'var(--danger)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-dark)'} />
                  </button>
                  <style>{`.glass-panel div:hover .delete-sess-btn { opacity: 1 !important; }`}</style>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* Medical Banner Warning */}
        <div style={{
          padding: '12px 24px',
          backgroundColor: 'rgba(245, 158, 11, 0.06)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShieldAlert size={18} color="var(--warning)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Disclaimer: SafeDose AI provides educational info. It does not replace medical consultation. Always consult a physician.
          </span>
        </div>

        {/* Messages list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.length === 0 ? (
            <div style={{
              margin: 'auto',
              maxWidth: '560px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--primary-teal), var(--accent-purple))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#060911',
                boxShadow: '0 8px 24px rgba(6, 182, 212, 0.2)'
              }}>
                <Sparkles size={32} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '8px' }}>SafeDose AI Companion</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                  Ask questions about drug dosages, safety warning disclaimers, generic names, active combinations, or potential side effects.
                </p>
              </div>

              {/* Sample Prompts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', marginTop: '16px' }}>
                {[
                  'What is the standard dosage of Paracetamol for children?',
                  'Can I take Ibuprofen and Aspirin together?',
                  'What are the common side effects of Amoxicillin?',
                  'Explain the differences between generic and brand name drugs.'
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-muted)',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      lineHeight: '1.4',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg._id}
                  style={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}
                >
                  <div style={{
                    maxWidth: '75%',
                    padding: '14px 20px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: isUser ? 'var(--primary-teal)' : 'rgba(255, 255, 255, 0.03)',
                    border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                    color: isUser ? '#060911' : 'var(--text-main)',
                    boxShadow: isUser ? '0 4px 12px var(--primary-teal-glow)' : 'none',
                    fontSize: '0.92rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
              <div style={{
                padding: '12px 20px',
                borderRadius: '16px 16px 16px 4px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                height: '38px'
              }}>
                <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1s infinite alternate' }}></span>
                <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1s infinite alternate 0.2s' }}></span>
                <span className="dot" style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', animation: 'bounce 1s infinite alternate 0.4s' }}></span>
                <style>{`
                  @keyframes bounce {
                    from { transform: translateY(0); opacity: 0.3; }
                    to { transform: translateY(-4px); opacity: 1; }
                  }
                `}</style>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(13, 18, 32, 0.4)' }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Ask a medical question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading || !currentSessionId}
              style={{ height: '48px', borderRadius: '10px' }}
            />
            <button
              type="submit"
              className="btn btn-ai"
              style={{ height: '48px', width: '48px', borderRadius: '10px', padding: 0 }}
              disabled={loading || !currentSessionId || !inputMessage.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </main>

    </div>
  );
}
