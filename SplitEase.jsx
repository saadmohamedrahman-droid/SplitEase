import { useState, useEffect } from "react";

const MEMBER_COLORS = ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f97316', '#3b82f6', '#a78bfa'];

function getMemberColor(name, members) {
  const idx = members.indexOf(name);
  return MEMBER_COLORS[idx % MEMBER_COLORS.length];
}

function Avatar({ name, members, size = 32 }) {
  const color = getMemberColor(name, members);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '22', border: `1.5px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 800, color, flexShrink: 0,
      fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px'
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

function calculateBalances(members, expenses) {
  const balances = {};
  members.forEach(m => (balances[m] = 0));
  expenses.forEach(exp => {
    const share = exp.amount / exp.splitAmong.length;
    exp.splitAmong.forEach(member => { balances[member] -= share; });
    balances[exp.paidBy] += exp.amount;
  });
  return balances;
}

function calculateSettlements(balances) {
  const people = Object.entries(balances).map(([p, a]) => ({ p, a: parseFloat(a.toFixed(2)) }));
  const pos = people.filter(x => x.a > 0.01).sort((a, b) => b.a - a.a);
  const neg = people.filter(x => x.a < -0.01).sort((a, b) => a.a - b.a);
  const txns = [];
  let i = 0, j = 0;
  while (i < pos.length && j < neg.length) {
    const amt = Math.min(pos[i].a, -neg[j].a);
    if (amt > 0.01) txns.push({ from: neg[j].p, to: pos[i].p, amount: amt });
    pos[i].a -= amt; neg[j].a += amt;
    if (pos[i].a < 0.01) i++;
    if (neg[j].a > -0.01) j++;
  }
  return txns;
}

function getCategoryEmoji(desc) {
  const d = desc.toLowerCase();
  if (d.match(/food|dinner|lunch|breakfast|eat|restaurant|pizza|burger|cafe|chai|coffee|snack/)) return '🍽️';
  if (d.match(/hotel|stay|hostel|airbnb|room|accommodation|pg/)) return '🏨';
  if (d.match(/uber|ola|cab|taxi|auto|bus|train|flight|travel|transport|ride/)) return '🚗';
  if (d.match(/movie|film|theatre|cinema|show|concert|event|ticket/)) return '🎬';
  if (d.match(/drink|beer|wine|alcohol|bar|pub|cocktail/)) return '🍺';
  if (d.match(/grocery|market|shop|store|supermarket|zepto|blinkit/)) return '🛒';
  if (d.match(/gas|petrol|fuel|cng/)) return '⛽';
  if (d.match(/medicine|medical|doctor|hospital|pharmacy|chemist/)) return '💊';
  if (d.match(/internet|wifi|broadband|recharge|mobile/)) return '📶';
  if (d.match(/electricity|water|gas bill|utility/)) return '💡';
  return '💰';
}

const labelStyle = {
  display: 'block', color: '#64748b', fontSize: 11,
  fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 9
};
const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
  padding: '12px 16px', color: '#f1f5f9', fontSize: 15,
  fontFamily: 'Syne, sans-serif', transition: 'border-color 0.2s'
};

export default function App() {
  const [step, setStep] = useState('setup');
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([]);
  const [memberInput, setMemberInput] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ desc: '', amount: '', paidBy: '', splitAmong: [] });
  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #07101f; font-family: 'Syne', sans-serif; }
      input, select, button { font-family: 'Syne', sans-serif; }
      input::placeholder { color: #334155; }
      select option { background: #0d1a30; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }
      .input-focus:focus { border-color: rgba(0,200,130,0.4) !important; outline: none; }
      .btn-primary { transition: all 0.18s ease; }
      .btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,200,130,0.25); }
      .btn-primary:active:not(:disabled) { transform: translateY(0); }
      .btn-ghost:hover { background: rgba(255,255,255,0.07) !important; }
      .expense-card { transition: border-color 0.2s, transform 0.15s; }
      .expense-card:hover { border-color: rgba(0,200,130,0.2) !important; transform: translateX(2px); }
      .chip-btn { transition: all 0.15s ease; }
      .chip-btn:hover { opacity: 0.85; }
      @keyframes fadeSlide {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .anim { animation: fadeSlide 0.38s cubic-bezier(.16,1,.3,1) both; }
      @keyframes popIn {
        from { opacity: 0; transform: scale(0.96) translateY(8px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .pop-in { animation: popIn 0.32s cubic-bezier(.16,1,.3,1) both; }
      .tab-btn { transition: color 0.2s; position: relative; }
      .tab-btn::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #00c882; border-radius: 2px 2px 0 0; transform: scaleX(0); transition: transform 0.2s; }
      .tab-btn.active::after { transform: scaleX(1); }
      .settle-card { animation: fadeSlide 0.3s cubic-bezier(.16,1,.3,1) both; }
    `;
    document.head.appendChild(style);
  }, []);

  const addMember = () => {
    const name = memberInput.trim();
    if (name && !members.includes(name) && members.length < 8) {
      setMembers(prev => [...prev, name]);
      setMemberInput('');
    }
  };

  const startGroup = () => {
    if (groupName.trim() && members.length >= 2) {
      setForm({ desc: '', amount: '', paidBy: members[0], splitAmong: [...members] });
      setStep('main');
    }
  };

  const addExpense = () => {
    const amt = parseFloat(form.amount);
    if (!form.desc.trim() || isNaN(amt) || amt <= 0 || !form.paidBy || form.splitAmong.length === 0) return;
    setExpenses(prev => [...prev, {
      id: Date.now(), desc: form.desc.trim(), amount: amt,
      paidBy: form.paidBy, splitAmong: [...form.splitAmong],
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    }]);
    setForm({ desc: '', amount: '', paidBy: members[0], splitAmong: [...members] });
    setShowForm(false);
  };

  const toggleSplitMember = name => {
    setForm(f => ({
      ...f,
      splitAmong: f.splitAmong.includes(name)
        ? f.splitAmong.filter(m => m !== name)
        : [...f.splitAmong, name]
    }));
  };

  const balances = calculateBalances(members, expenses);
  const settlements = calculateSettlements({ ...balances });
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const canStart = groupName.trim() && members.length >= 2;

  /* ── SETUP SCREEN ── */
  if (step === 'setup') return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #07101f 0%, #0b1a35 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="anim" style={{ width: '100%', maxWidth: 460 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #00c882 0%, #00a870 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(0,200,130,0.3)' }}>💸</div>
          <h1 style={{ fontSize: 34, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1.5px', marginBottom: 6 }}>SplitEase</h1>
          <p style={{ color: '#475569', fontSize: 14, fontWeight: 500 }}>Group expense splitting, done right.</p>
        </div>

        {/* Form Card */}
        <div style={{ background: 'rgba(255,255,255,0.032)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '32px 28px' }}>

          {/* Group Name */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Group Name</label>
            <input
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('mi').focus()}
              placeholder="Goa Trip, Flat 4B, Weekend Crew..."
              className="input-focus"
              style={{ ...inputStyle }}
            />
          </div>

          {/* Members */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Members <span style={{ color: '#1e3a5f', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({members.length}/8)</span></label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                id="mi" value={memberInput}
                onChange={e => setMemberInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addMember()}
                placeholder="Add a name..."
                className="input-focus"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                onClick={addMember}
                disabled={!memberInput.trim() || members.length >= 8}
                className="btn-primary"
                style={{ background: '#00c882', border: 'none', borderRadius: 12, width: 46, fontSize: 22, fontWeight: 700, color: '#07101f', cursor: 'pointer', flexShrink: 0, opacity: (!memberInput.trim() || members.length >= 8) ? 0.4 : 1 }}
              >+</button>
            </div>
            {members.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {members.map((m, i) => {
                  const c = MEMBER_COLORS[i % MEMBER_COLORS.length];
                  return (
                    <div key={m} className="chip-btn" style={{ display: 'flex', alignItems: 'center', gap: 7, background: c + '14', border: `1px solid ${c}30`, borderRadius: 100, padding: '5px 10px 5px 6px', cursor: 'default' }}>
                      <Avatar name={m} members={members} size={20} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{m}</span>
                      <button onClick={() => setMembers(ms => ms.filter(x => x !== m))} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: '0 0 0 2px', display: 'flex' }}>×</button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#1e3a5f', fontSize: 13 }}>Add at least 2 people to continue</p>
            )}
          </div>

          <button
            onClick={startGroup}
            disabled={!canStart}
            className="btn-primary"
            style={{ width: '100%', background: canStart ? 'linear-gradient(135deg, #00c882, #00a870)' : '#0d1a30', border: 'none', borderRadius: 14, padding: '15px', fontWeight: 800, fontSize: 16, color: canStart ? '#07101f' : '#1e3a5f', cursor: canStart ? 'pointer' : 'not-allowed', letterSpacing: '-0.3px' }}
          >
            {canStart ? `Start Splitting →` : 'Add members to continue'}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── MAIN APP ── */
  return (
    <div style={{ minHeight: '100vh', background: '#07101f', color: '#f1f5f9' }}>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(7,16,31,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 660, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 16 }}>💸</span>
              <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.6px' }}>{groupName}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {members.map((m, i) => (
                <div key={m} title={m} style={{ width: 22, height: 22, borderRadius: '50%', background: MEMBER_COLORS[i % MEMBER_COLORS.length] + '22', border: `1.5px solid ${MEMBER_COLORS[i % MEMBER_COLORS.length]}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: MEMBER_COLORS[i % MEMBER_COLORS.length], marginLeft: i > 0 ? -5 : 0, zIndex: members.length - i }}>
                  {m[0].toUpperCase()}
                </div>
              ))}
              <span style={{ color: '#334155', fontSize: 11, fontWeight: 600, marginLeft: 6 }}>{members.length} people</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#334155', fontSize: 10, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Total</div>
            <div style={{ fontSize: 21, fontWeight: 600, fontFamily: 'DM Mono, monospace', color: '#00c882', letterSpacing: '-0.5px' }}>
              ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 660, margin: '0 auto', display: 'flex', padding: '0 20px', gap: 4 }}>
          {[
            { id: 'expenses', label: `Expenses`, badge: expenses.length },
            { id: 'balances', label: 'Balances' },
            { id: 'settle', label: 'Settle Up', badge: settlements.length }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
              style={{ background: 'none', border: 'none', padding: '11px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: activeTab === t.id ? '#00c882' : '#475569', display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '-0.2px' }}>
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span style={{ background: activeTab === t.id ? 'rgba(0,200,130,0.15)' : 'rgba(255,255,255,0.06)', color: activeTab === t.id ? '#00c882' : '#475569', fontSize: 10, fontWeight: 700, borderRadius: 100, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '20px 20px 40px' }} key={activeTab} className="anim">

        {/* ── EXPENSES ── */}
        {activeTab === 'expenses' && (
          <>
            {/* Add form */}
            {showForm && (
              <div className="pop-in" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,200,130,0.18)', borderRadius: 22, padding: '24px', marginBottom: 18 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#00c882', marginBottom: 20, letterSpacing: '-0.3px' }}>New Expense</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Description</label>
                      <input value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Dinner, Hotel..." className="input-focus" style={{ ...inputStyle, fontSize: 14 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Amount (₹)</label>
                      <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" type="number" min="0" className="input-focus" style={{ ...inputStyle, fontFamily: 'DM Mono, monospace', fontSize: 18, fontWeight: 500 }} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Paid By</label>
                    <select value={form.paidBy} onChange={e => setForm(f => ({ ...f, paidBy: e.target.value }))} className="input-focus" style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}>
                      {members.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Split Among</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {members.map((m, i) => {
                        const sel = form.splitAmong.includes(m);
                        const c = MEMBER_COLORS[i % MEMBER_COLORS.length];
                        return (
                          <button key={m} onClick={() => toggleSplitMember(m)} className="chip-btn"
                            style={{ display: 'flex', alignItems: 'center', gap: 7, background: sel ? c + '18' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${sel ? c + '50' : 'rgba(255,255,255,0.07)'}`, borderRadius: 100, padding: '7px 13px 7px 8px', cursor: 'pointer' }}>
                            <Avatar name={m} members={members} size={22} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: sel ? '#e2e8f0' : '#475569' }}>{m}</span>
                          </button>
                        );
                      })}
                    </div>
                    {form.splitAmong.length > 0 && form.amount && !isNaN(parseFloat(form.amount)) && (
                      <p style={{ color: '#334155', fontSize: 12, marginTop: 10, fontFamily: 'DM Mono, monospace' }}>
                        ₹{(parseFloat(form.amount) / form.splitAmong.length).toFixed(2)} per person
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowForm(false)} className="btn-ghost" style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '13px', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={addExpense} className="btn-primary" style={{ flex: 2, background: 'linear-gradient(135deg, #00c882, #00a870)', border: 'none', borderRadius: 12, padding: '13px', color: '#07101f', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Add Expense</button>
                  </div>
                </div>
              </div>
            )}

            {/* Expense list */}
            {expenses.length === 0 && !showForm ? (
              <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                <div style={{ fontSize: 52, marginBottom: 16, filter: 'grayscale(0.3)' }}>🧾</div>
                <p style={{ color: '#1e3a5f', fontSize: 15, fontWeight: 600 }}>No expenses yet</p>
                <p style={{ color: '#0f2040', fontSize: 13, marginTop: 4 }}>Tap below to add the first one</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {expenses.map((exp, idx) => {
                  const paidColor = getMemberColor(exp.paidBy, members);
                  const perPerson = exp.amount / exp.splitAmong.length;
                  const emoji = getCategoryEmoji(exp.desc);
                  return (
                    <div key={exp.id} className="expense-card" style={{ background: 'rgba(255,255,255,0.032)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 16, padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 14, animationDelay: `${idx * 0.04}s` }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.desc}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Avatar name={exp.paidBy} members={members} size={16} />
                          <span style={{ fontSize: 12, color: '#334155' }}>
                            <span style={{ color: paidColor, fontWeight: 700 }}>{exp.paidBy}</span> paid · {exp.splitAmong.length} way split · <span style={{ color: '#1e3a5f' }}>{exp.date}</span>
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontWeight: 500, fontSize: 17, color: '#f1f5f9', letterSpacing: '-0.5px' }}>₹{exp.amount.toFixed(2)}</div>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#334155' }}>₹{perPerson.toFixed(2)}/ea</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add button */}
            {!showForm && (
              <button
                onClick={() => { setShowForm(true); setForm(f => ({ ...f, paidBy: members[0], splitAmong: [...members] })); }}
                className="btn-primary"
                style={{ width: '100%', marginTop: 14, background: 'rgba(0,200,130,0.07)', border: '1.5px dashed rgba(0,200,130,0.28)', borderRadius: 16, padding: '15px', color: '#00c882', fontWeight: 700, fontSize: 15, cursor: 'pointer', letterSpacing: '-0.2px' }}
              >
                + Add Expense
              </button>
            )}
          </>
        )}

        {/* ── BALANCES ── */}
        {activeTab === 'balances' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {members.map((m, i) => {
              const bal = balances[m] || 0;
              const color = MEMBER_COLORS[i % MEMBER_COLORS.length];
              const isPos = bal > 0.01, isNeg = bal < -0.01;
              const totalPaid = expenses.filter(e => e.paidBy === m).reduce((s, e) => s + e.amount, 0);
              const totalShare = expenses.filter(e => e.splitAmong.includes(m)).reduce((s, e) => s + e.amount / e.splitAmong.length, 0);
              const pct = totalSpent > 0 ? (totalPaid / totalSpent) * 100 : 0;
              return (
                <div key={m} style={{ background: 'rgba(255,255,255,0.032)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 20, padding: '20px 22px', animationDelay: `${i * 0.06}s` }} className="anim">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar name={m} members={members} size={44} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.4px' }}>{m}</div>
                        <div style={{ fontSize: 12, color: isPos ? '#00c882' : isNeg ? '#f87171' : '#475569', fontWeight: 600, marginTop: 2 }}>
                          {isPos ? '← gets back' : isNeg ? '→ owes' : '✓ settled up'}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 24, fontWeight: 600, color: isPos ? '#00c882' : isNeg ? '#f87171' : '#334155', letterSpacing: '-1px' }}>
                      {isPos ? '+' : isNeg ? '-' : ''}₹{Math.abs(bal).toFixed(2)}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 14, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, borderRadius: 2, transition: 'width 0.6s ease' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[{ label: 'Paid', val: totalPaid, color: '#00c882' }, { label: 'Share', val: totalShare, color: '#f87171' }].map(stat => (
                      <div key={stat.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px' }}>
                        <div style={{ color: '#334155', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{stat.label}</div>
                        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 16, color: stat.color, fontWeight: 500 }}>₹{stat.val.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SETTLE UP ── */}
        {activeTab === 'settle' && (
          <>
            {settlements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 20px' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(0,200,130,0.12)', border: '2px solid rgba(0,200,130,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>✓</div>
                <p style={{ color: '#00c882', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>All settled up!</p>
                <p style={{ color: '#334155', fontSize: 14, marginTop: 6 }}>
                  {expenses.length === 0 ? 'Add some expenses to get started.' : 'No payments needed right now.'}
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={{ color: '#475569', fontSize: 13, fontWeight: 600 }}>
                    {settlements.length} payment{settlements.length > 1 ? 's' : ''} to settle all debts
                  </p>
                  <span style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', fontSize: 11, fontWeight: 700, borderRadius: 100, padding: '3px 10px' }}>PENDING</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {settlements.map((s, i) => {
                    const fc = getMemberColor(s.from, members);
                    const tc = getMemberColor(s.to, members);
                    return (
                      <div key={i} className="settle-card" style={{ background: 'rgba(255,255,255,0.032)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: 20, padding: '20px 22px', animationDelay: `${i * 0.07}s` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 52 }}>
                            <Avatar name={s.from} members={members} size={40} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: fc, marginTop: 6 }}>{s.from}</span>
                          </div>

                          <div style={{ flex: 1, textAlign: 'center', padding: '0 8px' }}>
                            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 22, fontWeight: 600, color: '#f1f5f9', letterSpacing: '-0.8px', marginBottom: 4 }}>₹{s.amount.toFixed(2)}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #1e3a5f)' }} />
                              <span style={{ color: '#334155', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>pays</span>
                              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #1e3a5f, transparent)' }} />
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 52 }}>
                            <Avatar name={s.to} members={members} size={40} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: tc, marginTop: 6 }}>{s.to}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
