/* Login page — form is static HTML in login.html; this just wires it up */
(function () {
  if (Store.session) { window.location.href = `app.html#/${Store.session.role}/dashboard`; }
})();

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#login-role-toggle .role-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('login-role').value = btn.dataset.value;
      document.querySelectorAll('#login-role-toggle .role-btn').forEach((b) => b.classList.toggle('active', b === btn));
    });
  });

  document.querySelectorAll('[data-action="toggle-pw"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = Icon(show ? 'eyeOff' : 'eye', 17);
    });
  });

  const forgot = document.querySelector('[data-action="forgot-pw"]');
  if (forgot) forgot.addEventListener('click', (e) => { e.preventDefault(); showToast("Password reset isn't available in this demo.", 'info'); });

  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;
    const errBox = document.getElementById('login-error');
    errBox.style.display = 'none';
    if (!email || !password) { errBox.textContent = 'Please enter your email and password.'; errBox.style.display = 'block'; return; }
    const res = Store.login(email, password, role);
    if (!res.ok) { errBox.textContent = res.error; errBox.style.display = 'block'; return; }
    showToast(`Welcome back, ${role}!`);
    window.location.href = `app.html#/${res.role}/dashboard`;
  });
});
