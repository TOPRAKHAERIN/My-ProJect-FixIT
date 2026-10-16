const getUsers = () => JSON.parse(localStorage.getItem('fixlyUsers') || '[]');
const setSession = (user) => localStorage.setItem('fixlyCurrentUser', JSON.stringify(user));
const showError = (id, text) => { const el = document.querySelector(id); el.textContent = text; el.classList.remove('hidden'); };
const clearErrors = () => document.querySelectorAll('[id$="Error"]').forEach(el => el.classList.add('hidden'));
const validStudentId = (value) => /^\d{10}$/.test(value);

if (localStorage.getItem('fixlyCurrentUser')) window.location.replace('index.html');

function showTab(tab) {
  clearErrors();
  document.querySelector('#loginForm').classList.toggle('hidden', tab !== 'login');
  document.querySelector('#registerForm').classList.toggle('hidden', tab !== 'register');
  document.querySelector('#adminLoginForm').classList.toggle('hidden', tab !== 'admin');
  document.querySelectorAll('.auth-tab').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
}
document.querySelectorAll('[data-tab], [data-switch]').forEach(button => button.addEventListener('click', () => showTab(button.dataset.tab || button.dataset.switch)));
document.querySelectorAll('[data-student-id]').forEach((input) => {
  input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 10); });
  input.addEventListener('paste', () => setTimeout(() => { input.value = input.value.replace(/\D/g, '').slice(0, 10); }));
});

document.querySelector('#loginForm').addEventListener('submit', (event) => {
  event.preventDefault(); clearErrors();
  const studentId = document.querySelector('#loginStudentId').value.trim();
  if (!validStudentId(studentId)) return showError('#loginError', 'กรุณากรอกรหัสนักศึกษาเป็นตัวเลข 10 หลัก');
  const user = getUsers().find(item => item.studentId === studentId);
  if (!user) return showError('#loginError', 'ไม่พบรหัสนักศึกษานี้ กรุณาสมัครใช้งานก่อน');
  localStorage.removeItem('fixlyAdmin');
  setSession(user); window.location.href = 'login.html';
});
document.querySelector('#registerForm').addEventListener('submit', (event) => {
  event.preventDefault(); clearErrors();
  const studentId = document.querySelector('#registerStudentId').value.trim();
  const studentName = document.querySelector('#registerName').value.trim();
  const studentClass = document.querySelector('#registerClass').value.trim();
  if (!validStudentId(studentId)) return showError('#registerError', 'กรุณากรอกรหัสนักศึกษาเป็นตัวเลข 10 หลัก');
  const users = getUsers();
  if (users.some(item => item.studentId === studentId)) return showError('#registerError', 'รหัสนักศึกษานี้สมัครไว้แล้ว กรุณาเข้าสู่ระบบ');
  const user = { studentId, studentName, studentClass };
  users.push(user); localStorage.setItem('fixlyUsers', JSON.stringify(users)); localStorage.removeItem('fixlyAdmin'); setSession(user); window.location.href = 'login.html';
});
document.querySelector('#adminLoginForm').addEventListener('submit', (event) => {
  event.preventDefault(); clearErrors();
  const username = document.querySelector('#adminUsername').value.trim();
  const password = document.querySelector('#adminLoginPassword').value;
  if (username !== 'admin' || password !== 'admin123') return showError('#adminLoginError', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  localStorage.setItem('fixlyAdmin', 'true');
  setSession({ studentId: 'ADMIN', studentName: 'ผู้ควบคุมระบบ', studentClass: 'ผู้ดูแลระบบ' });
  window.location.href = 'login.html';
});
