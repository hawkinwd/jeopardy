(function () {
  'use strict';

  const app = document.getElementById('app');
  const GAME = window.GAME;
  if (!GAME) {
    app.innerHTML = '<div class="fatal">Could not load <b>questions.js</b>. Make sure it sits next to index.html and has no syntax errors (open the browser console, F12, to see the error).</div>';
    return;
  }

  const SAVE_KEY = 'jeopardy-save-v1';
  const MAX_TEAMS = 8;
  const rounds = GAME.rounds || [];
  const $ = (sel, root) => (root || document).querySelector(sel);

  document.title = GAME.title || 'Jeopardy';
  app.classList.toggle('upper', GAME.uppercase !== false);

  // ---------------------------------------------------------------- state
  let state = load() || { teams: null, used: {}, round: 0 };
  if (state.round >= rounds.length) state.round = 0;
  let view = state.teams ? 'board' : 'setup';
  let cur = null; // the clue currently open: { r, c, i }
  let timerId = null;
  let bannerDismissed = false;
  const problems = validate();
  if (problems.length) console.warn('questions.js problems:\n' + problems.join('\n'));

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s && Array.isArray(s.teams) && s.teams.length) return Object.assign({ used: {}, round: 0 }, s);
    } catch (e) { /* ignore */ }
    return null;
  }
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  const key = (r, c, i) => r + '-' + c + '-' + i;

  // ------------------------------------------------------------ helpers
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function fmt(n) { return (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US'); }
  function parseMoney(s) {
    s = String(s).split('.')[0];
    const neg = /^\s*[-−(]/.test(s);
    const digits = s.replace(/[^\d]/g, '');
    const n = digits ? parseInt(digits, 10) : 0;
    return neg ? -n : n;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function strip(html) { return String(html == null ? '' : html).replace(/<[^>]*>/g, ''); }

  function validate() {
    const p = [];
    if (!rounds.length) p.push('No rounds defined in questions.js');
    rounds.forEach((r, ri) => {
      const rn = 'Round ' + (ri + 1);
      if (!Array.isArray(r.values) || !r.values.length) { p.push(rn + ': missing "values"'); return; }
      if (!Array.isArray(r.categories) || !r.categories.length) { p.push(rn + ': no categories'); return; }
      r.categories.forEach((c, ci) => {
        const cn = rn + ', category ' + (ci + 1) + ' (' + strip(c.name) + ')';
        const n = c.clues ? c.clues.length : 0;
        if (n !== r.values.length) p.push(cn + ': needs ' + r.values.length + ' clues, has ' + n);
        (c.clues || []).forEach((cl, i) => {
          if (!cl || !cl.q || !cl.a) p.push(cn + ', clue ' + (i + 1) + ': missing q or a');
        });
      });
    });
    const f = GAME.final;
    if (f && (!f.category || !f.q || !f.a)) p.push('final: needs category, q and a');
    return p;
  }

  // -------------------------------------------------------------- media
  const IMG = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif', 'bmp'];
  const VIDEO = ['mp4', 'webm', 'mov', 'm4v', 'ogv'];
  const AUDIO = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];

  function secs(t) {
    if (!t) return 0;
    if (/^\d+$/.test(t)) return +t;
    const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
    return m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0;
  }
  function youtubeEmbed(s) {
    let u;
    try { u = new URL(s); } catch (e) { return null; }
    const host = u.hostname.replace(/^www\./, '');
    let id = null;
    if (host === 'youtu.be') id = u.pathname.slice(1);
    else if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else {
        const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/);
        if (m) id = m[1];
      }
    }
    if (!id) return null;
    const p = new URLSearchParams({ rel: '0' });
    const start = secs(u.searchParams.get('start') || u.searchParams.get('t'));
    const end = secs(u.searchParams.get('end'));
    if (start) p.set('start', start);
    if (end) p.set('end', end);
    return 'https://www.youtube.com/embed/' + id + '?' + p.toString();
  }
  function oneMedia(s) {
    s = String(s).trim();
    if (!s) return '';
    if (s.charAt(0) === '<') return '<div class="m m-embed">' + s + '</div>'; // pasted embed code
    const yt = youtubeEmbed(s);
    if (yt) {
      return '<div class="m m-yt"><iframe src="' + esc(yt) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>';
    }
    const ext = (s.split(/[?#]/)[0].split('.').pop() || '').toLowerCase();
    if (VIDEO.indexOf(ext) >= 0) return '<div class="m"><video src="' + esc(s) + '" controls playsinline></video></div>';
    if (AUDIO.indexOf(ext) >= 0) return '<div class="m"><audio src="' + esc(s) + '" controls></audio></div>';
    return '<div class="m"><img src="' + esc(s) + '" alt=""></div>';
  }
  function mediaHTML(spec) {
    if (!spec) return '';
    const list = Array.isArray(spec) ? spec : [spec];
    const html = list.map(oneMedia).join('');
    return html ? '<div class="media">' + html + '</div>' : '';
  }

  // -------------------------------------------------------- score bar
  function moneyInput(cls, get, set) {
    const inp = el('input', cls);
    inp.type = 'text';
    inp.inputMode = 'numeric';
    inp.autocomplete = 'off';
    const show = () => { const v = get(); inp.value = fmt(v); inp.classList.toggle('neg', v < 0); };
    inp.addEventListener('focus', () => { inp.value = String(get()); setTimeout(() => { if (document.activeElement === inp) inp.select(); }, 0); });
    inp.addEventListener('blur', () => { set(parseMoney(inp.value)); save(); show(); });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') inp.blur();
      else if (e.key === 'Escape') { inp.value = String(get()); inp.blur(); }
    });
    inp.refresh = show;
    show();
    return inp;
  }

  function refreshScores() {
    document.querySelectorAll('.score').forEach((inp) => {
      if (inp !== document.activeElement && inp.refresh) inp.refresh();
    });
  }

  function pmButton(i, sign, amtFn) {
    const b = el('button', 'pm ' + (sign > 0 ? 'plus' : 'minus'), sign > 0 ? '+' : '−');
    b.type = 'button';
    b.title = (sign > 0 ? '+' : '−') + fmt(amtFn());
    b.addEventListener('click', () => {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); // commit any typed edit first
      state.teams[i].score += sign * amtFn();
      save();
      refreshScores();
      b.blur();
    });
    return b;
  }

  // mode: 'plain' | 'adjust' (+/- by clue value) | 'wager' (wager inputs) | 'finalAdjust' (+/- by each team's wager)
  function mountScoreBar(mode, delta) {
    const bar = $('#scorebar');
    bar.className = 'scorebar';
    bar.textContent = '';
    state.teams.forEach((t, i) => {
      const box = el('div', 'team');
      box.append(el('div', 'tname', t.name));
      const row = el('div', 'trow');
      const adjust = mode === 'adjust' || mode === 'finalAdjust';
      const amt = () => (mode === 'adjust' ? delta : (state.teams[i].wager || 0));
      if (adjust) row.append(pmButton(i, -1, amt));
      row.append(moneyInput('score', () => state.teams[i].score, (v) => { state.teams[i].score = v; }));
      if (adjust) row.append(pmButton(i, 1, amt));
      box.append(row);
      if (mode === 'adjust') box.append(el('div', 'tsub', '±' + fmt(delta)));
      if (mode === 'finalAdjust') box.append(el('div', 'tsub', 'Wager: ' + fmt(t.wager || 0)));
      if (mode === 'wager') {
        box.append(el('div', 'wlabel', 'Wager'));
        box.append(moneyInput('wager', () => state.teams[i].wager || 0, (v) => { state.teams[i].wager = v; }));
      }
      bar.append(box);
    });
  }

  // -------------------------------------------------------------- views
  function render() {
    clearTimer();
    window.scrollTo(0, 0);
    switch (view) {
      case 'setup': return renderSetup();
      case 'board': return renderBoard();
      case 'clue': return renderClue();
      case 'answer': return renderAnswer();
      case 'finalHome': return renderFinalHome();
      case 'finalClue': return renderFinalClue();
      case 'finalAnswer': return renderFinalAnswer();
      case 'results': return renderResults();
    }
  }
  function go(v) { view = v; render(); }

  // ---- setup
  function renderSetup() {
    const inGame = !!state.teams;
    let draft = inGame
      ? state.teams.map((t) => ({ name: t.name, score: t.score, wager: t.wager || 0 }))
      : [1, 2, 3].map((n) => ({ name: 'Team ' + n, score: 0, wager: 0 }));

    app.innerHTML =
      '<div class="screen setup"><div class="card">' +
      '<h1></h1><h2>Teams (up to ' + MAX_TEAMS + ')</h2><div id="teamRows"></div>' +
      '<button class="btn ghost" id="addTeam" type="button">+ Add team</button>' +
      '<div class="btn-row">' +
      '<button class="btn primary" id="startBtn" type="button">' + (inGame ? 'Save & back to board' : 'Start game') + '</button>' +
      (inGame ? '<button class="btn ghost" id="cancelBtn" type="button">Cancel</button>' : '') +
      '</div>' +
      (inGame
        ? '<h2>Reset</h2><div class="btn-row">' +
          '<button class="btn ghost" id="rstScores" type="button">Reset scores</button>' +
          '<button class="btn ghost" id="rstBoard" type="button">Reset board</button>' +
          '<button class="btn danger" id="rstAll" type="button">Start over</button></div>'
        : '') +
      '</div></div>';
    $('h1').textContent = GAME.title || 'Jeopardy!';

    const rowsEl = $('#teamRows');
    const paint = () => {
      rowsEl.textContent = '';
      draft.forEach((d, i) => {
        const row = el('div', 'setup-row');
        const inp = el('input');
        inp.value = d.name;
        inp.placeholder = 'Team ' + (i + 1);
        inp.maxLength = 30;
        inp.addEventListener('input', () => { d.name = inp.value; });
        const rm = el('button', 'btn ghost', '✕');
        rm.type = 'button';
        rm.title = 'Remove team';
        rm.disabled = draft.length <= 1;
        rm.addEventListener('click', () => { draft.splice(i, 1); paint(); });
        row.append(inp, rm);
        rowsEl.append(row);
      });
      $('#addTeam').disabled = draft.length >= MAX_TEAMS;
    };
    paint();

    $('#addTeam').addEventListener('click', () => { draft.push({ name: '', score: 0, wager: 0 }); paint(); });
    $('#startBtn').addEventListener('click', () => {
      state.teams = draft.map((d, i) => ({ name: d.name.trim() || 'Team ' + (i + 1), score: d.score, wager: d.wager }));
      save();
      go('board');
    });
    if (inGame) {
      $('#cancelBtn').addEventListener('click', () => go('board'));
      $('#rstScores').addEventListener('click', () => {
        if (!confirm('Set every team\'s score and wager back to $0?')) return;
        state.teams.forEach((t) => { t.score = 0; t.wager = 0; });
        save();
        go('board');
      });
      $('#rstBoard').addEventListener('click', () => {
        if (!confirm('Un-gray every clue and go back to round 1? (Scores stay.)')) return;
        state.used = {};
        state.round = 0;
        save();
        go('board');
      });
      $('#rstAll').addEventListener('click', () => {
        if (!confirm('Wipe everything (teams, scores, board) and start over?')) return;
        state = { teams: null, used: {}, round: 0 };
        save();
        go('setup');
      });
    }
  }

  // ---- board
  function renderBoard() {
    const ri = state.round;
    const R = rounds[ri];
    if (!R || !R.values || !R.categories) {
      app.innerHTML = '<div class="fatal">questions.js has no valid round. Check the file structure against the README.</div>';
      return;
    }
    const rows = R.values.length;
    const cols = R.categories.length;
    const allUsed = R.categories.every((cat, c) => R.values.every((v, i) => state.used[key(ri, c, i)]));
    const isLastRound = ri === rounds.length - 1;

    let grid = R.categories.map((c) => '<div class="cat"><span>' + c.name + '</span></div>').join('');
    for (let i = 0; i < rows; i++) {
      for (let c = 0; c < cols; c++) {
        const used = state.used[key(ri, c, i)];
        grid += '<button class="tile' + (used ? ' used' : '') + '" data-c="' + c + '" data-i="' + i + '"' +
          (used ? ' disabled tabindex="-1"' : '') + ' type="button">' + (used ? '' : fmt(R.values[i])) + '</button>';
      }
    }

    const roundBtns = rounds.length > 1
      ? rounds.map((r, k) => '<button class="btn ghost rbtn' + (k === ri ? ' active' : '') + '" data-r="' + k + '" type="button">' +
          esc(r.name || 'Round ' + (k + 1)) + '</button>').join('')
      : '';
    const showBanner = problems.length && !bannerDismissed;

    app.innerHTML =
      '<div class="screen board">' +
      (showBanner
        ? '<div class="warn"><div><b>questions.js has problems:</b><ul>' +
          problems.slice(0, 8).map((p) => '<li>' + esc(p) + '</li>').join('') +
          (problems.length > 8 ? '<li>…and ' + (problems.length - 8) + ' more (see console)</li>' : '') +
          '</ul></div><button id="dismissWarn" type="button">✕</button></div>'
        : '') +
      '<header class="topbar">' +
      '<div class="left"><button class="btn ghost" id="settings" type="button">⚙ Teams / Reset</button></div>' +
      '<div class="titlewrap"><div class="gtitle"></div><div class="rname"></div></div>' +
      '<div class="right">' + roundBtns +
      (GAME.final ? '<button class="btn gold' + (allUsed && isLastRound ? ' ready' : '') + '" id="finalBtn" type="button">Final Jeopardy</button>' : '') +
      '</div></header>' +
      '<div class="grid" style="--cols:' + cols + ';--rows:' + rows + '">' + grid + '</div>' +
      '<div id="scorebar"></div></div>';

    $('.gtitle').textContent = GAME.title || 'Jeopardy!';
    $('.rname').textContent = R.name || '';
    mountScoreBar('plain');

    $('#settings').addEventListener('click', () => go('setup'));
    if (GAME.final) $('#finalBtn').addEventListener('click', () => go('finalHome'));
    const dw = $('#dismissWarn');
    if (dw) dw.addEventListener('click', () => { bannerDismissed = true; render(); });
    document.querySelectorAll('.rbtn').forEach((b) => b.addEventListener('click', () => {
      state.round = +b.dataset.r;
      save();
      render();
    }));
    $('.grid').addEventListener('click', (e) => {
      const t = e.target.closest('.tile');
      if (!t || t.disabled) return;
      cur = { r: ri, c: +t.dataset.c, i: +t.dataset.i };
      go('clue');
    });
  }

  function curInfo() {
    const R = rounds[cur.r];
    const cat = R.categories[cur.c];
    const clue = (cat.clues && cat.clues[cur.i]) || { q: '(missing clue)', a: '(missing answer)' };
    return { cat, clue, value: R.values[cur.i] };
  }

  // ---- clue
  function renderClue() {
    const { cat, clue, value } = curInfo();
    const media = mediaHTML(clue.qMedia);
    app.innerHTML =
      '<div class="screen clue">' +
      '<div class="crumb"><span class="cc"></span><span>' + fmt(value) + '</span></div>' +
      '<div class="stage' + (media ? ' has-media' : '') + '"><div class="qtext">' + clue.q + '</div>' + media + '</div>' +
      '<div class="actions">' +
      '<button class="btn ghost" data-esc id="back" type="button">← Back to board (don\'t use up)</button>' +
      '<button class="btn primary" id="reveal" type="button">Show answer</button></div>' +
      '<div id="scorebar"></div></div>';
    $('.cc').innerHTML = cat.name;
    mountScoreBar('plain');
    $('#back').addEventListener('click', () => go('board'));
    $('#reveal').addEventListener('click', () => {
      state.used[key(cur.r, cur.c, cur.i)] = true; // the clue is spent once the answer is shown
      save();
      go('answer');
    });
  }

  // ---- answer
  function renderAnswer() {
    const { cat, clue, value } = curInfo();
    const media = mediaHTML(clue.aMedia);
    app.innerHTML =
      '<div class="screen clue">' +
      '<div class="crumb"><span class="cc"></span><span>' + fmt(value) + '</span></div>' +
      '<div class="stage' + (media ? ' has-media' : '') + '">' +
      '<div class="qtext small">' + clue.q + '</div>' +
      '<div class="alabel">Answer</div>' +
      '<div class="atext">' + clue.a + '</div>' + media + '</div>' +
      '<div class="actions"><span></span>' +
      '<button class="btn primary" id="done" type="button">Back to board</button></div>' +
      '<div id="scorebar"></div></div>';
    $('.cc').innerHTML = cat.name;
    mountScoreBar('adjust', value);
    $('#done').addEventListener('click', () => go('board'));
  }

  // ---- final jeopardy
  function renderFinalHome() {
    app.innerHTML =
      '<div class="screen final">' +
      '<div class="crumb"><span>Final Jeopardy</span><span></span></div>' +
      '<div class="stage"><div class="fcat"></div><div class="fhint">Enter each team\'s wager, then continue.</div></div>' +
      '<div class="actions">' +
      '<button class="btn ghost" data-esc id="back" type="button">← Back to board</button>' +
      '<button class="btn primary" id="next" type="button">Reveal clue →</button></div>' +
      '<div id="scorebar"></div></div>';
    $('.fcat').innerHTML = GAME.final.category;
    mountScoreBar('wager');
    $('#back').addEventListener('click', () => go('board'));
    $('#next').addEventListener('click', () => {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      go('finalClue');
    });
  }

  function renderFinalClue() {
    const f = GAME.final;
    const media = mediaHTML(f.qMedia);
    app.innerHTML =
      '<div class="screen final">' +
      '<div class="crumb"><span class="cc"></span><span>Final Jeopardy</span></div>' +
      '<div class="stage' + (media ? ' has-media' : '') + '"><div class="qtext">' + f.q + '</div>' + media + '</div>' +
      '<div class="actions">' +
      '<button class="btn ghost" data-esc id="back" type="button">← Wagers</button>' +
      '<div><button class="btn ghost" id="timerBtn" type="button">Start ' + (f.seconds || 30) + 's timer</button> <span class="timer" id="timerOut"></span></div>' +
      '<button class="btn primary" id="reveal" type="button">Show answer</button></div>' +
      '<div id="scorebar"></div></div>';
    $('.cc').innerHTML = f.category;
    mountScoreBar('plain');
    $('#back').addEventListener('click', () => go('finalHome'));
    $('#reveal').addEventListener('click', () => go('finalAnswer'));
    setupTimer(f.seconds || 30);
  }

  function renderFinalAnswer() {
    const f = GAME.final;
    const media = mediaHTML(f.aMedia);
    app.innerHTML =
      '<div class="screen final">' +
      '<div class="crumb"><span class="cc"></span><span>Final Jeopardy</span></div>' +
      '<div class="stage' + (media ? ' has-media' : '') + '">' +
      '<div class="qtext small">' + f.q + '</div><div class="alabel">Answer</div>' +
      '<div class="atext">' + f.a + '</div>' + media + '</div>' +
      '<div class="actions"><span></span><button class="btn primary" id="next" type="button">Final scores →</button></div>' +
      '<div id="scorebar"></div></div>';
    $('.cc').innerHTML = f.category;
    mountScoreBar('finalAdjust');
    $('#next').addEventListener('click', () => {
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      go('results');
    });
  }

  function setupTimer(seconds) {
    const btn = $('#timerBtn');
    const out = $('#timerOut');
    btn.addEventListener('click', () => {
      clearTimer();
      let left = seconds;
      out.textContent = left;
      out.classList.remove('done');
      btn.textContent = 'Restart timer';
      btn.blur();
      timerId = setInterval(() => {
        left--;
        if (left > 0) out.textContent = left;
        else { out.textContent = 'TIME!'; out.classList.add('done'); clearTimer(); }
      }, 1000);
    });
  }
  function clearTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  // ---- results
  function renderResults() {
    const sorted = state.teams.slice().sort((a, b) => b.score - a.score);
    const top = sorted[0].score;
    const winners = sorted.filter((t) => t.score === top);
    app.innerHTML =
      '<div class="screen results"><div class="card"><h1>Final scores</h1><div class="winner"></div><div id="ranks"></div>' +
      '<div class="btn-row center"><button class="btn ghost" id="back" data-esc type="button">Back to board</button>' +
      '<button class="btn ghost" id="settings" type="button">Teams / Reset</button></div></div></div>';
    $('.winner').textContent = winners.length === 1
      ? 'Winner: ' + winners[0].name
      : 'Tie: ' + winners.map((t) => t.name).join(' & ');
    sorted.forEach((t, i) => {
      const r = el('div', 'rank' + (t.score === top ? ' win' : ''));
      r.append(el('span', 'pos', String(i + 1)), el('span', 'rn', t.name), el('span', 'rs' + (t.score < 0 ? ' neg' : ''), fmt(t.score)));
      $('#ranks').append(r);
    });
    $('#back').addEventListener('click', () => go('board'));
    $('#settings').addEventListener('click', () => go('setup'));
  }

  // ----------------------------------------------------------- keyboard
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
    if (e.key === 'Escape') {
      const b = $('[data-esc]');
      if (b) b.click();
      return;
    }
    const advance = e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight';
    if (!advance || view === 'board' || view === 'setup') return;
    if (t.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return; // let the focused button handle it
    const p = $('.btn.primary');
    if (p) { e.preventDefault(); p.click(); }
  });

  render();
})();
