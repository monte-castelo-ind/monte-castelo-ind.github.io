/* ===== Script compartilhado da suíte Monte Castelo =====
   Todos os apps carregam este arquivo. Ele faz três coisas:
   1. coloca o ícone da Monte Castelo na aba e na tela inicial;
   2. mostra o botão "⌂ Apps" quando o app está aberto pelo ícone do celular;
   3. avisa quando saiu uma versão nova do app aberto, com botão Atualizar.
   Por morar num lugar só, trocar o ícone ou o botão é mexer só aqui e nas
   imagens da raiz — nenhum app precisa ser alterado. */

/* ---- 1. ícone ----
   Roda sempre, antes de qualquer verificação do botão. Não sobrescreve um
   app que tenha definido o próprio ícone. O ?v= força o navegador a trocar
   o ícone guardado em cache: ao mudar as imagens, suba o número. */
(function(){
  var B='https://monte-castelo-ind.github.io/', V='?v=5';
  var head=document.head || document.getElementsByTagName('head')[0];
  if(!head) return;
  function poe(rel, arquivo, tam, tipo){
    if(document.querySelector('link[rel~="'+rel+'"]')) return;
    var l=document.createElement('link');
    l.setAttribute('rel', rel);
    l.setAttribute('href', B+arquivo+V);
    if(tam)  l.setAttribute('sizes', tam);
    if(tipo) l.setAttribute('type', tipo);
    head.appendChild(l);
  }
  poe('icon', 'favicon-32.png', '32x32', 'image/png');
  poe('apple-touch-icon', 'apple-touch-icon.png', '180x180');
})();

/* ---- 2. botão ---- */
/* Botão "⌂ Apps" para voltar à lista quando o app está aberto pelo ícone da
   tela inicial. Nesse modo (standalone) não há barra de endereço nem botão
   voltar — no iPhone a pessoa entra num app e fica presa nele.
   No navegador comum não aparece nada.

   Uso em cada app, antes do </body>:
   <script src="https://monte-castelo-ind.github.io/voltar.js"></script> */
(function(){
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
                   || window.navigator.standalone === true;
  if(!standalone) return;

  /* Dentro de iframe (a Gestão embute outros apps) o botão ficaria por cima
     da tela embutida. Só o app de fora mostra. */
  try{ if(window.self !== window.top) return; }catch(e){ return; }

  /* Só em tela de toque. No computador a janela de app do Chrome já tem seta
     de voltar, e o canto esquerdo embaixo é onde fica o Sair da sidebar. */
  if(!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) return;

  /* Na própria lista não faz sentido. /hub/ só redireciona, mas por garantia. */
  var p = location.pathname;
  if(/^\/(index\.html)?$/.test(p) || /^\/hub\/?(index\.html)?$/.test(p)) return;

  function montar(){
    if(document.getElementById('mc-voltar-hub')) return;
    var a=document.createElement('a');
    a.id='mc-voltar-hub';
    a.href='https://monte-castelo-ind.github.io/';
    a.setAttribute('aria-label','Voltar para os apps');
    a.innerHTML='<span style="font-size:15px;line-height:1">⌂</span><span>Apps</span>';
    a.style.cssText='position:fixed;z-index:2147483000;left:12px;'
      +'bottom:calc(14px + env(safe-area-inset-bottom, 0px));'
      +'display:flex;align-items:center;gap:6px;padding:9px 14px;border-radius:22px;'
      +'background:rgba(15,17,26,.88);color:#e7e9f0;border:1px solid rgba(255,255,255,.14);'
      +'font:600 13px Archivo,system-ui,sans-serif;text-decoration:none;'
      +'box-shadow:0 6px 20px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)';
    document.body.appendChild(a);
  }
  if(document.body) montar(); else document.addEventListener('DOMContentLoaded', montar);
})();

/* ---- 3. aviso de versão nova ----
   O problema: quem deixa o app aberto (no celular ele fica dias em segundo
   plano) continua na versão de quando abriu. Depois de uma publicação, vê
   tela velha, não acha botão novo — e toma permission-denied quando a regra
   do Firestore mudou junto.
   Como descobre, sem cada app precisar de número de versão:
   - document.lastModified é a data da página QUE ESTÁ ABERTA (vem do
     cabeçalho Last-Modified de quando ela foi carregada, inclusive do cache);
   - uma consulta HEAD sem cache devolve a data da página publicada AGORA.
     Publicada mais nova que a aberta → mostra a faixa.
   - reserva: se o ETag mudar entre duas consultas desta mesma aba, também.
   Quando consulta: 8 s depois de abrir, a cada 10 min, e ao voltar para o
   app/aba. É um HEAD pequeno no GitHub — nada no Firebase.
   O GitHub Pages republica o repositório inteiro a cada envio, então subir
   outro arquivo do mesmo repositório (ex.: painel.html no predial) também
   acende o aviso. Atualizar nesse caso não faz mal nenhum.
   Nunca recarrega sozinho: a pessoa pode estar no meio de um formulário. */
(function(){
  try{ if(window.self !== window.top) return; }catch(e){ return; }   /* iframe da Gestão: quem avisa é o app de fora */
  if(!window.fetch || location.protocol !== 'https:') return;
  var aberta = Date.parse(document.lastModified);
  var etag0 = null, mostrando = false, adiadoAte = 0;
  var INTERVALO = 10*60*1000, FOLGA = 90*1000, ADIAR = 30*60*1000;
  function endereco(){ return location.href.split('#')[0]; }

  function checar(){
    if(mostrando || document.hidden || Date.now() < adiadoAte) return;
    fetch(endereco(), { method:'HEAD', cache:'no-store', credentials:'same-origin' })
      .then(function(r){
        if(!r.ok) return;
        var lm = Date.parse(r.headers.get('last-modified') || ''), et = r.headers.get('etag') || '';
        var nova = false;
        if(isFinite(lm) && isFinite(aberta) && lm > aberta + FOLGA) nova = true;
        if(et){ if(etag0 === null) etag0 = et; else if(et !== etag0) nova = true; }
        if(nova) mostrar();
      })
      .catch(function(){ /* sem internet: tenta na próxima */ });
  }

  function mostrar(){
    if(mostrando || document.getElementById('mc-versao-nova')) return;
    mostrando = true;
    var d = document.createElement('div');
    d.id = 'mc-versao-nova';
    d.setAttribute('role', 'status');
    d.style.cssText = 'position:fixed;z-index:2147483001;left:50%;transform:translateX(-50%);'
      + 'top:calc(10px + env(safe-area-inset-top, 0px));width:max-content;max-width:calc(100% - 20px);box-sizing:border-box;'
      + 'display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;padding:10px 10px 10px 16px;border-radius:12px;'
      + 'background:rgba(15,17,26,.96);color:#e7e9f0;border:1px solid rgba(255,255,255,.16);'
      + 'font:500 13.5px/1.35 Archivo,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.45);'
      + '-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)';
    d.innerHTML = '<span style="flex:1 1 200px"><b style="font-weight:700">🔄 Saiu uma versão nova deste app.</b>'
      + '<br><span style="color:#a3a9bb;font-size:12px">Termine o que estiver fazendo e atualize.</span></span>'
      + '<span style="display:flex;gap:6px;margin-left:auto">'
      + '<button type="button" id="mc-vn-depois" style="background:transparent;color:#e7e9f0;border:1px solid rgba(255,255,255,.2);'
      +   'border-radius:8px;padding:8px 12px;font:600 13px Archivo,system-ui,sans-serif;cursor:pointer">Depois</button>'
      + '<button type="button" id="mc-vn-ok" style="background:#2fae7d;color:#fff;border:none;border-radius:8px;'
      +   'padding:8px 14px;font:700 13px Archivo,system-ui,sans-serif;cursor:pointer">Atualizar</button></span>';
    (document.body || document.documentElement).appendChild(d);
    document.getElementById('mc-vn-ok').onclick = function(){
      this.disabled = true; this.textContent = 'Atualizando…';
      /* busca a página nova para dentro do cache antes de recarregar,
         senão o celular pode reabrir a mesma versão guardada */
      fetch(endereco(), { cache:'reload', credentials:'same-origin' })
        .catch(function(){})
        .then(function(){ location.reload(); });
    };
    document.getElementById('mc-vn-depois').onclick = function(){
      d.parentNode && d.parentNode.removeChild(d);
      mostrando = false;
      adiadoAte = Date.now() + ADIAR;          /* volta a lembrar em 30 min */
    };
  }

  setTimeout(checar, 8000);
  setInterval(checar, INTERVALO);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) checar(); });
  window.addEventListener('pageshow', function(e){ if(e.persisted) checar(); });   /* voltou pelo botão voltar */
  window.mcChecarVersao = checar;               /* para teste no console */
})();
