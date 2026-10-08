/* ===== mc-ui.js — aparência compartilhada da suíte Monte Castelo =====
   Carregado no <head> de cada app (menos o Produlog):
     <script src="https://monte-castelo-ind.github.io/mc-ui.js"></script>
   Faz, igual em todos os apps:
   - modo CLARO (padrão) com a paleta escolhida nas bolinhas (verde se nenhuma)
     e modo ESCURO (lua ☾) sempre no preto da paleta Neutro;
   - as paletas (verde, Monte Castelo, Aço, Âmbar, Índigo, Vinho, Neutro);
   - MENU NO TOPO como padrão (barra montada copiando os botões do menu
     lateral — mesmas permissões e cliques); quem preferir volta ao lateral.
   As escolhas valem para TODOS os apps (mesmo site = mesmo armazenamento):
   mc_tema ('claro'|'escuro'), mc_pal (paleta do claro), mc_menu ('lateral'
   para quem escolheu o lateral; qualquer outro valor = topo).
   Apps com muitos itens podem agrupar o menu definindo, antes de carregar a
   página toda, window.MC_MENU_GRUPOS = [{nome:'Cadastros', ps:['a','b']}, {ps:['c']}].
   Apps de outro molde descrevem o próprio menu ANTES de carregar este arquivo:
     window.MC_UI = { lateral:'#sidebar', botoes:'.navbtn[data-p]', chave:'data-p',
       rotulo:'.lbl' (null = texto do botão), ativo:'on', grupos:[…],
       nome:'#uname', papel:'#urole', avatar:'#uavatar', sair:'sair',
       funcsTema:['toggleTema'], funcsPaleta:['setPaleta'], paletaRow:'.paleta-row',
       rodape:'.side-foot', alvo:'#desk' (elemento que também recebe tema/paleta),
       soTema:true (escuro = o escuro do próprio app, sem a Neutro),
       semBarra:true (só tema; sem menu no topo) }
   Dentro de outro app (iframe, como na Gestão) só o tema é aplicado. */
(function(){
  var D=document, H=D.documentElement;
  var U=window.MC_UI||{};
  var CFG={ lateral:U.lateral||'#sidebar', botoes:U.botoes||'.navbtn[data-p]', chave:U.chave||'data-p',
            rotulo:('rotulo' in U)?U.rotulo:'.lbl', ativo:U.ativo||'on', grupos:U.grupos||null,
            nome:U.nome||'#uname', papel:U.papel||'#urole', avatar:U.avatar||'#uavatar', sair:U.sair||'sair',
            funcsTema:U.funcsTema||['toggleTema','toggleTheme'], funcsPaleta:U.funcsPaleta||['setPaleta'],
            paletaRow:U.paletaRow||'.paleta-row', rodape:U.rodape||'.side-foot', alvo:U.alvo||null,
            soTema:!!U.soTema, semBarra:!!U.semBarra };
  var EMBUTIDO=false; try{ EMBUTIDO=(window.self!==window.top); }catch(e){ EMBUTIDO=true; }
  function ler(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function gravar(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  var PALETAS=[['','Verde (original)','#2fae7d','#0f111a'],['mc','Monte Castelo','#F26B1F','#1A1A1A'],['aco','Aço','#4C8FBF','#12161C'],
               ['ambar','Âmbar','#D9A441','#16130F'],['indigo','Índigo','#7B6CF0','#101120'],['vinho','Vinho','#C4544F','#181113'],
               ['ui','Neutro','#171717','#f5f5f5']];

  /* ---- 1. antes de desenhar: tema, paleta e menu ---- */
  function modoGuardado(){ return ler('mc_tema')==='escuro' ? 'escuro' : 'claro'; }
  function aplicarAtributos(m){
    var alvos=[H]; if(CFG.alvo) Array.prototype.forEach.call(D.querySelectorAll(CFG.alvo), function(e){ alvos.push(e); });
    var p=ler('mc_pal')||'';
    if(m==='escuro' && !CFG.soTema) p='ui';            /* escuro = preto da Neutro */
    if(CFG.soTema && p==='ui') p='';                   /* app sem a Neutro: fica no padrão dele */
    alvos.forEach(function(el){
      el.setAttribute('data-theme', m==='escuro'?'dark':'light');
      if(p) el.setAttribute('data-pal',p); else el.removeAttribute('data-pal');
    });
  }
  aplicarAtributos(modoGuardado());
  if(ler('mc_menu')!=='lateral' && !CFG.semBarra && !EMBUTIDO) H.setAttribute('data-menu','topo');
  var st=D.createElement('style'); st.id='mc-ui-css'; st.textContent=`.paleta-box{padding:9px 4px 7px}
.paleta-lab{font-size:9.5px;font-weight:700;letter-spacing:.7px;color:var(--muted);
            text-transform:uppercase;margin-bottom:7px;padding-left:2px}
.paleta-row{display:flex;gap:6px;flex-wrap:wrap}
.pbola{width:22px;height:22px;border-radius:50%;cursor:pointer;padding:0;
       border:2px solid transparent;position:relative;
       background:linear-gradient(135deg,var(--a) 0 50%,var(--b) 50% 100%)}
.pbola:hover{transform:scale(1.12)}
.pbola.on{border-color:var(--text);box-shadow:0 0 0 2px var(--bg)}



/* --- Monte Castelo: preto industrial e laranja da marca --- */
html[data-pal="mc"]{
  --bg:#141414; --card:#1E1E1E; --card-2:#282828; --text:#EDEDED; --muted:#8C8C8C;
  --border:rgba(255,255,255,.08); --sidebar:#1A1A1A; --side-active:#3A2113; --side-active-text:#F58B4C;
  --primary:#F26B1F; --amber:#E8A33D; --green:#4CAF6A; --red:#E05252; --blue:#5B8FB9; --purple:#9B7FD4;
}
html[data-pal="mc"][data-theme="light"]{
  --bg:#F2F0ED; --card:#FFFFFF; --card-2:#F7F5F2; --text:#1F1D1B; --muted:#7A756F;
  --border:#E4E0DA; --sidebar:#FFFFFF; --side-active:#FCEDE2; --side-active-text:#C04E0C;
  --primary:#D9550F; --amber:#C98A21; --green:#2E8B4F; --red:#C93F3F; --blue:#3C6E94; --purple:#7A5FBF;
}

/* --- Aço: azul frio, cara de painel industrial --- */
html[data-pal="aco"]{
  --bg:#12161C; --card:#1A2029; --card-2:#232B36; --text:#E4E9F0; --muted:#8494A6;
  --border:rgba(255,255,255,.07); --sidebar:#161C24; --side-active:#16303F; --side-active-text:#6FB6DE;
  --primary:#4C8FBF; --amber:#E3AE4A; --green:#3FB68A; --red:#E06B6B; --blue:#5B9BD5; --purple:#8A86D6;
}
html[data-pal="aco"][data-theme="light"]{
  --bg:#EDF1F5; --card:#FFFFFF; --card-2:#F5F8FB; --text:#16202B; --muted:#78879A;
  --border:#E1E7EE; --sidebar:#FFFFFF; --side-active:#E3F0F8; --side-active-text:#1E6A96;
  --primary:#2A76A8; --amber:#C8912C; --green:#249A72; --red:#CC5151; --blue:#3B7FBE; --purple:#6F6AC4;
}

/* --- Âmbar: grafite quente, tom de pão --- */
html[data-pal="ambar"]{
  --bg:#16130F; --card:#201C16; --card-2:#2A241C; --text:#EFE9DF; --muted:#998F80;
  --border:rgba(255,255,255,.08); --sidebar:#1A1611; --side-active:#3B2E16; --side-active-text:#E6BC63;
  --primary:#D9A441; --amber:#E8B84D; --green:#6FA86A; --red:#D96A5A; --blue:#6A93B8; --purple:#A088C4;
}
html[data-pal="ambar"][data-theme="light"]{
  --bg:#F5F1E8; --card:#FFFFFF; --card-2:#FAF7F0; --text:#221D15; --muted:#8A8070;
  --border:#E8E1D4; --sidebar:#FFFFFF; --side-active:#F7EDD6; --side-active-text:#9A6F12;
  --primary:#B0812A; --amber:#C08F1E; --green:#4F8A4A; --red:#C05242; --blue:#4E7A9E; --purple:#7E66A8;
}

/* --- Índigo: roxo azulado, mais moderno --- */
html[data-pal="indigo"]{
  --bg:#101120; --card:#191B2E; --card-2:#22253C; --text:#E7E7F2; --muted:#8B8CA8;
  --border:rgba(255,255,255,.07); --sidebar:#151629; --side-active:#272552; --side-active-text:#A99BF5;
  --primary:#7B6CF0; --amber:#F0B84A; --green:#3FC08A; --red:#EE6B7E; --blue:#5C8BF0; --purple:#9A8AF5;
}
html[data-pal="indigo"][data-theme="light"]{
  --bg:#EFEFF7; --card:#FFFFFF; --card-2:#F6F6FC; --text:#181A2E; --muted:#7D7F9B;
  --border:#E5E5F0; --sidebar:#FFFFFF; --side-active:#ECEAFB; --side-active-text:#5344C4;
  --primary:#5D4FD6; --amber:#C99320; --green:#22A06B; --red:#D6465C; --blue:#3E6FD4; --purple:#7566DC;
}

/* --- Vinho: escuro avermelhado, bem sóbrio --- */
html[data-pal="vinho"]{
  --bg:#181113; --card:#221A1C; --card-2:#2C2225; --text:#EDE4E4; --muted:#9A8A8C;
  --border:rgba(255,255,255,.08); --sidebar:#1C1416; --side-active:#3E1F24; --side-active-text:#E0837E;
  --primary:#C4544F; --amber:#DFA653; --green:#5FA678; --red:#E0645F; --blue:#6B8EB5; --purple:#A183C0;
}
html[data-pal="vinho"][data-theme="light"]{
  --bg:#F5EFEF; --card:#FFFFFF; --card-2:#FBF6F6; --text:#241A1C; --muted:#8B7B7D;
  --border:#EBE0E0; --sidebar:#FFFFFF; --side-active:#F8E8E7; --side-active-text:#A33B36;
  --primary:#A8413C; --amber:#BC8828; --green:#3F8659; --red:#C24B46; --blue:#4F7399; --purple:#7F639E;
}
/* --- Neutro: estilo de referência "clinical blueprint on frosted paper" ---
   Diferente das outras paletas, esta também muda a forma (cantos em pílula,
   cartões de 24px, bordas finas) — mas SÓ para quem a escolhe. Fontes e
   tamanhos ficam os de sempre (Archivo / JetBrains Mono). As cores de status (âmbar, verde, vermelho, azul, roxo) seguem
   valendo, porque carregam significado no trabalho. */
html[data-pal="ui"]{
  --bg:#0a0a0a; --card:#141414; --card-2:#1f1f1f; --text:#fafafa; --muted:#a3a3a3;
  --border:#262626; --sidebar:#0f0f0f; --side-active:#262626; --side-active-text:#fafafa;
  --primary:#fafafa; --amber:#f5b013; --green:#22c55e; --red:#f87171; --blue:#60a5fa; --purple:#a78bfa;
  --shadow:0 0 0 1px rgba(255,255,255,.03);
}
/* Neutro no CLARO: "caderno de laboratório" — pergaminho, osso, grafite e um
   único destaque laranja (ação principal). Plano: sem sombra, profundidade só
   pela troca de tom (pergaminho → osso → branco). */
html[data-pal="ui"][data-theme="light"]{
  --bg:#e8e8de; --card:#f3f3ee; --card-2:#ffffff; --text:#2d2f33; --muted:#69695d;
  --border:#cecebf; --sidebar:#e8e8de; --side-active:#f3f3ee; --side-active-text:#2d2f33;
  --primary:#2d2f33; --acento:#f43e01;
  --amber:#b45309; --green:#2e7d4f; --red:#c62828; --blue:#2f5f9e; --purple:#7a4fc0;
  --shadow:none;
}
html[data-pal="ui"][data-theme="light"] .card{border-radius:10px;border-color:transparent;box-shadow:none}
html[data-pal="ui"][data-theme="light"] .modal{border-radius:10px;box-shadow:0 0 0 1px var(--border)}
html[data-pal="ui"][data-theme="light"] .btn,
html[data-pal="ui"][data-theme="light"] .rz-dia,
html[data-pal="ui"][data-theme="light"] .chip{border-radius:1000px}
html[data-pal="ui"][data-theme="light"] .btn-ghost{background:transparent;border-color:var(--border)}
html[data-pal="ui"][data-theme="light"] .btn-ghost:hover{background:var(--card)}
html[data-pal="ui"][data-theme="light"] input,html[data-pal="ui"][data-theme="light"] select{border-radius:1000px;background:#fff;border-color:var(--border)}
html[data-pal="ui"][data-theme="light"] textarea{border-radius:10px;background:#fff;border-color:var(--border)}
html[data-pal="ui"][data-theme="light"] input:focus,html[data-pal="ui"][data-theme="light"] select:focus,
html[data-pal="ui"][data-theme="light"] textarea:focus{border-color:var(--text)}
html[data-pal="ui"][data-theme="light"] .pill{border-radius:5px}
html[data-pal="ui"][data-theme="light"] .mpill-fill{background:var(--acento);border-color:var(--acento);color:#fff}
html[data-pal="ui"][data-theme="light"] .mlink.on{background:transparent;color:var(--text);box-shadow:inset 0 -2px 0 var(--acento);border-radius:0}
html[data-pal="ui"][data-theme="light"] .mdrop{border-radius:10px;box-shadow:none;background:var(--card)}
html[data-pal="ui"][data-theme="light"] .navbtn.on{box-shadow:inset 3px 0 0 var(--acento)}
html[data-pal="ui"] .card{border-radius:24px;padding:20px}
html[data-pal="ui"] .modal{border-radius:24px}
html[data-pal="ui"] .btn{border-radius:18px}
html[data-pal="ui"][data-theme="dark"] .btn:not(.btn-ghost),
html[data-pal="ui"][data-theme="dark"] .uav,
html[data-pal="ui"][data-theme="dark"] .auth-card button,
html[data-pal="ui"][data-theme="dark"] .rz-num,
html[data-pal="ui"][data-theme="dark"] .rz-bts button.rz-pos-on,
html[data-pal="ui"][data-theme="dark"] .rz-base .btn.rz-pos-on,
html[data-pal="ui"][data-theme="dark"] .rz-dia.on,
html[data-pal="ui"][data-theme="dark"] .filtro-badge,
html[data-pal="ui"][data-theme="dark"] .filtro-grupo-n,
html[data-pal="ui"][data-theme="dark"] .chip.active,
html[data-pal="ui"][data-theme="dark"] .tb button.on{color:#0a0a0a}
html[data-pal="ui"] .btn-ghost{background:var(--card-2);border-color:transparent}
html[data-pal="ui"] .btn-ghost:hover{border-color:var(--border)}
html[data-pal="ui"] input,html[data-pal="ui"] select{border-radius:18px;border-color:transparent;background:var(--card-2)}
html[data-pal="ui"] textarea{border-radius:14px;border-color:transparent;background:var(--card-2)}
html[data-pal="ui"] input:focus,html[data-pal="ui"] select:focus,html[data-pal="ui"] textarea:focus{outline:none;border-color:var(--muted)}
html[data-pal="ui"] .pill,html[data-pal="ui"] .chip,html[data-pal="ui"] .rz-dia{border-radius:18px}
html[data-pal="ui"] .navbtn{border-radius:10px}


/* ===== menu no topo ===== */
.mtopo{display:none}
html[data-menu="topo"] .side{display:none}
html[data-menu="topo"] .shell>main,html[data-menu="topo"] .side ~ main,html[data-menu="topo"] .side.pin ~ main{margin-left:0!important}
html[data-menu="topo"] .mtopo{display:block;position:sticky;top:0;z-index:60;height:60px;
  background:color-mix(in srgb, var(--sidebar) 88%, transparent);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
  border-bottom:1px solid var(--border)}
.mtopo-in{height:60px;display:flex;align-items:center;gap:26px;padding:0 26px}
.mtopo-marca{display:flex;align-items:center;gap:10px;cursor:pointer;flex:0 0 auto}
.mtopo .mtopo-logo{width:120px;height:34px;flex:0 0 120px;background-position:left center!important}
.mtopo-cap{font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);border-left:1px solid var(--border);padding-left:10px}
.mtopo-nav{display:flex;align-items:center;gap:2px;flex:1;min-width:0}
.mlink{background:none;border:0;color:var(--muted);font:500 13.5px inherit;font-family:inherit;padding:8px 13px;border-radius:9999px;cursor:pointer;
  display:inline-flex;gap:5px;align-items:center;letter-spacing:.01em;white-space:nowrap}
.mlink .lbl{opacity:1}
.mlink:hover,.mgrupo:hover>.mlink,.mgrupo.aberto>.mlink,.mlink.on{color:var(--text)}
.mlink.on{background:var(--card-2)}
.mcar{font-size:10px;opacity:.7}
.mgrupo{position:relative}
.mdrop{display:none;position:absolute;top:calc(100% + 10px);left:0;min-width:230px;background:var(--card);border:1px solid var(--border);
  border-radius:12px;padding:6px;box-shadow:0 14px 34px rgba(0,0,0,.32);z-index:70}
.mdrop::before{content:'';position:absolute;top:-12px;left:0;right:0;height:12px}
@media(hover:hover){ .mgrupo:hover>.mdrop{display:block} }
.mgrupo.aberto>.mdrop{display:block}
.mdrop .navbtn{width:100%}
.mdrop .navbtn .lbl{opacity:1}
.mdrop-dir{left:auto;right:0;min-width:240px}
.mtopo-dir{display:flex;align-items:center;gap:12px;flex:0 0 auto}
.mpill{border-radius:9999px;padding:8px 18px;font:600 13px inherit;font-family:inherit;cursor:pointer;white-space:nowrap}
.mpill-fill{background:var(--text);color:var(--bg);border:1px solid var(--text)}
.mpill-fill:hover{opacity:.88}
.mtopo-av{border:0;cursor:pointer}
.mtopo-lua{width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:transparent;color:var(--text);
  font-size:15px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
.mtopo-lua:hover{background:var(--card-2)}
.mtopo-quem{padding:8px 10px 4px}
.mtopo-quem b{display:block;font-size:13px}
.mtopo-quem small{color:var(--muted);font-size:11.5px}
@media(max-width:900px){
  html[data-menu="topo"] .mtopo{display:none}
  html[data-menu="topo"] .side{display:flex}
}


.mtopo-lua{width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:transparent;color:var(--text);
  font-size:15px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
.mtopo-lua:hover{background:var(--card-2)}
html[data-menu="topo"] .pinbtn{display:none}
.mc-topo-btn{width:100%;margin-top:8px}
/* itens da barra e das listas com estilo próprio (apps de outro molde não têm .navbtn) */
.mtopo .mdrop .navbtn{display:flex;align-items:center;gap:9px;width:100%;padding:9px 11px;border:0;border-radius:9px;background:none;
  color:var(--muted);font:500 13.5px inherit;font-family:inherit;text-align:left;cursor:pointer;white-space:nowrap}
.mtopo .mdrop .navbtn:hover{background:var(--card-2);color:var(--text)}
.mtopo .mdrop .navbtn.on{background:var(--side-active,var(--card-2));color:var(--side-active-text,var(--text));font-weight:600}
.mtopo .mdrop .navbtn .side-ico{display:inline-block;width:22px;flex:0 0 22px;text-align:center}
.mtopo .mdrop .navbtn .lbl{opacity:1}
.mtopo .uav{width:29px;height:29px;flex:0 0 29px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px}
html[data-pal="ui"][data-theme="dark"] .mtopo .uav{color:#0a0a0a}
.mc-topo-btn{font:inherit;cursor:pointer;padding:7px 10px;border-radius:9px;border:1px solid var(--border);background:transparent;color:var(--text)}
html[data-menu="topo"] .mc-com-barra{flex-wrap:wrap;align-content:flex-start}
html[data-menu="topo"] .mc-com-barra>.mtopo{flex:0 0 100%;width:100%}
html[data-menu="topo"] .mc-com-barra>:not(.mtopo):not([data-mc-lateral]){min-width:100%}
@media(min-width:901px){
  html[data-menu="topo"] [data-mc-lateral]{display:none!important}
  html[data-menu="topo"] main{margin-left:0!important}
}
`;
  (D.head||H).appendChild(st);

  /* ---- 2. modo claro / escuro e paletas ---- */
  function modoAtual(){ return H.getAttribute('data-theme')==='dark' ? 'escuro' : 'claro'; }
  function aplicarModo(m){
    aplicarAtributos(m); gravar('mc_tema', m);
    var p=ler('mc_pal')||'', esc=(m==='escuro');
    D.querySelectorAll('.pbola,.d-pbola').forEach(function(b){ b.classList.toggle('on', !esc && (b.getAttribute('data-pal')||'')===p); });
    var lua=D.getElementById('mtopoLua');
    if(lua){ lua.textContent=esc?'☀':'☾'; lua.title=esc?'Voltar ao modo claro':'Modo escuro'; }
    if(typeof ajustarLogo==='function') setTimeout(ajustarLogo,0);
  }
  window.mcAplicarModo=aplicarModo;
  function instalarFuncoes(){
    var alternar=function(){ aplicarModo(modoAtual()==='escuro'?'claro':'escuro'); };
    var paleta=function(p){ gravar('mc_pal', p||''); aplicarModo('claro'); };
    window.toggleTema=alternar;
    CFG.funcsTema.forEach(function(n){ window[n]=alternar; });
    window.applyTheme=function(t){ aplicarModo(t==='dark'?'escuro':'claro'); };
    window.setPaleta=paleta;
    CFG.funcsPaleta.forEach(function(n){ window[n]=paleta; });
    window.setMenuTopo=function(on){
      if(on) H.setAttribute('data-menu','topo'); else H.removeAttribute('data-menu');
      gravar('mc_menu', on?'topo':'lateral'); fecharListas(); sincronizar();
    };
  }
  function bolinhas(){
    return PALETAS.map(function(x){
      return '<button class="pbola" data-pal="'+x[0]+'" onclick="setPaleta(\''+x[0]+'\')" title="'+x[1]+'" style="--a:'+x[2]+';--b:'+x[3]+'"></button>';
    }).join('');
  }

  /* ---- 3. menu lateral: paletas iguais em todos e botão "Menu no topo" ---- */
  function prepararLateral(side){
    var row=side.querySelector(CFG.paletaRow);
    if(!row){
      var foot=side.querySelector(CFG.rodape); if(!foot) return;
      var box=D.createElement('div'); box.className='paleta-box lbl';
      box.innerHTML='<div class="paleta-lab">Paleta</div><div class="paleta-row"></div>';
      var alvo=foot.querySelector(CFG.funcsTema.concat(['toggleTema']).map(function(n){ return 'button[onclick*="'+n+'"]'; }).join(','));
      alvo=alvo ? alvo.parentElement : null;
      if(alvo && alvo.parentElement===foot) foot.insertBefore(box, alvo); else foot.appendChild(box);
      row=box.querySelector('.paleta-row');
    }
    row.innerHTML=bolinhas();
    if(!side.querySelector('.mc-topo-btn') && !CFG.semBarra){
      var b=D.createElement('button'); b.className='btn btn-sm btn-ghost mc-topo-btn';
      b.setAttribute('onclick','setMenuTopo(true)'); b.title='Trocar o menu lateral por uma barra no topo'; b.textContent='⇡ Menu no topo';
      row.parentElement.appendChild(b);
    }
  }

  /* ---- 4. barra do topo ---- */
  var side=null, mapa=[];                       /* [{clone, orig, solto}] */
  function limparIds(html){ return String(html).replace(/\sid="[^"]*"/g,''); }
  var BASES=['navbtn','nav-item','d-nav','on','active'];
  function chaveDe(b,i){ return b.getAttribute(CFG.chave) || b.id || ('item'+i); }
  function rotuloDe(b){
    var l=CFG.rotulo ? b.querySelector(CFG.rotulo) : null;
    if(l) return limparIds(l.innerHTML);
    var c=b.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('.ico,.side-ico,.d-ico,.chevron,.nav-badge,.cnt,.d-dot,.lab-m'), function(x){ x.remove(); });
    return limparIds(c.innerHTML).trim();
  }
  function classesDe(b){ return Array.prototype.filter.call(b.classList, function(c){ return BASES.indexOf(c)<0; }).join(' '); }
  function novoItem(o, base, html){
    var c=D.createElement('button'); c.type='button'; c.className=base+' '+classesDe(o); c.innerHTML=html;
    c.addEventListener('click', function(e){ e.preventDefault(); fecharListas(); o.click(); });
    return c;
  }
  function montarBarra(){
    if(CFG.semBarra || EMBUTIDO) return;
    side=D.querySelector(CFG.lateral); if(!side) return;
    var orig=Array.prototype.slice.call(side.querySelectorAll(CFG.botoes));
    if(!orig.length) return;
    side.setAttribute('data-mc-lateral','1');
    var porP={}; orig.forEach(function(b,i){ porP[chaveDe(b,i)]=b; });
    var grupos=CFG.grupos || window.MC_MENU_GRUPOS;     /* lido só agora: o app pode definir depois de carregar este arquivo */
    if(!grupos){
      var ps=orig.map(function(b,i){ return chaveDe(b,i); });
      grupos = ps.length<=6 ? ps.map(function(p){ return { ps:[p] }; })
             : ps.slice(0,4).map(function(p){ return { ps:[p] }; }).concat([{ nome:'Mais', ps:ps.slice(4) }]);
    }
    var cap=side.querySelector('.brand-cap,.d-cap'), capTxt=cap?cap.textContent.trim():'';
    var hd=D.createElement('header'); hd.className='mtopo'; hd.id='mtopo';
    hd.innerHTML='<div class="mtopo-in">'
      +'<div class="mtopo-marca" title="Voltar para a lista de apps"><div class="mtopo-logo brand-logo-box"></div>'+(capTxt?'<span class="mtopo-cap"></span>':'')+'</div>'
      +'<div class="mtopo-nav" id="mtopoNav"></div>'
      +'<div class="mtopo-dir">'
      +  '<button class="mtopo-lua" id="mtopoLua" onclick="toggleTema()" title="Modo escuro">☾</button>'
      +  '<div class="mgrupo" id="mtopoUserG"><button class="uav mtopo-av" id="mtopoAv" onclick="mcAbrir(event,\'mtopoUserG\')" title="Conta e paleta">?</button>'
      +    '<div class="mdrop mdrop-dir"><div class="mtopo-quem"><b id="mtopoNome">—</b><small id="mtopoPapel">—</small></div>'
      +      '<div class="paleta-lab" style="margin:8px 8px 6px">Paleta</div><div class="paleta-row" style="padding:0 8px 8px">'+bolinhas()+'</div>'
      +      '<button class="navbtn" onclick="setMenuTopo(false)"><span class="side-ico">▥</span><span class="lbl">Voltar ao menu lateral</span></button>'
      +      '<button class="navbtn" id="mtopoSair"><span class="side-ico">⎋</span><span class="lbl">Sair</span></button>'
      +  '</div></div>'
      +'</div></div>';
    if(capTxt) hd.querySelector('.mtopo-cap').textContent=capTxt;
    hd.querySelector('#mtopoSair').addEventListener('click', function(){ var f=window[CFG.sair]; if(typeof f==='function') f(); });
    hd.querySelector('.mtopo-marca').addEventListener('click', function(){ location.href='https://monte-castelo-ind.github.io/'; });
    var nav=hd.querySelector('#mtopoNav');
    grupos.forEach(function(g){
      var bs=(g.ps||[]).map(function(p){ return porP[p]; }).filter(Boolean);
      if(!bs.length) return;
      if(!g.nome){
        bs.forEach(function(o){
          var c=novoItem(o, 'mlink', rotuloDe(o));
          nav.appendChild(c); mapa.push({ clone:c, orig:o, solto:true });
        });
        return;
      }
      var gr=D.createElement('div'); gr.className='mgrupo mc-grupo'; gr.id='mcG'+mapa.length;
      gr.innerHTML='<button class="mlink" onclick="mcAbrir(event,\''+gr.id+'\')"></button><div class="mdrop"></div>';
      gr.querySelector('.mlink').innerHTML=g.nome.replace(/[<>&]/g,'')+' <span class="mcar">▾</span>';
      var dr=gr.querySelector('.mdrop');
      bs.forEach(function(o){
        var ic=o.querySelector('.side-ico,.ico,.d-ico');
        var c=novoItem(o, 'navbtn', (ic?'<span class="side-ico">'+limparIds(ic.innerHTML)+'</span>':'')+'<span class="lbl">'+rotuloDe(o)+'</span>');
        dr.appendChild(c); mapa.push({ clone:c, orig:o, grupo:gr });
      });
      nav.appendChild(gr);
    });
    /* a barra entra logo antes do bloco que contém o menu lateral (.shell),
       que fica dentro da área que só aparece depois do login */
    /* A barra fica DENTRO da área que só aparece depois do login:
       - molde da Logística (.shell): logo antes da .shell;
       - menu e conteúdo lado a lado (flex em linha): primeira coisa dentro do
         bloco, que passa a quebrar linha para a barra ocupar a largura toda;
       - nos outros casos: primeira coisa dentro do bloco. */
    var bloco=side.parentNode;
    if(bloco.classList.contains('shell') && bloco.parentNode) bloco.parentNode.insertBefore(hd, bloco);
    else {
      bloco.classList.add('mc-com-barra');       /* só tem efeito se o bloco for flex (pode estar escondido antes do login) */
      bloco.insertBefore(hd, bloco.firstChild);
    }
    if(window.MutationObserver){
      var t=null, agendar=function(){ clearTimeout(t); t=setTimeout(sincronizar, 60); };
      new MutationObserver(agendar).observe(side, { attributes:true, childList:true, subtree:true, characterData:true });
      [CFG.nome,CFG.papel,CFG.avatar].forEach(function(sel){ var e=D.querySelector(sel); if(e) new MutationObserver(agendar).observe(e,{ childList:true, characterData:true, subtree:true }); });
    }
    sincronizar();
  }
  /* copia do menu lateral: visibilidade, tela ativa, contadores; esconde grupo vazio */
  function sincronizar(){
    mapa.forEach(function(m){
      var o=m.orig, c=m.clone;
      c.className=(m.solto?'mlink':'navbtn')+' '+classesDe(o);       /* mesmas classes de permissão do original */
      c.classList.toggle('on', o.classList.contains(CFG.ativo));
      c.style.display=(o.style.display==='none' || o.hidden) ? 'none' : '';
    });
    D.querySelectorAll('#mtopoNav .mc-grupo').forEach(function(g){
      var its=mapa.filter(function(m){ return m.grupo===g; });
      var vis=its.filter(function(m){ return getComputedStyle(m.clone).display!=='none'; });
      g.style.display=vis.length?'':'none';
      g.querySelector('.mlink').classList.toggle('on', vis.some(function(m){ return m.orig.classList.contains(CFG.ativo); }));
    });
    var av=D.querySelector(CFG.avatar), n=D.querySelector(CFG.nome), r=D.querySelector(CFG.papel);
    var a2=D.getElementById('mtopoAv'); if(a2 && av) a2.textContent=av.textContent;
    var n2=D.getElementById('mtopoNome'); if(n2 && n) n2.textContent=n.textContent;
    var r2=D.getElementById('mtopoPapel'); if(r2) r2.textContent=r?r.textContent:'';
    ajustarLogo();
  }
  /* logo da barra: se o app não usa o desenho padrão (.brand-logo-box), copia o
     do próprio menu lateral (.brand, .d-brand…), na versão do tema atual */
  function ajustarLogo(){
    var l=D.querySelector('.mtopo .mtopo-logo'); if(!l || !side) return;
    l.style.backgroundImage='';
    if(getComputedStyle(l).backgroundImage!=='none') return;
    var o=side.querySelector('.brand-logo-box, .brand, .d-brand, .brand-logo-img'); if(!o) return;
    var img = o.tagName==='IMG' ? 'url("'+o.src+'")' : getComputedStyle(o).backgroundImage;
    if(img && img!=='none'){ l.style.backgroundImage=img; l.style.backgroundRepeat='no-repeat'; l.style.backgroundSize='contain'; }
  }
  function fecharListas(){ D.querySelectorAll('.mgrupo.aberto').forEach(function(x){ x.classList.remove('aberto'); }); }
  window.mcAbrir=function(ev,id){
    ev.stopPropagation(); var g=D.getElementById(id); if(!g) return;
    var abre=!g.classList.contains('aberto'); fecharListas(); if(abre) g.classList.add('aberto');
  };
  D.addEventListener('click', function(e){
    if(!e.target.closest || !e.target.closest('.mdrop') || e.target.closest('.navbtn')) fecharListas();
  });

  /* ---- 5. quando a página termina de carregar ---- */
  function iniciar(){
    /* o estilo compartilhado vai para o fim do <head>: nos empates com o estilo
       do próprio app (que vem depois na página), quem vem por último ganha */
    var est=D.getElementById('mc-ui-css'); if(est && D.head) D.head.appendChild(est);
    instalarFuncoes();                          /* por cima das funções de tema de cada app */
    var s=D.querySelector(CFG.lateral);
    if(s && !EMBUTIDO) prepararLateral(s);
    montarBarra();
    aplicarModo(modoGuardado());
  }
  if(D.readyState==='loading') D.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
