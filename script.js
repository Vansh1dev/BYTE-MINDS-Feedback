// ========================
// Google Apps Script URL – REPLACE WITH YOUR DEPLOYED SCRIPT URL
const SCRIPT_URL = 'https://script.google.com/macros/s/https://script.google.com/macros/s/AKfycbyamkx8TWQJL_l8Canrbo5cDOcZ2h0HV6uT4yDlr-Y/dev/exec'
// ========================

document.addEventListener('DOMContentLoaded', () => {
  // ---- Matrix rain ----
  const canvas = document.getElementById('matrix');
  const ctx = canvas.getContext('2d');
  let drops = [];
  const chars = '0123456789ABCDEFｦｧｨｩｪｫｬｭｮｯｱｲｳｵｶｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
  const colors = ['#00e5ff', '#ff4dff'];

  function initMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns).fill(0);
  }

  function drawMatrix() {
    const fontSize = 14;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillText(text, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  initMatrix();
  window.addEventListener('resize', initMatrix);
  setInterval(drawMatrix, 40);

  // ---- Boot sequence ----
  const bootScreen = document.getElementById('boot-screen');
  const bootTextEl = document.getElementById('boot-text');
  const bootFill = document.getElementById('boot-fill');
  const mainContent = document.getElementById('main-content');
  const fullMessage = 'INITIALIZING BYTEMINDS NETWORK...';
  let bootIndex = 0;

  function typeBoot() {
    if (bootIndex < fullMessage.length) {
      bootTextEl.textContent += fullMessage.charAt(bootIndex);
      bootIndex++;
      setTimeout(typeBoot, 60);
    } else {
      // fill bar
      bootFill.style.width = '100%';
      setTimeout(() => {
        bootScreen.style.opacity = '0';
        setTimeout(() => {
          bootScreen.style.display = 'none';
          mainContent.style.display = 'block';
        }, 500);
      }, 800);
    }
  }

  typeBoot();

  // ---- Progress bar & form validation ----
  const progressBar = document.getElementById('progress-bar');
  const form = document.getElementById('feedback-form');
  const radioGroup = document.getElementById('awarenessRadioGroup');
  const radioError = document.getElementById('radioError');
  const submitBtn = document.getElementById('submitBtn');

  function getRequiredFields() {
    return Array.from(form.querySelectorAll('.required'));
  }

  function isFieldFilled(el) {
    if (el.type === 'radio') {
      return radioGroup.querySelector('input[name="improvedAwareness"]:checked') !== null;
    }
    if (el.tagName === 'SELECT') return el.value !== '';
    if (el.type === 'range') return true; // always has value
    return el.value.trim() !== '';
  }

  function updateProgress() {
    const required = getRequiredFields();
    const filled = required.filter(isFieldFilled).length;
    const percent = Math.round((filled / required.length) * 100);
    progressBar.style.width = percent + '%';
  }

  // Attach listeners
  form.querySelectorAll('.required').forEach(el => {
    el.addEventListener('input', updateProgress);
    el.addEventListener('change', updateProgress);
  });

  // Range value display
  document.getElementById('overallRating').addEventListener('input', (e) => {
    document.getElementById('overallRatingValue').textContent = e.target.value;
  });
  document.getElementById('speakerRating').addEventListener('input', (e) => {
    document.getElementById('speakerRatingValue').textContent = e.target.value;
  });

  // ---- Submit handler ----
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate radio group manually
    const awarenessChecked = radioGroup.querySelector('input[name="improvedAwareness"]:checked');
    if (!awarenessChecked) {
      radioError.style.display = 'block';
      radioError.textContent = 'Select YES or NO.';
      return;
    } else {
      radioError.style.display = 'none';
    }

    // Collect data
    const formData = {
      agentName: document.getElementById('agentName').value.trim(),
      classSection: document.getElementById('classSection').value.trim(),
      overallRating: document.getElementById('overallRating').value,
      valuableSession: document.getElementById('valuableSession').value,
      improvedAwareness: awarenessChecked.value,
      speakerRating: document.getElementById('speakerRating').value,
      learned: document.getElementById('learned').value.trim(),
      suggestions: document.getElementById('suggestions').value.trim()
    };

    // Show loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // important for Apps Script (no-cors to avoid CORS issues; response will be opaque)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Because of no-cors, we cannot read response, but we assume success if no error thrown.
      // Alternate: use mode: 'cors' with proper CORS headers on Apps Script; see google-apps-script.js.
      // For simplicity, we proceed as success.

      // Hide form, show thank you
      document.querySelector('.form-container').style.display = 'none';
      const thankYou = document.getElementById('thank-you');
      thankYou.style.display = 'block';

      // Typing animation for terminal message
      const typedSpan = document.getElementById('typed-thanks');
      const thanksMsg = 'MISSION COMPLETE. FEEDBACK SUCCESSFULLY TRANSMITTED.';
      let i = 0;
      function typeThanks() {
        if (i < thanksMsg.length) {
          typedSpan.textContent += thanksMsg.charAt(i);
          i++;
          setTimeout(typeThanks, 60);
        }
      }
      typeThanks();

    } catch (err) {
      alert('TRANSMISSION FAILED. CHECK CONNECTION AND RETRY.');
      console.error(err);
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
});
