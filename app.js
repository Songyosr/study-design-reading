(function(){
'use strict';
const $$=(s,r)=>Array.prototype.slice.call((r||document).querySelectorAll(s));
function safe(name,fn){if(/^w\d+$/.test(name)&&!document.querySelector('#'+name+',[id^="'+name+'-"]'))return;try{fn();}catch(e){console.error('Widget failed: '+name,e);}}

/* Every widget is a web component in widgets/<name>.js since 6 October 2026 (widget 8, the last one
   here, became <prevalence-duration> when chapter 2's cards became a :::{cards} block). What is left is
   the page layout. */

/* ============ LAYOUT · the shorter column of each split stays in view; a column taller than the window sticks by its bottom edge ============ */
safe('sticky',()=>{
  const els=$$('.terra-split>.terra-split-text,.terra-split>.terra-split-side');
  const fit=()=>{const vh=window.innerHeight;els.forEach(el=>{const h=el.offsetHeight;el.style.setProperty('--stick',(h+32<=vh?16:Math.round(vh-h-16))+'px');});};
  fit();window.addEventListener('resize',fit);
  if('ResizeObserver' in window){const ro=new ResizeObserver(fit);els.forEach(el=>ro.observe(el));}
});
})();
