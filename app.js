const initialTickets = [
  { id: 1, studentId: '66301010001', studentName: 'นางสาวพิมพ์ชนก แสงทอง', studentClass: 'ปวช. 2/1', title: 'หลอดไฟหน้าห้องกะพริบ', category: 'ไฟฟ้า / แสงสว่าง', location: 'อาคาร B ชั้น 2', detail: 'หลอดไฟเหนือประตูห้องกะพริบเป็นระยะ', priority: 'ปกติ', status: 'กำลังดำเนินการ', date: 'วันนี้ 09:20' },
  { id: 2, studentId: '66301010002', studentName: 'นายศุภชัย วัฒนะ', studentClass: 'ปวส. 1/2', title: 'เครื่องพิมพ์กระดาษติด', category: 'อุปกรณ์การเรียน', location: 'ห้องธุรการ', detail: 'ดึงกระดาษออกแล้วแต่ยังขึ้นแจ้งเตือน', priority: 'เร็ว', status: 'รอตรวจสอบ', date: 'เมื่อวาน 14:05' }
];
const savedUser = JSON.parse(localStorage.getItem('fixlyCurrentUser') || 'null');
if (!savedUser) window.location.replace('index.html');
const currentUser = savedUser || { studentId: '', studentName: '', studentClass: '' };
let tickets = JSON.parse(localStorage.getItem('fixlyTickets') || 'null') || initialTickets;
let isAdmin = localStorage.getItem('fixlyAdmin') === 'true';
const $ = (s) => document.querySelector(s);

function save() { localStorage.setItem('fixlyTickets', JSON.stringify(tickets)); }
function statusClass(status) { return status === 'เสร็จสิ้น' ? 'status-done' : status === 'กำลังดำเนินการ' ? 'status-work' : 'status-wait'; }
function render() {
  const filter = $('#filterStatus').value;
  const ownedTickets = isAdmin ? tickets : tickets.filter(t => t.studentId === currentUser.studentId);
  const visible = ownedTickets.filter(t => filter === 'all' || t.status === filter);
  $('#ticketList').innerHTML = visible.length ? visible.map(ticketCard).join('') : '<div class="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">ยังไม่มีรายการในสถานะนี้</div>';
  $('#newCount').textContent = ownedTickets.filter(t => t.status === 'รอตรวจสอบ').length;
  $('#doneCount').textContent = ownedTickets.filter(t => t.status === 'เสร็จสิ้น').length;
  $('#adminPanel').classList.toggle('hidden', !isAdmin);
  if (isAdmin) $('#adminList').innerHTML = tickets.length ? tickets.map(adminCard).join('') : '<p class="text-sm text-slate-500">ยังไม่มีรายการแจ้งซ่อม</p>';
}
function ticketCard(t) {
  return `<article class="ticket"><div class="flex items-start justify-between gap-3"><div><h3 class="font-semibold text-ink">${escapeHtml(t.title)}</h3><p class="mt-1 text-sm text-slate-500">${escapeHtml(t.location)} · ${escapeHtml(t.category)}</p><p class="mt-2 text-xs font-medium text-brand">ผู้แจ้ง: ${escapeHtml(t.studentName || 'ไม่ระบุชื่อ')} · ${escapeHtml(t.studentClass || 'ไม่ระบุชั้น')}</p></div><span class="status ${statusClass(t.status)}">${t.status}</span></div><div class="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500"><span>${t.date}</span><span>ความเร่งด่วน: ${t.priority}</span></div></article>`;
}
function adminCard(t) {
  return `<div class="rounded-2xl bg-white p-4 shadow-sm"><div class="flex flex-wrap items-center justify-between gap-3"><div><b class="text-ink">${escapeHtml(t.title)}</b><p class="mt-1 text-sm font-medium text-brand">${escapeHtml(t.studentName || 'ไม่ระบุชื่อ')} · ${escapeHtml(t.studentClass || 'ไม่ระบุชั้น')}</p><p class="mt-1 text-sm text-slate-500">${escapeHtml(t.location)} · ${escapeHtml(t.detail)}</p></div><div class="flex gap-2"><select class="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" onchange="changeStatus(${t.id}, this.value)">${['รอตรวจสอบ','กำลังดำเนินการ','เสร็จสิ้น'].map(s => `<option ${s === t.status ? 'selected' : ''}>${s}</option>`).join('')}</select><button onclick="deleteTicket(${t.id})" class="rounded-lg bg-rose-50 px-3 text-sm font-medium text-rose-600 hover:bg-rose-100">ลบ</button></div></div></div>`;
}
function escapeHtml(value) { const d = document.createElement('div'); d.textContent = value; return d.innerHTML; }
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.remove('hidden'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.add('hidden'), 2600); }
window.changeStatus = (id, status) => { tickets = tickets.map(t => t.id === id ? { ...t, status } : t); save(); render(); toast('อัปเดตสถานะแล้ว'); };
window.deleteTicket = (id) => { if (confirm('ต้องการลบรายการนี้ใช่ไหม?')) { tickets = tickets.filter(t => t.id !== id); save(); render(); toast('ลบรายการแล้ว'); } };

$('#report').addEventListener('submit', (e) => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); tickets.unshift({ id: Date.now(), ...data, status: 'รอตรวจสอบ', date: 'เพิ่งแจ้งเมื่อสักครู่' }); save(); e.currentTarget.reset(); $('input[name="priority"]').value = 'ปกติ'; document.querySelectorAll('.priority').forEach((b, i) => b.classList.toggle('active', i === 0)); render(); toast('ส่งรายการแจ้งซ่อมเรียบร้อยแล้ว'); document.querySelector('#tickets').scrollIntoView({ behavior: 'smooth' }); });
$('#priorityOptions').addEventListener('click', (e) => { if (!e.target.matches('.priority')) return; document.querySelectorAll('.priority').forEach(b => b.classList.remove('active')); e.target.classList.add('active'); $('input[name="priority"]').value = e.target.dataset.priority; });
$('#filterStatus').addEventListener('change', render);
$('#scrollTickets').addEventListener('click', () => $('#tickets').scrollIntoView({ behavior: 'smooth' }));
$('#settingsButton').addEventListener('click', () => $('#settingsDialog').showModal());
$('#adminButton').addEventListener('click', () => isAdmin ? $('#adminPanel').scrollIntoView({ behavior: 'smooth' }) : $('#adminDialog').showModal());
$('#logoutButton').addEventListener('click', () => { localStorage.removeItem('fixlyCurrentUser'); localStorage.removeItem('fixlyAdmin'); window.location.replace('login.html'); });
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
$('#settingsForm').addEventListener('submit', (e) => { e.preventDefault(); const prefs = { name: $('#displayName').value, dark: $('#darkMode').checked }; localStorage.setItem('fixlyPrefs', JSON.stringify(prefs)); document.body.classList.toggle('dark', prefs.dark); $('#settingsDialog').close(); toast('บันทึกการตั้งค่าแล้ว'); });
$('#adminForm').addEventListener('submit', (e) => { e.preventDefault(); if ($('#adminPassword').value !== 'admin123') return $('#adminError').classList.remove('hidden'); isAdmin = true; localStorage.setItem('fixlyAdmin', 'true'); $('#adminDialog').close(); render(); $('#adminPanel').scrollIntoView({ behavior: 'smooth' }); toast('เข้าสู่โหมดผู้ดูแลแล้ว'); });
$('#logoutAdmin').addEventListener('click', () => { isAdmin = false; localStorage.removeItem('fixlyAdmin'); render(); toast('ออกจากโหมดผู้ดูแลแล้ว'); });
const prefs = JSON.parse(localStorage.getItem('fixlyPrefs') || '{}'); $('#displayName').value = prefs.name || ''; $('#darkMode').checked = !!prefs.dark; document.body.classList.toggle('dark', !!prefs.dark);
document.querySelector('[name="studentName"]').value = currentUser.studentName;
document.querySelector('[name="studentClass"]').value = currentUser.studentClass;
document.querySelector('[name="studentId"]').value = currentUser.studentId;
$('#currentUserInfo').innerHTML = `<b class="block text-ink">${escapeHtml(currentUser.studentName)}</b><span>${escapeHtml(currentUser.studentClass)} · ${escapeHtml(currentUser.studentId)}</span>`;
render();
