// this script is used on any page where you want to capture the checkin form
// the first page it was used with is bocc.html
document.addEventListener('DOMContentLoaded', function() {

  // --- Helper: TTL-based sessionStorage ---
  var STORAGE_KEY = 'checkinData';
  var STORAGE_TTL = 4 * 60 * 60 * 1000; // 4 hours

  function setWithExpiry(key, value, ttlMs) {
      var item = {
          value: value,
          expiry: Date.now() + ttlMs
      };
      sessionStorage.setItem(key, JSON.stringify(item));
  }

  function getWithExpiry(key) {
      var raw = sessionStorage.getItem(key);
      if (!raw) return null;
      try {
          var item = JSON.parse(raw);
          if (!item || typeof item !== 'object' || !item.expiry || !item.value) {
              sessionStorage.removeItem(key);
              return null;
          }
          if (Date.now() > item.expiry) {
              sessionStorage.removeItem(key);
              return null;
          }
          return item.value;
      } catch (e) {
          sessionStorage.removeItem(key);
          return null;
      }
  }

  // --- Helper: Production check ---
  var isProduction = window.location.hostname === '716coffee.club';

  // --- Helper: Debug logger (non-PII, non-production only) ---
  function debugLog(message, metadata) {
      if (isProduction) return;
      var urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('debug') !== '1') return;
      // Only log non-sensitive metadata
      if (metadata) {
          console.log('[checkin debug]', message, metadata);
      } else {
          console.log('[checkin debug]', message);
      }
  }

  // --- Helper: Input validation/sanitization ---
  function sanitizeInput(input, maxLength) {
      if (typeof input !== 'string') return '';
      maxLength = maxLength || 255;
      return input.trim().substring(0, maxLength);
  }

  function isValidEmail(email) {
      if (!email || email.length > 254) return false;
      // Basic email format check
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
      if (!phone) return true; // phone is optional
      if (phone.length > 20) return false;
      return /^[\d\s\-\(\)\+\.]+$/.test(phone);
  }

  function showValidationError(message) {
      var errEl = document.getElementById('validationError');
      if (!errEl) {
          errEl = document.createElement('div');
          errEl.id = 'validationError';
          var form = document.getElementById('checkinForm');
          form.insertBefore(errEl, form.firstChild);
      }
      errEl.textContent = message;
      errEl.style.display = 'block';
  }

  function clearValidationError() {
      var errEl = document.getElementById('validationError');
      if (errEl) errEl.style.display = 'none';
  }

  // --- Helper: Validate token ---
  function sanitizeToken(token) {
      if (!token) return '';
      if (token.length > 64) return '';
      if (!/^[a-zA-Z0-9\-]+$/.test(token)) return '';
      return token;
  }

  // --- URL parameters (gated to non-production) ---
  function getUrlParameter(name) {
      var urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name) || '';
  }

  var debug = isProduction ? '0' : getUrlParameter('debug');
  var localOnly = isProduction ? '0' : getUrlParameter('local');
  var token = sanitizeToken(getUrlParameter('token'));

  // --- Load stored checkin data (with error handling) ---
  var checkinData = null;
  try {
      var stored = getWithExpiry(STORAGE_KEY);
      if (stored && typeof stored === 'object' && stored.name && stored.email) {
          checkinData = stored;
      } else if (stored) {
          // Stored data is malformed, clear it
          sessionStorage.removeItem(STORAGE_KEY);
      }
  } catch (e) {
      sessionStorage.removeItem(STORAGE_KEY);
  }

  // Also migrate/clear any old localStorage data
  try {
      if (localStorage.getItem('checkinData')) {
          localStorage.removeItem('checkinData');
      }
  } catch (e) {
      // Ignore localStorage errors
  }

  function captureCheckinData() {
      var eventId = document.getElementById('eventId').value; // Only from hidden form field
      var checkinDate = new Date().toISOString();

      var form = document.getElementById('checkinForm');
      var formData = new FormData(form);

      // Check honeypot field
      var honeypot = formData.get('website');
      if (honeypot) {
          // Bot detected, silently abort
          return null;
      }

      // Sanitize and validate inputs
      var name = sanitizeInput(formData.get('name'));
      var email = sanitizeInput(formData.get('email'), 254);
      var phone = sanitizeInput(formData.get('phone'), 20);
      var businessName = sanitizeInput(formData.get('businessName'));

      if (!name) {
          showValidationError('Please enter your name.');
          return null;
      }

      if (!isValidEmail(email)) {
          showValidationError('Please enter a valid email address.');
          return null;
      }

      if (phone && !isValidPhone(phone)) {
          showValidationError('Please enter a valid phone number (digits, spaces, hyphens, parentheses, or dots only).');
          return null;
      }

      clearValidationError();

      var data = {
          checkinDate: checkinDate,
          eventId: sanitizeInput(eventId, 64),
          token: token,
          name: name,
          email: email,
          phone: phone,
          businessName: businessName,
          okToEmail: formData.get('okToEmail') === 'on'
      };

      debugLog('Captured checkin data', { eventId: data.eventId, checkinDate: data.checkinDate });
      return data;
  }

  async function sendCheckinData(data) {
      debugLog('Sending checkin data to API', { eventId: data.eventId });
      try {
          // Do not send debug flag to the backend
          var payload = Object.assign({}, data);
          delete payload.debug;

          var response = await fetch('https://bocc-backend.netlify.app/.netlify/functions/checkin', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
          });
          var result = await response.json();
          debugLog('API response received', { status: response.status });
      } catch (error) {
          console.error('Checkin submission error');
      }
  }

  if (checkinData) {
      // Returning visitor: show confirmation step
      var greetingDiv = document.getElementById('greeting');
      var form = document.getElementById('checkinForm');
      form.style.display = 'none';

      document.getElementById('checkinHeader').innerText = 'Welcome back!';
      greetingDiv.innerHTML = '<p>Welcome back, ' + escapeHtml(checkinData.name) + '!</p>' +
          '<button type="button" id="confirmCheckinBtn" style="margin-right:10px;">Check In</button>' +
          '<button type="button" id="notMeBtn">Not me — start fresh</button>';
      greetingDiv.style.display = 'block';

      document.getElementById('notMeBtn').addEventListener('click', function() {
          sessionStorage.removeItem(STORAGE_KEY);
          window.location.reload();
      });

      document.getElementById('confirmCheckinBtn').addEventListener('click', async function() {
          // Update checkin date and event-specific fields
          var eventId = document.getElementById('eventId').value;
          checkinData.checkinDate = new Date().toISOString();
          checkinData.eventId = sanitizeInput(eventId, 64);
          checkinData.token = token;

          setWithExpiry(STORAGE_KEY, checkinData, STORAGE_TTL);

          greetingDiv.innerHTML = '<p>Thank you for checking in!</p>';

          if (localOnly !== '1') {
              try {
                  await sendCheckinData(checkinData);
              } catch (error) {
                  console.error('Checkin submission error');
              }
          }
      });
  } else {
      var checkinButton = document.getElementById('checkinButton');
      var handleCheckinClick = async function() {
          checkinData = captureCheckinData();
          if (!checkinData) return; // Validation failed or honeypot triggered

          setWithExpiry(STORAGE_KEY, checkinData, STORAGE_TTL);

          if (localOnly !== '1') {
              try {
                  await sendCheckinData(checkinData);
              } catch (error) {
                  console.error('Checkin submission error');
              }
          }

          // Display thank you message
          document.getElementById('checkinHeader').innerText = 'Thank you!';
          document.getElementById('greeting').innerText = 'Thank you for checking in!';
          document.getElementById('checkinForm').style.display = 'none';
          document.getElementById('greeting').style.display = 'block';

          checkinButton.removeEventListener('click', handleCheckinClick);
      };

      checkinButton.addEventListener('click', handleCheckinClick);
  }

  // --- Helper: Escape HTML to prevent XSS in name display ---
  function escapeHtml(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
  }
});
