/* pedidos-equipamento.js — Remessa Comodato e Manutenção Externa.
   Um arquivo só para os dois apps que mostram os pedidos de equipamento: o
   Comercial e o Manut. Comodato. Os dois leem a MESMA coleção
   (comodatoSolicitacoes) e montam as duas listas com o MESMO código daqui —
   mesmas colunas, mesma ordem, mesma prioridade, mesmos filtros. Para mudar
   as listas, mude só aqui e suba o ?v= nos dois apps.
   - Remessa Comodato: envio e retorno (entregar, retirar, trocar) → categoria "remessa".
   - Manutenção Externa: conserto no cliente → categoria "externa".
     Pedido antigo sem categoria: "consertar" é externa, o resto é remessa.
   - Prioridade: campo "prioridade" (1, 2, 3…) dos pedidos em aberto de cada
     lista; ordem = prioridade e, sem número, do mais antigo ao mais novo.
     Quem gerencia arrasta pela alça ⋮⋮; o app grava 1..n onde mudou.
   Uso (cada app, uma vez):
     MCPedidos.configurar({ lista:fn, podeGerir:fn, eu:fn, ver:fn(id), editar:fn(id), podeEditar:fn(x),
       excluir:fn(id), podeExcluir:fn(x), gravarOrdem:fn([{id,prioridade}])→Promise, novo:fn(cat), aviso:fn(msg,erro) });
     MCPedidos.render(elemento, 'remessa'|'externa');   // a cada mudança dos dados
     MCPedidos.contar(lista, cat)                        // pedidos em aberto (para o menu) */
(function(){
  if(window.MCPedidos) return;
  var CSS=[
    '.mcp-tools{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin-bottom:10px}',
    /* !important: cada app tem estilo próprio para select/input/td (o Comodato estica o select a 100%); aqui vale o da lista */
    '.mcp-tools select,.mcp-tools input{width:auto!important;min-width:150px!important;max-width:none!important;flex:0 0 auto!important;height:38px!important;padding:0 12px!important;margin:0!important;border-radius:9px!important;border:1px solid var(--border,#333)!important;background:var(--card,#1b1b1f)!important;color:var(--text,#eee)!important;font:inherit;font-size:13.5px!important;box-sizing:border-box}',
    '.mcp-tools input{flex:1 1 240px!important}',
    '.mcp-tools .mcp-novo{margin-left:auto;height:38px;padding:0 16px;border-radius:9px;border:none;background:var(--primary,#e23b3b);color:#fff;font:inherit;font-weight:700;font-size:13px;cursor:pointer}',
    '.mcp-dica{font-size:12px;color:var(--muted,#999);margin:0 0 10px;min-height:2px}',
    /* sem altura máxima: a lista segue a rolagem da página (uma barra só) */
    /* a tabela cabe na largura da tela: sem barra de rolagem própria (nem de lado); só em tela estreita rola de lado */
    '.mcp-wrap{overflow:visible;border:1px solid var(--border,#333);border-radius:12px;background:var(--card,#1b1b1f)}',
    '@media (max-width:1100px){.mcp-wrap{overflow-x:auto}}',
    'table.mcp-tab{width:100%;border-collapse:collapse;font-size:13.5px;color:var(--text,#eee)}',
    'table.mcp-tab th{position:sticky;top:0;z-index:1;background:var(--card-2,#232328)!important;color:var(--muted,#999)!important;font-size:10.5px!important;font-weight:700!important;letter-spacing:.04em!important;text-transform:uppercase!important;text-align:left;padding:9px 9px!important;border:none!important;border-bottom:1px solid var(--border,#333)!important;white-space:nowrap!important}',
    'table.mcp-tab td{padding:9px 9px!important;vertical-align:top!important;border:none!important;border-bottom:1px solid var(--border,#333)!important;white-space:normal!important;font-size:13.5px!important;line-height:1.45!important;color:var(--text,#eee)}',
    'table.mcp-tab td.mcp-cli{white-space:normal!important;min-width:160px;max-width:320px}',
    'table.mcp-tab td.mcp-nw,table.mcp-tab td.mcp-r,table.mcp-tab td.mcp-acoes{white-space:nowrap!important}',
    'table.mcp-tab th{white-space:normal!important;line-height:1.25!important;vertical-align:bottom!important}',
    'table.mcp-tab tbody tr{cursor:pointer}',
    'table.mcp-tab tbody tr:hover td{background:var(--card-2,#232328)}',
    'table.mcp-tab tr.mcp-b-aberta td:first-child{box-shadow:inset 3px 0 0 var(--amber,#f59e0b)}',
    'table.mcp-tab tr.mcp-b-separacao td:first-child{box-shadow:inset 3px 0 0 var(--blue,#3b82f6)}',
    'table.mcp-tab tr.mcp-b-autorizacao td:first-child{box-shadow:inset 3px 0 0 #d97706}',
    'table.mcp-tab tr.mcp-b-cancelada td,table.mcp-tab tr.mcp-b-recusada td{opacity:.6}',
    'table.mcp-tab .mcp-r{text-align:right!important}',
    '.mcp-nw{white-space:nowrap}',
    '.mcp-sub{font-size:11.5px;color:var(--muted,#999);margin-top:2px}',
    '.mcp-red{color:var(--red,#ef4444)!important}',
    '.mcp-mut{color:var(--muted,#999)}',
    '.mcp-nome{font-weight:700}',
    '.mcp-novo-tag{font-size:10.5px;font-weight:700;color:#3b82f6;border:1px solid rgba(59,130,246,.45);border-radius:20px;padding:1px 7px;white-space:nowrap;margin-left:4px}',
    '.mcp-pill{display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;border-radius:20px;padding:2px 9px;border:1px solid currentColor;white-space:nowrap}',
    '.mcp-pri{display:flex;align-items:center;gap:7px;font-size:15px;font-weight:700}',
    '.mcp-alca{cursor:grab;color:var(--muted,#999);font-size:15px;letter-spacing:-2px;padding:2px 4px;border-radius:5px;user-select:none}',
    '.mcp-alca:hover{background:var(--card-2,#232328);color:var(--text,#eee)}',
    'table.mcp-tab tr.mcp-arr td{opacity:.35}',
    'table.mcp-tab tr.mcp-alvo-c td{box-shadow:inset 0 3px 0 var(--primary,#e23b3b)}',
    'table.mcp-tab tr.mcp-alvo-b td{box-shadow:inset 0 -3px 0 var(--primary,#e23b3b)}',
    'table.mcp-tab td.mcp-acoes{text-align:right!important}',
    '.mcp-acoes button{background:none;border:none;color:var(--muted,#999);font-size:14px;cursor:pointer;padding:3px 5px;border-radius:6px}',
    '.mcp-acoes button:hover{background:var(--card-2,#232328);color:var(--text,#eee)}',
    '.mcp-vazio{padding:40px 16px;text-align:center;color:var(--muted,#999);font-size:13.5px}'
  ].join('\n');
  function injetaCSS(){
    if(document.getElementById('mc-pedidos-css')) return;
    var st=document.createElement('style'); st.id='mc-pedidos-css'; st.textContent=CSS;
    (document.head||document.documentElement).appendChild(st);
  }
  injetaCSS();

  var CAT={ remessa:{ nome:'Remessa Comodato', novo:'+ Nova remessa / retorno', serv:['entregar','retirar','trocar'] },
            externa:{ nome:'Manutenção Externa', novo:'+ Nova manutenção externa', serv:['consertar'] } };
  var SERV={ entregar:'Entregar / instalar', retirar:'Retirar', trocar:'Trocar', consertar:'Consertar no cliente' };
  var ST={ autorizacao:['Aguardando autorização','#d97706'], aberta:['Aberta','#f59e0b'], separacao:['Em separação','#3b82f6'],
           entregue:['Entregue','#10b981'], cancelada:['Cancelada','#6b7280'], recusada:['Recusada pela diretoria','#ef4444'] };
  var ABERTOS=['autorizacao','aberta','separacao'];
  var OP={}, EST={ remessa:{ f:'abertas', q:'' }, externa:{ f:'abertas', q:'' } }, ULT={};

  function esc(t){ return String(t==null?'':t).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function norm(t){ return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim(); }
  function dataBR(ymd){ if(!ymd) return '—'; var p=String(ymd).slice(0,10).split('-'); return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:String(ymd); }
  function dias(ymd){ if(!ymd) return null; var a=String(ymd).slice(0,10).split('-'), d=new Date(+a[0],+a[1]-1,+a[2]), h=new Date(); h.setHours(0,0,0,0); return Math.round((d-h)/864e5); }
  function chama(n){ var f=OP[n]; if(typeof f!=='function') return undefined; return f.apply(null, [].slice.call(arguments,1)); }
  function lista(){ return chama('lista')||[]; }
  function aviso(m,e){ if(OP.aviso) OP.aviso(m,e); else if(e) alert(m); }

  function categoria(x){ return (x && (x.categoria==='remessa'||x.categoria==='externa')) ? x.categoria : ((x && x.servico==='consertar') ? 'externa' : 'remessa'); }
  function aberto(x){ return ABERTOS.indexOf(x && x.status)>=0; }
  function ordem(a,b){
    var pa=(+a.prioridade>0)?+a.prioridade:1e9, pb=(+b.prioridade>0)?+b.prioridade:1e9;
    return pa-pb || (+a.criadoEm||0)-(+b.criadoEm||0);
  }
  function abertos(l, cat){ return (l||[]).filter(function(x){ return categoria(x)===cat && aberto(x); }).sort(ordem); }
  function contar(l, cat){ return abertos(l, cat).length; }
  function itens(x){
    if(x && x.itens && x.itens.length) return x.itens;
    return [{ equipamento:(x&&x.equipamento)||'', modelo:(x&&x.modelo)||'', quantidade:(x&&x.quantidade)||1, patrimonio:(x&&x.patrimonio)||'' }];
  }
  function itensTxt(x){ return itens(x).map(function(i){ return (i.quantidade||1)+'× '+(i.equipamento||'')+(i.modelo?' · '+i.modelo:''); }).join(' + '); }
  function pill(st){ var s=ST[st]||[st||'—','#6b7280']; return '<span class="mcp-pill" style="color:'+s[1]+';background:'+s[1]+'1f">'+esc(s[0])+'</span>'; }
  /* posição de cada pedido em aberto (1, 2, 3…) na lista da categoria */
  function posicoes(cat){ var p={}; abertos(lista(), cat).forEach(function(x,i){ p[x.id]=i+1; }); return p; }

  function linha(x, n, cat, arrasta, gere){
    var ab=aberto(x), mut='<span class="mcp-mut">—</span>';
    var sub=function(v){ return v?'<div class="mcp-sub">'+esc(v)+'</div>':''; };
    var its=itens(x);
    var eq=its.length>1 ? its.map(function(i){ return '<div><b>'+(i.quantidade||1)+'×</b> '+esc(i.equipamento||'')+(i.modelo?' <span class="mcp-mut">· '+esc(i.modelo)+'</span>':'')+'</div>'; }).join('')
                        : esc(x.equipamento||'')+sub(x.modelo);
    var ent=mut;
    if(x.dataProgramada){
      var dd=dias(x.dataProgramada);
      var rel=!ab?'':(dd<0?'atrasada '+(-dd)+' dia'+(dd===-1?'':'s'):(dd===0?'hoje':(dd===1?'amanhã':'em '+dd+' dias')));
      ent='<b'+(ab&&dd<0?' class="mcp-red"':'')+'>'+dataBR(x.dataProgramada)+'</b>'+(rel?'<div class="mcp-sub'+(dd<0?' mcp-red':'')+'">'+rel+'</div>':'');
    }
    var d=x.criadoEm?new Date(+x.criadoEm):null, eu=chama('eu');
    var por=(eu && x.solicitadoPor===eu)?'Você':(x.solicitadoNome||x.solicitadoPor||'—');
    var pr=ab ? '<div class="mcp-pri">'+(arrasta?'<span class="mcp-alca" title="Arraste para mudar a prioridade" onmousedown="MCPedidos._pega()">⋮⋮</span>':'')+n+'</div>' : mut;
    var id=esc(x.id);
    var ed=gere && OP.editar && chama('podeEditar', x), ex=gere && OP.excluir && chama('podeExcluir', x);
    return '<tr class="mcp-b-'+esc(x.status||'')+'" data-id="'+id+'" onclick="MCPedidos._ver(\''+id+'\')"'
      +(arrasta&&ab?' draggable="true" ondragstart="MCPedidos._ini(event,\''+cat+'\')" ondragover="MCPedidos._sobre(event)" ondragleave="MCPedidos._sai(event)" ondrop="MCPedidos._solta(event,\''+cat+'\')" ondragend="MCPedidos._fim()"':'')+'>'
      +'<td class="mcp-nw" onclick="event.stopPropagation()">'+pr+'</td>'
      +'<td class="mcp-nw">'+(d?'<b>'+d.toLocaleDateString('pt-BR')+'</b><div class="mcp-sub">'+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+'</div>':mut)+'</td>'
      +'<td class="mcp-nw">'+ent+'</td>'
      +'<td class="mcp-cli"><span class="mcp-nome">'+esc(x.cliente||'')+'</span>'+(x.clienteNovo?'<span class="mcp-novo-tag">cliente novo</span>':'')+sub(x.endereco||x.cidade)+'</td>'
      +'<td>'+eq+'</td>'
      +'<td class="mcp-r"><b>'+(x.quantidade||1)+'</b></td>'
      +'<td>'+(x.patrimonio?esc(x.patrimonio):mut)+'</td>'
      +'<td>'+esc(SERV[x.servico]||x.servico||'')+'</td>'
      +'<td>'+esc(por)+'</td>'
      +'<td>'+pill(x.status)+(x.novo?'<div class="mcp-sub">equipamento novo</div>':'')+'</td>'
      +(gere?'<td class="mcp-acoes" onclick="event.stopPropagation()">'
        +(ed?'<button title="Editar" onclick="MCPedidos._editar(\''+id+'\')">✎</button>':'')
        +(ex?'<button title="Excluir" onclick="MCPedidos._excluir(\''+id+'\')">🗑</button>':'')+'</td>':'')
      +'</tr>';
  }
  function render(el, cat){
    if(!el || !CAT[cat]) return;
    ULT[cat]=el;
    var st=EST[cat];
    if(!el.querySelector('.mcp-tools')){
      el.innerHTML='<div class="mcp-tools">'
        +'<select onchange="MCPedidos._filtro(\''+cat+'\',this.value)">'
        +[['abertas','Em aberto'],['','Todos'],['fechadas','Encerrados']].map(function(o){ return '<option value="'+o[0]+'"'+(st.f===o[0]?' selected':'')+'>'+o[1]+'</option>'; }).join('')+'</select>'
        +'<input type="search" placeholder="Buscar cliente, equipamento, patrimônio, quem pediu…" value="'+esc(st.q)+'" oninput="MCPedidos._busca(\''+cat+'\',this.value)">'
        +(OP.novo?'<button class="mcp-novo" onclick="MCPedidos._novo(\''+cat+'\')">'+CAT[cat].novo+'</button>':'')
        +'</div><div class="mcp-dica"></div><div class="mcp-lista"></div>';
    }
    var l0=lista(), gere=!!chama('podeGerir');
    var ab=abertos(l0, cat);
    var fe=l0.filter(function(x){ return categoria(x)===cat && !aberto(x); })
      .sort(function(a,b){ return (+b.atualizadoEm||+b.criadoEm||0)-(+a.atualizadoEm||+a.criadoEm||0); });
    var pos={}; ab.forEach(function(x,i){ pos[x.id]=i+1; });
    var l=st.f==='abertas'?ab:(st.f==='fechadas'?fe:ab.concat(fe));
    var q=norm(st.q).split(' ').filter(Boolean), buscando=q.length>0;
    if(buscando) l=l.filter(function(x){ var t=norm([x.cliente,x.cidade,x.endereco,itensTxt(x),x.patrimonio,x.solicitadoNome,x.obs].join(' ')); return q.every(function(w){ return t.indexOf(w)>=0; }); });
    el.querySelector('.mcp-dica').innerHTML=(gere && st.f!=='fechadas' && ab.length>1)
      ? (buscando?'Com a busca ligada não dá para arrastar — limpe a busca para mudar a prioridade.':'Arraste pela alça <b>⋮⋮</b> para mudar a prioridade: o de cima é o nº 1.')
      : (ab.length?ab.length+' em aberto, na ordem de prioridade.':'');
    var box=el.querySelector('.mcp-lista');
    if(!l.length){ box.innerHTML='<div class="mcp-wrap"><div class="mcp-vazio">'+(buscando?'Nada com essa busca.':(st.f==='fechadas'?'Nenhum pedido encerrado.':'Nenhum pedido em aberto.'))+'</div></div>'; return; }
    var arrasta=gere && !buscando && !!OP.gravarOrdem;
    box.innerHTML='<div class="mcp-wrap"><table class="mcp-tab"><thead><tr>'
      +'<th style="width:64px">Prior.</th><th>Data da solicitação</th><th>Data programada</th><th>Cliente</th><th>Equipamento</th>'
      +'<th class="mcp-r">Qtd</th><th>Patrimônio</th><th>Serviço</th><th>Pedido por</th><th>Situação</th>'+(gere?'<th></th>':'')+'</tr></thead><tbody>'
      +l.map(function(x){ return linha(x, pos[x.id], cat, arrasta, gere); }).join('')+'</tbody></table></div>';
  }
  function redesenhar(cat){ if(ULT[cat] && document.body.contains(ULT[cat])) render(ULT[cat], cat); }

  /* ---------- prioridade ---------- */
  /* grava 1, 2, 3… na ordem pedida; só os que mudaram. Mostra na hora e, se o
     banco recusar, volta como estava. */
  function reordenar(cat, ids){
    if(!OP.gravarOrdem) return Promise.resolve();
    var l=lista(), up=[], antes={};
    ids.forEach(function(id,i){
      var x=l.filter(function(c){ return c.id===id; })[0]; if(!x) return;
      if(+x.prioridade!==i+1){ antes[id]=x.prioridade; x.prioridade=i+1; up.push({ id:id, prioridade:i+1 }); }
    });
    if(!up.length) return Promise.resolve();
    redesenhar(cat);
    return Promise.resolve(OP.gravarOrdem(up)).then(function(){ aviso('Prioridade atualizada.'); })
      .catch(function(e){
        var l2=lista(); Object.keys(antes).forEach(function(id){ var x=l2.filter(function(c){ return c.id===id; })[0]; if(x) x.prioridade=antes[id]; });
        redesenhar(cat);
        aviso(e && e.code==='permission-denied' ? 'Sem permissão para mudar a prioridade (chave "Gerencia pedidos de equipamento" ou regra do banco).'
                                                 : 'Não foi possível mudar a prioridade ('+((e&&(e.code||e.message))||e)+').', true);
      });
  }
  /* coloca um pedido na posição p (1 = primeiro) da lista da categoria */
  function mover(id, cat, p){
    var ids=abertos(lista(), cat).map(function(x){ return x.id; }).filter(function(x){ return x!==id; });
    p=(p>0)?Math.min(p, ids.length+1):ids.length+1;
    ids.splice(p-1, 0, id);
    return reordenar(cat, ids);
  }
  var pegou=false, arr=null;
  document.addEventListener('mouseup', function(){ setTimeout(function(){ pegou=false; }, 0); });
  function limpaAlvo(){ [].forEach.call(document.querySelectorAll('.mcp-alvo-c,.mcp-alvo-b'), function(t){ t.classList.remove('mcp-alvo-c','mcp-alvo-b'); }); }
  function ini(ev, cat){
    if(!pegou){ ev.preventDefault(); return; }                  /* só pela alça: clicar na linha abre o pedido */
    var tr=ev.currentTarget; arr={ id:tr.getAttribute('data-id'), cat:cat };
    try{ ev.dataTransfer.effectAllowed='move'; ev.dataTransfer.setData('text/plain', arr.id); }catch(e){}
    setTimeout(function(){ tr.classList.add('mcp-arr'); }, 0);
  }
  function sobre(ev){
    if(!arr) return; ev.preventDefault();
    var tr=ev.currentTarget, r=tr.getBoundingClientRect(), baixo=ev.clientY>r.top+r.height/2;
    limpaAlvo(); if(tr.getAttribute('data-id')!==arr.id) tr.classList.add(baixo?'mcp-alvo-b':'mcp-alvo-c');
  }
  function sai(ev){ ev.currentTarget.classList.remove('mcp-alvo-c','mcp-alvo-b'); }
  function fim(){ limpaAlvo(); [].forEach.call(document.querySelectorAll('.mcp-arr'), function(t){ t.classList.remove('mcp-arr'); }); arr=null; pegou=false; }
  function solta(ev, cat){
    ev.preventDefault();
    if(!arr || arr.cat!==cat){ fim(); return; }
    var tr=ev.currentTarget, alvo=tr.getAttribute('data-id'), r=tr.getBoundingClientRect(), baixo=ev.clientY>r.top+r.height/2;
    var ids=abertos(lista(), cat).map(function(x){ return x.id; }), de=arr.id;
    fim();
    if(alvo===de || ids.indexOf(alvo)<0 || ids.indexOf(de)<0) return;
    ids.splice(ids.indexOf(de),1);
    ids.splice(ids.indexOf(alvo)+(baixo?1:0), 0, de);
    reordenar(cat, ids);
  }

  window.MCPedidos={
    versao:1, CAT:CAT, SERV:SERV, ST:ST, ABERTOS:ABERTOS,
    configurar:function(o){ OP=o||{}; },
    categoria:categoria, aberto:aberto, ordem:ordem, abertos:abertos, contar:contar, posicoes:posicoes,
    itens:itens, itensTxt:itensTxt, pill:pill, render:render, redesenhar:redesenhar, reordenar:reordenar, mover:mover,
    /* usados pelo HTML da lista */
    _pega:function(){ pegou=true; }, _ini:ini, _sobre:sobre, _sai:sai, _fim:fim, _solta:solta,
    _ver:function(id){ chama('ver', id); }, _editar:function(id){ chama('editar', id); }, _excluir:function(id){ chama('excluir', id); },
    _novo:function(cat){ chama('novo', cat); },
    _filtro:function(cat,v){ EST[cat].f=v; redesenhar(cat); },
    _busca:function(cat,v){ EST[cat].q=v; redesenhar(cat); }
  };
})();
