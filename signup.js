/* Signup page — form is static HTML in signup.html; this just wires it up */
(function () {
  if (Store.session) { window.location.href = `app.html#/${Store.session.role}/dashboard`; }
})();

document.addEventListener('DOMContentLoaded', () => {
  const roleSel = document.getElementById('su-role');
  roleSel.addEventListener('change', () => {
    document.getElementById('su-resident-fields').classList.toggle('hidden', roleSel.value !== 'resident');
    document.getElementById('su-worker-fields').classList.toggle('hidden', roleSel.value !== 'worker');
  });

  document.querySelectorAll('[data-action="toggle-pw"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = Icon(show ? 'eyeOff' : 'eye', 17);
    });
  });

  document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const val = (id) => document.getElementById(id).value.trim();
    const errIds = ['err-su-name', 'err-su-email', 'err-su-phone', 'err-su-password', 'err-su-confirm'];
    errIds.forEach((id) => { const el = document.getElementById(id); el.style.display = 'none'; el.textContent = ''; });
    const name = val('su-name'), email = val('su-email'), phone = val('su-phone');
    const password = document.getElementById('su-password').value;
    const confirm = document.getElementById('su-confirm').value;
    const role = roleSel.value;
    let hasError = false;
    const setErr = (id, msg) => { const el = document.getElementById(id); el.textContent = msg; el.style.display = 'block'; hasError = true; };
    if (!name) setErr('err-su-name', 'Please enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) setErr('err-su-email', 'Please enter a valid email.');
    if (!/^\d{7,15}$/.test(phone)) setErr('err-su-phone', 'Please enter a valid phone number.');
    if (password.length < 6) setErr('err-su-password', 'Password must be at least 6 characters.');
    if (confirm !== password) setErr('err-su-confirm', 'Passwords do not match.');
    if (hasError) return;
    const data = { name, email, phone, password, role };
    if (role === 'resident') { data.tower = val('su-tower'); data.flat = val('su-flat'); }
    if (role === 'worker') { data.specialization = document.getElementById('su-spec').value; }
    const res = Store.signup(data);
    if (!res.ok) { setErr('err-su-email', res.error); return; }
    showToast('Account created. Please log in.');
    window.location.href = 'login.html';
  });
});
