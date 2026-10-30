// Handles the login form.
function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorBox = document.getElementById('loginError');

  errorBox.textContent = '';
  errorBox.classList.remove('visible');

  loginUser(username, password)
    .then(function(data) {
      window.location.href = './index.html';
    })
    .catch(function(error) {
      errorBox.textContent = error.message;
      errorBox.classList.add('visible');
    });
}
