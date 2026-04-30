(function () {
  var LS = window.localStorage;

  /* ── Font size ── */
  var sizes = ['13px', '15px', '17px', '20px', '23px'];
  var fontIdx = parseInt(LS.getItem('kcs-font') || '2');

  function applyFont(i) {
    fontIdx = Math.max(0, Math.min(sizes.length - 1, i));
    document.documentElement.style.setProperty('--base-font-size', sizes[fontIdx]);
    LS.setItem('kcs-font', fontIdx);
  }

  /* ── Preset themes ── */
  var presets = ['white', 'parchment', 'ivory', 'linen', 'sage', 'slate', 'rose', 'ocean', 'sand'];

  /* Preset theme token lookup — used to restore surface/text when switching away from custom */
  var presetTokens = {
    white:     { bg:'#ffffff',  surface:'#f8f8f8',  text:'#1a1208', text2:'#3a2c18', muted:'#7a6a55', accent:'#c8893a', accent2:'#a06820', tint:'rgba(200,137,58,.08)',  border:'rgba(26,18,8,0.13)'   },
    parchment: { bg:'#f5f0e8',  surface:'#faf7f2',  text:'#2a1f12', text2:'#4a3820', muted:'#7a6a55', accent:'#c8893a', accent2:'#a06820', tint:'rgba(200,137,58,.10)',  border:'rgba(42,31,18,0.14)'  },
    ivory:     { bg:'#fefcf5',  surface:'#ffffff',  text:'#241a08', text2:'#40300c', muted:'#7a6a40', accent:'#b07820', accent2:'#8a5a10', tint:'rgba(176,120,32,.10)',  border:'rgba(36,26,8,0.12)'   },
    linen:     { bg:'#f9f5ec',  surface:'#fdfaf4',  text:'#322510', text2:'#4e3a18', muted:'#8a7458', accent:'#b87828', accent2:'#8c5a14', tint:'rgba(184,120,40,.09)',  border:'rgba(50,37,16,0.13)'  },
    sage:      { bg:'#f0f5ee',  surface:'#f7faf5',  text:'#182818', text2:'#2c4228', muted:'#567050', accent:'#487838', accent2:'#2e5822', tint:'rgba(72,120,56,.10)',   border:'rgba(24,40,24,0.13)'  },
    slate:     { bg:'#edf1f7',  surface:'#f4f7fc',  text:'#0e1e32', text2:'#1a3050', muted:'#4a6080', accent:'#2a5890', accent2:'#1a3e6e', tint:'rgba(42,88,144,.09)',   border:'rgba(14,30,50,0.13)'  },
    rose:      { bg:'#fdf0f0',  surface:'#fff5f5',  text:'#320e0e', text2:'#501a1a', muted:'#8c5050', accent:'#a83030', accent2:'#7e1c1c', tint:'rgba(168,48,48,.09)',   border:'rgba(50,14,14,0.13)'  },
    ocean:     { bg:'#edf6f8',  surface:'#f3fafc',  text:'#062030', text2:'#0e3448', muted:'#3a6878', accent:'#0e6880', accent2:'#085060', tint:'rgba(14,104,128,.09)',  border:'rgba(6,32,48,0.13)'   },
    sand:      { bg:'#f8f3e6',  surface:'#fdfaf2',  text:'#30240a', text2:'#4c3a12', muted:'#847050', accent:'#9a6c20', accent2:'#745010', tint:'rgba(154,108,32,.09)',  border:'rgba(48,36,10,0.13)'  }
  };

  var curTheme  = LS.getItem('kcs-theme')  || 'white';
  var customBg  = LS.getItem('kcs-custom-bg') || '#ffffff';

  /* ── Apply a preset theme ── */
  function applyPreset(name) {
    /* remove all theme classes */
    presets.forEach(function (t) { document.body.classList.remove('theme-' + t); });
    document.body.classList.remove('theme-custom');
    /* clear any inline custom props */
    clearCustomProps();
    document.body.classList.add('theme-' + name);
    curTheme = name;
    LS.setItem('kcs-theme', name);
    LS.removeItem('kcs-custom-bg');
    syncSwatches(name);
    syncPicker(presetTokens[name] ? presetTokens[name].bg : '#ffffff');
  }

  /* ── Apply a custom background color ── */
  function applyCustom(hex) {
    presets.forEach(function (t) { document.body.classList.remove('theme-' + t); });
    document.body.classList.remove('theme-custom');
    document.body.classList.add('theme-custom');
    curTheme = 'custom';
    customBg = hex;
    LS.setItem('kcs-theme', 'custom');
    LS.setItem('kcs-custom-bg', hex);

    /* Derive a slightly darker surface */
    var surface = darken(hex, 6);
    /* Set CSS variables on :root */
    var r = document.documentElement;
    r.style.setProperty('--bg', hex);
    r.style.setProperty('--surface', surface);
    r.style.setProperty('--tint', hexToRgba(hex, 0.15));
    /* Border: mid-dark at low opacity */
    r.style.setProperty('--border', 'rgba(26,18,8,0.13)');

    syncSwatches(null);
    syncPicker(hex);
    updatePreview(hex);
  }

  function clearCustomProps() {
    var r = document.documentElement;
    ['--bg','--surface','--tint','--border'].forEach(function (p) { r.style.removeProperty(p); });
  }

  /* ── Sync UI ── */
  function syncSwatches(active) {
    document.querySelectorAll('.theme-opt').forEach(function (el) {
      el.classList.toggle('active', el.dataset.theme === active);
    });
  }

  function syncPicker(hex) {
    var picker = document.getElementById('bg-picker');
    if (picker) picker.value = hex;
    updatePreview(hex);
  }

  function updatePreview(hex) {
    var prev = document.getElementById('color-preview');
    if (prev) prev.style.background = hex;
  }

  /* ── Color helpers ── */
  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function darken(hex, pct) {
    var r = Math.max(0, parseInt(hex.slice(1, 3), 16) - Math.round(255 * pct / 100));
    var g = Math.max(0, parseInt(hex.slice(3, 5), 16) - Math.round(255 * pct / 100));
    var b = Math.max(0, parseInt(hex.slice(5, 7), 16) - Math.round(255 * pct / 100));
    return '#' + [r, g, b].map(function (v) { return v.toString(16).padStart(2, '0'); }).join('');
  }

  /* ── Mark active nav link ── */
  function markActive() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nl a').forEach(function (a) {
      var h = (a.getAttribute('href') || '').split('/').pop();
      a.classList.toggle('active', h === path);
    });
  }

  /* ── Mobile menu ── */
  function toggleMobile() {
    var m = document.getElementById('mm');
    if (m) m.classList.toggle('open');
  }

  /* ── Init on DOM ready ── */
  window.addEventListener('DOMContentLoaded', function () {

    applyFont(fontIdx);
    markActive();

    /* Restore theme */
    if (curTheme === 'custom') {
      applyCustom(customBg);
    } else {
      applyPreset(curTheme);
    }

    /* Font buttons */
    var fUp = document.getElementById('font-up');
    var fDn = document.getElementById('font-dn');
    var fRs = document.getElementById('font-rs');
    if (fUp) fUp.addEventListener('click', function () { applyFont(fontIdx + 1); });
    if (fDn) fDn.addEventListener('click', function () { applyFont(fontIdx - 1); });
    if (fRs) fRs.addEventListener('click', function () { applyFont(2); });

    /* Preset swatches */
    document.querySelectorAll('.theme-opt').forEach(function (el) {
      el.addEventListener('click', function () { applyPreset(el.dataset.theme); });
    });

    /* Custom color picker */
    var picker = document.getElementById('bg-picker');
    if (picker) {
      picker.value = curTheme === 'custom' ? customBg : (presetTokens[curTheme] ? presetTokens[curTheme].bg : '#ffffff');
      picker.addEventListener('input', function () { applyCustom(picker.value); });
      picker.addEventListener('change', function () { applyCustom(picker.value); });
    }

    /* Reset custom to white */
    var resetBtn = document.getElementById('color-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        applyPreset('white');
        var picker = document.getElementById('bg-picker');
        if (picker) picker.value = '#ffffff';
      });
    }

    /* A11y panel toggle */
    var toggle = document.getElementById('a11y-toggle');
    var panel  = document.getElementById('a11y-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        panel.classList.toggle('open');
      });
    }

    /* Close panel and mobile menu on outside click */
    document.addEventListener('click', function (e) {
      var panel  = document.getElementById('a11y-panel');
      var toggle = document.getElementById('a11y-toggle');
      if (panel && toggle && !panel.contains(e.target) && e.target !== toggle) {
        panel.classList.remove('open');
      }
      var m = document.getElementById('mm');
      var b = document.querySelector('.hbg');
      if (m && b && !m.contains(e.target) && !b.contains(e.target)) {
        m.classList.remove('open');
      }
    });
  });

  window.toggleMobile = toggleMobile;
})();
