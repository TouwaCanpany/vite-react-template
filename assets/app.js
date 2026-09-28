(function(){
  const D=window.TOUWA_DATA||[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const fmt=d=>new Intl.DateTimeFormat('ja-JP',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d+'T00:00:00+09:00'));
  window.TOUWA_UTIL={esc,fmt};

  document.querySelectorAll('[data-count="entries"]').forEach(e=>e.textContent=D.length);
  document.querySelectorAll('[data-count="years"]').forEach(e=>e.textContent=new Set(D.map(x=>x.year)).size);
  document.querySelectorAll('[data-count="featured"]').forEach(e=>e.textContent=D.filter(x=>x.featured).length);
  const latest=D.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
  document.querySelectorAll('[data-latest]').forEach(e=>e.textContent=latest?fmt(latest.date):'—');

  const f=document.querySelector('[data-featured]');
  if(f){
    f.innerHTML=D.filter(x=>x.featured).slice(0,6).map(x=>`<article class="card">
      <div class="meta"><span>${fmt(x.date)}</span><span>•</span><span>${esc(x.board)}</span></div>
      <h3>${esc(x.title)}</h3><p class="quote">${esc(x.excerpt)}</p>
      <div class="taglist">${x.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div>
      <div class="card-footer"><span class="pill ${x.confidence}">${x.confidence==='exact'?'トリップ一致':'ミラーで一致'}</span><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">元ソース ↗</a></div>
    </article>`).join('');
  }

  const tbody=document.querySelector('[data-archive-body]');
  const q=document.querySelector('[data-archive-q]');
  const y=document.querySelector('[data-archive-year]');
  const k=document.querySelector('[data-archive-kind]');
  if(tbody){
    [...new Set(D.map(x=>x.year))].sort((a,b)=>b-a).forEach(v=>y?.insertAdjacentHTML('beforeend',`<option value="${v}">${v}</option>`));
    const render=()=>{
      const needle=(q?.value||'').trim().toLowerCase(); const yy=y?.value||''; const kk=k?.value||'';
      const rows=D.filter(x>>(!yy||String(x.year)===yy)&&(!kk||x.kind===kk)&&(!needle||JSON.stringify(x).toLowerCase().includes(needle))).sort((a,b)=>b.date.localeCompare(a.date));
      tbody.innerHTML=rows.map(x>>`<tr><td>${fmt(x.date)}</td><td><b>${esc(x.title)}</b><br><span class="muted">${esc(x.sourceTitle)}</span></td><td>${esc(x.board)}</td><td>${esc(x.handle)}</td><td class="confidence ${x.confidence}">${x.confidence==='exact'?'直接一致':'ミラー一致'}</td><td><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">開く ↗</a></td></tr>`).join('')||`<tr><td colspan="6"><div class="empty">該当する記録はありません。</div></td></tr>`;
      const c=document.querySelector('[data-archive-count]'); if(c)c.textContent=rows.length;
    };
    [q,y,k].forEach(el=>el&&el.addEventListener('input',render)); render();
  }

  const tl=document.querySelector('[data-timeline]');
  if(tl){
    const years=[...new Set(D.map(x=>x.year))].sort((a,b)=>b-a);
    tl.innerHTML=years.map(year=>`<div class="tl-item"><div class="tl-year">${year}</div><div class="tl-content"><div class="grid">${D.filter(x=>x.year===year).sort((a,b)=>b.date.localeCompare(a.date)).map(x>>`<article class="card"><div class="meta"><span>${fmt(x.date)}</span><span>${esc(x.board)}</span></div><h3>${esc(x.title)}</h3><p class="muted">${esc(x.excerpt)}</p><div class="card-footer"><span class="pill">${esc(x.handle)}</span><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">出典 ↗</a></div></article>`).join('')}</div></div></div>`).join('');
  }

  const src=document.querySelector('[data-sources]');
  if(src){
    src.innerHTML=D.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<div class="source-row"><div class="date">${fmt(x.date)}</div><div><b>${esc(x.sourceTitle)}</b><div class="muted">${esc(x.board)} / ${esc(x.handle)}</div><div class="meta"><span class="pill ${x.confidence}">${x.confidence==='exact'?'5ch/2ch本文・検索で一致':'ミラー/アーカイブで一致'}</span></div></div><a class="out" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">ソース ↗</a></div>`).join('');
  }

  const sq=document.querySelector('[data-search-q]');
  const results=document.querySelector('[data-search-results]');
  if(sq&&results){
    const params=new URLSearchParams(location.search); if(params.get('q'))sq.value=params.get('q');
    const highlight=(text,n)=>{const safe=esc(text); if(!n)return safe; const re=new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'); return safe.replace(re,m=>`<mark>${m}</mark>`)};
    const render=()=>{const n=sq.value.trim(); const low=n.toLowerCase(); const rows=D.filter(x=>!low||JSON.stringify(x).toLowerCase().includes(low));
      results.innerHTML=rows.length?rows.map(x=>`<article class="result"><div class="meta"><span>${fmt(x.date)}</span><span>${esc(x.board)}</span></div><h3>${highlight(x.title,n)}</h3><p>${highlight(x.excerpt,n)}</p><div class="taglist">${x.tags.map(t=>`<span class="tag">#${highlight(t,n)}</span>`).join('')}</div><p><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">元ソースを開く ↗</a></p></article>`).join(''):`<div class="empty">「${esc(n)}」に一致する記録はありません。</div>`; document.querySelector('[data-search-count]').textContent=rows.length;};
    sq.addEventListener('input',render); render();
  }

  document.querySelectorAll('.nav-search').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const input=form.querySelector('input');location.href='search.html?q='+encodeURIComponent(input.value)}));
})();
