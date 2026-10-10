/* ConvertLab: Electronics Bench Edition
   Plain JavaScript, no dependencies. Linear units convert through a base unit;
   temperature uses functions to and from kelvin. */

'use strict';

// ---------------------------------------------------------------- data
var CATEGORIES = {
  length: { label: 'Length', units: {
    nm: ['Nanometre', 1e-9], um: ['Micrometre (µm)', 1e-6], mm: ['Millimetre', 1e-3], cm: ['Centimetre', 1e-2],
    m: ['Metre', 1], km: ['Kilometre', 1e3], mil: ['Mil (thou)', 2.54e-5], in: ['Inch', 0.0254],
    ft: ['Foot', 0.3048], yd: ['Yard', 0.9144], mi: ['Mile', 1609.344], nmi: ['Nautical mile', 1852] },
    picks: [[1, 'in', 'mm'], [1, 'mi', 'km'], [10, 'mil', 'mm'], [6, 'ft', 'm']], def: ['m', 'ft'] },
  mass: { label: 'Mass', units: {
    mg: ['Milligram', 1e-6], g: ['Gram', 1e-3], kg: ['Kilogram', 1], t: ['Tonne', 1e3],
    oz: ['Ounce', 0.028349523125], lb: ['Pound', 0.45359237], slug: ['Slug', 14.5939029372] },
    picks: [[1, 'lb', 'kg'], [16, 'oz', 'lb'], [1, 't', 'lb']], def: ['kg', 'lb'] },
  pressure: { label: 'Pressure', units: {
    Pa: ['Pascal', 1], kPa: ['Kilopascal', 1e3], MPa: ['Megapascal', 1e6], mbar: ['Millibar', 100], bar: ['Bar', 1e5],
    atm: ['Atmosphere', 101325], psi: ['psi', 6894.757293168], mmHg: ['mmHg', 133.322387415], inHg: ['inHg', 3386.389] },
    picks: [[1, 'atm', 'psi'], [1, 'bar', 'psi'], [30, 'psi', 'kPa']], def: ['bar', 'psi'] },
  energy: { label: 'Energy', units: {
    J: ['Joule', 1], kJ: ['Kilojoule', 1e3], MJ: ['Megajoule', 1e6], Wh: ['Watt-hour', 3600], kWh: ['Kilowatt-hour', 3.6e6],
    cal: ['Calorie', 4.184], kcal: ['Kilocalorie', 4184], BTU: ['BTU', 1055.05585262], eV: ['Electronvolt', 1.602176634e-19] },
    picks: [[1, 'kWh', 'MJ'], [1, 'BTU', 'J'], [1, 'kcal', 'kJ']], def: ['kWh', 'MJ'] },
  temperature: { label: 'Temperature', units: {
    C: ['Celsius (°C)'], F: ['Fahrenheit (°F)'], K: ['Kelvin (K)'], R: ['Rankine (°R)'] },
    picks: [[100, 'C', 'F'], [-40, 'C', 'F'], [0, 'K', 'C'], [85, 'C', 'F']], def: ['C', 'F'] },
  power: { label: 'Power', units: {
    mW: ['Milliwatt', 1e-3], W: ['Watt', 1], kW: ['Kilowatt', 1e3], MW: ['Megawatt', 1e6],
    hp: ['Horsepower (mech.)', 745.69987158227], PS: ['Metric hp (PS)', 735.49875], BTUh: ['BTU per hour', 0.29307107] },
    picks: [[1, 'hp', 'W'], [100, 'kW', 'hp'], [500, 'mW', 'W']], def: ['kW', 'hp'] },
  charge: { label: 'Charge', units: {
    C: ['Coulomb', 1], mAh: ['Milliamp-hour', 3.6], Ah: ['Amp-hour', 3600], uAh: ['Microamp-hour (µAh)', 3.6e-3] },
    picks: [[2000, 'mAh', 'C'], [1, 'Ah', 'C'], [220, 'mAh', 'Ah']], def: ['mAh', 'C'] },
  frequency: { label: 'Frequency', units: {
    Hz: ['Hertz', 1], kHz: ['Kilohertz', 1e3], MHz: ['Megahertz', 1e6], GHz: ['Gigahertz', 1e9],
    rpm: ['Revolutions per minute', 1 / 60], rads: ['Radians per second', 1 / (2 * Math.PI)] },
    picks: [[3000, 'rpm', 'Hz'], [168, 'MHz', 'Hz'], [50, 'Hz', 'rads']], def: ['MHz', 'kHz'] },
  data: { label: 'Data size', units: {
    bit: ['Bit', 0.125], B: ['Byte', 1], kB: ['Kilobyte (kB)', 1e3], KiB: ['Kibibyte (KiB)', 1024],
    MB: ['Megabyte (MB)', 1e6], MiB: ['Mebibyte (MiB)', 1048576], GB: ['Gigabyte (GB)', 1e9], GiB: ['Gibibyte (GiB)', 1073741824] },
    picks: [[1, 'MiB', 'MB'], [512, 'KiB', 'kB'], [1, 'GB', 'GiB']], def: ['KiB', 'kB'] }
};

var TEMP = {
  C: { toK: function (v) { return v + 273.15; }, fromK: function (k) { return k - 273.15; } },
  F: { toK: function (v) { return (v - 32) * 5 / 9 + 273.15; }, fromK: function (k) { return (k - 273.15) * 9 / 5 + 32; } },
  K: { toK: function (v) { return v; }, fromK: function (k) { return k; } },
  R: { toK: function (v) { return v * 5 / 9; }, fromK: function (k) { return k * 9 / 5; } }
};
var TEMP_FORMULA = {
  'C>F': '°F = °C × 9/5 + 32', 'F>C': '°C = (°F − 32) × 5/9', 'C>K': 'K = °C + 273.15', 'K>C': '°C = K − 273.15',
  'F>K': 'K = (°F − 32) × 5/9 + 273.15', 'K>F': '°F = (K − 273.15) × 9/5 + 32', 'K>R': '°R = K × 9/5', 'R>K': 'K = °R × 5/9',
  'C>R': '°R = (°C + 273.15) × 9/5', 'R>C': '°C = °R × 5/9 − 273.15', 'F>R': '°R = °F + 459.67', 'R>F': '°F = °R − 459.67'
};

function convert(cat, v, from, to) {
  if (from === to) return v;
  if (cat === 'temperature') return TEMP[to].fromK(TEMP[from].toK(v));
  var u = CATEGORIES[cat].units;
  return v * u[from][1] / u[to][1];
}

// ---------------------------------------------------------------- helpers
var $ = function (id) { return document.getElementById(id); };

function parseNum(s) {
  if (s == null) return NaN;
  s = String(s).trim().replace(/\s/g, '').replace(',', '.');
  if (s === '' || s === '-' || s === '.') return NaN;
  return Number(s);
}

function fmt(n, digits) {
  if (!isFinite(n)) return '';
  if (n === 0) return '0';
  var a = Math.abs(n);
  if (a >= 1e9 || a < 1e-4) {
    return n.toExponential(digits - 1).replace(/\.?0+e/, 'e').replace('e+', 'e');
  }
  return String(Number(n.toPrecision(digits)));
}

var PREFIX = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p']];
function si(n, unit, digits) {
  if (!isFinite(n)) return '—';
  digits = digits || 4;
  if (n === 0) return '0 ' + unit;
  var a = Math.abs(n);
  for (var i = 0; i < PREFIX.length; i++) {
    if (a >= PREFIX[i][0] * 0.99995 || i === PREFIX.length - 1) {
      return String(Number((n / PREFIX[i][0]).toPrecision(digits))) + ' ' + PREFIX[i][1] + unit;
    }
  }
}

function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
function load(key, fallback) {
  try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}

var toastTimer;
function toast(msg) {
  var t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1800);
}

function copyText(text, done) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(function () { toast(done); }, function () { fallbackCopy(text, done); });
  } else { fallbackCopy(text, done); }
}
function fallbackCopy(text, done) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); toast(done); } catch (e) { toast('Copy failed. Select the text and copy it manually.'); }
  document.body.removeChild(ta);
}

function unitLabel(cat, key) {
  if (cat === 'temperature') return { C: '°C', F: '°F', K: 'K', R: '°R' }[key];
  return { um: 'µm', rads: 'rad/s', BTUh: 'BTU/h', uAh: 'µAh' }[key] || key;
}

// ---------------------------------------------------------------- converter
var state = { cat: 'length', from: 'm', to: 'ft', value: 1, edited: 'from' };

function precision() { return Number($('precision').value); }

function buildTabs() {
  var wrap = $('catTabs');
  Object.keys(CATEGORIES).forEach(function (key) {
    var b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.dataset.cat = key;
    b.textContent = CATEGORIES[key].label;
    b.addEventListener('click', function () { setCategory(key); commitSoon(true); });
    wrap.appendChild(b);
  });
}

function fillSelect(sel, cat, selected) {
  sel.innerHTML = '';
  var units = CATEGORIES[cat].units;
  Object.keys(units).forEach(function (k) {
    var o = document.createElement('option');
    o.value = k;
    o.textContent = unitLabel(cat, k) + ' · ' + units[k][0];
    if (k === selected) o.selected = true;
    sel.appendChild(o);
  });
}

function setCategory(cat, from, to, value) {
  var c = CATEGORIES[cat];
  state.cat = cat;
  state.from = from && c.units[from] ? from : c.def[0];
  state.to = to && c.units[to] ? to : c.def[1];
  if (value !== undefined) state.value = value;
  state.edited = 'from';
  document.querySelectorAll('#catTabs button').forEach(function (b) {
    b.setAttribute('aria-selected', String(b.dataset.cat === cat));
  });
  fillSelect($('fromUnit'), cat, state.from);
  fillSelect($('toUnit'), cat, state.to);
  $('fromVal').value = isFinite(state.value) ? fmt(state.value, 10) : '';
  buildPicks();
  render();
}

function buildPicks() {
  var wrap = $('quickPicks');
  wrap.innerHTML = '';
  CATEGORIES[state.cat].picks.forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = p[0] + ' ' + unitLabel(state.cat, p[1]) + ' → ' + unitLabel(state.cat, p[2]);
    b.addEventListener('click', function () { setCategory(state.cat, p[1], p[2], p[0]); commitSoon(true); });
    wrap.appendChild(b);
  });
}

function render() {
  var d = precision();
  var fromEl = $('fromVal'), toEl = $('toVal');
  if (state.edited === 'from') {
    state.value = parseNum(fromEl.value);
    toEl.value = isFinite(state.value) ? fmt(convert(state.cat, state.value, state.from, state.to), d) : '';
  } else {
    var back = convert(state.cat, parseNum(toEl.value), state.to, state.from);
    state.value = back;
    fromEl.value = isFinite(back) ? fmt(back, d) : '';
  }

  var f = $('formula');
  if (!isFinite(state.value)) {
    f.textContent = 'Enter a number to convert.';
  } else if (state.cat === 'temperature') {
    f.textContent = state.from === state.to ? 'Same unit' : TEMP_FORMULA[state.from + '>' + state.to];
  } else {
    f.textContent = '1 ' + unitLabel(state.cat, state.from) + ' = ' +
      fmt(convert(state.cat, 1, state.from, state.to), d) + ' ' + unitLabel(state.cat, state.to);
  }

  renderAll();
  writeHash();
}

function renderAll() {
  var wrap = $('allUnits');
  wrap.innerHTML = '';
  var d = precision();
  var units = CATEGORIES[state.cat].units;
  Object.keys(units).forEach(function (k) {
    var b = document.createElement('button');
    b.type = 'button';
    if (k === state.to) b.classList.add('active');
    var name = document.createElement('span');
    name.textContent = units[k][0];
    var val = document.createElement('span');
    val.textContent = isFinite(state.value) ? fmt(convert(state.cat, state.value, state.from, k), d) + ' ' + unitLabel(state.cat, k) : '—';
    b.appendChild(name); b.appendChild(val);
    b.title = 'Convert to ' + units[k][0];
    b.addEventListener('click', function () {
      state.to = k; $('toUnit').value = k; state.edited = 'from'; render(); commitSoon(true);
    });
    wrap.appendChild(b);
  });
}

// URL hash keeps the conversion shareable, for example #c=length&v=1&f=m&t=ft
function writeHash() {
  if (!isFinite(state.value)) return;
  var h = '#c=' + state.cat + '&v=' + encodeURIComponent(fmt(state.value, 10)) + '&f=' + state.from + '&t=' + state.to;
  if (location.hash !== h) history.replaceState(null, '', h);
}
function readHash() {
  var p = new URLSearchParams(location.hash.slice(1));
  var c = p.get('c');
  if (c && CATEGORIES[c]) {
    var v = parseNum(p.get('v'));
    setCategory(c, p.get('f'), p.get('t'), isFinite(v) ? v : 1);
    return true;
  }
  return false;
}

// History: last 10 conversions in localStorage
var HIST_KEY = 'cl-history';
var commitTimer;
function commitSoon(now) {
  clearTimeout(commitTimer);
  commitTimer = setTimeout(commit, now ? 0 : 1200);
}
function commit() {
  if (!isFinite(state.value)) return;
  var res = convert(state.cat, state.value, state.from, state.to);
  var entry = { c: state.cat, v: state.value, f: state.from, t: state.to,
    text: fmt(state.value, 6) + ' ' + unitLabel(state.cat, state.from) + ' = ' + fmt(res, 6) + ' ' + unitLabel(state.cat, state.to) };
  var list = load(HIST_KEY, []);
  if (list.length && list[0].text === entry.text) return;
  list.unshift(entry);
  store(HIST_KEY, list.slice(0, 10));
  renderHistory();
}
function renderHistory() {
  var list = load(HIST_KEY, []);
  var ol = $('history');
  ol.innerHTML = '';
  $('histEmpty').hidden = list.length > 0;
  list.forEach(function (e) {
    if (!CATEGORIES[e.c]) return;
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = e.text;
    b.addEventListener('click', function () { setCategory(e.c, e.f, e.t, e.v); });
    li.appendChild(b);
    ol.appendChild(li);
  });
}

function initConverter() {
  buildTabs();
  $('fromVal').addEventListener('input', function () { state.edited = 'from'; render(); commitSoon(); });
  $('toVal').addEventListener('input', function () { state.edited = 'to'; render(); commitSoon(); });
  $('fromUnit').addEventListener('change', function (e) { state.from = e.target.value; state.edited = 'from'; render(); commitSoon(true); });
  $('toUnit').addEventListener('change', function (e) { state.to = e.target.value; state.edited = 'from'; render(); commitSoon(true); });
  $('precision').addEventListener('change', function () { state.edited = 'from'; render(); });
  $('swapBtn').addEventListener('click', function () {
    var res = convert(state.cat, state.value, state.from, state.to);
    var f = state.from; state.from = state.to; state.to = f;
    $('fromUnit').value = state.from; $('toUnit').value = state.to;
    if (isFinite(res)) $('fromVal').value = fmt(res, 10);
    state.edited = 'from'; render(); commitSoon(true);
  });
  $('copyBtn').addEventListener('click', function () {
    if (!$('toVal').value) return toast('Nothing to copy yet');
    copyText($('toVal').value + ' ' + unitLabel(state.cat, state.to), 'Result copied');
  });
  $('linkBtn').addEventListener('click', function () { writeHash(); copyText(location.href, 'Link copied. Anyone who opens it sees this conversion.'); });
  $('clearHist').addEventListener('click', function () { store(HIST_KEY, []); renderHistory(); });

  if (!readHash()) setCategory('length', 'm', 'ft', 1);
  renderHistory();
  window.addEventListener('hashchange', readHash);
}

// ---------------------------------------------------------------- bench: tabs
function initToolTabs() {
  var tabs = document.querySelectorAll('#toolTabs button');
  tabs.forEach(function (b) {
    b.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      document.querySelectorAll('.tool').forEach(function (p) { p.hidden = p.dataset.pane !== b.dataset.tool; });
    });
  });
}

function onInput(ids, fn) {
  ids.forEach(function (id) { $(id).addEventListener('input', fn); $(id).addEventListener('change', fn); });
  fn();
}

// ---------------------------------------------------------------- bench: STM32 timer
function initTimer() {
  function isReg(n) { return Number.isInteger(n) && n >= 0 && n <= 65535; }

  onInput(['tClk', 'tPsc', 'tArr', 'tCcr'], function () {
    var clk = parseNum($('tClk').value) * 1e6, psc = parseNum($('tPsc').value), arr = parseNum($('tArr').value), ccr = parseNum($('tCcr').value);
    if (!(clk > 0) || !isReg(psc) || !isReg(arr)) {
      $('tFreq').textContent = 'Check inputs';
      $('tPeriod').textContent = $('tTick').textContent = $('tDuty').textContent = 'PSC and ARR must be whole numbers 0–65535';
      return;
    }
    var f = clk / ((psc + 1) * (arr + 1));
    $('tFreq').textContent = si(f, 'Hz', 6);
    $('tPeriod').textContent = si(1 / f, 's', 6);
    $('tTick').textContent = si((psc + 1) / clk, 's', 6);
    $('tDuty').textContent = isFinite(ccr) && ccr >= 0 ? fmt(Math.min(ccr / (arr + 1), 1) * 100, 5) + ' %' : '—';
  });

  onInput(['tClk', 'tTarget'], function () {
    var clk = parseNum($('tClk').value) * 1e6, target = parseNum($('tTarget').value);
    var out = ['tFoundPsc', 'tFoundArr', 'tFoundF'];
    if (!(clk > 0) || !(target > 0) || target > clk) {
      out.forEach(function (id) { $(id).textContent = '—'; });
      $('tCode').textContent = '// Enter a target between 0 and the timer clock';
      return;
    }
    var total = clk / target, best = null;
    for (var psc = 0; psc <= 65535; psc++) {
      var div = Math.round(total / (psc + 1));
      if (div < 1) break;
      if (div > 65536) continue;
      var err = Math.abs(clk / ((psc + 1) * div) - target);
      if (!best || err < best.err - 1e-12) best = { psc: psc, arr: div - 1, err: err };
      if (err / target < 1e-12) break;
    }
    if (!best) {
      out.forEach(function (id) { $(id).textContent = '—'; });
      $('tCode').textContent = '// Target is too low for a 16-bit timer at this clock';
      return;
    }
    var actual = clk / ((best.psc + 1) * (best.arr + 1));
    $('tFoundPsc').textContent = best.psc;
    $('tFoundArr').textContent = best.arr;
    $('tFoundF').textContent = si(actual, 'Hz', 7) + (best.err / target < 1e-9 ? ' (exact)' : ' (error ' + fmt(best.err / target * 100, 3) + ' %)');
    $('tCode').textContent = 'htim2.Init.Prescaler = ' + best.psc + ';\nhtim2.Init.Period    = ' + best.arr + ';  // ' + si(actual, 'Hz', 6) + ' update rate';
  });

  $('tCopy').addEventListener('click', function () { copyText($('tCode').textContent, 'HAL code copied'); });
}

// ---------------------------------------------------------------- bench: number bases and bits
// The value is kept as an unsigned integer below 2^width. Numbers are exact up to 2^53, so 32 bits is safe.
var bits = { v: 0x20, w: 32 };

function initBits() {
  var fields = {
    nHex: { re: /^[0-9a-f]+$/i, parse: function (s) { return parseInt(s, 16); } },
    nDec: { re: /^[0-9]+$/, parse: function (s) { return Number(s); } },
    nOct: { re: /^[0-7]+$/, parse: function (s) { return parseInt(s, 8); } },
    nBin: { re: /^[01]+$/, parse: function (s) { return parseInt(s, 2); } },
    nSig: { re: /^-?[0-9]+$/, parse: function (s) { return Number(s); } }
  };
  var mod = function () { return Math.pow(2, bits.w); };

  function clean(s) { return s.replace(/[\s_]/g, '').replace(/^0[xob]/i, ''); }

  function render(skip) {
    var w = bits.w, v = bits.v, M = mod();
    var signed = v >= M / 2 ? v - M : v;
    var bin = v.toString(2).padStart(w, '0');
    var out = {
      nHex: v.toString(16).toUpperCase().padStart(w / 4, '0'),
      nDec: String(v),
      nSig: String(signed),
      nOct: v.toString(8),
      nBin: bin.replace(/(.{4})(?=.)/g, '$1 ')
    };
    Object.keys(out).forEach(function (id) {
      if (id !== skip) { $(id).value = out[id]; $(id).removeAttribute('aria-invalid'); }
    });

    // Bit grid, most significant bit first, grouped in nibbles
    var grid = $('bitGrid');
    grid.innerHTML = '';
    grid.className = 'bitgrid w' + w;
    for (var n = w / 4 - 1; n >= 0; n--) {
      var nib = document.createElement('div');
      nib.className = 'nibble';
      for (var b = 3; b >= 0; b--) {
        var idx = n * 4 + b, on = bin[w - 1 - idx] === '1';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bit';
        btn.setAttribute('aria-pressed', String(on));
        btn.setAttribute('aria-label', 'Bit ' + idx + (on ? ', set' : ', clear'));
        btn.dataset.idx = idx;
        btn.innerHTML = (on ? '1' : '0') + '<small>' + idx + '</small>';
        nib.appendChild(btn);
      }
      grid.appendChild(nib);
    }

    var setIdx = [];
    for (var i = 0; i < w; i++) if (bin[w - 1 - i] === '1') setIdx.push(i);
    $('nSet').textContent = setIdx.length + ' of ' + w;
    $('nIdx').textContent = setIdx.length ? (setIdx.length > 12 ? setIdx.slice(0, 12).join(', ') + ' …' : setIdx.join(', ')) : 'none';
    $('nMsb').textContent = setIdx.length ? 'bit ' + setIdx[setIdx.length - 1] : 'none';
    $('nBytes').textContent = out.nHex.match(/.{2}/g).join(' ');

    var type = 'uint' + w + '_t', hx = '0x' + out.nHex + 'U';
    var single = setIdx.length === 1 ? '(1U << ' + setIdx[0] + ')' : hx;
    var what = setIdx.length ? 'bit' + (setIdx.length > 1 ? 's ' : ' ') + $('nIdx').textContent : 'no bits';
    $('nCode').textContent =
      type + ' value = ' + hx + ';  // ' + v + '\n' +
      'REG |=  ' + single + ';  // set ' + what + '\n' +
      'REG &= ~' + single + ';  // clear ' + what + '\n' +
      'REG ^=  ' + single + ';  // toggle ' + what;
  }

  Object.keys(fields).forEach(function (id) {
    $(id).addEventListener('input', function () {
      var s = clean($(id).value), f = fields[id], M = mod();
      if (s === '' || !f.re.test(s)) { $(id).setAttribute('aria-invalid', 'true'); return; }
      var n = f.parse(s);
      if (id === 'nSig') {
        if (n < -M / 2 || n > M / 2 - 1) { $(id).setAttribute('aria-invalid', 'true'); return; }
        n = n < 0 ? n + M : n;
      } else if (n >= M) { $(id).setAttribute('aria-invalid', 'true'); return; }
      bits.v = n;
      $(id).removeAttribute('aria-invalid');
      render(id);
    });
  });

  $('nWidth').addEventListener('change', function () {
    bits.w = Number($('nWidth').value);
    bits.v = bits.v % mod();
    render();
  });

  $('bitGrid').addEventListener('click', function (e) {
    var btn = e.target.closest('.bit');
    if (!btn) return;
    var p = Math.pow(2, Number(btn.dataset.idx));
    bits.v = Math.floor(bits.v / p) % 2 ? bits.v - p : bits.v + p;
    render();
    var again = document.querySelector('.bit[data-idx="' + btn.dataset.idx + '"]');
    if (again) again.focus();
  });

  document.querySelectorAll('.bit-ops [data-op]').forEach(function (b) {
    b.addEventListener('click', function () {
      var M = mod(), v = bits.v, op = b.dataset.op;
      var B = parseInt(clean($('nB').value) || '0', 16);
      if (!isFinite(B)) B = 0;
      B = B % M;
      // Split into 16-bit halves so bitwise operators stay exact for 32-bit values
      function bitwise(a, c, fn) {
        var hi = fn(Math.floor(a / 65536), Math.floor(c / 65536)) & 0xFFFF, lo = fn(a % 65536, c % 65536) & 0xFFFF;
        return hi * 65536 + lo;
      }
      switch (op) {
        case 'shl': v = (v * 2) % M; break;
        case 'shr': v = Math.floor(v / 2); break;
        case 'not': v = M - 1 - v; break;
        case 'clear': v = 0; break;
        case 'all': v = M - 1; break;
        case 'and': v = bitwise(v, B, function (x, y) { return x & y; }); break;
        case 'or': v = bitwise(v, B, function (x, y) { return x | y; }); break;
        case 'xor': v = bitwise(v, B, function (x, y) { return x ^ y; }); break;
      }
      bits.v = v % M;
      render();
    });
  });

  $('nCopy').addEventListener('click', function () { copyText($('nCode').textContent, 'C code copied'); });
  render();
}

// ---------------------------------------------------------------- bench: resistor color code
var COLORS = [
  { n: 'Black', hex: '#1b1b1b', d: 0, m: 0 }, { n: 'Brown', hex: '#7a4a1e', d: 1, m: 1, t: 1 },
  { n: 'Red', hex: '#c62828', d: 2, m: 2, t: 2 }, { n: 'Orange', hex: '#ef6c00', d: 3, m: 3 },
  { n: 'Yellow', hex: '#f4cf1c', d: 4, m: 4 }, { n: 'Green', hex: '#2e7d32', d: 5, m: 5, t: 0.5 },
  { n: 'Blue', hex: '#1565c0', d: 6, m: 6, t: 0.25 }, { n: 'Violet', hex: '#7b1fa2', d: 7, m: 7, t: 0.1 },
  { n: 'Grey', hex: '#8a8a8a', d: 8, m: 8, t: 0.05 }, { n: 'White', hex: '#f2f2f2', d: 9, m: 9 },
  { n: 'Gold', hex: '#c9a227', m: -1, t: 5 }, { n: 'Silver', hex: '#c0c0c0', m: -2, t: 10 }
];

function initResistor() {
  function opts(sel, filter, def) {
    COLORS.forEach(function (c, i) {
      if (!filter(c)) return;
      var o = document.createElement('option');
      o.value = i;
      var extra = sel.id === 'r3' ? '×' + si(Math.pow(10, c.m), '', 3).trim() : sel.id === 'r4' ? '±' + c.t + ' %' : String(c.d);
      o.textContent = c.n + ' (' + extra + ')';
      if (c.n === def) o.selected = true;
      sel.appendChild(o);
    });
  }
  opts($('r1'), function (c) { return c.d !== undefined && c.d > 0; }, 'Yellow');
  opts($('r2'), function (c) { return c.d !== undefined; }, 'Violet');
  opts($('r3'), function (c) { return c.m !== undefined; }, 'Red');
  opts($('r4'), function (c) { return c.t !== undefined; }, 'Gold');

  onInput(['r1', 'r2', 'r3', 'r4'], function () {
    var c1 = COLORS[$('r1').value], c2 = COLORS[$('r2').value], c3 = COLORS[$('r3').value], c4 = COLORS[$('r4').value];
    $('b1').setAttribute('fill', c1.hex); $('b2').setAttribute('fill', c2.hex);
    $('b3').setAttribute('fill', c3.hex); $('b4').setAttribute('fill', c4.hex);
    var v = (c1.d * 10 + c2.d) * Math.pow(10, c3.m);
    $('rVal').textContent = si(v, 'Ω', 3);
    $('rTol').textContent = '±' + c4.t + ' % tolerance';
    $('rMin').textContent = si(v * (1 - c4.t / 100), 'Ω', 4);
    $('rMax').textContent = si(v * (1 + c4.t / 100), 'Ω', 4);
  });

  onInput(['rIn'], function () {
    var s = $('rIn').value.trim().replace(',', '.').replace(/Ω|ohms?/i, '');
    var m = s.match(/^([0-9]*\.?[0-9]+)\s*([kKmMgGrR]?)([0-9]*)$/);
    if (!m) { $('rBands').textContent = 'Type a value such as 220, 4.7k, 4k7 or 1M.'; return; }
    var mult = { '': 1, r: 1, R: 1, k: 1e3, K: 1e3, m: 1e6, M: 1e6, g: 1e9, G: 1e9 }[m[2]];
    var num = m[3] ? Number(m[1] + '.' + m[3]) : Number(m[1]);
    var v = num * mult;
    if (!(v >= 0.1) || v > 99e9) { $('rBands').textContent = 'A 4-band code covers 0.1 Ω to 99 GΩ.'; return; }
    var e = Math.floor(Math.log10(v)) - 1;
    var digits = Math.round(v / Math.pow(10, e));
    if (digits >= 100) { digits = Math.round(digits / 10); e += 1; }
    if (e < -2 || e > 9) { $('rBands').textContent = 'That value is outside the 4-band range.'; return; }
    var exact = Math.abs(digits * Math.pow(10, e) - v) / v < 1e-9;
    var d1 = Math.floor(digits / 10), d2 = digits % 10;
    var names = [COLORS[d1].n, COLORS[d2].n, COLORS.filter(function (c) { return c.m === e; })[0].n];
    $('rBands').textContent = names.join(' · ') + ' + tolerance band' +
      (exact ? '' : '. Not a 2-digit value, so this is the nearest: ' + si(digits * Math.pow(10, e), 'Ω', 3));
  });
}

// ---------------------------------------------------------------- bench: RC filter
function initRC() {
  onInput(['rcR', 'rcRu', 'rcC', 'rcCu'], function () {
    var R = parseNum($('rcR').value) * Number($('rcRu').value);
    var C = parseNum($('rcC').value) * Number($('rcCu').value);
    var tau = R * C;
    if (!(tau > 0)) {
      $('rcTau').textContent = $('rcFc').textContent = $('rcSettle').textContent = '—';
      drawRC(NaN);
      return;
    }
    $('rcTau').textContent = si(tau, 's', 4);
    $('rcFc').textContent = si(1 / (2 * Math.PI * tau), 'Hz', 4);
    $('rcSettle').textContent = si(5 * tau, 's', 4);
    drawRC(tau);
  });
}

function drawRC(tau) {
  var svg = $('rcChart'), W = 420, H = 240, L = 44, R = 14, T = 16, B = 36;
  var pw = W - L - R, ph = H - T - B;
  var x = function (t) { return L + t / 5 * pw; };
  var y = function (v) { return T + (1 - v) * ph; };
  var s = '';
  [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
    s += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>';
    s += '<text class="axis-t" x="' + (L - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + (v * 100) + '%</text>';
  });
  for (var k = 0; k <= 5; k++) {
    s += '<line class="grid" y1="' + T + '" y2="' + (H - B) + '" x1="' + x(k) + '" x2="' + x(k) + '"/>';
    var lab = k === 0 ? '0' : k + 'τ';
    s += '<text class="axis-t" x="' + x(k) + '" y="' + (H - B + 15) + '" text-anchor="middle">' + lab + '</text>';
    if (isFinite(tau) && k > 0) s += '<text class="axis-t" x="' + x(k) + '" y="' + (H - B + 28) + '" text-anchor="middle">' + si(k * tau, 's', 2) + '</text>';
  }
  var d = '';
  for (var i = 0; i <= 80; i++) {
    var t = i / 80 * 5;
    d += (i ? 'L' : 'M') + x(t).toFixed(1) + ' ' + y(1 - Math.exp(-t)).toFixed(1);
  }
  s += '<path class="curve" d="' + d + '"/>';
  var v1 = 1 - Math.exp(-1);
  s += '<line class="mark-tau" x1="' + x(1) + '" x2="' + x(1) + '" y1="' + y(0) + '" y2="' + y(v1) + '"/>';
  s += '<line class="mark-tau" x1="' + L + '" x2="' + x(1) + '" y1="' + y(v1) + '" y2="' + y(v1) + '"/>';
  s += '<circle class="dot" cx="' + x(1) + '" cy="' + y(v1) + '" r="5"/>';
  s += '<text class="axis-t" x="' + (x(1) + 8) + '" y="' + (y(v1) + 16) + '">63.2% at τ</text>';
  svg.innerHTML = s;
}

// ---------------------------------------------------------------- bench: Ohm's law
var OHM_LABELS = { V: 'Voltage (V)', I: 'Current (A)', R: 'Resistance (Ω)', P: 'Power (W)' };
var OHM_DEFAULTS = { VR: [5, 220], VI: [12, 0.5], IR: [0.02, 150], PV: [60, 230], PI: [2, 0.1], PR: [0.25, 1000] };
function initOhm() {
  $('oPair').addEventListener('change', function () {
    var p = $('oPair').value;
    $('oLabA').firstChild.textContent = OHM_LABELS[p[0]] + ' ';
    $('oLabB').firstChild.textContent = OHM_LABELS[p[1]] + ' ';
    $('oA').value = OHM_DEFAULTS[p][0];
    $('oB').value = OHM_DEFAULTS[p][1];
  });
  onInput(['oPair', 'oA', 'oB'], function () {
    var p = $('oPair').value, a = parseNum($('oA').value), b = parseNum($('oB').value);
    var V, I, R, P;
    switch (p) {
      case 'VR': V = a; R = b; I = V / R; P = V * V / R; break;
      case 'VI': V = a; I = b; R = V / I; P = V * I; break;
      case 'IR': I = a; R = b; V = I * R; P = I * I * R; break;
      case 'PV': P = a; V = b; I = P / V; R = V * V / P; break;
      case 'PI': P = a; I = b; V = P / I; R = P / (I * I); break;
      case 'PR': P = a; R = b; V = Math.sqrt(P * R); I = Math.sqrt(P / R); break;
    }
    $('oV').textContent = si(V, 'V', 5);
    $('oI').textContent = si(I, 'A', 5);
    $('oR').textContent = si(R, 'Ω', 5);
    $('oP').textContent = si(P, 'W', 5);
    $('oHint').textContent = P > 0.25 && isFinite(P)
      ? 'Above 0.25 W: a standard 1/4 W through-hole resistor will overheat. Pick a higher power rating.' : '';
  });
}

// ---------------------------------------------------------------- bench: ADC
function initADC() {
  onInput(['aBits', 'aRef', 'aCode', 'aVin'], function () {
    var n = Number($('aBits').value), vref = parseNum($('aRef').value), max = Math.pow(2, n) - 1;
    var code = parseNum($('aCode').value), vin = parseNum($('aVin').value);
    $('aLsb').textContent = vref > 0 ? si(vref / max, 'V', 4) : '—';
    $('aLevels').textContent = Math.pow(2, n).toLocaleString('en-US') + ' (0 to ' + max.toLocaleString('en-US') + ')';
    $('aCodeV').textContent = vref > 0 && code >= 0 && code <= max ? si(code * vref / max, 'V', 5) : 'Code must be 0–' + max;
    $('aVinCode').textContent = vref > 0 && vin >= 0 && vin <= vref ? String(Math.round(vin / vref * max)) : 'Voltage must be 0–V ref';
  });
}

// ---------------------------------------------------------------- bench: decibels
function initDB() {
  function pair(ratioId, dbId, toDb, fromDb) {
    $(ratioId).addEventListener('input', function () {
      var r = parseNum($(ratioId).value);
      $(dbId).value = r > 0 ? fmt(toDb(r), 6) : '';
    });
    $(dbId).addEventListener('input', function () {
      var d = parseNum($(dbId).value);
      $(ratioId).value = isFinite(d) ? fmt(fromDb(d), 6) : '';
    });
    $(ratioId).dispatchEvent(new Event('input'));
  }
  pair('dPr', 'dPdb', function (r) { return 10 * Math.log10(r); }, function (d) { return Math.pow(10, d / 10); });
  pair('dVr', 'dVdb', function (r) { return 20 * Math.log10(r); }, function (d) { return Math.pow(10, d / 20); });
  pair('dMw', 'dDbm', function (r) { return 10 * Math.log10(r); }, function (d) { return Math.pow(10, d / 10); });
}

// ---------------------------------------------------------------- quiz
var quiz = { answer: NaN, streak: 0, best: load('cl-best', 0), done: false };
function newQuestion() {
  var cats = Object.keys(CATEGORIES);
  var cat = cats[Math.floor(Math.random() * cats.length)];
  var keys = Object.keys(CATEGORIES[cat].units);
  var a = keys[Math.floor(Math.random() * keys.length)], b;
  do { b = keys[Math.floor(Math.random() * keys.length)]; } while (b === a);
  var vals = [1, 2, 5, 10, 12, 25, 50, 100, 250, 1000];
  var v = vals[Math.floor(Math.random() * vals.length)];
  var ans = convert(cat, v, a, b);
  // Skip questions whose answer needs scientific notation
  if (!isFinite(ans) || Math.abs(ans) > 1e7 || Math.abs(ans) < 1e-3) return newQuestion();
  quiz.answer = ans; quiz.done = false;
  $('qText').textContent = 'Convert ' + v + ' ' + unitLabel(cat, a) + ' to ' + unitLabel(cat, b) + '.';
  $('qAns').value = '';
  $('qFeedback').textContent = '';
  $('qFeedback').className = 'feedback';
}
function checkAnswer() {
  var g = parseNum($('qAns').value);
  if (!isFinite(g)) { $('qFeedback').textContent = 'Type a number first.'; return; }
  if (quiz.done) return;
  quiz.done = true;
  var ok = Math.abs(g - quiz.answer) <= Math.abs(quiz.answer) * 0.01;
  var fb = $('qFeedback');
  if (ok) {
    quiz.streak++;
    if (quiz.streak > quiz.best) { quiz.best = quiz.streak; store('cl-best', quiz.best); }
    fb.textContent = 'Correct. The exact answer is ' + fmt(quiz.answer, 6) + '.';
    fb.className = 'feedback ok';
  } else {
    quiz.streak = 0;
    fb.textContent = 'Not quite. The answer is ' + fmt(quiz.answer, 6) + '.';
    fb.className = 'feedback bad';
  }
  $('qStreak').textContent = quiz.streak;
  $('qBest').textContent = quiz.best;
}
function initQuiz() {
  $('qBest').textContent = quiz.best;
  $('qCheck').addEventListener('click', checkAnswer);
  $('qNext').addEventListener('click', newQuestion);
  $('qAns').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { if (quiz.done) newQuestion(); else checkAnswer(); }
  });
  newQuestion();
}

// ---------------------------------------------------------------- theme and keyboard
function initTheme() {
  $('themeBtn').addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('cl-theme', next); } catch (e) {}
    toast(next === 'dark' ? 'Dark theme' : 'Light theme');
  });
}
document.addEventListener('keydown', function (e) {
  var tag = (e.target.tagName || '').toLowerCase();
  if (e.key === '/' && tag !== 'input' && tag !== 'select' && tag !== 'textarea') {
    e.preventDefault();
    $('converter').scrollIntoView();
    $('fromVal').focus();
    $('fromVal').select();
  }
});

// ---------------------------------------------------------------- start
initConverter();
initToolTabs();
initTimer();
initBits();
initResistor();
initRC();
initOhm();
initADC();
initDB();
initQuiz();
initTheme();
