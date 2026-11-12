document.addEventListener("DOMContentLoaded", function () {

  /* ============ 1. ЭЛЕМЕНТЫ ============ */
  const form = document.getElementById('booking-form');
  const phoneInput = document.getElementById('b-phone');
  const dateIn = document.getElementById('b-in');
  const dateOut = document.getElementById('b-out');
  const countInput = document.getElementById('b-count');
  const totalDisplay = document.getElementById('total');
  const breakdown = document.getElementById('calc-breakdown');
  const seasonWarning = document.getElementById('season-warning');
  const copyBtn = document.getElementById('copy-sitter');
  const sitterSelect = document.getElementById('b-sitter');

  const today = new Date().toISOString().split('T')[0];
  if (dateIn) dateIn.setAttribute('min', today);

  /* ============ 1.5. АВТОВЫБОР СИТТЕРА ИЗ URL ============ */
  const urlParams = new URLSearchParams(window.location.search);
  const sitterParam = urlParams.get('sitter');
  
  if (sitterParam) {
    for (let i = 0; i < sitterSelect.options.length; i++) {
      if (sitterSelect.options[i].value === sitterParam) {
        sitterSelect.selectedIndex = i;
        
        // Вызываем change, чтобы сработали слушатели (кнопка копирования, валидация и т.д.)
        sitterSelect.dispatchEvent(new Event('change'));
        
        // Плавный скролл к полю выбора ситтера, чтобы пользователь понял, что произошло
        setTimeout(() => {
          sitterSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
        break;
      }
    }
  }

  /* ============ 2. ТЕЛЕФОН ============ */
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '');
    });
  }

  /* ============ 3. СЕЗОННЫЙ КОЭФФИЦИЕНТ ============ */
  function seasonCoeff(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();

    if ((m === 12 && d >= 25) || (m === 1 && d <= 10)) {
      return { coeff: 1.5, label: 'новогодние праздники' };
    }
    if (m === 5 && d <= 10) {
      return { coeff: 1.3, label: 'майские праздники' };
    }
    if (m === 7 || m === 8) {
      return { coeff: 1.2, label: 'летний сезон' };
    }
    return { coeff: 1, label: null };
  }

  function seasonForPeriod(dIn, dOut) {
    if (!dIn || !dOut) return { coeff: 1, labels: [] };
    const start = new Date(dIn);
    const end = new Date(dOut);
    let coeff = 1;
    const labels = new Set();

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const s = seasonCoeff(new Date(d));
      if (s.coeff > coeff) coeff = s.coeff;
      if (s.label) labels.add(s.label);
    }
    return { coeff, labels: Array.from(labels) };
  }

  /* ============ 4. РАСЧЕТ ============ */
  function calcTotal() {
    const selectedOption = sitterSelect.options[sitterSelect.selectedIndex];
    const price = selectedOption ? parseInt(selectedOption.dataset.price) || 0 : 0;
    
    const dIn = dateIn.value;
    const dOut = dateOut.value;

    if (dIn && dOut) {
      const date1 = new Date(dIn);
      const date2 = new Date(dOut);
      if (date2 <= date1) {
        dateOut.setCustomValidity("Дата выезда должна быть позже даты заезда.");
        dateOut.classList.add('is-invalid');
        dateOut.classList.remove('is-valid');
        totalDisplay.textContent = "0";
        breakdown.textContent = "Выберите корректные даты";
        seasonWarning.classList.add('d-none');
        return;
      } else {
        dateOut.setCustomValidity("");
        dateOut.classList.remove('is-invalid');
        dateOut.classList.add('is-valid');
      }
    } else {
      dateOut.setCustomValidity("");
    }

    if (dIn) {
      const nextDay = new Date(dIn);
      nextDay.setDate(nextDay.getDate() + 1);
      dateOut.setAttribute('min', nextDay.toISOString().split('T')[0]);
    }

    let days = 0;
    if (dIn && dOut) {
      const ms = new Date(dOut) - new Date(dIn);
      days = Math.max(0, Math.round(ms / 86400000));
    }

    const count = Math.max(1, parseInt(countInput.value) || 1);

    let extras = 0;
    document.querySelectorAll('.extra:checked').forEach(c => extras += Number(c.value));

    const season = seasonForPeriod(dIn, dOut);

    const base = price * days * count;
    const withSeason = Math.round(base * season.coeff);
    const total = withSeason + extras;

    totalDisplay.textContent = total;

    if (days > 0 && price > 0) {
      let text = `${price} ₽ × ${days} дн. × ${count} соб.`;
      if (season.coeff > 1) text += ` × ${season.coeff}`;
      if (extras > 0) text += ` + ${extras} ₽ доп.`;
      breakdown.textContent = text;
    } else if (!sitterSelect.value) {
      breakdown.textContent = "Выберите ситтера и даты";
    } else {
      breakdown.textContent = "Выберите даты заезда и выезда";
    }

    if (season.coeff > 1 && days > 0) {
      seasonWarning.classList.remove('d-none');
      seasonWarning.innerHTML = `<strong>Выбранные даты попадают на ${season.labels.join(' и ')}.</strong> Применён коэффициент ${season.coeff}.`;
    } else {
      seasonWarning.classList.add('d-none');
    }
  }

  document.querySelectorAll('#b-sitter, #b-in, #b-out, .extra, #b-count').forEach(el => {
    el.addEventListener('change', calcTotal);
    el.addEventListener('input', calcTotal);
  });

  /* ============ 5. КОПИРОВАНИЕ КОНТАКТОВ ============ */
  sitterSelect.addEventListener('change', () => {
    copyBtn.classList.toggle('d-none', !sitterSelect.value);
  });

  copyBtn.addEventListener('click', async () => {
    const selectedOption = sitterSelect.options[sitterSelect.selectedIndex];
    if (!selectedOption || !selectedOption.value) return;

    const name = selectedOption.value;
    const phone = selectedOption.dataset.phone;
    const district = selectedOption.dataset.district;

    const text = `Ситтер ${name}, тел: ${phone}, район: ${district}`;

    try {
      await navigator.clipboard.writeText(text);
      bootstrap.Toast.getOrCreateInstance(document.getElementById('copy-toast'), { delay: 2500 }).show();
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      bootstrap.Toast.getOrCreateInstance(document.getElementById('copy-toast'), { delay: 2500 }).show();
    }
  });

  /* ============ 6. ВАЛИДАЦИЯ ПОЛЕЙ ============ */
  const requiredInputs = document.querySelectorAll('input[required], select[required]');
  requiredInputs.forEach(input => {
    input.addEventListener('input', function () {
      if (this.validity.customError) return;
      this.classList.toggle('is-invalid', !this.checkValidity());
      this.classList.toggle('is-valid', this.checkValidity());
    });
    input.addEventListener('blur', function () {
      if (this.value !== '' && !this.validity.customError) {
        this.classList.toggle('is-invalid', !this.checkValidity());
        this.classList.toggle('is-valid', this.checkValidity());
      }
    });
  });

  /* ============ 7. ОТПРАВКА ============ */
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (!this.checkValidity()) {
        const invalidFields = this.querySelectorAll(':invalid');
        invalidFields.forEach(f => f.classList.add('is-invalid'));
        const first = invalidFields[0];
        first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => first.focus({ preventScroll: true }), 500);
      } else {
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success rounded-4 mb-4 fw-bold text-center shadow-sm';
        successAlert.innerHTML = '✅ Форма успешно отправлена! Менеджер свяжется с вами в ближайшее время.';
        form.parentElement.insertBefore(successAlert, form);
        
        form.reset();
        totalDisplay.textContent = "0";
        breakdown.textContent = "Выберите ситтера и даты";
        seasonWarning.classList.add('d-none');
        copyBtn.classList.add('d-none');
        
        requiredInputs.forEach(input => {
          input.classList.remove('is-valid', 'is-invalid');
        });

        setTimeout(() => successAlert.remove(), 5000);
      }
    });
  }
});