document.addEventListener("DOMContentLoaded", function() {
  
  // --- 1. ДАННЫЕ О ЦЕНАХ СИТТЕРОВ ---
  const sitterPrices = {
    "Анна — Центральный, 800 ₽": 800,
    "Михаил — Северный, 1000 ₽": 1000,
    "Ольга — Южный, 600 ₽": 600,
    "Дмитрий — Северный, 1200 ₽": 1200,
    "Елена — Центральный, 900 ₽": 900,
    "Игорь — Южный, 700 ₽": 700,
    "Мария — Северный, 1100 ₽": 1100,
    "Алексей — Центральный, 950 ₽": 950
  };

  // --- 2. ЭЛЕМЕНТЫ ФОРМЫ ---
  const form = document.getElementById('booking-form');
  const phoneInput = document.getElementById('b-phone');
  const dateIn = document.getElementById('b-in');
  const dateOut = document.getElementById('b-out');
  const totalDisplay = document.getElementById('total');

  // Устанавливаем минимальную дату заезда - сегодня
  const today = new Date().toISOString().split('T')[0];
  if (dateIn) dateIn.setAttribute('min', today);

  // --- 3. ВАЛИДАЦИЯ ТЕЛЕФОНА (только цифры) ---
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      // Удаляем все символы, кроме цифр
      this.value = this.value.replace(/\D/g, '');
    });
  }

  // --- 4. РАСЧЕТ СТОИМОСТИ И ПРОВЕРКА ДАТ ---
  function calcTotal() {
    const sitter = document.getElementById('b-sitter').value;
    const price = sitterPrices[sitter] || 0;
    const dIn = dateIn.value;
    const dOut = dateOut.value;

    // Проверка: дата выезда не может быть раньше или равна дате заезда
    if (dIn && dOut) {
      const date1 = new Date(dIn);
      const date2 = new Date(dOut);
      
      if (date2 <= date1) {
        // Принудительно делаем поле невалидным для браузера
        dateOut.setCustomValidity("Дата выезда должна быть позже даты заезда.");
        dateOut.classList.add('is-invalid');
        dateOut.classList.remove('is-valid');
        totalDisplay.textContent = "0";
        return; // Прерываем расчет
      } else {
        // Сбрасываем ошибку
        dateOut.setCustomValidity("");
        dateOut.classList.remove('is-invalid');
        dateOut.classList.add('is-valid');
      }
    } else {
      dateOut.setCustomValidity("");
    }

    // Ограничение минимальной даты выезда (день после заезда)
    if (dIn) {
      const nextDay = new Date(dIn);
      nextDay.setDate(nextDay.getDate() + 1);
      dateOut.setAttribute('min', nextDay.toISOString().split('T')[0]);
    }

    // Расчет количества дней
    let days = 0;
    if (dIn && dOut) {
      const ms = new Date(dOut) - new Date(dIn);
      days = Math.max(0, Math.round(ms / 86400000));
    }

    // Расчет дополнительных услуг
    let extras = 0;
    document.querySelectorAll('.extra:checked').forEach(c => extras += Number(c.value));

    // Вывод итоговой суммы
    const total = (price * days) + extras;
    totalDisplay.textContent = total;
  }

  // Навешиваем события на элементы формы
  document.querySelectorAll('#b-sitter, #b-in, #b-out, .extra').forEach(el => {
    el.addEventListener('change', calcTotal);
    el.addEventListener('input', calcTotal);
  });
  
  const countInput = document.getElementById('b-count');
  if (countInput) {
    countInput.addEventListener('input', calcTotal);
  }

  // --- 5. ДИНАМИЧЕСКАЯ ПОДСВЕТКА ПОЛЕЙ (Красный/Зеленый) ---
  const requiredInputs = document.querySelectorAll('input[required], select[required]');
  
  requiredInputs.forEach(input => {
    // При вводе
    input.addEventListener('input', function() {
      if (this.checkValidity()) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
      } else {
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
      }
    });
    
    // При потере фокуса
    input.addEventListener('blur', function() {
      if (this.value !== '') {
        if (this.checkValidity()) {
          this.classList.remove('is-invalid');
          this.classList.add('is-valid');
        } else {
          this.classList.remove('is-valid');
          this.classList.add('is-invalid');
        }
      }
    });
  });

  // --- 6. ОТПРАВКА ФОРМЫ (Блокировка и плавный скролл) ---
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault(); // Отменяем стандартную перезагрузку страницы
      e.stopPropagation();

      // Проверяем валидность всей формы
      if (!this.checkValidity()) {
        
        // Находим все невалидные поля
        const invalidFields = this.querySelectorAll(':invalid');
        
        if (invalidFields.length > 0) {
          // Подсвечиваем их красным
          invalidFields.forEach(field => {
            field.classList.add('is-invalid');
          });

          // Берем первое невалидное поле
          const firstInvalid = invalidFields[0];
          
          // Плавно скроллим к этому полю
          firstInvalid.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Ставим курсор в это поле с небольшой задержкой (чтобы скролл не сбился)
          setTimeout(() => {
            firstInvalid.focus({ preventScroll: true }); 
          }, 500); 
        }
      } else {
        // Если форма валидна, показываем сообщение об успехе
        alert("Форма успешно отправлена! Менеджер свяжется с вами в ближайшее время.");
        
        // Опционально: очищаем форму после отправки
        this.reset();
        totalDisplay.textContent = "0";
        
        // Убираем зеленую подсветку после сброса
        requiredInputs.forEach(input => {
          input.classList.remove('is-valid', 'is-invalid');
        });
      }
    });
  }
});