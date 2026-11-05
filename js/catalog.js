document.addEventListener("DOMContentLoaded", function() {
  const applyBtn = document.getElementById('apply-filters');
  
  if (applyBtn) {
    applyBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const district = document.getElementById('f-district').value;
      const maxPrice = parseInt(document.getElementById('f-price').value) || Infinity;
      const size = document.getElementById('f-size').value;
      const exp = parseInt(document.getElementById('f-exp').value) || 0;
      
      const cards = document.querySelectorAll('.sitter-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const cardDistrict = card.dataset.district;
        const cardPrice = parseInt(card.dataset.price);
        const cardSize = card.dataset.size;
        const cardExp = parseInt(card.dataset.exp);
        
        let match = true;

        if (district !== "all" && district !== cardDistrict) match = false;
        if (cardPrice > maxPrice) match = false;
        if (size !== "all" && size !== cardSize) match = false;
        if (exp > 0 && cardExp < exp) match = false;

        if (match) {
          card.style.display = 'block';
          visibleCount++;
          card.style.opacity = '0';
          setTimeout(() => card.style.opacity = '1', 50);
        } else {
          card.style.display = 'none';
        }
      });

      const noResults = document.getElementById('no-results');
      if (visibleCount === 0) {
        noResults.classList.remove('d-none');
      } else {
        noResults.classList.add('d-none');
      }
    });
  }
});