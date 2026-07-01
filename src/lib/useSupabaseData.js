import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { getProducts as getMockProducts, getLocations as getMockLocations, getMovements as getMockMovements, getCustomers as getMockCustomers, users as mockUsers, seedSurveys, statusOf, money } from '../data/products';

function enrichProduct(p) {
  const st = statusOf(p.qty, p.min_qty ?? p.min, p.max_qty ?? p.max);
  const price = Number(p.price);
  const qty = p.qty;
  const max = p.max_qty ?? p.max;
  return {
    sku: p.sku, name: p.name, cat: p.category ?? p.cat, unit: p.unit,
    qty, min: p.min_qty ?? p.min, max, loc: p.location ?? p.loc,
    price, value: qty * price, valueText: money(qty * price), priceText: money(price),
    st, fillPct: Math.min(100, Math.round(qty / max * 100)) + '%'
  };
}

function enrichMovement(r) {
  const isIn = r.direction === 'in' || r.dir === 'in';
  return {
    ref: r.ref, dir: r.direction || r.dir, time: r.time_label || r.time,
    sku: r.sku, name: r.product_name || r.name, qty: r.qty,
    loc: r.location || r.loc, by: r.created_by || r.by, doc: r.doc,
    isIn, qtyText: (isIn ? '+' : '−') + r.qty,
    fg: isIn ? '#16a34a' : '#ef4444', bg: isIn ? '#dcfce7' : '#fee2e2',
    typeLabel: isIn ? 'รับเข้า' : 'จ่ายออก'
  };
}

function enrichCustomerRows(rows) {
  const stMap = {
    done: { label: 'ปิดงาน', fg: '#15803d', bg: '#dcfce7' },
    issue: { label: 'มีปัญหา', fg: '#b91c1c', bg: '#fee2e2' },
    progress: { label: 'กำลังดำเนินการ', fg: '#b45309', bg: '#fef3c7' }
  };
  return rows.map((c, i) => {
    const st = stMap[c.status] || stMap.progress;
    const isCash = (c.payment_type || c.type) === 'เงินสด';
    const outstanding = Number(c.outstanding) || 0;
    const amount = Number(c.amount) || 0;
    const downPay = Number(c.down_payment ?? c.downPay) || 0;
    const creditAmt = Number(c.credit_amount ?? c.creditAmt) || 0;
    return {
      idx: i + 1, name: c.name, amount, amountText: money(amount),
      type: c.payment_type || c.type, isCash, downPay, downText: money(downPay),
      creditAmt, creditText: creditAmt ? money(creditAmt) : '—',
      outstanding, outstandingText: outstanding ? money(outstanding) : '—',
      outColor: outstanding > 0 ? '#d97706' : '#9aabbf',
      payDate: c.pay_date || c.payDate || '—', owner: c.owner, st,
      note: c.note || '', hasNote: !!(c.note),
      typeStyle: { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '7px', color: '#fff', background: isCash ? '#16a34a' : '#b91c1c' },
      ownerStyle: { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '7px', color: '#fff', background: c.owner === 'พี่เบญ' ? '#7c2d12' : '#92400e' },
      statusStyle: { fontSize: '11.5px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', color: st.fg, background: st.bg, whiteSpace: 'nowrap' }
    };
  });
}

export function useSupabaseData() {
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [movements, setMovements] = useState([]);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [users, setUsers] = useState(mockUsers);
  const [surveys, setSurveys] = useState(seedSurveys);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [pwOverrides, setPwOverrides] = useState({}); // {id: pinที่เปลี่ยนแล้ว}

  const loadAll = useCallback(async () => {
    try {
      const [pRes, lRes, mRes, cRes, sRes, uRes] = await Promise.all([
        supabase.from('products').select('*').order('sku'),
        supabase.from('locations').select('*').order('code'),
        supabase.from('movements').select('*').order('id', { ascending: false }),
        supabase.from('customers').select('*').order('id'),
        supabase.from('surveys').select('*').order('created_at', { ascending: false }),
        supabase.from('app_users').select('id, pin'),
      ]);

      // รหัสผ่านที่ผู้ใช้เปลี่ยนไว้ (เก็บใน app_users) มาทับรหัสในโค้ด
      const ov = {};
      (uRes && uRes.data ? uRes.data : []).forEach(u => { if (u.pin) ov[u.id] = u.pin; });
      setPwOverrides(ov);

      if (pRes.error || !pRes.data?.length) throw new Error('No DB data');

      setProducts(pRes.data.map(enrichProduct));
      setLocations(lRes.data || []);
      setMovements(mRes.data.map(enrichMovement));

      // Group customers by month
      const grouped = {};
      (cRes.data || []).forEach(c => {
        const key = c.month_group;
        if (!grouped[key]) grouped[key] = { month: c.month_group, label: c.month_label, rows: [] };
        grouped[key].rows.push(c);
      });
      setCustomerGroups(Object.values(grouped).map(g => ({
        ...g, rows: enrichCustomerRows(g.rows)
      })));

      // รายชื่อผู้ใช้/รหัสเข้าระบบ ใช้จากในโค้ด (mockUsers) เสมอ ไม่ดึงจาก DB
      // เพื่อให้ควบคุมบัญชีพนักงานได้จากโค้ดโดยตรง

      if (sRes.data?.length) setSurveys(sRes.data.map(s => ({
        id: s.id, customer: s.customer, surveyor: s.surveyor, date: s.survey_date,
        roof: s.roof, azimuth: s.azimuth, sizeKw: Number(s.size_kw), panels: s.panels,
        done: s.done, total: s.total, status: s.status
      })));

      setDbConnected(true);
    } catch {
      setProducts(getMockProducts());
      setLocations(getMockLocations());
      setMovements(getMockMovements());
      setCustomerGroups(getMockCustomers());
      setUsers(mockUsers);
      setSurveys(seedSurveys);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const addMovement = useCallback(async (movement) => {
    if (dbConnected) {
      const { error } = await supabase.from('movements').insert({
        ref: movement.ref, direction: movement.dir, time_label: movement.time,
        sku: movement.sku, product_name: movement.name, qty: movement.qty,
        location: movement.loc, created_by: movement.by, doc: movement.doc || '—'
      });
      if (!error) {
        const qtyChange = movement.dir === 'in' ? movement.qty : -movement.qty;
        await supabase.from('products').update({
          qty: (products.find(p => p.sku === movement.sku)?.qty || 0) + qtyChange,
          updated_at: new Date().toISOString()
        }).eq('sku', movement.sku);
        await loadAll();
      }
    }
    return enrichMovement(movement);
  }, [dbConnected, products, loadAll]);

  const addSurvey = useCallback(async (survey) => {
    if (dbConnected) {
      await supabase.from('surveys').insert({
        id: survey.id, customer: survey.customer, surveyor: survey.surveyor,
        survey_date: survey.date, roof: survey.roof || '', azimuth: survey.azimuth || '',
        size_kw: survey.sizeKw || 0, panels: survey.panels || 0,
        done: survey.done, total: survey.total, status: survey.status,
        notes: survey.notes || {}, checks: survey.checks || {}
      });
      await loadAll();
    }
    return survey;
  }, [dbConnected, loadAll]);

  const fail = (e) => ({ ok: false, error: (e && e.message) ? e.message : String(e) });
  const OK = { ok: true };

  // แก้ไขข้อมูลสินค้า (รับ field แบบ enriched: name, cat, unit, qty, min, max, loc, price)
  const updateProduct = useCallback(async (sku, u) => {
    if (dbConnected) {
      const d = {};
      if (u.name != null) d.name = u.name;
      if (u.cat != null) d.category = u.cat;
      if (u.unit != null) d.unit = u.unit;
      if (u.qty != null) d.qty = Number(u.qty);
      if (u.min != null) d.min_qty = Number(u.min);
      if (u.max != null) d.max_qty = Number(u.max);
      if (u.loc != null) d.location = u.loc;
      if (u.price != null) d.price = Number(u.price);
      const { error } = await supabase.from('products').update({ ...d, updated_at: new Date().toISOString() }).eq('sku', sku);
      if (error) return fail(error);
      await loadAll();
    } else {
      setProducts(prev => prev.map(p => p.sku === sku ? enrichProduct({
        sku: p.sku, name: u.name ?? p.name, category: u.cat ?? p.cat, unit: u.unit ?? p.unit,
        qty: u.qty != null ? Number(u.qty) : p.qty, min_qty: u.min != null ? Number(u.min) : p.min,
        max_qty: u.max != null ? Number(u.max) : p.max, location: u.loc ?? p.loc,
        price: u.price != null ? Number(u.price) : p.price
      }) : p));
    }
    return OK;
  }, [dbConnected, loadAll]);

  // เพิ่มสินค้าใหม่
  const addProduct = useCallback(async (p) => {
    const row = { sku: p.sku, name: p.name, category: p.cat, unit: p.unit || 'ชิ้น',
      qty: Number(p.qty) || 0, min_qty: Number(p.min) || 0, max_qty: Number(p.max) || 0,
      location: p.loc || '', price: Number(p.price) || 0 };
    if (dbConnected) {
      const { error } = await supabase.from('products').insert(row);
      if (error) return fail(error);
      await loadAll();
    } else {
      setProducts(prev => [...prev, enrichProduct(row)].sort((a, b) => a.sku.localeCompare(b.sku)));
    }
    return OK;
  }, [dbConnected, loadAll]);

  // ลบสินค้า (ลบประวัติเคลื่อนไหวที่อ้างถึงก่อน กัน FK)
  const deleteProduct = useCallback(async (sku) => {
    if (dbConnected) {
      await supabase.from('movements').delete().eq('sku', sku);
      const { error } = await supabase.from('products').delete().eq('sku', sku);
      if (error) return fail(error);
      await loadAll();
    } else {
      setProducts(prev => prev.filter(p => p.sku !== sku));
    }
    return OK;
  }, [dbConnected, loadAll]);

  // รับเข้า / จ่ายออก (ปรับสต็อก + บันทึกประวัติ)
  const adjustStock = useCallback(async (sku, dir, qty, by) => {
    const prod = products.find(p => p.sku === sku);
    if (!prod) return fail('ไม่พบสินค้า');
    const q = Number(qty);
    if (!q || q <= 0) return fail('กรุณากรอกจำนวนให้ถูกต้อง');
    if (dir === 'out' && q > prod.qty) return fail('สต็อกไม่พอ (คงเหลือ ' + prod.qty + ')');
    const now = new Date();
    const ref = (dir === 'in' ? 'GR' : 'GI') + '-' + String(now.getFullYear() + 543).slice(2) + '-' + Math.floor(1000 + Math.random() * 9000);
    const timeLabel = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) + ' ' + now.toTimeString().slice(0, 5);
    const newQty = prod.qty + (dir === 'in' ? q : -q);
    if (dbConnected) {
      const { error: e1 } = await supabase.from('movements').insert({
        ref, direction: dir, time_label: timeLabel, sku, product_name: prod.name,
        qty: q, location: prod.loc, created_by: by, doc: '—'
      });
      if (e1) return fail(e1);
      const { error: e2 } = await supabase.from('products').update({ qty: newQty, updated_at: new Date().toISOString() }).eq('sku', sku);
      if (e2) return fail(e2);
      await loadAll();
    } else {
      setProducts(prev => prev.map(p => p.sku === sku ? enrichProduct({
        sku: p.sku, name: p.name, category: p.cat, unit: p.unit, qty: newQty,
        min_qty: p.min, max_qty: p.max, location: p.loc, price: p.price
      }) : p));
      setMovements(prev => [enrichMovement({ ref, dir, time: timeLabel, sku, name: prod.name, qty: q, loc: prod.loc, by, doc: '—' }), ...prev]);
    }
    return OK;
  }, [dbConnected, products, loadAll]);

  // เพิ่มคลัง / โซนจัดเก็บ
  const addLocation = useCallback(async (l) => {
    const row = { code: l.code, name: l.name, type: l.type || '', capacity: Number(l.capacity) || 0,
      used: 0, items: 0, color: l.color || '#3b82f6' };
    if (dbConnected) {
      const { error } = await supabase.from('locations').insert(row);
      if (error) return fail(error);
      await loadAll();
    } else {
      setLocations(prev => [...prev, row]);
    }
    return OK;
  }, [dbConnected, loadAll]);

  // ลบคลัง
  const deleteLocation = useCallback(async (code) => {
    if (dbConnected) {
      const { error } = await supabase.from('locations').delete().eq('code', code);
      if (error) return fail(error);
      await loadAll();
    } else {
      setLocations(prev => prev.filter(l => l.code !== code));
    }
    return OK;
  }, [dbConnected, loadAll]);

  // เปลี่ยนรหัสผ่าน (บันทึกลง app_users เพื่อให้ใช้ได้ทุกเครื่อง)
  const changePassword = useCallback(async (id, newPin) => {
    const u = users.find(x => x.id === id);
    if (!u) return fail('ไม่พบผู้ใช้');
    if (dbConnected) {
      const { error } = await supabase.from('app_users').upsert({
        id: u.id, name: u.name, role: u.role, dept: u.dept, pin: newPin, color: u.color
      }, { onConflict: 'id' });
      if (error) return fail(error);
    }
    setPwOverrides(prev => ({ ...prev, [id]: newPin }));
    return OK;
  }, [dbConnected, users]);

  // รายชื่อผู้ใช้ + รหัสผ่านล่าสุด (โค้ด + ที่เปลี่ยนไว้ใน DB)
  const effectiveUsers = users.map(u => pwOverrides[u.id] ? { ...u, pin: pwOverrides[u.id] } : u);

  return {
    products, locations, movements, customerGroups, users: effectiveUsers, surveys,
    loading, dbConnected, loadAll,
    addMovement, addSurvey, updateProduct, setSurveys,
    addProduct, deleteProduct, adjustStock, addLocation, deleteLocation,
    changePassword
  };
}
