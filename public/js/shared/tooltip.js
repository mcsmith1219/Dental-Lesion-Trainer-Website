// Info tooltips on the login and sign-up forms.
document.querySelectorAll('.info-icon').forEach(function (icon) {
  icon.addEventListener('click', function (event) {
    event.stopPropagation();
    const tooltip = icon.closest('.info-tooltip');
    const wasOpen = tooltip.classList.contains('open');
    document.querySelectorAll('.info-tooltip.open').forEach(function (t) {
      t.classList.remove('open');
    });
    if (!wasOpen) {
      tooltip.classList.add('open');
    }
  });
});

document.addEventListener('click', function () {
  document.querySelectorAll('.info-tooltip.open').forEach(function (t) {
    t.classList.remove('open');
  });
});
