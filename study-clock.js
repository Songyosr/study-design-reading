/* <study-clock>: the events a study's data refer to, against the study start: slide the start and only
   the timing changes; switch the directionality and only the arrows turn. Was widget 5 in app.js
   (chapter 2, section 7); moved to the components page, C.4, on 3 November 2026. PROTOTYPE, 8 November
   2026 (components review, scratch only): redrawn in chapter 2's time-figure marks (includes/ch2/dir.html
   and timing.html, classes .tl4): each person a timeline with a hollow E and O and the arrow the study
   traced, its tail where the clock starts; the study start a triangle with a dotted upright; what had
   already happened a shaded band; 440 wide, so it needs no sideways swipe. It replaces the October marks
   (an open circle at time zero and a filled dot at the index date, which read as "no diabetes" and
   "diabetes" beside the lifelines; a filled arrowhead at a line's end, which reads as follow-up
   stopping; a person's line dashed after the start, where a dash means diabetes; a filled or dashed
   block for the window; a filled diamond for one date, where a diamond means randomisation; a long-
   dashed line for the start, where a long dash is a reference value). One date now sits at a fixed
   year (2025), so its timing is historical or concurrent and never mixed, as chapter 2's grid says;
   until now it moved with the start and was always "single date". From the page's widget block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w5-svg, w5-read, …)
     timing                     the note for each timing: historical, mixed, concurrent; and for one
                                date, one_historical and one_concurrent
     words                      directionality, data_refer_to, study_start (the controls' labels);
                                svg_label; events ("Events {from}–{to}"), one_date ("One date, {year}")
                                (the windows' buttons); forward, backward, non_directional (the
                                buttons), read_forward, read_backward (the readout's shorter words); historical,
                                mixed, concurrent (the timing names); e_mark, o_mark (the letters);
                                refer_label ("…: {when}"), start_year ({year}), case_back,
                                person_forward, one_label (the drawing's labels); key_band, key_start,
                                key_arrow (the key); aria_one, aria_window (the drawing for screen
                                readers: {year} or {from} and {to}, {start}, {timing}, {direction});
                                refer_to, start, timing_label, direction_label, window_label, one, years
                                ({n}) (the readout); note_forward, note_backward, note_separately,
                                note_one (the note)
   Marks (Teaching shared/design/terra/DESIGN.md, chapter 2's time figures, and the proposed entry for
   this widget): the hollow E and O, the arrow (its tail where each person's clock starts), the triangle
   and dotted upright for the study start, the shaded band for what had already happened, a bracket for
   the calendar window the data refer to; one date draws E and O side by side with no arrow.
   Reuse: copy the block to reword it; the windows, the one date and the years are in this file. */
(function () {
  'use strict';
  const K = window.SewnKit, { $, $$, esc, seg, readout, fill } = K;
  // the windows, in chapter 2's grid order with the start at 2026: historical, mixed, concurrent; one date
  const SC = { hist: [2019, 2023], mixed: [2022, 2028], fwd: [2026, 2029], snap: [2025, 2025] };
  const Y0 = 2018, Y1 = 2031, x0 = 28, x1 = 424, X = K.linear(Y0, Y1, x0, x1);
  const R = 10, ROWS = [78, 106, 134], AX = 176;
  // three people in the window, each with their own time zero and end (shares of the window)
  const SPANS = [[0, 0.62], [0.22, 1], [0.45, 0.97]];
  const t = (x, y, s, c, a) => '<text' + (c ? ' class="' + c + '"' : '') + ' x="' + x.toFixed(1) + '" y="' + y + '"' + (a ? ' text-anchor="' + a + '"' : '') + '>' + esc(s) + '</text>';
  const letter = (x, y, s) => '<circle class="hol" cx="' + x.toFixed(1) + '" cy="' + y + '" r="' + R + '"/>' + t(x, y + 4.5, s, 'lh', 'middle');
  // chapter 2's arrow: a line from just past the tail's circle to a head that stops short of the other
  const arrow = (from, to, y) => {
    const dir = Math.sign(to - from), a = from + dir * (R + 2), tip = to - dir * (R + 4), base = tip - dir * 9;
    return '<line class="arw" x1="' + a.toFixed(1) + '" y1="' + y + '" x2="' + base.toFixed(1) + '" y2="' + y + '"/>'
      + '<path class="ah" d="M' + tip.toFixed(1) + ' ' + y + ' L' + base.toFixed(1) + ' ' + (y - 5) + ' L' + base.toFixed(1) + ' ' + (y + 5) + ' Z"/>';
  };
  // a label placed at x (anchor middle), kept inside the drawing
  const within = (x, w) => Math.min(Math.max(x, x0 + w / 2), x1 - w / 2);
  class StudyClock extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-dir-l">' + esc(w.directionality) + '</span><div class="terra-seg" id="' + id + '-dir"></div></div>'
        + '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-seg-l">' + esc(w.data_refer_to) + '</span><div class="terra-seg" id="' + id + '-seg"></div></div>'
        + K.slider(d.id, 'y', { label: w.study_start, min: '2022', max: '2030', step: '1', value: '2026' })
        + '<svg class="fig-svg tl4" id="' + id + '-svg" role="img" aria-label="' + esc(w.svg_label) + '"></svg>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<p class="terra-w-note" id="' + id + '-note" aria-live="polite"></p>');
      K.run('study-clock', () => {
        const W = { sc: 'hist', y: 2026, dir: 'fwd' };
        const label = k => (k === 'snap' ? fill(w.one_date, { year: SC.snap[0] }) : fill(w.events, { from: SC[k][0], to: SC[k][1] }));
        seg(at('dir'), [{ value: 'fwd', label: w.forward }, { value: 'back', label: w.backward }], W.dir, v => { W.dir = v; render(); }, w.directionality);
        seg(at('seg'), Object.keys(SC).map(k => ({ value: k, label: label(k) })), W.sc, v => { W.sc = v; render(); }, w.data_refer_to);
        at('y').addEventListener('input', e => { W.y = +e.target.value; render(); });
        function render() {
          at('y-o').textContent = W.y;
          // windows are whole calendar years (2019-2023 runs to the end of 2023); one date is a day in its year
          const snap = W.sc === 'snap', ev = SC[W.sc], from = X(ev[0]), to = X(ev[1] + 1), xs = X(W.y), nYears = ev[1] - ev[0] + 1;
          const tk = ev[1] + 1 <= W.y ? 'historical' : ev[0] >= W.y ? 'concurrent' : 'mixed', timing = w[tk];
          let s = '';
          // what had already happened at the start: shaded, behind everything (chapter 2's band)
          s += '<rect class="band" x="' + x0 + '" y="22" width="' + (xs - x0).toFixed(1) + '" height="' + (AX - 22) + '"/>';
          // the start's dotted upright, under the people as in chapter 2's timing figure (its triangle is drawn last)
          s += '<line class="st" x1="' + xs.toFixed(1) + '" y1="17" x2="' + xs.toFixed(1) + '" y2="' + AX + '"/>';
          // the window the data refer to: a bracket over the people, its label above (haloed over the start's line)
          const L1 = fill(w.refer_label, { when: snap ? ev[0] : ev[0] + '–' + ev[1] }), w1 = L1.length * 6.4;
          if (!snap) s += '<path class="bracket" d="M' + from.toFixed(1) + ' 56 V50 H' + to.toFixed(1) + ' V56"/>';
          s += t(within((from + to) / 2, w1), 42, L1, 'strong knock', 'middle');
          // the people: each a timeline with E at its start and O at its end, and the arrow the study traced
          // (chapter 2's directionality figure); one date: E and O side by side, no arrow
          if (snap) {
            const c = (from + to) / 2, y = ROWS[1];
            s += '<line class="ax" x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '"/>' + letter(c - R - 1, y, w.e_mark) + letter(c + R + 1, y, w.o_mark);
          } else {
            SPANS.forEach(([p, q], i) => {
              const a = from + p * (to - from), b = from + q * (to - from), y = ROWS[i];
              s += '<line class="ax" x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '"/>';
              s += (W.dir === 'back' ? arrow(b, a, y) : arrow(a, b, y)) + letter(a, y, w.e_mark) + letter(b, y, w.o_mark);
            });
          }
          const L3 = snap ? w.one_label : W.dir === 'back' ? w.case_back : w.person_forward, w3 = L3.length * 6.7;
          s += t(within((from + to) / 2, w3), 160, L3, 'mono knock', 'middle');
          // the study start's triangle, its year beside it
          s += '<path class="tri" d="M' + (xs - 6).toFixed(1) + ' 8 L' + (xs + 6).toFixed(1) + ' 8 L' + xs.toFixed(1) + ' 17 Z"/>';
          const L0 = fill(w.start_year, { year: W.y }), right = xs < 300;
          s += t(right ? xs + 10 : xs - 10, 16, L0, 'strong', right ? 'start' : 'end');
          // the years (the kit's axis), then the key: the band, the start, the arrow
          const ticks = []; for (let yr = Y0; yr <= 2030; yr += 2) ticks.push({ x: X(yr), label: yr });
          s += K.axis(x0, x1, AX, ticks);
          const ky = 222;
          s += '<rect class="band" x="2" y="' + (ky - 7) + '" width="22" height="14"/>' + t(30, ky + 4, w.key_band);
          s += '<path class="tri" d="M7 ' + (ky + 15) + ' L19 ' + (ky + 15) + ' L13 ' + (ky + 24) + ' Z"/><line class="st" x1="13" y1="' + (ky + 24) + '" x2="13" y2="' + (ky + 30) + '"/>' + t(30, ky + 26, w.key_start);
          s += '<line class="arw" x1="2" y1="' + (ky + 44) + '" x2="15" y2="' + (ky + 44) + '"/><path class="ah" d="M24 ' + (ky + 44) + ' L15 ' + (ky + 39) + ' L15 ' + (ky + 49) + ' Z"/>' + t(30, ky + 48, w.key_arrow);
          const svg = at('svg'); svg.setAttribute('viewBox', '0 0 440 ' + (ky + 58)); svg.innerHTML = s;
          const dirTxt = snap ? w.non_directional : (W.dir === 'back' ? w.backward : w.forward), dirRead = snap ? w.non_directional : (W.dir === 'back' ? w.read_backward : w.read_forward);
          $$('button', at('dir')).forEach(b => { b.disabled = snap; });
          svg.setAttribute('aria-label', snap ? fill(w.aria_one, { year: ev[0], start: W.y, timing, direction: dirTxt }) : fill(w.aria_window, { from: ev[0], to: ev[1], start: W.y, timing, direction: dirTxt }));
          readout(at('read'), [{ value: snap ? String(ev[0]) : ev[0] + '–' + ev[1], label: esc(w.refer_to) }, { value: String(W.y), label: esc(w.start) },
            { value: esc(timing), label: esc(w.timing_label), hl: true }, { value: esc(dirRead), label: esc(w.direction_label), hl: true }, { value: esc(snap ? w.one : fill(w.years, { n: nYears })), label: esc(w.window_label) }]);
          at('note').textContent = snap ? d.timing['one_' + tk] + ' ' + w.note_one : d.timing[tk] + ' ' + (W.dir === 'back' ? w.note_backward : w.note_forward) + ' ' + w.note_separately;
        }
        render();
      });
    }
  }
  if (!customElements.get('study-clock')) customElements.define('study-clock', StudyClock);
})();
