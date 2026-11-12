document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById('pickModal');
  if (!modal) return;

  const steps = modal.querySelectorAll('.quiz-step');
  const progress = document.getElementById('quiz-progress');
  const answers = { size: null, district: null, in: null, out: null };

  function showStep(n) {
    steps.forEach(s => s.classList.toggle('d-none', Number(s.dataset.step) !== n));
    progress.style.width = (n / 4 * 100) + '%';
  }

  // Сброс при открытии
  modal.addEventListener('show.bs.modal', () => {
    answers.size = answers.district = answers.in = answers.out = null;
    document.getElementById('quiz-in').value = '';
    document.getElementById('quiz-out').value = '';
    showStep(1);
  });

  // Обработка кнопок-ответов
  modal.querySelectorAll('.quiz-answer').forEach(btn => {
    btn.addEventListener('click', () => {
      answers[btn.dataset.key] = btn.dataset.value;
      const current = Number(btn.closest('.quiz-step').dataset.step);
      showStep(current + 1);
    });
  });

  // Валидация дат (мин. сегодня, выезд позже заезда)
  const today = new Date().toISOString().split('T')[0];
  const qIn = document.getElementById('quiz-in');
  const qOut = document.getElementById('quiz-out');
  
  qIn.setAttribute('min', today);
  qIn.addEventListener('change', () => {
    if (!qIn.value) return;
    const next = new Date(qIn.value);
    next.setDate(next.getDate() + 1);
    qOut.setAttribute('min', next.toISOString().split('T')[0]);
    if (qOut.value && qOut.value <= qIn.value) qOut.value = '';
  });

  // Финал квиза
  document.getElementById('quiz-finish').addEventListener('click', () => {
    answers.in = qIn.value;
    answers.out = qOut.value;

    // Справочник ситтеров (строго синхронизирован с catalog.html)
    const sitters = [
      { district: 'Центральный', size: 'Средний' },
      { district: 'Северный', size: 'Крупный' },
      { district: 'Южный', size: 'Мелкий' },
      { district: 'Северный', size: 'Крупный' },
      { district: 'Центральный', size: 'Средний' },
      { district: 'Южный', size: 'Средний' },
      { district: 'Северный', size: 'Мелкий' },
      { district: 'Центральный', size: 'Крупный' },
    ];

    // Считаем количество подходящих
    const count = sitters.filter(s =>
      (answers.district === 'all' || s.district === answers.district) &&
      s.size === answers.size
    ).length;

    document.getElementById('quiz-count').textContent = count;

    // Формируем URL для каталога
    const url = new URL('catalog.html', window.location.href);
    if (answers.size) url.searchParams.set('size', answers.size);
    if (answers.district && answers.district !== 'all') url.searchParams.set('district', answers.district);
    
    // Добавляем флаг, что был умный подбор, чтобы в каталоге показать алерт
    url.searchParams.set('smart', 'true');

    document.getElementById('quiz-go-catalog').href = url.toString();
    showStep(4);
  });
});