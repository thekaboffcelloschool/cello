// ── Kaboff Cello School – Shared JS ──
(function() {
  var LS = window.localStorage;

  // Font size
  var sizes = ['14px','16px','18px','21px','24px'];
  var sizeIdx = parseInt(LS.getItem('kcs-font') || '1');

  function applyFont(idx) {
    sizeIdx = Math.max(0, Math.min(sizes.length-1, idx));
    document.documentElement.style.setProperty('--base-font-size', sizes[sizeIdx]);
    LS.setItem('kcs-font', sizeIdx);
  }

  // Theme
  var themes = ['default','dark','warm','sage','slate','rose'];
  var curTheme = LS.getItem('kcs-theme') || 'default';

  function applyTheme(t) {
    themes.forEach(function(th) { document.body.classList.remove('theme-'+th); });
    if (t !== 'default') document.body.classList.add('theme-'+t);
    curTheme = t;
    LS.setItem('kcs-theme', t);
    document.querySelectorAll('.swatch').forEach(function(s) {
      s.classList.toggle('active', s.dataset.theme === t);
    });
  }

  // Mobile menu
  function toggleMobile() {
    var m = document.getElementById('mm');
    if (m) m.classList.toggle('open');
  }

  // Accessibility panel
  function togglePanel() {
    var p = document.getElementById('a11y-panel');
    if (p) p.classList.toggle('open');
  }

  // Mark active nav link
  function markActive() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nl a, .mm a').forEach(function(a) {
      var href = a.getAttribute('href') || '';
      a.classList.toggle('active', href.split('/').pop() === path);
    });
  }

  window.addEventListener('DOMContentLoaded', function() {
    applyFont(sizeIdx);
    applyTheme(curTheme);
    markActive();

    // Font buttons
    var fUp = document.getElementById('font-up');
    var fDn = document.getElementById('font-dn');
    var fRs = document.getElementById('font-rs');
    if (fUp) fUp.addEventListener('click', function() { applyFont(sizeIdx+1); });
    if (fDn) fDn.addEventListener('click', function() { applyFont(sizeIdx-1); });
    if (fRs) fRs.addEventListener('click', function() { applyFont(1); });

    // Swatches
    document.querySelectorAll('.swatch').forEach(function(s) {
      s.addEventListener('click', function() { applyTheme(s.dataset.theme); });
    });

    // Mobile close on outside click
    document.addEventListener('click', function(e) {
      var m = document.getElementById('mm');
      var b = document.querySelector('.hbg');
      if (m && b && !m.contains(e.target) && !b.contains(e.target)) {
        m.classList.remove('open');
      }
    });

    // Panel toggle
    var toggle = document.getElementById('a11y-toggle');
    if (toggle) toggle.addEventListener('click', function(e) { e.stopPropagation(); togglePanel(); });
    document.addEventListener('click', function(e) {
      var panel = document.getElementById('a11y-panel');
      var toggle = document.getElementById('a11y-toggle');
      if (panel && toggle && !panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.classList.remove('open');
      }
    });
  });

  window.toggleMobile = toggleMobile;
  window.togglePanel = togglePanel;
})();
