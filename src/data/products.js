export function statusOf(qty, min, max) {
  if (qty <= 0) return { key: 'out', label: 'หมดสต็อก', fg: '#b91c1c', bg: '#fee2e2', dot: '#ef4444' };
  if (qty < min) return { key: 'low', label: 'ต่ำกว่า Min', fg: '#b45309', bg: '#fef3c7', dot: '#f59e0b' };
  if (qty >= max * 0.9) return { key: 'full', label: 'ใกล้เต็ม', fg: '#0369a1', bg: '#e0f2fe', dot: '#0ea5e9' };
  return { key: 'ok', label: 'ปกติ', fg: '#15803d', bg: '#dcfce7', dot: '#22c55e' };
}

export function money(n) { return '฿' + n.toLocaleString('en-US'); }

export function getProducts() {
  const raw = [
    ['PNL-LG650', 'แผงโซล่าร์ Longi 650W', 'แผงโซล่าร์เซลล์', 'แผง', 1056, 200, 1200, 'A1-03', 2976],
    ['BAT-LVT16', 'แบตเตอรี่ LVTOPSUN 314A G4 51.2V (16kWh)', 'แบตเตอรี่', 'ก้อน', 0, 4, 30, 'B1-04', 60000],
    ['INV-HW5K', 'Huawei SUN2000-5KTL-LB0 (5kW)', 'อินเวอร์เตอร์', 'เครื่อง', 5, 3, 20, 'B2-01', 21700],
    ['INV-HW10LC', 'Huawei SUN2000-10K-LC0 (10kW)', 'อินเวอร์เตอร์', 'เครื่อง', 4, 3, 20, 'B2-02', 28800],
    ['INV-HW10MAP', 'Huawei SUN2000-10K-MAP0 (10kW)', 'อินเวอร์เตอร์', 'เครื่อง', 3, 3, 20, 'B2-03', 42800],
    ['INV-HW15K', 'Huawei SUN2000-15K-MB0 (15kW)', 'อินเวอร์เตอร์', 'เครื่อง', 3, 2, 15, 'B2-04', 58400],
    ['INV-HW20K', 'Huawei SUN2000-20K-MB0 (20kW)', 'อินเวอร์เตอร์', 'เครื่อง', 1, 2, 12, 'B2-05', 65300],
    ['INV-SL15K', 'Solis S6-EH3P15K02-NVYD-L (15kW)', 'อินเวอร์เตอร์', 'เครื่อง', 2, 2, 15, 'B2-06', 59000],
    ['INV-SL10K', 'Solis S6-EH1P10K-L-PLUS (10kW)', 'อินเวอร์เตอร์', 'เครื่อง', 3, 3, 20, 'B2-07', 46706],
    ['INV-SL6K', 'Solis S6-EH1P6K-L-PLUS (6kW)', 'อินเวอร์เตอร์', 'เครื่อง', 3, 3, 20, 'B2-08', 27007],
    ['INV-SG20K', 'Sigenergy Inverter 20.0kW', 'อินเวอร์เตอร์', 'เครื่อง', 0, 2, 12, 'B2-09', 92400],
    ['BAT-SG10K', 'แบตเตอรี่ Sigenergy 10kW', 'แบตเตอรี่', 'ก้อน', 0, 2, 20, 'B1-08', 84500],
    ['MTR-HW1P', 'Huawei Smart Meter 1Phase + CT', 'สมาร์ทมิเตอร์', 'ตัว', 0, 3, 30, 'B3-01', 2050],
    ['MTR-HW3P', 'Huawei Smart Meter 3Phase + CT', 'สมาร์ทมิเตอร์', 'ตัว', 0, 3, 30, 'B3-02', 3200],
    ['MTR-HW3PHW', 'Huawei Smart Meter 3Phase HW', 'สมาร์ทมิเตอร์', 'ตัว', 1, 3, 30, 'B3-03', 3150],
    ['MTR-HWDDSU', 'Huawei Power Sensor DDSU666-H 1Ph', 'สมาร์ทมิเตอร์', 'ตัว', 4, 3, 30, 'B3-04', 1900],
    ['MNT-SGBAT', 'ขาตั้งแบตเตอรี่ Sigenergy (Ground)', 'อุปกรณ์ยึด', 'ชุด', 0, 2, 20, 'C1-08', 4600],
    ['BRK-LM125', 'เบรกเกอร์ Lumira 125A 500V', 'เบรกเกอร์', 'ตัว', 5, 5, 50, 'B3-06', 700],
    ['DNG-001', 'Dongle (อุปกรณ์สื่อสาร)', 'Dongle', 'ตัว', 6, 5, 40, 'C2-03', 1883],
  ];
  return raw.map(r => {
    const [sku, name, cat, unit, qty, min, max, loc, price] = r;
    const st = statusOf(qty, min, max);
    return { sku, name, cat, unit, qty, min, max, loc, price, value: qty * price, valueText: money(qty * price), priceText: money(price), st, fillPct: Math.min(100, Math.round(qty / max * 100)) + '%' };
  });
}

export function getLocations() {
  return [
    { code: 'A1', name: 'Zone A · แถว 1', type: 'แผงโซลาร์เซลล์', cap: 600, used: 492, items: 2, color: '#3b82f6' },
    { code: 'A2', name: 'Zone A · แถว 2', type: 'แผงโซลาร์เซลล์', cap: 400, used: 156, items: 1, color: '#3b82f6' },
    { code: 'B1', name: 'Zone B · ชั้นวางแบตเตอรี่', type: 'แบตเตอรี่', cap: 110, used: 26, items: 2, color: '#22c55e' },
    { code: 'B2', name: 'Zone B · ชั้นวางอินเวอร์เตอร์', type: 'อินเวอร์เตอร์', cap: 210, used: 93, items: 3, color: '#22c55e' },
    { code: 'B3', name: 'Zone B · อุปกรณ์ควบคุม', type: 'ควบคุม/ป้องกัน', cap: 500, used: 221, items: 3, color: '#22c55e' },
    { code: 'C1', name: 'Zone C · อุปกรณ์ยึดติดตั้ง', type: 'อุปกรณ์ยึด', cap: 1000, used: 628, items: 2, color: '#06b6d4' },
    { code: 'C2', name: 'Zone C · สายไฟ & ขั้วต่อ', type: 'สายไฟ/ขั้วต่อ', cap: 1200, used: 121, items: 3, color: '#06b6d4' },
  ];
}

export function getMovements() {
  return [
    ['GR-69-0021', 'in', '13 มิ.ย. 10:20', 'DNG-001', 'Dongle (อุปกรณ์สื่อสาร)', 6, 'C2-03', 'ธนา พ.', '—'],
    ['GR-69-0020', 'in', '11 มิ.ย. 09:10', 'BRK-LM125', 'เบรกเกอร์ Lumira 125A 500V', 5, 'B3-06', 'ธนา พ.', 'บ้านพลังงาน'],
    ['GI-69-0019', 'out', '23 พ.ค. 16:30', 'INV-SL6K', 'Solis S6-EH1P6K-L-PLUS (6kW)', 2, 'B2-08', 'ณัฐญา ศ.', 'KT'],
    ['GR-69-0018', 'in', '23 พ.ค. 11:00', 'INV-SL10K', 'Solis S6-EH1P10K-L-PLUS (10kW)', 5, 'B2-07', 'ธนา พ.', 'เคเอสเอ็นฟอร์จูน'],
    ['GI-69-0017', 'out', '23 พ.ค. 11:05', 'INV-SL10K', 'Solis S6-EH1P10K-L-PLUS (10kW)', 2, 'B2-07', 'ณัฐญา ศ.', 'คุณสุภาวดี (ภูเก็ต), KT'],
    ['GI-69-0016', 'out', '21 พ.ค. 15:40', 'INV-SL6K', 'Solis S6-EH1P6K-L-PLUS (6kW)', 3, 'B2-08', 'ณัฐญา ศ.', 'คุณจันจิรา, คุณประภัสสร, คุณนวพัณณ์'],
    ['GI-69-0015', 'out', '15 พ.ค. 14:10', 'INV-SG20K', 'Sigenergy Inverter 20.0kW', 1, 'B2-09', 'ณัฐญา ศ.', 'บจก.เอลีท แอดแวนเทจ'],
    ['GI-69-0014', 'out', '15 พ.ค. 14:10', 'BAT-SG10K', 'แบตเตอรี่ Sigenergy 10kW', 2, 'B1-08', 'วิภา ส.', 'บจก.เอลีท แอดแวนเทจ'],
    ['GR-69-0013', 'in', '15 พ.ค. 09:30', 'INV-SG20K', 'Sigenergy Inverter 20.0kW', 1, 'B2-09', 'ธนา พ.', 'ซิกเน็ก'],
    ['GI-69-0012', 'out', '09 พ.ค. 13:25', 'PNL-LG650', 'แผงโซล่าร์ Longi 650W', 96, 'A1-03', 'วิภา ส.', 'คุณนราชัย, KT'],
    ['GR-69-0011', 'in', '09 พ.ค. 08:45', 'PNL-LG650', 'แผงโซล่าร์ Longi 650W', 720, 'A1-03', 'ธนา พ.', 'ซิกเน็ก'],
    ['GI-69-0010', 'out', '06 พ.ค. 10:50', 'INV-SL15K', 'Solis S6-EH3P15K02-NVYD-L (15kW)', 1, 'B2-06', 'ณัฐญา ศ.', 'คุณนราชัย'],
    ['GR-69-0009', 'in', '06 พ.ค. 09:00', 'INV-SL15K', 'Solis S6-EH3P15K02-NVYD-L (15kW)', 3, 'B2-06', 'ธนา พ.', 'GT'],
    ['GI-69-0008', 'out', '01 พ.ค. 15:00', 'BAT-LVT16', 'แบตเตอรี่ LVTOPSUN 314A (16kWh)', 8, 'B1-04', 'วิภา ส.', 'คุณจันจิรา, แม่มาลี3, KT ฯลฯ'],
    ['GR-69-0007', 'in', '01 พ.ค. 09:15', 'BAT-LVT16', 'แบตเตอรี่ LVTOPSUN 314A (16kWh)', 8, 'B1-04', 'ธนา พ.', 'GT'],
    ['GI-69-0006', 'out', '21 เม.ย. 14:20', 'INV-HW5K', 'Huawei SUN2000-5KTL-LB0 (5kW)', 1, 'B2-01', 'ณัฐญา ศ.', 'คุณประโมทย์'],
    ['GR-69-0005', 'in', '21 เม.ย. 09:30', 'INV-HW5K', 'Huawei SUN2000-5KTL-LB0 (5kW)', 6, 'B2-01', 'ธนา พ.', 'GT'],
    ['GI-69-0004', 'out', '06 เม.ย. 11:40', 'INV-HW15K', 'Huawei SUN2000-15K-MB0 (15kW)', 1, 'B2-04', 'ณัฐญา ศ.', 'หจก.เอสซีเอฟ (ยะลา)'],
    ['GI-69-0003', 'out', '06 เม.ย. 11:30', 'INV-HW10MAP', 'Huawei SUN2000-10K-MAP0 (10kW)', 1, 'B2-03', 'ณัฐญา ศ.', 'ห้างทองไทยเจริญ'],
    ['GR-69-0002', 'in', '06 เม.ย. 09:00', 'INV-HW15K', 'Huawei SUN2000-15K-MB0 (15kW)', 4, 'B2-04', 'ธนา พ.', 'ซิกเน็ก'],
    ['GR-69-0001', 'in', '10 เม.ย. 09:00', 'PNL-LG650', 'แผงโซล่าร์ Longi 650W', 432, 'A1-03', 'ธนา พ.', 'บ้านพลังงาน'],
  ].map(r => {
    const [ref, dir, time, sku, name, qty, loc, by, doc] = r;
    const isIn = dir === 'in';
    return { ref, dir, time, sku, name, qty, loc, by, doc, isIn,
      qtyText: (isIn ? '+' : '−') + qty,
      fg: isIn ? '#16a34a' : '#ef4444', bg: isIn ? '#dcfce7' : '#fee2e2',
      typeLabel: isIn ? 'รับเข้า' : 'จ่ายออก' };
  });
}

export function getCustomers() {
  const jan = [
    ['คุณสุทธิศักดิ์ ทองขาว', 200000, 'ICBC', '100%', 20000, 180000, 0, 0, '26/01/69', 'พี่สีแก้ว', 'done', ''],
    ['คุณสุรชัย พรมจิตร', 230000, 'ICBC', '', 23000, 207000, 0, 0, '28/01/69', 'พี่เบญ', 'done', ''],
    ['คุณจารีย์ แก้วนก', 280000, 'ICBC', '', 28000, 252000, 0, 0, '27/01/69', 'พี่สีแก้ว', 'done', ''],
    ['คุณบัฐพงศ์ มีศรี (ท่าศาลา)', 170000, 'เงินสด', '', 34000, 0, 136000, 0, '04/02/69', 'พี่เบญ', 'done', ''],
    ['คุณฤทธิ์ เดชะผล', 260000, 'ICBC', '100%', 26000, 234000, 0, 0, '12/02/69', 'พี่สีแก้ว', 'done', ''],
    ['คุณคมอักร หนูสง', 950000, 'ICBC', '100%', 100000, 850000, 0, 0, '26/02/69', 'พี่เบญ', 'done', ''],
  ];
  const feb = [
    ['บจก.ออราเคิล (ธ.ค.68)', 260000, 'เงินสด', '', 52000, 0, 208000, 0, '05/04/69', 'พี่สีแก้ว', 'done', ''],
    ['คุณวิชัย อิฐสถิตไพศาล (คลินิก)', 424000, 'เงินสด', '', 42400, 0, 0, 381600, '', 'พี่เบญ', 'issue', 'คลินิกลูกค้ายังทำประตูไม่เสร็จ'],
    ['คุณวิชัย อิฐสถิตไพศาล (บ้าน)', 609000, 'เงินสด', '', 337000, 0, 272000, 0, '17/06/69', 'พี่เบญ', 'issue', 'ขอคู่มือการใช้งานและไปนำเสนอส่งมอบงาน พร้อมจ่ายเงินวิศวะ KT กำลังทำแบบให้'],
    ['คุณจุฬาลักษณ์ รุ่งเรือง (พ.ย.69)', 712000, 'เงินสด', '', 69000, 0, 0, 643000, '', 'พี่เบญ', 'issue', 'บ้านลูกค้ายังสร้างไม่เสร็จ'],
    ['คุณพจนา พรหมจีน (Oshop88)', 1980000, 'ICBC', '100%', 198000, 1782000, 0, 0, '10/04/69', 'พี่เบญ', 'done', ''],
    ['คุณสรเชษฐ์ สรภักดิ์ (โรงเหล็กร่อน)', 417300, 'ICBC', '', 95855, 321445, 0, 0, '18/03/69', 'พี่สีแก้ว', 'done', ''],
  ];
  const mk = (rows) => rows.map((r, i) => {
    const [name, amount, type, , downPay, creditAmt, , outstanding, payDate, owner, status, note] = r;
    const stMap = { done: { label: 'ปิดงาน', fg: '#15803d', bg: '#dcfce7' }, issue: { label: 'มีปัญหา', fg: '#b91c1c', bg: '#fee2e2' }, progress: { label: 'กำลังดำเนินการ', fg: '#b45309', bg: '#fef3c7' } };
    const st = stMap[status] || stMap.progress;
    const isCash = type === 'เงินสด';
    return { idx: i + 1, name, amount, amountText: money(amount), type, isCash, downPay, downText: money(downPay),
      creditAmt, creditText: creditAmt ? money(creditAmt) : '—',
      outstanding, outstandingText: outstanding ? money(outstanding) : '—',
      outColor: outstanding > 0 ? '#d97706' : '#9aabbf',
      payDate: payDate || '—', owner, st, note: note || '', hasNote: !!note,
      typeStyle: { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '7px', color: '#fff', background: isCash ? '#16a34a' : '#b91c1c' },
      ownerStyle: { fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '7px', color: '#fff', background: owner === 'พี่เบญ' ? '#7c2d12' : '#92400e' },
      statusStyle: { fontSize: '11.5px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', color: st.fg, background: st.bg, whiteSpace: 'nowrap' } };
  });
  return [
    { month: 'มกราคม 2569', label: 'โซล่าร์เดือนมกราคม', rows: mk(jan) },
    { month: 'กุมภาพันธ์ 2569', label: 'โซล่าร์เดือนกุมภาพันธ์', rows: mk(feb) },
  ];
}

export const users = [
  { id: 'sing', name: 'สิงห์ (เจ้าของ)', role: 'เจ้าของ', dept: 'บริหารสูงสุด', pin: '9999', color: '#b45309' },
  { id: 'beer', name: 'ชนัญพงศ์ สันตยานนท์ (เบียร์)', role: 'ผู้จัดการ', dept: 'บริหาร', pin: 'Beer@2569', color: '#0f766e' },
  { id: 'aom', name: 'รังสิยา ธนาพงศ์ (ออม)', role: 'แอดมิน', dept: 'บริหารระบบ', pin: 'Aom@2569', color: '#2563eb' },
  { id: 'nun', name: 'จุฑามาศ จิตวิจารณ์ (นุ่น)', role: 'แอดมิน', dept: 'บริหารระบบ', pin: 'Nun@2569', color: '#7c3aed' },
  { id: 'sikaew', name: 'เพ็ชรินทร์ ณ ตะกั่วป่า (สีแก้ว)', role: 'พนักงานขาย', dept: 'ฝ่ายขาย', pin: 'Sikaew@2569', color: '#d97706' },
  { id: 'ben', name: 'กัลยาณี เกิดเกตุ (เบญ)', role: 'พนักงานขาย', dept: 'ฝ่ายขาย', pin: 'Ben@2569', color: '#db2777' },
];

export const seedSurveys = [
  { id: 'SV-2569-0007', customer: 'คุณวิชัย อิฐสถิตไพศาล', surveyor: 'พี่เบญ', date: '17 มิ.ย. 2569', roof: 'เมทัลชีท', azimuth: 'ทิศใต้', sizeKw: 10.2, panels: 18, done: 16, total: 16, status: 'approved' },
  { id: 'SV-2569-0006', customer: 'คุณสมหญิง รุ่งโรจน์', surveyor: 'ประเสริฐ', date: '15 มิ.ย. 2569', roof: 'กระเบื้องลอนคู่', azimuth: 'ทิศตะวันตก', sizeKw: 5.5, panels: 10, done: 16, total: 16, status: 'approved' },
  { id: 'SV-2569-0005', customer: 'หจก. นาหลวงฟาร์ม', surveyor: 'พี่เบญ', date: '12 มิ.ย. 2569', roof: 'เมทัลชีท', azimuth: 'ทิศใต้', sizeKw: 25.0, panels: 45, done: 14, total: 16, status: 'pending' },
  { id: 'SV-2569-0004', customer: 'คุณอนุชา ตั้งใจ', surveyor: 'ประเสริฐ', date: '8 มิ.ย. 2569', roof: 'คอนกรีต/ดาดฟ้า', azimuth: 'ทิศตะวันออก', sizeKw: 3.3, panels: 6, done: 16, total: 16, status: 'approved' },
  { id: 'SV-2569-0003', customer: 'คุณกิตติ พูลสุข', surveyor: 'พี่เบญ', date: '3 มิ.ย. 2569', roof: 'เมทัลชีท', azimuth: 'ทิศใต้', sizeKw: 8.0, panels: 14, done: 11, total: 16, status: 'rework' },
];

export const checkDefs = [
  ['ข้อมูลทั่วไป & สถานที่', [
    ['c1', 'บันทึกพิกัด/ที่อยู่ และถ่ายภาพหน้างาน'],
    ['c2', 'ตรวจสอบทิศทางหลังคา (เหมาะสมทิศใต้)'],
    ['c3', 'วัดพื้นที่หลังคาว่างที่ติดตั้งได้จริง'],
    ['c4', 'ตรวจเงา/สิ่งบดบัง (ต้นไม้ อาคารข้างเคียง)'],
  ]],
  ['โครงสร้างหลังคา', [
    ['c5', 'ระบุชนิดหลังคา (เมทัลชีท/กระเบื้อง/คอนกรีต)'],
    ['c6', 'ตรวจความแข็งแรงโครงสร้างรับน้ำหนัก'],
    ['c7', 'วัดองศาความลาดเอียงหลังคา'],
    ['c8', 'เลือกชุดอุปกรณ์ยึด (rail/clamp) ให้เหมาะกับหลังคา'],
  ]],
  ['ระบบไฟฟ้า', [
    ['c9', 'ตรวจขนาดมิเตอร์ & เฟสไฟ (1 เฟส / 3 เฟส)'],
    ['c10', 'ตรวจตู้ MDB และพื้นที่ติดตั้งอินเวอร์เตอร์'],
    ['c11', 'วัดระยะเดินสาย DC/AC และจุดลงกราวด์'],
    ['c12', 'ประเมินขนาดระบบ (kWp) ตามการใช้ไฟ'],
  ]],
  ['สรุป & เอกสาร', [
    ['c13', 'สรุปรุ่น/จำนวนแผง อินเวอร์เตอร์ แบตเตอรี่'],
    ['c14', 'ถ่ายรูปประกอบใบเสนอราคา'],
    ['c15', 'ยืนยันวันนัดติดตั้งกับลูกค้า'],
  ]],
];
