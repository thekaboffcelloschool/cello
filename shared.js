/* Kaboff Cello School — shared.js
   Compatible with: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
   GitHub Pages safe: no modules, no optional chaining, no nullish coalescing
*/
(function () {
  'use strict';

  /* ── Polyfill padStart for older browsers ── */
  if (!String.prototype.padStart) {
    String.prototype.padStart = function (len, fill) {
      var s = String(this);
      fill = fill === undefined ? ' ' : String(fill);
      while (s.length < len) s = fill + s;
      return s;
    };
  }

  var LS;
  try { LS = window.localStorage; } catch (e) { LS = null; }

  function lsGet(k) { try { return LS ? LS.getItem(k) : null; } catch(e) { return null; } }
  function lsSet(k, v) { try { if (LS) LS.setItem(k, v); } catch(e) {} }
  function lsDel(k) { try { if (LS) LS.removeItem(k); } catch(e) {} }

  /* ── Font size ── */
  var sizes = ['13px', '15px', '17px', '20px', '23px'];
  var fontIdx = parseInt(lsGet('kcs-font') || '2', 10);

  function applyFont(i) {
    fontIdx = Math.max(0, Math.min(sizes.length - 1, i));
    document.documentElement.style.setProperty('--base-font-size', sizes[fontIdx]);
    lsSet('kcs-font', String(fontIdx));
  }

  /* ── Preset themes ── */
  var presets = ['white','parchment','ivory','linen','sage','slate','rose','ocean','sand'];

  var presetTokens = {
    white:     { bg:'#ffffff', surface:'#f8f8f8' },
    parchment: { bg:'#f5f0e8', surface:'#faf7f2' },
    ivory:     { bg:'#fefcf5', surface:'#ffffff'  },
    linen:     { bg:'#f9f5ec', surface:'#fdfaf4'  },
    sage:      { bg:'#f0f5ee', surface:'#f7faf5'  },
    slate:     { bg:'#edf1f7', surface:'#f4f7fc'  },
    rose:      { bg:'#fdf0f0', surface:'#fff5f5'  },
    ocean:     { bg:'#edf6f8', surface:'#f3fafc'  },
    sand:      { bg:'#f8f3e6', surface:'#fdfaf2'  }
  };

  var curTheme = lsGet('kcs-theme') || 'white';
  var customBg = lsGet('kcs-custom-bg') || '#ffffff';

  /* Remove all theme classes and clear inline custom props */
  function clearTheme() {
    for (var i = 0; i < presets.length; i++) {
      document.body.classList.remove('theme-' + presets[i]);
    }
    document.body.classList.remove('theme-custom');
    var r = document.documentElement;
    r.style.removeProperty('--bg');
    r.style.removeProperty('--surface');
    r.style.removeProperty('--tint');
    r.style.removeProperty('--border');
  }

  function applyPreset(name) {
    clearTheme();
    document.body.classList.add('theme-' + name);
    curTheme = name;
    lsSet('kcs-theme', name);
    lsDel('kcs-custom-bg');
    syncSwatches(name);
    var t = presetTokens[name];
    syncPicker(t ? t.bg : '#ffffff');
  }

  /* Derive a slightly darker shade for surface */
  function darkenHex(hex, pct) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    var amt = Math.round(255 * pct / 100);
    var r = Math.max(0, parseInt(hex.substring(0,2), 16) - amt);
    var g = Math.max(0, parseInt(hex.substring(2,4), 16) - amt);
    var b = Math.max(0, parseInt(hex.substring(4,6), 16) - amt);
    return '#' + r.toString(16).padStart(2,'0')
                + g.toString(16).padStart(2,'0')
                + b.toString(16).padStart(2,'0');
  }

  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function applyCustom(hex) {
    if (!hex || hex.length < 4) return;
    clearTheme();
    document.body.classList.add('theme-custom');
    curTheme = 'custom';
    customBg = hex;
    lsSet('kcs-theme', 'custom');
    lsSet('kcs-custom-bg', hex);

    var root = document.documentElement;
    root.style.setProperty('--bg', hex);
    root.style.setProperty('--surface', darkenHex(hex, 5));
    root.style.setProperty('--tint', hexToRgba(hex, 0.15));
    root.style.setProperty('--border', 'rgba(26,18,8,0.13)');

    syncSwatches(null);
    syncPicker(hex);
    updatePreview(hex);
  }

  function syncSwatches(active) {
    var opts = document.querySelectorAll('.theme-opt');
    for (var i = 0; i < opts.length; i++) {
      if (active !== null) {
        opts[i].classList.toggle('active', opts[i].getAttribute('data-theme') === active);
      } else {
        opts[i].classList.remove('active');
      }
    }
  }

  function syncPicker(hex) {
    var picker = document.getElementById('bg-picker');
    if (picker) {
      try { picker.value = hex; } catch(e) {}
    }
    updatePreview(hex);
  }

  function updatePreview(hex) {
    var prev = document.getElementById('color-preview');
    if (prev) prev.style.background = hex;
  }

  /* ── Mark active nav link based on current filename ── */
  function markActive() {
    var path = window.location.pathname;
    var page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    /* Handle GitHub Pages subdir: strip query/hash */
    page = page.split('?')[0].split('#')[0];
    if (!page || page === '') page = 'index.html';

    var links = document.querySelectorAll('.nl a');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href') || '';
      var linkPage = href.split('/').pop().split('?')[0].split('#')[0];
      links[i].classList.toggle('active', linkPage === page);
    }
  }

  /* ── Mobile menu ── */
  function toggleMobile() {
    var m = document.getElementById('mm');
    if (m) m.classList.toggle('open');
  }

  /* ── Panel open/close ── */
  var panelOpen = false;

  function openPanel() {
    var panel = document.getElementById('a11y-panel');
    if (panel) {
      panel.classList.add('open');
      panelOpen = true;
    }
  }

  function closePanel() {
    var panel = document.getElementById('a11y-panel');
    if (panel) {
      panel.classList.remove('open');
      panelOpen = false;
    }
  }

  function togglePanel() {
    if (panelOpen) { closePanel(); } else { openPanel(); }
  }

  /* ── DOM ready ── */
  function init() {
    applyFont(fontIdx);
    markActive();

    /* Restore saved theme */
    if (curTheme === 'custom') {
      applyCustom(customBg);
    } else {
      applyPreset(curTheme);
    }

    /* Font size buttons */
    var fUp = document.getElementById('font-up');
    var fDn = document.getElementById('font-dn');
    var fRs = document.getElementById('font-rs');
    if (fUp) fUp.addEventListener('click', function () { applyFont(fontIdx + 1); });
    if (fDn) fDn.addEventListener('click', function () { applyFont(fontIdx - 1); });
    if (fRs) fRs.addEventListener('click', function () { applyFont(2); });

    /* Preset theme swatches */
    var opts = document.querySelectorAll('.theme-opt');
    for (var i = 0; i < opts.length; i++) {
      (function (el) {
        el.addEventListener('click', function () {
          applyPreset(el.getAttribute('data-theme'));
        });
      })(opts[i]);
    }

    /* Custom color picker — listen on both input and change for cross-browser */
    var picker = document.getElementById('bg-picker');
    if (picker) {
      /* Set initial value */
      var initColor = (curTheme === 'custom') ? customBg
                    : (presetTokens[curTheme] ? presetTokens[curTheme].bg : '#ffffff');
      try { picker.value = initColor; } catch(e) {}
      updatePreview(initColor);

      picker.addEventListener('input',  function () { applyCustom(picker.value); });
      picker.addEventListener('change', function () { applyCustom(picker.value); });
    }

    /* Reset button */
    var resetBtn = document.getElementById('color-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        applyPreset('white');
      });
    }

    /* Gear toggle — use mousedown to beat the document click handler */
    var toggleBtn = document.getElementById('a11y-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        togglePanel();
      });
    }

    /* Close panel on outside click */
    document.addEventListener('click', function (e) {
      var panel     = document.getElementById('a11y-panel');
      var toggleBtn = document.getElementById('a11y-toggle');
      if (!panel || !toggleBtn) return;
      if (!panel.contains(e.target) && e.target !== toggleBtn) {
        closePanel();
      }
    });

    /* Close mobile menu on outside click */
    document.addEventListener('click', function (e) {
      var m = document.getElementById('mm');
      var b = document.querySelector('.hbg');
      if (m && b && !m.contains(e.target) && !b.contains(e.target)) {
        m.classList.remove('open');
      }
    });

    /* Prevent clicks inside panel from closing it */
    var panel = document.getElementById('a11y-panel');
    if (panel) {
      panel.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
  }

  /* Run init when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Expose toggleMobile globally for onclick= in HTML */
  window.toggleMobile = toggleMobile;

})();
