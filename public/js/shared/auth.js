// Login, sign-up and session helpers.
let currentUser = null;

function loadUserFromStorage() {
  const stored = localStorage.getItem('dentalLesionUser');
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
    } catch (e) {
      console.error('Error loading user from storage:', e);
    }
  }
}

function saveUserToStorage(user) {
  localStorage.setItem('dentalLesionUser', JSON.stringify(user));
}

function getCurrentUser() {
  return currentUser;
}

async function readApiResponse(response) {
  const responseText = await response.text();
  let data = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    data = {error: responseText || `Request failed with status ${response.status}`};
  }

  if (!response.ok) {
    const message = data.error || `Request failed with status ${response.status}`;
    if (response.status === 403 && message === 'Forbidden.') {
      throw new Error('The API request was forbidden. Start the app with "npm start" and open http://localhost:3000/login.html.');
    }
    throw new Error(message);
  }

  return data;
}

async function registerUser(username, email, password) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, email, password})
    });

    const data = await readApiResponse(response);

    currentUser = data.user;
    saveUserToStorage(currentUser);
    renderAuthNav();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

async function loginUser(username, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password})
    });

    const data = await readApiResponse(response);

    currentUser = data.user;
    saveUserToStorage(currentUser);
    renderAuthNav();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('dentalLesionUser');
  window.location.href = './index.html';
}

async function getUserProfile(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    const data = await readApiResponse(response);

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

function renderAuthNav() {
  const nav = document.querySelector('.top-bar-auth');
  if (!nav) {
    return;
  }

  if (currentUser) {
    const nameEl = document.createElement('li');
    nameEl.className = 'nav-username';
    nameEl.textContent = currentUser.username;

    const signOutEl = document.createElement('li');
    const signOutLink = document.createElement('a');
    signOutLink.href = '#';
    signOutLink.textContent = 'Sign Out';
    signOutLink.addEventListener('click', function (event) {
      event.preventDefault();
      logoutUser();
    });
    signOutEl.appendChild(signOutLink);

    nav.innerHTML = '';
    nav.appendChild(nameEl);
    nav.appendChild(signOutEl);
  } else {
    nav.innerHTML = `
      <li><a href="./login.html">Login</a></li>
      <li><a href="./signup.html">Sign Up</a></li>
    `;
  }
}

loadUserFromStorage();
renderAuthNav();
