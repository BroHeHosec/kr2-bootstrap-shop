document.addEventListener("DOMContentLoaded", function () {

  /* ===================== 1. ФИЛЬТРЫ ===================== */
  const applyBtn = document.getElementById('apply-filters');
  const resetBtn = document.getElementById('reset-filters');
  const noResults = document.getElementById('no-results');

  function applyFilters() {
    const district = document.getElementById('f-district').value;
    const maxPrice = parseInt(document.getElementById('f-price').value) || Infinity;
    const size = document.getElementById('f-size').value;
    const exp = parseInt(document.getElementById('f-exp').value) || 0;

    let visibleCount = 0;
    document.querySelectorAll('.sitter-card').forEach(card => {
      const match =
        (district === 'all' || card.dataset.district === district) &&
        (parseInt(card.dataset.price) <= maxPrice) &&
        (size === 'all' || card.dataset.size === size) &&
        (exp === 0 || parseInt(card.dataset.exp) >= exp);

      card.classList.toggle('d-none', !match);
      if (match) visibleCount++;
    });

    noResults.classList.toggle('d-none', visibleCount !== 0);
  }

  if (applyBtn) applyBtn.addEventListener('click', e => { e.preventDefault(); applyFilters(); });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('filter-form').reset();
      setTimeout(applyFilters, 0);
    });
  }

  // Предзаполнение из URL (из квиза на главной)
  const params = new URLSearchParams(window.location.search);
  if (params.get('district')) document.getElementById('f-district').value = params.get('district');
  if (params.get('size')) document.getElementById('f-size').value = params.get('size');
  
  // Показываем алерт, если пришли из умного подбора
  if (params.get('smart') === 'true') {
    const smartAlert = document.getElementById('smart-alert');
    if (smartAlert) smartAlert.classList.remove('d-none');
  }

  if (params.get('district') || params.get('size')) applyFilters();

  /* ===================== 2. СРАВНЕНИЕ ===================== */
  const MAX_COMPARE = 3;
  const bar = document.getElementById('compare-bar');
  const barCount = document.getElementById('compare-count');
  const checks = () => document.querySelectorAll('.compare-check');
  const selected = () => Array.from(checks()).filter(c => c.checked);

  function syncCompareBar() {
    const n = selected().length;
    barCount.textContent = n;
    bar.classList.toggle('d-none', n === 0);
    bar.classList.toggle('d-flex', n > 0);
  }

  checks().forEach(cb => {
    cb.addEventListener('change', () => {
      // Если пытаются выбрать больше 3 — откат
      if (cb.checked && selected().length > MAX_COMPARE) {
        cb.checked = false;
        return;
      }
      // Блокируем остальные, если уже выбрано 3
      const reached = selected().length >= MAX_COMPARE;
      checks().forEach(c => {
        if (!c.checked) c.disabled = reached;
      });
      syncCompareBar();
    });
  });

  document.getElementById('compare-clear').addEventListener('click', () => {
    checks().forEach(c => { c.checked = false; c.disabled = false; });
    syncCompareBar();
  });

  document.getElementById('compare-open').addEventListener('click', () => {
    const items = selected();
    if (items.length < 2) return;

    const rows = [
      ['Имя', 'name'],
      ['Район', 'district'],
      ['Цена, ₽/сутки', 'price'],
      ['Размер собаки', 'size'],
      ['Опыт, лет', 'exp'],
      ['Животные', 'animals'],
      ['Телефон', 'phone'],
    ];

    // Заголовок таблицы
    const head = document.getElementById('compare-head');
    head.innerHTML = '<th scope="col" class="text-white">Характеристика</th>' +
      items.map(i => `<th scope="col" class="text-center text-white">${i.dataset.name}</th>`).join('');

    // Тело таблицы
    const body = document.getElementById('compare-body');
    body.innerHTML = rows.map(([label, key]) =>
      `<tr>
        <th scope="row" class="text-muted">${label}</th>
        ${items.map(i => `<td class="text-center">${i.dataset[key] || '—'}</td>`).join('')}
      </tr>`
    ).join('');

    new bootstrap.Modal(document.getElementById('compareModal')).show();
  });

  syncCompareBar();
});