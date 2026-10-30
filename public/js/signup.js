// Handles the sign-up form and password checks.
function checkPasswordMatch() {
  const pw = document.getElementById('password').value;
  const cpw = document.getElementById('confirmPassword').value;
  const msg = document.getElementById('passwordMatchMessage');
  msg.textContent = cpw && pw !== cpw ? 'Passwords do not match.' : '';
}

function getPasswordStrength(pw) {
  if (!pw) {
    return '';
  }

  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const lengthOk = pw.length >= 8;

  if (!lengthOk) {
    return 'Too short (min 8 characters)';
  }

  const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (score <= 1) {
    return 'Weak';
  }
  if (score <= 2) {
    return 'Medium';
  }
  return 'Strong';
}

function checkPasswordStrength() {
  const pw = document.getElementById('password').value;
  const msg = document.getElementById('passwordStrengthMessage');
  const strength = getPasswordStrength(pw);
  msg.textContent = strength ? `Password Strength: ${strength}` : '';
}

function validateForm(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const accessCode = document.getElementById('accessCode').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  if (!checkAccessCode()) {
    return;
  }

  registerUser(username, email, password)
    .then(function(data) {
      window.location.href = './index.html';
    })
    .catch(function(error) {
      alert('Registration failed: ' + error.message);
    });
}

function checkAccessCode() {
  const accessCode = document.getElementById('accessCode').value;
  const validAccessCode = 'accesscodedemo';
  if (accessCode !== validAccessCode) {
    alert('Invalid access code. Please contact the administrator for the correct code.');
    return false;
  }
  return true;
}
