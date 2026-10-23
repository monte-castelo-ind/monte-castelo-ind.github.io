/* folha-solicitacao.js — Folha da Solicitação de Equipamento (Comodato).
   Um arquivo só para os dois apps que mostram o pedido: o Manut. Comodato e o
   Comercial. Os dois leem o MESMO documento (comodatoSolicitacoes) e montam a
   folha com o MESMO código daqui — o que a manutenção altera aparece igual
   para o comercial, na tela e no PDF. Mesmo modelo da Autorização de Compra.
   Uso: MCSolic.html(pedido) devolve a folha; MCSolic.imprimir(pedido) abre a
   impressão (Salvar como PDF). Para mudar a folha, mude só aqui e suba o ?v=
   nos apps.
   Vários equipamentos no mesmo pedido: lista "itens" (equipamento, modelo,
   quantidade, patrimônio), uma linha por item. Pedido antigo, sem itens, usa
   os campos de cima, como antes. */
(function(){
  if(window.MCSolic) return;
  var CSS="/* ===== Folha da solicita\u00e7\u00e3o (na tela e na impress\u00e3o) \u2014 mesmo modelo da Autoriza\u00e7\u00e3o de Compra ===== */\n.sc-folha{background:#fff;color:#000;font-family:Arial,Helvetica,sans-serif;font-size:11.5px;line-height:1.45;padding:22px 24px;border-radius:6px}\n.sc-folha .f-cab{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:2px solid #000;padding-bottom:9px}\n.sc-folha .f-logo{height:46px;width:auto;max-width:200px;object-fit:contain}\n.sc-folha .f-emp{text-align:right;font-size:9.5px;line-height:1.55}\n.sc-folha .f-tit{text-align:center;font-size:16px;font-weight:bold;letter-spacing:1.6px;margin:14px 0 12px;padding-bottom:5px;border-bottom:1px solid #000}\n.sc-folha table{border-collapse:collapse}\n.sc-folha .f-meta{width:100%;font-size:11px;margin-bottom:10px}\n.sc-folha .f-meta td{padding:2px 0;vertical-align:middle}\n.sc-folha .f-meta td:last-child{text-align:right}\n.sc-folha .f-sec{background:#ddd;border:1px solid #000;padding:4px 7px;font-weight:bold;font-size:11px;letter-spacing:.4px}\n.sc-folha .f-dados{width:100%;border:1px solid #000;border-top:none;margin-bottom:12px}\n.sc-folha .f-dados td{padding:5px 7px;border-bottom:1px solid #bbb;width:50%;vertical-align:top}\n.sc-folha .f-itens{width:100%;border:1px solid #000;margin-bottom:12px}\n.sc-folha .f-itens th{background:#ddd;border:1px solid #000;padding:5px 6px;font-size:10.5px}\n.sc-folha .f-itens td{border:1px solid #999;padding:5px 6px;height:17px}\n.sc-folha .c{text-align:center} .sc-folha .r{text-align:right}\n.sc-folha .f-obs{border:1px solid #000;border-top:none;padding:7px;min-height:46px;font-size:10.5px;line-height:1.5;white-space:pre-wrap;margin-bottom:12px}\n.sc-folha .f-hist{border:1px solid #000;border-top:none;padding:6px 8px;font-size:10px;line-height:1.6}\n.sc-folha .f-hist div span{color:#555}\n.sc-folha .f-selo{display:inline-block;border:2px solid currentColor;border-radius:5px;padding:2px 10px;font-weight:bold;letter-spacing:.12em;font-size:11px;transform:rotate(-3deg)}\n.sc-folha .f-ass{display:flex;gap:26px;justify-content:space-between;margin-top:40px;break-inside:avoid;page-break-inside:avoid}\n.sc-folha .f-ass > div{flex:1;text-align:center}\n.sc-folha .f-nm{font-size:11px;font-weight:bold;min-height:15px}\n.sc-folha .f-ln{border-top:1.2px solid #000;margin:4px 0 5px}\n.sc-folha .f-cg{font-size:9px;letter-spacing:.6px;text-transform:uppercase;color:#444}\n.sc-folha .f-rod{margin-top:20px;border-top:1px solid #999;padding-top:6px;font-size:8.5px;color:#666;display:flex;justify-content:space-between;align-items:center;gap:12px}\n.sc-folha .f-cod{font-family:'Courier New',monospace;font-size:11px;font-weight:bold;color:#000;border:1.5px solid #000;padding:2px 8px;letter-spacing:1.4px}\n.sc-folha.sc-sombra{box-shadow:0 2px 12px rgba(0,0,0,.35)}\n/* dentro do #desk, as tabelas do app t\u00eam estilo pr\u00f3prio: aqui vale o da folha */\n.sc-folha table{width:100%;font-size:inherit}\n.sc-folha th,.sc-folha td{white-space:normal!important;color:#000!important;text-transform:none!important;letter-spacing:0!important;font-size:inherit}\n.sc-folha .f-meta td{padding:2px 0!important;border:none!important}\n.sc-folha .f-dados td{padding:5px 7px!important;border:none!important;border-bottom:1px solid #bbb!important;background:#fff!important}\n.sc-folha .f-itens th{background:#ddd!important;border:1px solid #000!important;padding:5px 6px!important;font-size:10.5px!important;font-weight:bold!important;text-align:center!important}\n.sc-folha .f-itens td{border:1px solid #999!important;padding:5px 6px!important;background:#fff!important}\n#scImp{display:none}\n@media print{\n  @page{ size:A4 portrait; margin:13mm 12mm }\n  /* display:none e n\u00e3o visibility: invis\u00edvel ainda ocupa lugar e sai folha em branco */\n  body.sc-imprimindo{background:#fff!important}\n  body.sc-imprimindo > *:not(#scImp){display:none!important}\n  body.sc-imprimindo #scImp{display:block!important}\n  #scImp .sc-folha{padding:0;border-radius:0;box-shadow:none}\n  #scImp, #scImp *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}\n}\n";
  function injetaCSS(){
    if(document.getElementById('mc-solic-css')) return;
    var st=document.createElement('style'); st.id='mc-solic-css'; st.textContent=CSS;
    (document.head||document.documentElement).appendChild(st);
  }
  injetaCSS();
  var SERV={ entregar:'Entregar / instalar', retirar:'Retirar', trocar:'Trocar', consertar:'Consertar no cliente' };
  /* tipo do pedido (marcado no app Comercial) */
  var CAT={ remessa:'Remessa / retorno', externa:'Manutenção externa' };
  var SELO={ autorizacao:['AGUARDA AUTORIZAÇÃO','#b45309'], aberta:['ABERTA','#b7791f'], separacao:['EM SEPARAÇÃO','#1d4ed8'],
    entregue:['ENTREGUE','#1f6b45'], cancelada:['CANCELADA','#555'], recusada:['RECUSADA','#b91c1c'] };
  function esc(t){ return String(t==null?'':t).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function dataBR(ymd){ if(!ymd) return '—'; var p=String(ymd).slice(0,10).split('-'); return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:String(ymd); }
  function dh(ms){ if(!ms) return '—'; var d=new Date(ms); if(isNaN(d)) return '—';
    return d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); }
  function rs(n){ return 'R$ '+Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function codigo(s){ return 'SE-'+String(s.id||'').slice(0,6).toUpperCase(); }
  /* logo: a variável --logo-light que cada app já tem (no #desk do Comodato
     ou na raiz do Comercial) */
  function logoSrc(){
    var alvos=[document.getElementById('desk'), document.documentElement, document.body];
    for(var i=0;i<alvos.length;i++){ if(!alvos[i]) continue;
      try{ var v=getComputedStyle(alvos[i]).getPropertyValue('--logo-light')||''; var m=v.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/); if(m) return m[1]; }catch(e){} }
    return '';
  }
  /* as linhas do pedido: a lista itens ou, no pedido antigo, os campos soltos */
  function itensDe(s){
    if(s && s.itens && s.itens.length) return s.itens;
    return [{ equipamento:s.equipamento||'', modelo:s.modelo||'', quantidade:s.quantidade||1, patrimonio:s.patrimonio||'' }];
  }
  function quemEntregou(s){ var h=(s.historico||[]).filter(function(x){ return /entregue/.test(x.acao||''); }).pop(); return h?(h.nome||h.por||''):''; }
  function linhaAut(s){
    if(!s.novo) return '';
    var a=s.autorizacao||{};
    var t= a.status==='aprovado' ? 'Autorizado por '+(a.nome||a.por||'')+' em '+dh(a.em)+(a.codigo?' · código '+a.codigo:'')
         : a.status==='recusado' ? 'Recusado por '+(a.nome||a.por||'')+' em '+dh(a.em)+(a.motivo?' · '+a.motivo:'')
         : 'Aguardando a assinatura da diretoria';
    return '<tr><td colspan="2" style="text-align:left;padding-top:4px"><b>Equipamento NOVO</b>'+(s.valorEstimado?' · valor estimado '+rs(s.valorEstimado):'')+' — '+esc(t)+'</td></tr>';
  }
  function html(s, opts){
    opts=opts||{};
    var logo=logoSrc(), selo=SELO[s.status]||[String(s.status||'').toUpperCase(),'#000'];
    var serv=esc((s.categoria&&CAT[s.categoria]?CAT[s.categoria]+' · ':'')+(SERV[s.servico]||s.servico||''));
    var itens=itensDe(s), linhas=itens.map(function(x,i){
      return '<tr><td class="c">'+(i+1)+'</td><td class="c">'+(x.quantidade||1)+'</td><td>'+esc(x.equipamento||'')+(x.modelo?' · '+esc(x.modelo):'')
        +'</td><td>'+esc(x.patrimonio||'')+'</td><td>'+serv+'</td></tr>'; }).join('');
    var vazias=''; for(var k=itens.length;k<3;k++) vazias+='<tr><td class="c">&nbsp;</td><td></td><td></td><td></td><td></td></tr>';
    var obs=esc(s.obs||'')+(s.obsManut?(s.obs?'\n\n':'')+'Manutenção: '+esc(s.obsManut):'');
    return '<div class="sc-folha'+(opts.sombra?' sc-sombra':'')+'">'
      +'<div class="f-cab">'+(logo?'<img class="f-logo" src="'+logo+'" alt="Monte Castelo">':'<b style="font-size:18px">MONTE CASTELO</b>')
      +  '<div class="f-emp"><b>PANIFICADORA MONTE CASTELO LTDA</b><br>AV RODRIGUES DA FONSECA 1840<br>VILA NOVA - PORTO ALEGRE<br>CNPJ 01.052.266/0001-40</div></div>'
      +'<div class="f-tit">SOLICITAÇÃO DE EQUIPAMENTO — COMODATO</div>'
      +'<table class="f-meta"><tr><td><b>Data da solicitação:</b> '+dh(s.criadoEm)+'</td><td><b>Solicitante:</b> '+esc(s.solicitadoNome||s.solicitadoPor||'')+'</td></tr>'
      +  '<tr><td><b>Entrega programada:</b> '+dataBR(s.dataProgramada)+'</td><td><span class="f-selo" style="color:'+selo[1]+'">'+selo[0]+'</span></td></tr>'+linhaAut(s)+'</table>'
      +'<div class="f-sec">DADOS DO CLIENTE</div>'
      +'<table class="f-dados">'
      +  '<tr><td><b>Cliente:</b> '+esc(s.cliente||'')+(s.clienteNovo?' <b>(cliente novo)</b>':'')+'</td><td><b>Contato:</b> '+esc(s.contato||'—')+'</td></tr>'
      +  '<tr><td colspan="2" style="width:auto"><b>Endereço:</b> '+esc(s.endereco||'—')+'</td></tr>'
      +  '<tr><td><b>Cidade:</b> '+esc(s.cidade||'—')+'</td><td><b>Cód. no ERP:</b> '+esc(s.clienteId||(s.clienteNovo?'ainda não cadastrado':'—'))+'</td></tr></table>'
      +'<table class="f-itens"><thead><tr><th style="width:7%">ITEM</th><th style="width:9%">QTDE</th><th>EQUIPAMENTO</th>'
      +  '<th style="width:22%">PATRIMÔNIO</th><th style="width:20%">SERVIÇO</th></tr></thead><tbody>'
      +  linhas+vazias+'</tbody></table>'
      +'<div class="f-sec">OBSERVAÇÃO</div><div class="f-obs">'+(obs||'&nbsp;')+'</div>'
      +'<div class="f-sec">ANDAMENTO</div><div class="f-hist">'+((s.historico||[]).map(function(h){
          return '<div><span>'+dh(h.em)+'</span> · <b>'+esc(h.nome||h.por||'')+'</b> '+esc(h.acao||'')+(h.txt?': '+esc(h.txt):'')+'</div>'; }).join('')||'—')+'</div>'
      +'<div class="f-ass">'
      +  '<div><div class="f-nm">'+esc(s.solicitadoNome||'')+'</div><div class="f-ln"></div><div class="f-cg">Solicitado por</div></div>'
      +  '<div><div class="f-nm">'+esc(quemEntregou(s))+'</div><div class="f-ln"></div><div class="f-cg">Entregue por (manutenção)</div></div>'
      +  '<div><div class="f-nm">&nbsp;</div><div class="f-ln"></div><div class="f-cg">Recebido pelo cliente · nome e data</div></div>'
      +'</div>'
      +'<div class="f-rod"><span>Emitido em '+dh(Date.now())+'</span><span class="f-cod">'+codigo(s)+'</span></div>'
      +'</div>';
  }
  /* Imprimir ou salvar em PDF: a folha vai para #scImp e só ela sai na impressão */
  function imprimir(s){
    injetaCSS();
    var box=document.getElementById('scImp');
    if(!box){ box=document.createElement('div'); box.id='scImp'; document.body.appendChild(box); }
    box.innerHTML=html(s);
    var titulo=document.title; document.title='Solicitação '+codigo(s)+' - '+(s.cliente||'');
    document.body.classList.add('sc-imprimindo');
    var foi=false;
    function fim(){ document.body.classList.remove('sc-imprimindo'); document.title=titulo; window.removeEventListener('afterprint', fim); }
    function vai(){ if(foi) return; foi=true; window.addEventListener('afterprint', fim); window.print(); setTimeout(fim, 1500); }
    var img=box.querySelector('img');
    if(img && !img.complete){ img.onload=vai; img.onerror=vai; setTimeout(vai,1500); } else setTimeout(vai,60);
  }
  window.MCSolic={ html:html, imprimir:imprimir, codigo:codigo, SERV:SERV, itens:itensDe };
})();
