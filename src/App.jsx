import React, { useState, useEffect, useMemo } from 'react';
import { checkDefs, money, statusOf } from './data/products';
import { Icon, navIcons, arrowUpHtml, arrowDownHtml } from './data/icons';
import { useSupabaseData } from './lib/useSupabaseData';

/* ── constants ─────────────────────────────────────────────── */
const FONT = "'IBM Plex Sans Thai', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', monospace";
const BG = '#eef3f9';
const CARD = { background: '#fff', border: '1px solid #e6edf5', borderRadius: '16px' };
const BLUE = '#2563eb';
const GREEN = '#16a34a';
const RED = '#ef4444';
const SIDEBAR_W = 268;
const BP = 860;
const FADE = { animation: 'fadeUp .45s cubic-bezier(.22,.61,.36,1)' };

const navGroups = [
  { label: 'เมนูหลัก', items: [
    { key: 'dashboard', label: 'แดชบอร์ด' },
    { key: 'items', label: 'สินค้า & สต็อก' },
    { key: 'locations', label: 'ตำแหน่งจัดเก็บ' },
  ]},
  { label: 'งานขาย', items: [
    { key: 'receiving', label: 'รับเข้าสินค้า' },
    { key: 'issue', label: 'จ่ายออกสินค้า' },
    { key: 'sales', label: 'ใบสั่งขาย' },
    { key: 'checklist', label: 'เช็คลิสต์สำรวจ' },
    { key: 'roi', label: 'คำนวณ ROI' },
  ]},
  { label: 'รายงาน', items: [
    { key: 'stockreport', label: 'รายงานสต็อก' },
    { key: 'movereport', label: 'รายงานเคลื่อนไหว' },
    { key: 'surveyreport', label: 'รายงานสำรวจ' },
    { key: 'customers', label: 'สถานะลูกค้า' },
  ]},
];

const screenTitles = {
  dashboard: 'แดชบอร์ด',
  items: 'สินค้า & สต็อก',
  locations: 'ตำแหน่งจัดเก็บ',
  receiving: 'รับเข้าสินค้า',
  issue: 'จ่ายออกสินค้า',
  sales: 'ใบสั่งขาย',
  checklist: 'เช็คลิสต์สำรวจ',
  roi: 'คำนวณ ROI · วิเคราะห์ความคุ้มค่าการลงทุน',
  stockreport: 'รายงานสต็อก',
  movereport: 'รายงานเคลื่อนไหว',
  surveyreport: 'รายงานสำรวจ',
  customers: 'สถานะลูกค้า',
};

/* ── helpers ────────────────────────────────────────────────── */
const pill = (label, fg, bg, extra = {}) => ({ display: 'inline-block', fontSize: '11.5px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', color: fg, background: bg, whiteSpace: 'nowrap', ...extra });

function CardWrap({ children, style = {} }) {
  return <div style={{ ...CARD, padding: '24px', ...style }}>{children}</div>;
}

function Th({ children, style = {} }) {
  return <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#7b8fa3', borderBottom: '2px solid #e6edf5', whiteSpace: 'nowrap', ...style }}>{children}</th>;
}

function Td({ children, style = {} }) {
  return <td style={{ padding: '10px 14px', fontSize: '13.5px', borderBottom: '1px solid #f0f4f9', whiteSpace: 'nowrap', ...style }}>{children}</td>;
}

/* ── main component ─────────────────────────────────────────── */
export default function App() {
  const [screen, setScreen] = useState('dashboard');
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('inv_user')); } catch { return null; } });
  const [selectedSku, setSelectedSku] = useState(null);
  const [catFilter, setCatFilter] = useState('ทั้งหมด');
  const [cart, setCart] = useState({});
  const [moveFilter, setMoveFilter] = useState('all');
  const [checks, setChecks] = useState({});
  const [notes, setNotes] = useState({});
  const [surveyCustomer, setSurveyCustomer] = useState('');
  const [surveyor, setSurveyor] = useState('');
  const [surveyDate, setSurveyDate] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginErr, setLoginErr] = useState('');

  const {
    products, locations, movements, customerGroups: customerData,
    users, surveys, setSurveys, loading: dbLoading, dbConnected,
    addMovement, addSurvey, updateProduct
  } = useSupabaseData();

  const mobile = vw <= BP;

  useEffect(() => {
    const h = () => setVw(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('inv_user', JSON.stringify(user));
    else localStorage.removeItem('inv_user');
  }, [user]);

  const doLogin = () => {
    const uname = loginUser.trim().toLowerCase();
    if (!uname) { setLoginErr('กรุณากรอกชื่อผู้ใช้'); return; }
    const u = users.find(x => x.id.toLowerCase() === uname);
    if (!u || loginPass !== u.pin) { setLoginErr('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'); return; }
    setUser(u);
    setLoginErr('');
    setLoginPass('');
    setLoginUser('');
  };

  const navigate = (k) => { setScreen(k); setDrawer(false); setJustSaved(false); };

  /* ── LOGIN SCREEN ──────────────────────────────────────────── */
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d1b2e, #162d4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
        <div style={{ ...FADE, background: '#fff', borderRadius: '24px', padding: '48px 40px', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0d1b2e', marginBottom: 4 }}>Solar Inventory</div>
            <div style={{ fontSize: '14px', color: '#7b8fa3' }}>ระบบจัดการคลังสินค้าโซลาร์เซลล์</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#4a5d74', display: 'block', marginBottom: 6 }}>ชื่อผู้ใช้ (Username)</label>
            <input type="text" autoCapitalize="none" autoCorrect="off" value={loginUser}
              onChange={e => { setLoginUser(e.target.value); setLoginErr(''); }}
              onKeyDown={e => { if (e.key === 'Enter') doLogin(); }}
              style={{ width: '100%', padding: '12px 16px', border: '2px solid #e6edf5', borderRadius: 12, fontSize: 15, fontFamily: FONT, boxSizing: 'border-box' }} placeholder="เช่น admin" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#4a5d74', display: 'block', marginBottom: 6 }}>รหัสผ่าน (Password)</label>
            <input type="password" value={loginPass}
              onChange={e => { setLoginPass(e.target.value); setLoginErr(''); }}
              onKeyDown={e => { if (e.key === 'Enter') doLogin(); }}
              style={{ width: '100%', padding: '12px 16px', border: '2px solid #e6edf5', borderRadius: 12, fontSize: 15, fontFamily: FONT, boxSizing: 'border-box' }} placeholder="••••••" />
            {loginErr && <div style={{ color: RED, fontSize: '12px', marginTop: 8, textAlign: 'center' }}>{loginErr}</div>}
          </div>
          <button onClick={doLogin}
            style={{ width: '100%', padding: '14px', background: BLUE, color: '#fff', border: 'none', borderRadius: 12, fontSize: '15px', fontWeight: 700 }}>
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  /* ── SIDEBAR ───────────────────────────────────────────────── */
  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-.3px' }}>Solar Inventory</div>
        <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,.45)', marginTop: 2 }}>ระบบจัดการคลังสินค้า</div>
      </div>
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {navGroups.map(g => (
          <div key={g.label} style={{ marginBottom: 8 }}>
            <div style={{ padding: '8px 24px 4px', fontSize: '10.5px', fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{g.label}</div>
            {g.items.map(it => {
              const active = screen === it.key;
              return (
                <button key={it.key} onClick={() => navigate(it.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '10px 24px', border: 'none', cursor: 'pointer',
                    background: active ? 'linear-gradient(90deg, rgba(37,99,235,.22), rgba(37,99,235,.05))' : 'transparent',
                    boxShadow: active ? 'inset 3px 0 0 #3b82f6' : 'none',
                    color: active ? '#93bbfc' : 'rgba(255,255,255,.55)',
                    fontSize: '13.5px', fontWeight: active ? 700 : 500,
                    transition: 'all .15s', textAlign: 'left',
                  }}>
                  <Icon path={navIcons[it.key]} color={active ? '#93bbfc' : 'rgba(255,255,255,.45)'} size={19} />
                  {it.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{user.name[0]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)' }}>{user.role}</div>
        </div>
        <button onClick={() => { setUser(null); setScreen('dashboard'); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: '18px', cursor: 'pointer', padding: 4 }} title="ออกจากระบบ">⏻</button>
      </div>
    </div>
  );

  const sidebar = mobile ? (
    <>
      {drawer && <div onClick={() => setDrawer(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 49 }} />}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_W, zIndex: 50,
        background: 'linear-gradient(180deg, #0d1b2e, #11233a)',
        transform: drawer ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .25s ease',
      }}>
        {sidebarContent}
      </div>
    </>
  ) : (
    <div style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_W, zIndex: 40,
      background: 'linear-gradient(180deg, #0d1b2e, #11233a)',
    }}>
      {sidebarContent}
    </div>
  );

  /* ── HEADER ────────────────────────────────────────────────── */
  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 28px', background: '#fff', borderBottom: '1px solid #e6edf5' }}>
      {mobile && (
        <button onClick={() => setDrawer(true)} style={{ background: 'none', border: 'none', fontSize: '22px', padding: 4, cursor: 'pointer', color: '#4a5d74' }}>☰</button>
      )}
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#0d1b2e' }}>{screenTitles[screen] || 'แดชบอร์ด'}</div>
      <div style={{ flex: 1 }} />
      {!mobile && (
        <div style={{ position: 'relative', width: 260 }}>
          <input placeholder="ค้นหา..." style={{ width: '100%', padding: '9px 14px 9px 36px', border: '1px solid #e6edf5', borderRadius: 10, fontSize: '13px', background: '#f6f9fc' }} readOnly />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9aabbf', fontSize: '14px' }}>🔍</span>
        </div>
      )}
      <div style={{ position: 'relative', cursor: 'pointer' }}>
        <span style={{ fontSize: '19px', color: '#7b8fa3' }}>🔔</span>
        <span style={{ position: 'absolute', top: -4, right: -6, width: 17, height: 17, borderRadius: '50%', background: RED, color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
      </div>
      {!mobile && (
        <div style={{ fontSize: '13px', color: '#7b8fa3', fontFamily: MONO }}>
          {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )}
    </div>
  );

  /* ── SCREEN RENDERERS ──────────────────────────────────────── */
  const renderScreen = () => {
    switch (screen) {
      case 'dashboard': return <DashboardScreen products={products} movements={movements} mobile={mobile} />;
      case 'receiving': return <ReceivingScreen mobile={mobile} />;
      case 'issue': return <IssueScreen mobile={mobile} />;
      case 'items': return <ItemsScreen products={products} movements={movements} selectedSku={selectedSku} setSelectedSku={setSelectedSku} catFilter={catFilter} setCatFilter={setCatFilter} mobile={mobile} />;
      case 'locations': return <LocationsScreen locations={locations} mobile={mobile} />;
      case 'sales': return <SalesScreen products={products} cart={cart} setCart={setCart} mobile={mobile} />;
      case 'stockreport': return <StockReportScreen products={products} mobile={mobile} />;
      case 'movereport': return <MoveReportScreen movements={movements} moveFilter={moveFilter} setMoveFilter={setMoveFilter} mobile={mobile} />;
      case 'checklist': return <ChecklistScreen checks={checks} setChecks={setChecks} notes={notes} setNotes={setNotes} surveyCustomer={surveyCustomer} setSurveyCustomer={setSurveyCustomer} surveyor={surveyor} setSurveyor={setSurveyor} surveyDate={surveyDate} setSurveyDate={setSurveyDate} surveys={surveys} setSurveys={setSurveys} navigate={navigate} setJustSaved={setJustSaved} mobile={mobile} />;
      case 'roi': return <RoiScreen mobile={mobile} />;
      case 'surveyreport': return <SurveyReportScreen surveys={surveys} justSaved={justSaved} mobile={mobile} />;
      case 'customers': return <CustomersScreen customerData={customerData} mobile={mobile} />;
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily: FONT, minHeight: '100vh', background: BG }}>
      {sidebar}
      <div style={{ marginLeft: mobile ? 0 : SIDEBAR_W, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {header}
        <div key={screen} style={{ flex: 1, padding: mobile ? '16px' : '28px', ...FADE }}>
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════════════════ */
function DashboardScreen({ products, movements, mobile }) {
  const kpis = [
    { label: 'มูลค่าสต็อกรวม', value: '฿8.42M', sub: '+12% จากเดือนก่อน', color: BLUE, icon: '📦' },
    { label: 'จำนวน SKU', value: '128', sub: 'รายการทั้งหมด', color: '#7c3aed', icon: '🏷️' },
    { label: 'สินค้าใกล้หมด', value: '7', sub: 'ต่ำกว่า Min', color: '#d97706', icon: '⚠️' },
    { label: 'รับเข้า / จ่ายออก', value: '42 / 31', sub: 'เดือนนี้', color: GREEN, icon: '🔄' },
    { label: 'รอดำเนินการ', value: '5', sub: 'ใบเบิก/ใบรับ', color: RED, icon: '📋' },
  ];

  const cats = [
    { label: 'แผงโซล่าร์เซลล์', val: 1056, max: 1200, color: '#3b82f6' },
    { label: 'อินเวอร์เตอร์', val: 24, max: 160, color: '#8b5cf6' },
    { label: 'แบตเตอรี่', val: 0, max: 70, color: '#22c55e' },
    { label: 'สมาร์ทมิเตอร์', val: 5, max: 120, color: '#06b6d4' },
    { label: 'เบรกเกอร์', val: 5, max: 50, color: '#f59e0b' },
    { label: 'อุปกรณ์อื่นๆ', val: 6, max: 60, color: '#ec4899' },
  ];

  const lowStock = products.filter(p => p.st.key === 'low' || p.st.key === 'out').slice(0, 4);
  const recentMov = movements.slice(0, 5);

  return (
    <div>
      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <CardWrap key={i} style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: '12.5px', color: '#7b8fa3', fontWeight: 600 }}>{k.label}</span>
              <span style={{ fontSize: '20px' }}>{k.icon}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0d1b2e', fontFamily: MONO, marginBottom: 4 }}>{k.value}</div>
            <div style={{ fontSize: '11.5px', color: k.color, fontWeight: 600 }}>{k.sub}</div>
          </CardWrap>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Stock by Category */}
        <CardWrap>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0d1b2e', marginBottom: 20 }}>สต็อกตามหมวดหมู่</div>
          {cats.map((c, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: 5 }}>
                <span style={{ color: '#4a5d74', fontWeight: 600 }}>{c.label}</span>
                <span style={{ fontFamily: MONO, color: '#7b8fa3', fontWeight: 600 }}>{c.val} / {c.max}</span>
              </div>
              <div style={{ height: 10, background: '#eef3f9', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: Math.min(100, (c.val / c.max) * 100) + '%', background: c.color, borderRadius: 6, animation: 'growW .8s ease', transformOrigin: 'left' }} />
              </div>
            </div>
          ))}
        </CardWrap>

        {/* Low Stock Alerts */}
        <CardWrap>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0d1b2e', marginBottom: 16 }}>แจ้งเตือนสินค้าใกล้หมด</div>
          {lowStock.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < lowStock.length - 1 ? '1px solid #f0f4f9' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.st.dot, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0d1b2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: '11.5px', color: '#7b8fa3' }}>{p.sku} · {p.loc}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: p.st.fg, fontFamily: MONO }}>{p.qty}</div>
                <div style={{ fontSize: '11px', color: '#7b8fa3' }}>Min {p.min}</div>
              </div>
              <span style={pill(p.st.label, p.st.fg, p.st.bg)}>{p.st.label}</span>
            </div>
          ))}
        </CardWrap>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 20 }}>
        {/* Recent Movements */}
        <CardWrap>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0d1b2e', marginBottom: 16 }}>เคลื่อนไหวล่าสุด</div>
          {recentMov.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < recentMov.length - 1 ? '1px solid #f0f4f9' : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                dangerouslySetInnerHTML={{ __html: m.isIn ? arrowUpHtml : arrowDownHtml }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0d1b2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                <div style={{ fontSize: '11.5px', color: '#7b8fa3' }}>{m.ref} · {m.time}</div>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: MONO, color: m.fg }}>{m.qtyText}</span>
            </div>
          ))}
        </CardWrap>

        {/* Warehouse Capacity */}
        <div style={{ background: 'linear-gradient(135deg, #0d1b2e, #162d4a)', borderRadius: 16, padding: 24, color: '#fff' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: 20 }}>ความจุคลังสินค้า</div>
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <div style={{ fontSize: '52px', fontWeight: 800, fontFamily: MONO }}>68%</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.55)', marginTop: 4 }}>ใช้งานแล้ว</div>
          </div>
          <div style={{ height: 12, background: 'rgba(255,255,255,.12)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: 8, animation: 'growW .8s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'rgba(255,255,255,.5)' }}>
            <span>ใช้งาน 1,737 หน่วย</span>
            <span>คงเหลือ 823 หน่วย</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GOODS RECEIVING
   ══════════════════════════════════════════════════════════════ */
function ReceivingScreen({ mobile }) {
  const lines = [
    { sku: 'PNL-LG650', name: 'แผงโซล่าร์ Longi 650W', qty: 720, unit: 'แผง', loc: 'A1-03' },
    { sku: 'BAT-LVT16', name: 'แบตเตอรี่ LVTOPSUN 314A (16kWh)', qty: 8, unit: 'ก้อน', loc: 'B1-04' },
    { sku: 'INV-HW5K', name: 'Huawei SUN2000-5KTL-LB0 (5kW)', qty: 6, unit: 'เครื่อง', loc: 'B2-01' },
  ];
  const recent = [
    { ref: 'GR-2569-0142', date: '13 มิ.ย. 2569', items: 2, status: 'done' },
    { ref: 'GR-2569-0141', date: '11 มิ.ย. 2569', items: 1, status: 'done' },
    { ref: 'GR-2569-0140', date: '09 พ.ค. 2569', items: 3, status: 'done' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 340px', gap: 24, alignItems: 'flex-start' }}>
      <div>
        <CardWrap style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0d1b2e', marginBottom: 20 }}>ใบรับสินค้าเข้า</div>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'เลขที่เอกสาร', val: 'GR-2569-0143' },
              { label: 'วันที่', val: '20 มิ.ย. 2569' },
              { label: 'เลขที่ PO', val: 'PO-2569-0088' },
              { label: 'ผู้จำหน่าย', val: 'บ้านพลังงาน จำกัด' },
            ].map((f, i) => (
              <div key={i}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#7b8fa3', marginBottom: 4 }}>{f.label}</label>
                <input readOnly value={f.val} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e6edf5', borderRadius: 10, fontSize: '13.5px', background: '#f6f9fc', fontFamily: f.label === 'เลขที่เอกสาร' ? MONO : 'inherit' }} />
              </div>
            ))}
          </div>
        </CardWrap>

        <CardWrap>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0d1b2e', marginBottom: 14 }}>รายการสินค้า</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <Th>SKU</Th><Th>สินค้า</Th><Th>จำนวน</Th><Th>หน่วย</Th><Th>ตำแหน่ง</Th>
              </tr></thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i}>
                    <Td style={{ fontFamily: MONO, fontSize: '12.5px', fontWeight: 600, color: BLUE }}>{l.sku}</Td>
                    <Td style={{ fontWeight: 600 }}>{l.name}</Td>
                    <Td><span style={{ fontFamily: MONO, fontWeight: 700, color: GREEN }}>+{l.qty}</span></Td>
                    <Td>{l.unit}</Td>
                    <Td><span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: 7, background: '#eef3f9', color: '#4a5d74' }}>{l.loc}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardWrap>
      </div>

      {/* Right sidebar */}
      <div>
        <div style={{ background: 'linear-gradient(135deg, #0d1b2e, #162d4a)', borderRadius: 16, padding: 24, color: '#fff', marginBottom: 16 }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>รับเข้าวันนี้</div>
          <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: MONO }}>42</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.45)' }}>รายการ</div>
        </div>

        <CardWrap>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0d1b2e', marginBottom: 14 }}>รายการล่าสุด</div>
          {recent.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < recent.length - 1 ? '1px solid #f0f4f9' : 'none' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: MONO, color: BLUE }}>{r.ref}</div>
                <div style={{ fontSize: '11.5px', color: '#7b8fa3' }}>{r.date} · {r.items} รายการ</div>
              </div>
              <span style={pill('เสร็จสิ้น', '#15803d', '#dcfce7')}>เสร็จสิ้น</span>
            </div>
          ))}
        </CardWrap>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   GOODS ISSUE
   ══════════════════════════════════════════════════════════════ */
function IssueScreen({ mobile }) {
  const lines = [
    { sku: 'INV-SL6K', name: 'Solis S6-EH1P6K-L-PLUS (6kW)', qty: 2, unit: 'เครื่อง', loc: 'B2-08' },
    { sku: 'INV-SL10K', name: 'Solis S6-EH1P10K-L-PLUS (10kW)', qty: 2, unit: 'เครื่อง', loc: 'B2-07' },
    { sku: 'PNL-LG650', name: 'แผงโซล่าร์ Longi 650W', qty: 96, unit: 'แผง', loc: 'A1-03' },
  ];
  const recent = [
    { ref: 'GI-2569-0098', date: '23 พ.ค. 2569', items: 2, status: 'done' },
    { ref: 'GI-2569-0097', date: '21 พ.ค. 2569', items: 1, status: 'done' },
    { ref: 'GI-2569-0096', date: '15 พ.ค. 2569', items: 3, status: 'done' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 340px', gap: 24, alignItems: 'flex-start' }}>
      <div>
        <CardWrap style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0d1b2e', marginBottom: 20 }}>ใบจ่ายสินค้าออก</div>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'เลขที่เอกสาร', val: 'GI-2569-0099' },
              { label: 'วันที่', val: '20 มิ.ย. 2569' },
              { label: 'เลขที่ SO', val: 'SO-2569-0055' },
              { label: 'โครงการ / ลูกค้า', val: 'คุณสุภาวดี (ภูเก็ต)' },
            ].map((f, i) => (
              <div key={i}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#7b8fa3', marginBottom: 4 }}>{f.label}</label>
                <input readOnly value={f.val} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e6edf5', borderRadius: 10, fontSize: '13.5px', background: '#f6f9fc', fontFamily: f.label === 'เลขที่เอกสาร' ? MONO : 'inherit' }} />
              </div>
            ))}
          </div>
        </CardWrap>

        <CardWrap>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0d1b2e', marginBottom: 14 }}>รายการสินค้า</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <Th>SKU</Th><Th>สินค้า</Th><Th>จำนวน</Th><Th>หน่วย</Th><Th>ตำแหน่ง</Th>
              </tr></thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i}>
                    <Td style={{ fontFamily: MONO, fontSize: '12.5px', fontWeight: 600, color: BLUE }}>{l.sku}</Td>
                    <Td style={{ fontWeight: 600 }}>{l.name}</Td>
                    <Td><span style={{ fontFamily: MONO, fontWeight: 700, color: RED }}>−{l.qty}</span></Td>
                    <Td>{l.unit}</Td>
                    <Td><span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: 7, background: '#eef3f9', color: '#4a5d74' }}>{l.loc}</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardWrap>
      </div>

      {/* Right sidebar */}
      <div>
        <div style={{ background: 'linear-gradient(135deg, #2d0a0a, #4a1010)', borderRadius: 16, padding: 24, color: '#fff', marginBottom: 16 }}>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>จ่ายออกวันนี้</div>
          <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: MONO }}>31</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.45)' }}>รายการ</div>
        </div>

        <CardWrap>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0d1b2e', marginBottom: 14 }}>รายการล่าสุด</div>
          {recent.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < recent.length - 1 ? '1px solid #f0f4f9' : 'none' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: MONO, color: RED }}>{r.ref}</div>
                <div style={{ fontSize: '11.5px', color: '#7b8fa3' }}>{r.date} · {r.items} รายการ</div>
              </div>
              <span style={pill('เสร็จสิ้น', '#15803d', '#dcfce7')}>เสร็จสิ้น</span>
            </div>
          ))}
        </CardWrap>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ITEMS & STOCK
   ══════════════════════════════════════════════════════════════ */
function ItemsScreen({ products, movements, selectedSku, setSelectedSku, catFilter, setCatFilter, mobile }) {
  const cats = ['ทั้งหมด', ...new Set(products.map(p => p.cat))];
  const filtered = catFilter === 'ทั้งหมด' ? products : products.filter(p => p.cat === catFilter);
  const selected = selectedSku ? products.find(p => p.sku === selectedSku) : null;
  const relatedMoves = selectedSku ? movements.filter(m => m.sku === selectedSku).slice(0, 5) : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 380px', gap: 24, alignItems: 'flex-start' }}>
      <CardWrap>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              style={{
                padding: '6px 16px', borderRadius: 20, border: '1px solid #e6edf5', fontSize: '12.5px', fontWeight: 600,
                background: catFilter === c ? BLUE : '#fff', color: catFilter === c ? '#fff' : '#4a5d74', cursor: 'pointer',
              }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th>SKU</Th><Th>สินค้า</Th><Th>ตำแหน่ง</Th><Th style={{ textAlign: 'right' }}>คงเหลือ</Th><Th>สถานะ</Th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.sku} onClick={() => setSelectedSku(p.sku)}
                  style={{ cursor: 'pointer', background: selectedSku === p.sku ? '#f0f6ff' : 'transparent', transition: 'background .15s' }}>
                  <Td style={{ fontFamily: MONO, fontSize: '12px', fontWeight: 600, color: BLUE }}>{p.sku}</Td>
                  <Td style={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</Td>
                  <Td><span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: 7, background: '#eef3f9', color: '#4a5d74' }}>{p.loc}</span></Td>
                  <Td style={{ textAlign: 'right', fontFamily: MONO, fontWeight: 700 }}>{p.qty}</Td>
                  <Td><span style={pill(p.st.label, p.st.fg, p.st.bg)}>{p.st.label}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardWrap>

      {/* Detail panel */}
      <div style={{ position: mobile ? 'static' : 'sticky', top: 100 }}>
        {selected ? (
          <CardWrap>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0d1b2e', marginBottom: 4 }}>{selected.name}</div>
            <div style={{ fontSize: '12.5px', fontFamily: MONO, color: BLUE, fontWeight: 600, marginBottom: 16 }}>{selected.sku}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '12.5px', color: '#7b8fa3', fontWeight: 600 }}>ระดับสต็อก</span>
              <span style={{ fontSize: '12.5px', fontFamily: MONO, fontWeight: 700, color: '#0d1b2e' }}>{selected.qty} / {selected.max} {selected.unit}</span>
            </div>
            <div style={{ height: 10, background: '#eef3f9', borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ height: '100%', width: selected.fillPct, background: selected.st.dot, borderRadius: 6, transition: 'width .5s ease' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { l: 'ราคาต่อหน่วย', v: selected.priceText },
                { l: 'มูลค่าคงเหลือ', v: selected.valueText },
                { l: 'Min', v: selected.min },
                { l: 'Max', v: selected.max },
                { l: 'หมวดหมู่', v: selected.cat },
                { l: 'ตำแหน่ง', v: selected.loc },
              ].map((f, i) => (
                <div key={i} style={{ background: '#f6f9fc', padding: '10px 14px', borderRadius: 10 }}>
                  <div style={{ fontSize: '11px', color: '#7b8fa3', fontWeight: 600, marginBottom: 2 }}>{f.l}</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0d1b2e' }}>{f.v}</div>
                </div>
              ))}
            </div>

            {relatedMoves.length > 0 && (
              <>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0d1b2e', marginBottom: 10 }}>ประวัติเคลื่อนไหว</div>
                {relatedMoves.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < relatedMoves.length - 1 ? '1px solid #f0f4f9' : 'none' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      dangerouslySetInnerHTML={{ __html: m.isIn ? arrowUpHtml.replace(/19/g, '14') : arrowDownHtml.replace(/19/g, '14') }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0d1b2e' }}>{m.ref}</div>
                      <div style={{ fontSize: '11px', color: '#7b8fa3' }}>{m.time}</div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: MONO, color: m.fg }}>{m.qtyText}</span>
                  </div>
                ))}
              </>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button style={{ flex: 1, padding: '10px', background: GREEN, color: '#fff', border: 'none', borderRadius: 10, fontSize: '13px', fontWeight: 700 }}>รับเข้า</button>
              <button style={{ flex: 1, padding: '10px', background: RED, color: '#fff', border: 'none', borderRadius: 10, fontSize: '13px', fontWeight: 700 }}>จ่ายออก</button>
            </div>
          </CardWrap>
        ) : (
          <CardWrap style={{ textAlign: 'center', padding: '48px 24px', color: '#9aabbf' }}>
            <div style={{ fontSize: '36px', marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>เลือกสินค้าเพื่อดูรายละเอียด</div>
          </CardWrap>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LOCATIONS
   ══════════════════════════════════════════════════════════════ */
function LocationsScreen({ locations, mobile }) {
  return (
    <div>
      <CardWrap style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef3f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🏭</div>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: '#0d1b2e' }}>คลัง Nst นาหลวง</div>
          <div style={{ fontSize: '13px', color: '#7b8fa3' }}>7 โซน · 2,560 หน่วยรวม</div>
        </div>
      </CardWrap>

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, 1fr)', gap: 16 }}>
        {locations.map((loc, i) => {
          const pct = Math.round(loc.used / loc.cap * 100);
          return (
            <CardWrap key={i} style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: loc.color, fontFamily: MONO }}>{loc.code}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0d1b2e', marginTop: 2 }}>{loc.name}</div>
                </div>
                <span style={pill(loc.type, '#4a5d74', '#eef3f9', { fontSize: '11px' })}>{loc.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 5 }}>
                <span style={{ color: '#7b8fa3', fontWeight: 600 }}>{loc.used} / {loc.cap}</span>
                <span style={{ fontWeight: 700, fontFamily: MONO, color: pct > 80 ? '#d97706' : '#0d1b2e' }}>{pct}%</span>
              </div>
              <div style={{ height: 8, background: '#eef3f9', borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: pct + '%', background: loc.color, borderRadius: 6, animation: 'growW .8s ease' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#7b8fa3' }}>{loc.items} ประเภทสินค้า</div>
            </CardWrap>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SALES ORDER
   ══════════════════════════════════════════════════════════════ */
function SalesScreen({ products, cart, setCart, mobile }) {
  const addToCart = (sku) => setCart(c => ({ ...c, [sku]: (c[sku] || 0) + 1 }));
  const changeQty = (sku, delta) => setCart(c => {
    const n = (c[sku] || 0) + delta;
    if (n <= 0) { const { [sku]: _, ...rest } = c; return rest; }
    return { ...c, [sku]: n };
  });

  const cartItems = Object.entries(cart).map(([sku, qty]) => {
    const p = products.find(x => x.sku === sku);
    return p ? { ...p, cartQty: qty, lineTotal: qty * p.price } : null;
  }).filter(Boolean);

  const subtotal = cartItems.reduce((s, x) => s + x.lineTotal, 0);
  const vat = Math.round(subtotal * 0.07);
  const grand = subtotal + vat;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 380px', gap: 24, alignItems: 'flex-start' }}>
      {/* Product catalog */}
      <div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0d1b2e', marginBottom: 16 }}>สินค้าทั้งหมด</div>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 14 }}>
          {products.filter(p => p.qty > 0).map(p => (
            <CardWrap key={p.sku} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0d1b2e', lineHeight: 1.4 }}>{p.name}</div>
              <div style={{ fontSize: '11.5px', fontFamily: MONO, color: BLUE, fontWeight: 600 }}>{p.sku}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: MONO, color: '#0d1b2e' }}>{p.priceText}</span>
                <span style={{ fontSize: '11.5px', color: '#7b8fa3' }}>คงเหลือ {p.qty} {p.unit}</span>
              </div>
              <button onClick={() => addToCart(p.sku)}
                style={{ width: '100%', padding: '9px', background: BLUE, color: '#fff', border: 'none', borderRadius: 10, fontSize: '13px', fontWeight: 700, marginTop: 'auto' }}>
                + เพิ่มลงตะกร้า
              </button>
            </CardWrap>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div style={{ position: mobile ? 'static' : 'sticky', top: 100 }}>
        <CardWrap>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0d1b2e', marginBottom: 16 }}>🛒 ตะกร้าสินค้า</div>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9aabbf', fontSize: '13px' }}>ยังไม่มีสินค้าในตะกร้า</div>
          ) : (
            <>
              {cartItems.map((item, i) => (
                <div key={item.sku} style={{ padding: '12px 0', borderBottom: i < cartItems.length - 1 ? '1px solid #f0f4f9' : 'none' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0d1b2e', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => changeQty(item.sku, -1)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e6edf5', background: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: '14px', minWidth: 24, textAlign: 'center' }}>{item.cartQty}</span>
                      <button onClick={() => changeQty(item.sku, 1)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e6edf5', background: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: '14px', color: '#0d1b2e' }}>{money(item.lineTotal)}</span>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '2px solid #e6edf5', marginTop: 12, paddingTop: 12 }}>
                {[
                  { l: 'ยอดรวม', v: money(subtotal) },
                  { l: 'VAT 7%', v: money(vat) },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: '#7b8fa3' }}>
                    <span>{r.l}</span><span style={{ fontFamily: MONO, fontWeight: 600 }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: '16px', fontWeight: 800, color: '#0d1b2e' }}>
                  <span>ยอดรวมทั้งสิ้น</span><span style={{ fontFamily: MONO }}>{money(grand)}</span>
                </div>
              </div>
              <button style={{ width: '100%', padding: '14px', background: GREEN, color: '#fff', border: 'none', borderRadius: 12, fontSize: '15px', fontWeight: 700, marginTop: 16 }}>
                ยืนยันใบสั่งขาย
              </button>
            </>
          )}
        </CardWrap>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STOCK REPORT
   ══════════════════════════════════════════════════════════════ */
function StockReportScreen({ products, mobile }) {
  const totalValue = products.reduce((s, p) => s + p.value, 0);
  const totalQty = products.reduce((s, p) => s + p.qty, 0);
  const lowCount = products.filter(p => p.st.key === 'low' || p.st.key === 'out').length;
  const okCount = products.filter(p => p.st.key === 'ok').length;

  const summaryCards = [
    { label: 'มูลค่ารวม', value: money(totalValue), color: BLUE, icon: '💰' },
    { label: 'จำนวนรวม', value: totalQty.toLocaleString() + ' หน่วย', color: '#7c3aed', icon: '📦' },
    { label: 'สินค้าปกติ', value: okCount, color: GREEN, icon: '✅' },
    { label: 'ต่ำ/หมด', value: lowCount, color: RED, icon: '⚠️' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {summaryCards.map((c, i) => (
          <CardWrap key={i} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: '12.5px', color: '#7b8fa3', fontWeight: 600 }}>{c.label}</span>
              <span style={{ fontSize: '18px' }}>{c.icon}</span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0d1b2e', fontFamily: MONO }}>{c.value}</div>
          </CardWrap>
        ))}
      </div>

      <CardWrap>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0d1b2e', marginBottom: 16 }}>รายงานสต็อกทั้งหมด</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th>SKU</Th><Th>สินค้า</Th><Th>หมวดหมู่</Th><Th>ตำแหน่ง</Th>
              <Th style={{ textAlign: 'right' }}>คงเหลือ</Th>
              <Th style={{ textAlign: 'right' }}>มูลค่า</Th>
              <Th>สถานะ</Th>
            </tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.sku}>
                  <Td style={{ fontFamily: MONO, fontSize: '12px', fontWeight: 600, color: BLUE }}>{p.sku}</Td>
                  <Td style={{ fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</Td>
                  <Td style={{ fontSize: '12.5px', color: '#4a5d74' }}>{p.cat}</Td>
                  <Td><span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: 7, background: '#eef3f9', color: '#4a5d74' }}>{p.loc}</span></Td>
                  <Td style={{ textAlign: 'right', fontFamily: MONO, fontWeight: 700 }}>{p.qty}</Td>
                  <Td style={{ textAlign: 'right', fontFamily: MONO, fontWeight: 600, color: '#4a5d74' }}>{p.valueText}</Td>
                  <Td><span style={pill(p.st.label, p.st.fg, p.st.bg)}>{p.st.label}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardWrap>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MOVEMENT REPORT
   ══════════════════════════════════════════════════════════════ */
function MoveReportScreen({ movements, moveFilter, setMoveFilter, mobile }) {
  const filters = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'in', label: 'รับเข้า' },
    { key: 'out', label: 'จ่ายออก' },
  ];
  const filtered = moveFilter === 'all' ? movements : movements.filter(m => m.dir === moveFilter);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setMoveFilter(f.key)}
            style={{
              padding: '8px 20px', borderRadius: 20, border: '1px solid #e6edf5', fontSize: '13px', fontWeight: 600,
              background: moveFilter === f.key ? BLUE : '#fff', color: moveFilter === f.key ? '#fff' : '#4a5d74', cursor: 'pointer',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      <CardWrap>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th>เลขที่</Th><Th>ประเภท</Th><Th>วัน/เวลา</Th><Th>SKU</Th><Th>สินค้า</Th>
              <Th style={{ textAlign: 'right' }}>จำนวน</Th><Th>ตำแหน่ง</Th><Th>ผู้ดำเนินการ</Th><Th>อ้างอิง</Th>
            </tr></thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={i}>
                  <Td style={{ fontFamily: MONO, fontSize: '12px', fontWeight: 600, color: BLUE }}>{m.ref}</Td>
                  <Td><span style={pill(m.typeLabel, m.fg, m.bg)}>{m.typeLabel}</span></Td>
                  <Td style={{ fontSize: '12.5px', color: '#4a5d74' }}>{m.time}</Td>
                  <Td style={{ fontFamily: MONO, fontSize: '12px', fontWeight: 600 }}>{m.sku}</Td>
                  <Td style={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</Td>
                  <Td style={{ textAlign: 'right', fontFamily: MONO, fontWeight: 700, color: m.fg }}>{m.qtyText}</Td>
                  <Td><span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: 7, background: '#eef3f9', color: '#4a5d74' }}>{m.loc}</span></Td>
                  <Td style={{ fontSize: '12.5px' }}>{m.by}</Td>
                  <Td style={{ fontSize: '12.5px', color: '#7b8fa3', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.doc}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardWrap>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CHECKLIST
   ══════════════════════════════════════════════════════════════ */
function ChecklistScreen({ checks, setChecks, notes, setNotes, surveyCustomer, setSurveyCustomer, surveyor, setSurveyor, surveyDate, setSurveyDate, surveys, setSurveys, navigate, setJustSaved, mobile }) {
  const totalChecks = checkDefs.reduce((s, g) => s + g[1].length, 0);
  const doneCount = Object.values(checks).filter(Boolean).length;
  const pct = totalChecks > 0 ? Math.round(doneCount / totalChecks * 100) : 0;

  const handleSubmit = () => {
    const newSurvey = {
      id: 'SV-2569-' + String(surveys.length + 1).padStart(4, '0'),
      customer: surveyCustomer || 'ไม่ระบุ',
      surveyor: surveyor || 'ไม่ระบุ',
      date: surveyDate || new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
      roof: '—', azimuth: '—', sizeKw: 0, panels: 0,
      done: doneCount, total: totalChecks,
      status: pct === 100 ? 'approved' : 'pending',
    };
    setSurveys(prev => [newSurvey, ...prev]);
    setChecks({});
    setNotes({});
    setSurveyCustomer('');
    setSurveyor('');
    setSurveyDate('');
    setJustSaved(true);
    navigate('surveyreport');
  };

  // SVG ring
  const R = 58, C = 2 * Math.PI * R;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 340px', gap: 24, alignItems: 'flex-start' }}>
      <div>
        {checkDefs.map(([group, items], gi) => (
          <CardWrap key={gi} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0d1b2e', marginBottom: 14 }}>{group}</div>
            {items.map(([id, label]) => (
              <div key={id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #f0f4f9' }}>
                <button onClick={() => setChecks(c => ({ ...c, [id]: !c[id] }))}
                  style={{
                    width: 24, height: 24, borderRadius: 7, border: checks[id] ? 'none' : '2px solid #d0d9e4',
                    background: checks[id] ? GREEN : '#fff', color: '#fff', fontSize: '14px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 2,
                  }}>
                  {checks[id] ? '✓' : ''}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: checks[id] ? '#7b8fa3' : '#0d1b2e', textDecoration: checks[id] ? 'line-through' : 'none' }}>{label}</div>
                  <input placeholder="หมายเหตุ..." value={notes[id] || ''} onChange={e => setNotes(n => ({ ...n, [id]: e.target.value }))}
                    style={{ marginTop: 6, width: '100%', padding: '7px 12px', border: '1px solid #e6edf5', borderRadius: 8, fontSize: '12.5px', background: '#f6f9fc' }} />
                </div>
              </div>
            ))}
          </CardWrap>
        ))}
      </div>

      {/* Right panel */}
      <div style={{ position: mobile ? 'static' : 'sticky', top: 100 }}>
        <CardWrap style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0d1b2e', marginBottom: 20 }}>ความคืบหน้า</div>
          <svg width="140" height="140" viewBox="0 0 140 140" style={{ display: 'block', margin: '0 auto 16px' }}>
            <circle cx="70" cy="70" r={R} fill="none" stroke="#eef3f9" strokeWidth="10" />
            <circle cx="70" cy="70" r={R} fill="none" stroke={GREEN} strokeWidth="10"
              strokeDasharray={C} strokeDashoffset={C - (C * pct / 100)}
              strokeLinecap="round" transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset .5s ease' }} />
            <text x="70" y="66" textAnchor="middle" fontSize="28" fontWeight="800" fill="#0d1b2e" fontFamily={MONO}>{pct}%</text>
            <text x="70" y="86" textAnchor="middle" fontSize="12" fill="#7b8fa3">{doneCount}/{totalChecks} รายการ</text>
          </svg>
          <button onClick={handleSubmit} disabled={doneCount === 0}
            style={{
              width: '100%', padding: '14px', background: doneCount > 0 ? GREEN : '#c7d4e3', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: '15px', fontWeight: 700, cursor: doneCount > 0 ? 'pointer' : 'default',
            }}>
            บันทึกผลสำรวจ
          </button>
        </CardWrap>

        <CardWrap>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0d1b2e', marginBottom: 14 }}>ข้อมูลสำรวจ</div>
          {[
            { label: 'ลูกค้า', value: surveyCustomer, setter: setSurveyCustomer },
            { label: 'ผู้สำรวจ', value: surveyor, setter: setSurveyor },
            { label: 'วันที่', value: surveyDate, setter: setSurveyDate },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#7b8fa3', marginBottom: 4 }}>{f.label}</label>
              <input value={f.value} onChange={e => f.setter(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e6edf5', borderRadius: 10, fontSize: '13.5px', background: '#f6f9fc' }} />
            </div>
          ))}
        </CardWrap>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SURVEY REPORT
   ══════════════════════════════════════════════════════════════ */
function SurveyReportScreen({ surveys, justSaved, mobile }) {
  const approved = surveys.filter(s => s.status === 'approved').length;
  const pending = surveys.filter(s => s.status === 'pending').length;
  const rework = surveys.filter(s => s.status === 'rework').length;

  const statusMap = {
    approved: { label: 'อนุมัติ', fg: '#15803d', bg: '#dcfce7' },
    pending: { label: 'รอตรวจ', fg: '#b45309', bg: '#fef3c7' },
    rework: { label: 'แก้ไข', fg: '#b91c1c', bg: '#fee2e2' },
  };

  const statCards = [
    { label: 'สำรวจทั้งหมด', value: surveys.length, color: BLUE, icon: '📋' },
    { label: 'อนุมัติแล้ว', value: approved, color: GREEN, icon: '✅' },
    { label: 'รอตรวจสอบ', value: pending, color: '#d97706', icon: '⏳' },
    { label: 'ต้องแก้ไข', value: rework, color: RED, icon: '🔄' },
  ];

  return (
    <div>
      {justSaved && (
        <div style={{ ...CARD, background: '#dcfce7', border: '1px solid #bbf7d0', padding: '16px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#15803d' }}>บันทึกสำเร็จ!</div>
            <div style={{ fontSize: '12.5px', color: '#16a34a' }}>ผลสำรวจถูกบันทึกเรียบร้อยแล้ว</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map((c, i) => (
          <CardWrap key={i} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: '12.5px', color: '#7b8fa3', fontWeight: 600 }}>{c.label}</span>
              <span style={{ fontSize: '18px' }}>{c.icon}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0d1b2e', fontFamily: MONO }}>{c.value}</div>
          </CardWrap>
        ))}
      </div>

      <CardWrap>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0d1b2e', marginBottom: 16 }}>รายการสำรวจ</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <Th>รหัส</Th><Th>ลูกค้า</Th><Th>ผู้สำรวจ</Th><Th>วันที่</Th><Th>ขนาด</Th><Th>ความคืบหน้า</Th><Th>สถานะ</Th>
            </tr></thead>
            <tbody>
              {surveys.map((s, i) => {
                const st = statusMap[s.status] || statusMap.pending;
                const svPct = Math.round(s.done / s.total * 100);
                return (
                  <tr key={i}>
                    <Td style={{ fontFamily: MONO, fontSize: '12px', fontWeight: 600, color: BLUE }}>{s.id}</Td>
                    <Td style={{ fontWeight: 600 }}>{s.customer}</Td>
                    <Td style={{ fontSize: '12.5px' }}>{s.surveyor}</Td>
                    <Td style={{ fontSize: '12.5px', color: '#4a5d74' }}>{s.date}</Td>
                    <Td style={{ fontFamily: MONO, fontWeight: 600 }}>{s.sizeKw} kW</Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#eef3f9', borderRadius: 4, overflow: 'hidden', minWidth: 60 }}>
                          <div style={{ height: '100%', width: svPct + '%', background: svPct === 100 ? GREEN : '#f59e0b', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: '11.5px', fontFamily: MONO, fontWeight: 600, color: '#7b8fa3' }}>{svPct}%</span>
                      </div>
                    </Td>
                    <Td><span style={pill(st.label, st.fg, st.bg)}>{st.label}</span></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardWrap>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CUSTOMERS
   ══════════════════════════════════════════════════════════════ */
function CustomersScreen({ customerData, mobile }) {
  const allRows = customerData.flatMap(g => g.rows);
  const totalAmt = allRows.reduce((s, r) => s + r.amount, 0);
  const doneCount = allRows.filter(r => r.st.label === 'ปิดงาน').length;
  const issueCount = allRows.filter(r => r.st.label === 'มีปัญหา').length;
  const totalDown = allRows.reduce((s, r) => s + r.downPay, 0);
  const totalCredit = allRows.reduce((s, r) => s + r.creditAmt, 0);

  const statCards = [
    { label: 'ยอดรวมทั้งหมด', value: money(totalAmt), color: BLUE, icon: '💰' },
    { label: 'ปิดงานแล้ว', value: doneCount + ' ราย', color: GREEN, icon: '✅' },
    { label: 'มีปัญหา', value: issueCount + ' ราย', color: RED, icon: '⚠️' },
    { label: 'เงินดาวน์รวม', value: money(totalDown), color: '#7c3aed', icon: '💵' },
    { label: 'สินเชื่อรวม', value: money(totalCredit), color: '#d97706', icon: '🏦' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map((c, i) => (
          <CardWrap key={i} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: '12.5px', color: '#7b8fa3', fontWeight: 600 }}>{c.label}</span>
              <span style={{ fontSize: '18px' }}>{c.icon}</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0d1b2e', fontFamily: MONO }}>{c.value}</div>
          </CardWrap>
        ))}
      </div>

      {customerData.map((group, gi) => (
        <CardWrap key={gi} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 6, height: 28, borderRadius: 3, background: BLUE }} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0d1b2e' }}>{group.label}</div>
              <div style={{ fontSize: '12.5px', color: '#7b8fa3' }}>{group.month} · {group.rows.length} ราย</div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <Th>#</Th><Th>ชื่อลูกค้า</Th><Th style={{ textAlign: 'right' }}>ยอดรวม</Th><Th>ประเภท</Th>
                <Th style={{ textAlign: 'right' }}>ดาวน์</Th><Th style={{ textAlign: 'right' }}>สินเชื่อ</Th>
                <Th style={{ textAlign: 'right', color: '#d97706' }}>คงค้าง</Th>
                <Th>วันจ่าย</Th><Th>เจ้าของ</Th><Th>สถานะ</Th>
              </tr></thead>
              <tbody>
                {group.rows.map((r, i) => (
                  <React.Fragment key={i}>
                    <tr>
                      <Td style={{ fontWeight: 600, color: '#7b8fa3' }}>{r.idx}</Td>
                      <Td style={{ fontWeight: 600 }}>{r.name}</Td>
                      <Td style={{ textAlign: 'right', fontFamily: MONO, fontWeight: 700 }}>{r.amountText}</Td>
                      <Td><span style={r.typeStyle}>{r.type}</span></Td>
                      <Td style={{ textAlign: 'right', fontFamily: MONO, fontWeight: 600 }}>{r.downText}</Td>
                      <Td style={{ textAlign: 'right', fontFamily: MONO, fontWeight: 600, color: '#4a5d74' }}>{r.creditText}</Td>
                      <Td style={{ textAlign: 'right', fontFamily: MONO, fontWeight: 600, color: r.outColor }}>{r.outstandingText}</Td>
                      <Td style={{ fontSize: '12.5px', fontFamily: MONO }}>{r.payDate}</Td>
                      <Td><span style={r.ownerStyle}>{r.owner}</span></Td>
                      <Td><span style={r.statusStyle}>{r.st.label}</span></Td>
                    </tr>
                    {r.hasNote && (
                      <tr>
                        <td colSpan={10} style={{ padding: '0 14px 10px 48px', fontSize: '12px', color: '#d97706', fontStyle: 'italic', borderBottom: '1px solid #f0f4f9' }}>
                          📝 {r.note}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardWrap>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROI · วิเคราะห์ความคุ้มค่าการลงทุนโซลาร์
   ══════════════════════════════════════════════════════════════ */
function RoiScreen({ mobile }) {
  const [sizeKw, setSizeKw]       = useState('10');
  const [pricePerKw, setPricePerKw] = useState('32000');
  const [sunHours, setSunHours]   = useState('4.2');
  const [rate, setRate]           = useState('4.5');
  const [selfUse, setSelfUse]     = useState('80');
  const [inflation, setInflation] = useState('3');
  const [custName, setCustName]   = useState('');

  const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
  const LIFESPAN = 25;
  const DEGRADE = 0.005; // แผงเสื่อม 0.5%/ปี
  const PANEL_W = 650;

  const kw = num(sizeKw);
  const totalCost = kw * num(pricePerKw);
  const prodYr1 = kw * num(sunHours) * 365;            // kWh/ปี (ปีแรก)
  const selfR = num(selfUse) / 100;
  const g = num(inflation) / 100;
  const saveYr1 = prodYr1 * selfR * num(rate);
  const panels = Math.ceil((kw * 1000) / PANEL_W);

  // ตารางกระแสเงินสด 25 ปี (รวมค่าไฟขึ้น + แผงเสื่อม)
  const schedule = [];
  let cum = 0, paybackYr = null;
  for (let i = 1; i <= LIFESPAN; i++) {
    const prod = prodYr1 * (1 - DEGRADE * (i - 1));
    const rt = num(rate) * Math.pow(1 + g, i - 1);
    const save = prod * selfR * rt;
    const prevCum = cum;
    cum += save;
    if (paybackYr === null && cum >= totalCost && totalCost > 0) {
      const need = totalCost - prevCum;
      paybackYr = (i - 1) + (save > 0 ? need / save : 0);
    }
    schedule.push({ year: i, prod, save, cum });
  }
  const cum25 = cum;
  const netProfit = cum25 - totalCost;
  const roiPct = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const co2Ton = (prodYr1 * 0.5) / 1000; // 0.5 kg CO2/kWh

  const fmt0 = (n) => Math.round(n).toLocaleString('en-US');
  const fmt1 = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const Field = ({ label, value, onChange, suffix, hint, step }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4a5d74', marginBottom: 5 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type="number" inputMode="decimal" step={step || 'any'} value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '11px 44px 11px 14px', border: '1.5px solid #e6edf5', borderRadius: 10, fontSize: '15px', fontFamily: MONO, fontWeight: 600, color: '#0d1b2e', boxSizing: 'border-box', background: '#f6f9fc' }} />
        {suffix && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '12.5px', color: '#9aabbf', fontWeight: 600 }}>{suffix}</span>}
      </div>
      {hint && <div style={{ fontSize: '11px', color: '#9aabbf', marginTop: 4 }}>{hint}</div>}
    </div>
  );

  const kpis = [
    { label: 'ประหยัดค่าไฟ/เดือน', value: money(Math.round(saveYr1 / 12)), sub: 'ปีแรก', color: GREEN, icon: '💡' },
    { label: 'ระยะคืนทุน', value: paybackYr ? fmt1(paybackYr) + ' ปี' : '—', sub: 'จุดคุ้มทุน', color: BLUE, icon: '⏳' },
    { label: 'ROI 25 ปี', value: fmt0(roiPct) + '%', sub: 'ผลตอบแทน', color: '#7c3aed', icon: '📈' },
    { label: 'กำไรสุทธิ 25 ปี', value: money(Math.round(netProfit)), sub: 'หลังหักทุน', color: '#d97706', icon: '💰' },
  ];

  const milestones = [1, 3, 5, 10, 15, 20, 25];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '340px 1fr', gap: 24, alignItems: 'flex-start' }}>
      {/* ── ฟอร์มกรอกข้อมูล ── */}
      <CardWrap>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#0d1b2e', marginBottom: 18 }}>ข้อมูลระบบโซลาร์</div>
        <Field label="ชื่อลูกค้า / โครงการ" value={custName} onChange={setCustName} />
        <Field label="ขนาดระบบ" value={sizeKw} onChange={setSizeKw} suffix="kW" hint={`≈ ${panels} แผง (${PANEL_W}W)`} />
        <Field label="ราคาต่อ kW" value={pricePerKw} onChange={setPricePerKw} suffix="บาท" hint="ทั่วไป 25,000–40,000 บาท/kW" />
        <Field label="ชั่วโมงแดดเฉลี่ย/วัน" value={sunHours} onChange={setSunHours} suffix="ชม." hint="ภาคใต้ ≈ 4.0–4.5 ชม." />
        <Field label="ค่าไฟต่อหน่วย" value={rate} onChange={setRate} suffix="บาท" hint="ค่าไฟ + Ft ปัจจุบัน" />
        <Field label="สัดส่วนใช้ไฟที่ผลิต" value={selfUse} onChange={setSelfUse} suffix="%" hint="ไฟที่ผลิตแล้วได้ใช้จริง" />
        <Field label="ค่าไฟปรับขึ้นต่อปี" value={inflation} onChange={setInflation} suffix="%" hint="เฉลี่ยย้อนหลัง ≈ 3%/ปี" />
        <div style={{ marginTop: 8, padding: '12px 14px', background: '#f0f7ff', borderRadius: 10, fontSize: '12px', color: '#4a5d74', lineHeight: 1.6 }}>
          💡 คำนวณอายุระบบ {LIFESPAN} ปี · แผงเสื่อมสภาพ 0.5%/ปี · ลด CO₂ ≈ <b>{fmt1(co2Ton)} ตัน/ปี</b>
        </div>
      </CardWrap>

      {/* ── ผลลัพธ์ ── */}
      <div>
        {/* มูลค่าลงทุน + KPI */}
        <div style={{ background: 'linear-gradient(135deg, #0d1b2e, #162d4a)', borderRadius: 16, padding: mobile ? '20px' : '24px 28px', color: '#fff', marginBottom: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>เงินลงทุนทั้งระบบ{custName ? ` · ${custName}` : ''}</div>
            <div style={{ fontSize: mobile ? '30px' : '38px', fontWeight: 800, fontFamily: MONO, lineHeight: 1.1 }}>{money(Math.round(totalCost))}</div>
            <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{fmt1(kw)} kW · {panels} แผง · ผลิต ≈ {fmt0(prodYr1)} kWh/ปี</div>
          </div>
          <div style={{ textAlign: mobile ? 'left' : 'right' }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>ประหยัดรวม {LIFESPAN} ปี</div>
            <div style={{ fontSize: mobile ? '26px' : '32px', fontWeight: 800, fontFamily: MONO, color: '#4ade80', lineHeight: 1.1 }}>{money(Math.round(cum25))}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {kpis.map((k, i) => (
            <CardWrap key={i} style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: '12px', color: '#7b8fa3', fontWeight: 600 }}>{k.label}</span>
                <span style={{ fontSize: '18px' }}>{k.icon}</span>
              </div>
              <div style={{ fontSize: mobile ? '19px' : '22px', fontWeight: 800, color: '#0d1b2e', fontFamily: MONO, marginBottom: 3, lineHeight: 1.1 }}>{k.value}</div>
              <div style={{ fontSize: '11.5px', color: k.color, fontWeight: 600 }}>{k.sub}</div>
            </CardWrap>
          ))}
        </div>

        {/* แถบคืนทุน */}
        <CardWrap style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0d1b2e' }}>จุดคืนทุน</div>
            <div style={{ fontSize: '13px', color: '#7b8fa3' }}>{paybackYr ? `คืนทุนภายใน ${fmt1(paybackYr)} ปี จากอายุ ${LIFESPAN} ปี` : 'ยังไม่คืนทุนในอายุระบบ'}</div>
          </div>
          <div style={{ height: 14, background: '#eef3f9', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '100%', width: Math.min(100, paybackYr ? (paybackYr / LIFESPAN) * 100 : 100) + '%', background: 'linear-gradient(90deg,#16a34a,#4ade80)', borderRadius: 8 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9aabbf', marginTop: 6, fontFamily: MONO }}>
            <span>ปีที่ 0</span><span>ปีที่ {LIFESPAN}</span>
          </div>
        </CardWrap>

        {/* ตารางผลตอบแทนรายปี */}
        <CardWrap>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0d1b2e', marginBottom: 14 }}>ผลตอบแทนสะสม (ช่วงเวลาสำคัญ)</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                <Th>ปีที่</Th>
                <Th style={{ textAlign: 'right' }}>ผลิตไฟ (kWh)</Th>
                <Th style={{ textAlign: 'right' }}>ประหยัด/ปี</Th>
                <Th style={{ textAlign: 'right' }}>สะสม</Th>
                <Th style={{ textAlign: 'right' }}>สถานะ</Th>
              </tr></thead>
              <tbody>
                {milestones.map(y => {
                  const r = schedule[y - 1];
                  const paid = r.cum >= totalCost;
                  return (
                    <tr key={y}>
                      <Td style={{ fontFamily: MONO, fontWeight: 700, color: BLUE }}>{y}</Td>
                      <Td style={{ textAlign: 'right', fontFamily: MONO, color: '#4a5d74' }}>{fmt0(r.prod)}</Td>
                      <Td style={{ textAlign: 'right', fontFamily: MONO, fontWeight: 600, color: GREEN }}>{money(Math.round(r.save))}</Td>
                      <Td style={{ textAlign: 'right', fontFamily: MONO, fontWeight: 700, color: '#0d1b2e' }}>{money(Math.round(r.cum))}</Td>
                      <Td style={{ textAlign: 'right' }}>
                        <span style={pill(paid ? 'คืนทุนแล้ว' : 'กำลังคืนทุน', paid ? '#15803d' : '#b45309', paid ? '#dcfce7' : '#fef3c7')}>{paid ? 'คืนทุนแล้ว' : 'กำลังคืนทุน'}</span>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: '11px', color: '#9aabbf', marginTop: 12, lineHeight: 1.6 }}>
            * ตัวเลขเป็นการประมาณการเพื่อใช้เสนอขายเบื้องต้น คำนวณจากค่าไฟที่ปรับขึ้น {num(inflation)}%/ปี และแผงเสื่อมสภาพ 0.5%/ปี · ผลจริงขึ้นกับสภาพหน้างานและการใช้ไฟ
          </div>
        </CardWrap>
      </div>
    </div>
  );
}
