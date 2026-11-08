/* <period-rates>: one count compared over two periods of different length, shown either as the two
   counts or as rates per year. Was widget 10 in app.js (chapter 1, "A trap: periods of different
   length"); moved here on 6 October 2026. Its numbers and every word it shows come from the page's
   widget block (YAML), which sewn writes into the element as JSON:
     id        the prefix of its ids (w10: w10-seg, w10-read, w10-note), as before
     control   the label of the buttons
     before, after       visits and years of each period
     count, rate         each view: its button, the two readout labels, the verdict's label and the
                         verdict ({difference} or {ratio} filled in), and its note
   Reuse: copy the block and change any of it: every word and number it shows is there. */
(function () {
  'use strict';
  const K = window.SewnKit;
  class PeriodRates extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), id = d.id;
      const before = { n: Number(d.before.visits), yrs: Number(d.before.years) };
      const after = { n: Number(d.after.visits), yrs: Number(d.after.years) };
      const box = document.createElement('div');
      box.innerHTML = '<div class="terra-w-controls"><span class="ctl-label" id="' + K.esc(id) + '-l">' + K.esc(d.control) + '</span><div class="terra-seg" id="' + K.esc(id) + '-seg"></div></div>'
        + '<div class="terra-readout" id="' + K.esc(id) + '-read"></div>'
        + '<p class="terra-w-note" id="' + K.esc(id) + '-note" aria-live="polite"></p>';
      while (box.firstChild) this.appendChild(box.firstChild);
      const read = this.querySelector('.terra-readout'), note = this.querySelector('.terra-w-note');
      let m = 'count';
      K.seg(this.querySelector('.terra-seg'), [{ value: 'count', label: d.count.button }, { value: 'rate', label: d.rate.button }], m, v => { m = v; render(); }, d.control);
      function render() {
        const v = d[m];
        const a = m === 'count' ? before.n : before.n / before.yrs, b = m === 'count' ? after.n : after.n / after.yrs;
        const verdict = String(v.verdict).replace('{difference}', String(a - b)).replace('{ratio}', (b / a).toFixed(1));
        K.readout(read, [{ value: String(a), label: K.esc(v.before) }, { value: String(b), label: K.esc(v.after) }, { value: K.esc(verdict), label: K.esc(v.verdict_label), hl: true }]);
        note.textContent = v.note;
      }
      render();
    }
  }
  if (!customElements.get('period-rates')) customElements.define('period-rates', PeriodRates);
})();
