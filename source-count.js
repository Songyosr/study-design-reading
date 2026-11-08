/* <source-count>: choose a data source and read what it can count, what it divides by, what it misses
   and what moves it. Was widget 13 in app.js (chapter 4, section 14); moved here on 6 October 2026.
   From the page's widget block (YAML):
     id, title, status, how     the frame (id prefixes the parts' ids: w13-s, w13-dl, …)
     sources                    each, in order: label, gives, counts, divides_by, misses, moves_with
     words                      source (the control's label); counts, divides_by, misses and moves_with
                                (the list's terms); gives (the readout)
   Reuse: copy the block and change any of it: every word and number it shows is there, the
   sources included. */
(function () {
  'use strict';
  const K = window.SewnKit, { $, esc, seg, readout } = K;
  class SourceCount extends HTMLElement {
    connectedCallback() {
      if (this.drawn) return;
      this.drawn = true;
      const d = K.data(this), w = d.words, id = esc(d.id), at = s => $('#' + d.id + '-' + s);
      K.frame(this, d, '<div class="terra-w-controls"><span class="ctl-label" id="' + id + '-s-l">' + esc(w.source) + '</span><div class="terra-seg" id="' + id + '-s"></div></div>'
        + '<div class="terra-readout" id="' + id + '-read"></div>'
        + '<dl class="srcdl" id="' + id + '-dl"></dl>');
      K.run('source-count', () => {
        const SRC = {};
        Object.keys(d.sources).forEach(k => { const x = d.sources[k]; SRC[k] = { label: x.label, count: x.gives, rows: [[w.counts, x.counts], [w.divides_by, x.divides_by], [w.misses, x.misses], [w.moves_with, x.moves_with]] }; });
        let k = Object.keys(SRC)[0];
        seg(at('s'), Object.keys(SRC).map(x => ({ value: x, label: SRC[x].label })), k, v => { k = v; render(); }, w.source);
        function render() {
          const s = SRC[k];
          readout(at('read'), [{ value: s.count, label: esc(w.gives), hl: true }]);
          at('dl').innerHTML = s.rows.map(r => '<dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd>').join('');
        }
        render();
      });
    }
  }
  if (!customElements.get('source-count')) customElements.define('source-count', SourceCount);
})();
