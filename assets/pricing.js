(() => {
  const estimate = document.querySelector('[data-inhouse-estimate]');
  const fields = Array.from(estimate.querySelectorAll('[data-estimate-cost]'));
  const currency = new Intl.NumberFormat(document.documentElement.lang, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });

  const update = () => {
    let total = 0;
    let staff = 0;

    for (const field of fields) {
      const cost = Math.max(0, field.valueAsNumber || 0);
      total += cost;
      if (field.hasAttribute('data-staff-cost')) staff += cost;
    }

    estimate.querySelector('[data-estimate-total]').textContent = currency.format(total);
    estimate.querySelector('[data-estimate-staff]').textContent = currency.format(staff);
  };

  estimate.addEventListener('input', update);
  update();
})();
