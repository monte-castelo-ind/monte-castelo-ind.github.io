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
