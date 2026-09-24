/* ATENÇÃO — escopo: este arquivo agora mora na RAIZ do domínio, então ele
   controla todos os apps (autorizacao/, logistica/, manutencao/...). Hoje
   isso não muda nada porque o fetch só repassa para a rede. Se algum dia
   alguém colocar cache aqui, vai cachear TODOS os apps — e aí uma correção
   subida no main pode não aparecer para quem está com a versão velha. */
/* Service worker mínimo: existe só para o Android oferecer "Instalar app".
   Não guarda nada em cache de propósito — toda atualização subida no main
   aparece na hora, sem ninguém ficar preso numa versão antiga. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(){ /* deixa a rede responder */ });
