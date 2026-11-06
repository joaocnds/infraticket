let tickets = [];
try {
  const dados = JSON.parse(localStorage.getItem("infraTickets") || "[]");
  if (Array.isArray(dados)) tickets = dados.filter(t => t && typeof t.id === "string"
    && ["Aberto", "Em atendimento", "Resolvido"].includes(t.status)
    && ["Hardware", "Rede", "Periféricos", "Acesso"].includes(t.category)
    && ["Baixa", "Média", "Alta", "Crítica"].includes(t.priority));
} catch { /* O armazenamento local pode estar indisponível. */ }

let currentFilter="Todos";
let selectedId=null;

const rules={
Hardware:["notebook","laptop","computador","pc","monitor","teclado","mouse","cpu","desktop","não liga","nao liga","tela"],
Rede:["internet","wi-fi","wifi","vpn","conexão","conexao","cabo de rede","rede","sem internet"],
Periféricos:["impressora","scanner","webcam","projetor","periférico","periferico","microfone","headset"],
Acesso:["senha","login","bloqueado","bloqueio","autenticação","autenticacao","usuário","usuario","mfa"]
};
function norm(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
function classify(title,desc){
 let text=norm(title+" "+desc),scores={};
 for(let c in rules)scores[c]=[...new Set(rules[c].map(norm))].reduce((n,w)=>n+(text.split(/[^a-z0-9]+/).includes(w) || (w.includes(" ") && text.includes(w)) ? 1 : 0),0);
 let category=Object.keys(scores).sort((a,b)=>scores[b]-scores[a])[0];
 if(scores[category]===0)category="Hardware";
 let priority="Baixa";
 if(["servidor","produção parada","producao parada","todos","indisponível","indisponivel","segurança","seguranca","urgente"].some(w=>text.includes(norm(w))))priority="Crítica";
 else if(["hoje","agora","não consigo trabalhar","nao consigo trabalhar","parado","bloqueado","sem acesso"].some(w=>text.includes(norm(w))))priority="Alta";
 else if(["lento","falhando","erro","problema"].some(w=>text.includes(norm(w))))priority="Média";
 return {category,priority}
}
function save(){localStorage.setItem("infraTickets",JSON.stringify(tickets))}
function esc(v=""){return String(v ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

$("#ticketForm").addEventListener("submit",e=>{
 e.preventDefault();
 let nome=$("#nome").value.trim(),email=$("#email").value.trim(),titulo=$("#titulo").value.trim(),descricao=$("#descricao").value.trim();
 if(!nome||!titulo||!descricao){alert("Preencha nome, título e descrição.");return}
 let c=classify(titulo,descricao);
 let t={id:Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),nome,email,titulo,descricao,category:c.category,priority:c.priority,status:"Aberto",date:new Date().toLocaleString("pt-BR")};
 tickets.unshift(t);save();
 $("#userResult").classList.remove("hidden");
 $("#userResult").innerHTML=`<div class="card-head"><div><span class="number">02</span><h2>Chamado enviado com sucesso</h2></div><span class="status ready">✓ Recebido</span></div>
 <p>Seu chamado foi registrado e direcionado automaticamente para <b>Infraestrutura</b>.</p>
 <div class="result-grid"><div class="result-box"><small>Nº do chamado</small><strong>#${esc(t.id)}</strong></div><div class="result-box"><small>Categoria</small><strong>${t.category}</strong></div><div class="result-box"><small>Prioridade</small><strong>${t.priority}</strong></div></div>
 <p style="color:#9aa6b2;font-size:12px">O administrador já pode visualizar este ticket no Painel de Infraestrutura.</p>`;
 e.target.reset();updateAdmin();$("#userResult").scrollIntoView({behavior:"smooth"});
});

function updateStats(){
 $("#total").textContent=tickets.length;
 $("#abertos").textContent=tickets.filter(t=>t.status==="Aberto").length;
 $("#atendimento").textContent=tickets.filter(t=>t.status==="Em atendimento").length;
 $("#resolvidos").textContent=tickets.filter(t=>t.status==="Resolvido").length;
}
function updateAdmin(){
 updateStats();
 let list=tickets.filter(t=>currentFilter==="Todos"||t.status===currentFilter);
 if(!list.length){$("#adminList").innerHTML=`<div class="card"><p style="color:#9aa6b2">Nenhum ticket nesta categoria.</p></div>`;return}
 $("#adminList").innerHTML=list.map(t=>`<div class="ticket-item ${selectedId===t.id?"selected":""}" data-id="${esc(t.id)}">
 <div class="ticket-top"><h3>#${esc(t.id)} — ${esc(t.titulo)}</h3><span class="priority ${t.priority.toLowerCase().replace("í","i").replace("é","e")}">${t.priority}</span></div>
 <p>${esc(t.nome)} • ${esc(t.date)}</p><span class="tag">${t.category}</span><span class="tag">${t.status}</span></div>`).join("");
 document.querySelectorAll(".ticket-item").forEach(el=>el.addEventListener("click",()=>showDetails(el.dataset.id)));
}
function showDetails(id){
 selectedId=id;let t=tickets.find(x=>x.id===id);updateAdmin();
 if(!t)return;
 $("#adminDetails").innerHTML=`<div class="details-header"><div><span class="badge">TICKET #${esc(t.id)}</span><h2 style="margin-top:10px">${esc(t.titulo)}</h2></div></div>
 <div class="detail-block"><small>SOLICITANTE</small><strong>${esc(t.nome)}</strong><p>${esc(t.email||"E-mail não informado")}</p></div>
 <div class="detail-block"><small>DESCRIÇÃO</small><p>${esc(t.descricao)}</p></div>
 <div class="detail-block"><small>TRIAGEM AUTOMÁTICA</small><p><b>Setor:</b> Infraestrutura &nbsp; <b>Categoria:</b> ${t.category} &nbsp; <b>Prioridade:</b> ${t.priority}</p></div>
 <div class="detail-block"><small>ATUALIZAR STATUS</small><select class="select-status" id="statusSelect"><option ${t.status==="Aberto"?"selected":""}>Aberto</option><option ${t.status==="Em atendimento"?"selected":""}>Em atendimento</option><option ${t.status==="Resolvido"?"selected":""}>Resolvido</option></select>
 <button class="primary" id="saveStatus">Salvar alteração</button></div>`;
 $("#saveStatus").addEventListener("click",()=>{t.status=$("#statusSelect").value;save();updateAdmin();showDetails(t.id)});
}
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{currentFilter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");updateAdmin()}));
$("#clearHistory").addEventListener("click",()=>{if(confirm("Apagar todos os tickets deste navegador?")){tickets=[];selectedId=null;save();updateAdmin();$("#adminDetails").innerHTML=`<div class="empty"><div class="empty-icon">⌁</div><h2>Selecione um ticket</h2><p>Os detalhes do chamado aparecerão aqui.</p></div>`}});

function goTo(page){document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));$("#"+page).classList.add("active");document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===page));if(page==="admin")updateAdmin();window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>goTo(b.dataset.page)));
updateAdmin();

function $(s){return document.querySelector(s)}
