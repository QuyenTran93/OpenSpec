export const VISUAL_HELPER = `(() => {
  const params = new URLSearchParams(location.search);
  const key = params.get('key') || '';
  const status = document.getElementById('connection');
  const candidates = document.querySelectorAll('[data-choice]');
  for (const item of candidates) {
    if (item.tagName !== 'BUTTON') { item.setAttribute('role','button'); item.setAttribute('tabindex','0'); }
    item.setAttribute('aria-pressed','false');
  }
  let ws;
  const select = (item) => {
    for (const other of candidates) { other.classList.remove('selected'); other.setAttribute('aria-pressed','false'); }
    item.classList.add('selected'); item.setAttribute('aria-pressed','true');
    const choice = item.dataset.choice;
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({type:'choice',choice}));
    status.textContent = 'Selected ' + choice;
  };
  document.addEventListener('click', e => { const item=e.target.closest?.('[data-choice]'); if(item) select(item); });
  document.addEventListener('keydown', e => { const item=e.target.closest?.('[data-choice]'); if(item && (e.key==='Enter'||e.key===' ')){e.preventDefault();select(item);} });
  if ('WebSocket' in window) {
    ws = new WebSocket((location.protocol==='https:'?'wss':'ws')+'://'+location.host+'/events?key='+encodeURIComponent(key));
    ws.onopen=()=>status.textContent='Connected';
    ws.onmessage=e=>{if(e.data==='reload') location.reload();};
    ws.onclose=()=>status.textContent='Selection sync paused';
  } else status.textContent='Readable preview; selection sync unavailable';
})();`;
