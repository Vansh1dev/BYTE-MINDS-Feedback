// ========================
// Google Apps Script URL – REPLACE WITH YOUR DEPLOYED SCRIPT URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6KFnHizgwWRNvnTh8qSN9Klyj6VjFdRyQnyFxP01UtzVNXMQQU4wO46Dje55s6aY/exec';
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
  const formContainer = document.getElementById('form-container');
  const alreadySubmittedDiv = document.getElementById('already-submitted');
  const fullMessage = 'INITIALIZING BYTEMINDS NETWORK...';
  let bootIndex = 0;

  function typeBoot() {
    if (bootIndex < fullMessage.length) {
      bootTextEl.textContent += fullMessage.charAt(bootIndex);
      bootIndex++;
      setTimeout(typeBoot, 60);
    } else {
      bootFill.style.width = '100%';
      setTimeout(() => {
        bootScreen.style.opacity = '0';
        setTimeout(() => {
          bootScreen.style.display = 'none';
          mainContent.style.display = 'block';

          if (localStorage.getItem('byteMindsSubmitted') === 'true') {
            formContainer.style.display = 'none';
            alreadySubmittedDiv.style.display = 'block';
          } else {
            formContainer.style.display = 'block';
            alreadySubmittedDiv.style.display = 'none';
          }
        }, 500);
      }, 800);
    }
  }

  typeBoot();

  // ---- Progress bar & form validation ----
  const progressBar = document.getElementById('progress-bar');
  const form = document.getElementById('feedback-form');
  const submitBtn = document.getElementById('submitBtn');

  function getRequiredFields() {
    const inputs = Array.from(form.querySelectorAll('input.required, textarea.required'));
    const radioGroups = Array.from(form.querySelectorAll('.required-radio-group'));
    return [...inputs, ...radioGroups];
  }

  function isFieldFilled(el) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      return el.value.trim() !== '';
    }
    if (el.classList.contains('required-radio-group')) {
      const name = el.querySelector('input[type="radio"]').name;
      return !!form.querySelector(`input[name="${name}"]:checked`);
    }
    return false;
  }

  function countRequiredFilled() {
    return getRequiredFields().filter(isFieldFilled).length;
  }

  function getTotalRequired() {
    return getRequiredFields().length;
  }

  function updateProgress() {
    const filled = countRequiredFilled();
    const total = getTotalRequired();
    const percent = total === 0 ? 0 : Math.round((filled / total) * 100);
    progressBar.style.width = percent + '%';
  }

  // Attach progress listeners
  form.querySelectorAll('input.required, textarea.required, .required-radio-group input[type="radio"]')
    .forEach(el => el.addEventListener('input', updateProgress));
  form.querySelectorAll('.required-radio-group input[type="radio"]')
    .forEach(el => el.addEventListener('change', updateProgress));

  // Range value displays
  document.getElementById('overallRating').addEventListener('input', (e) => {
    document.getElementById('overallRatingValue').textContent = e.target.value;
  });
  document.getElementById('speakerRating').addEventListener('input', (e) => {
    document.getElementById('speakerRatingValue').textContent = e.target.value;
  });

  // ---- Submit handler ----
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (localStorage.getItem('byteMindsSubmitted') === 'true') {
      alert('ERROR: You have already submitted feedback.');
      formContainer.style.display = 'none';
      alreadySubmittedDiv.style.display = 'block';
      return;
    }

    // Validate all required fields
    const requiredFields = getRequiredFields();
    let valid = true;
    document.querySelectorAll('.radio-error').forEach(el => (el.style.display = 'none'));

    for (const field of requiredFields) {
      if (!isFieldFilled(field)) {
        valid = false;
        if (field.classList.contains('required-radio-group')) {
          const errorEl = field.querySelector('.radio-error');
          if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.textContent = 'Please select an option.';
          }
        } else {
          field.style.borderColor = '#ff4dff';
          setTimeout(() => { field.style.borderColor = ''; }, 1500);
        }
      }
    }

    if (!valid) return;

    // Collect data
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      overallRating: document.getElementById('overallRating').value,
      contentClarity: document.querySelector('input[name="contentClarity"]:checked')?.value || '',
      speakerRating: document.getElementById('speakerRating').value,
      mostUseful: document.getElementById('mostUseful').value.trim(),
      mostInteresting: document.getElementById('mostInteresting').value.trim(),
      keyTakeaway: document.getElementById('keyTakeaway').value.trim(),
      improvements: document.getElementById('improvements').value.trim(),
      additionalComments: document.getElementById('additionalComments').value.trim(),
      attendFuture: document.querySelector('input[name="attendFuture"]:checked')?.value || ''
    };

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      localStorage.setItem('byteMindsSubmitted', 'true');
      formContainer.style.display = 'none';
      const thankYou = document.getElementById('thank-you');
      thankYou.style.display = 'block';

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
