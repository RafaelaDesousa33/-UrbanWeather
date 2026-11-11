const $ = (id) => document.getElementById(id);
const historico = [];
const rotulos = [];
let grafico;

function desenharGrafico() {
  if (grafico) grafico.destroy();
  grafico = new Chart($("temperatureChart"), {
    type: "line",
    data: { labels: rotulos, datasets: [{
      label: "Temperatura (°C)", data: historico,
      borderColor: "#65c7ff", backgroundColor: "rgba(101,199,255,.15)",
      fill: true, tension: .35, pointRadius: 3
    }]},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#dce7fa" } } },
      scales: {
        x: { ticks: { color: "#a8b4cc" }, grid: { color: "rgba(168,180,204,.10)" } },
        y: { ticks: { color: "#a8b4cc" }, grid: { color: "rgba(168,180,204,.10)" } }
      }
    }
  });
}

function mostrarLeitura(r) {
  $("temperature").innerHTML = `${Number(r.temperature).toFixed(1).replace(".", ",")} <small>°C</small>`;
  $("humidity").innerHTML = `${Number(r.humidity).toFixed(0)} <small>%</small>`;
  $("pressure").innerHTML = `${Number(r.pressure).toFixed(0)} <small>hPa</small>`;
  $("air").textContent = r.air_quality || "Não classificada";
  $("light").innerHTML = `${Number(r.light).toFixed(0)} <small>lux</small>`;
  $("rain").innerHTML = `${Number(r.rain_mm).toFixed(1).replace(".", ",")} <small>mm</small>`;

  const dataHora = r.created_at ? new Date(r.created_at).toLocaleString("pt-BR") : new Date().toLocaleString("pt-BR");

  $("lastUpdate").textContent = `Última leitura: ${dataHora} | Origem: ${r.source || "não informada"}`;

  historico.push(Number(r.temperature));
  rotulos.push(new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}));

  if (historico.length > 10) {
    historico.shift();
    rotulos.shift();
  }

  desenharGrafico();
}

async function carregarUltimaLeitura() {
  try {
    const resposta = await fetch("/api/readings/latest");
    if (!resposta.ok) throw new Error("API indisponível");

    const dados = await resposta.json();

    if (dados && dados.id) mostrarLeitura(dados);
    else $("lastUpdate").textContent = "Backend conectado. Ainda não existem leituras salvas.";

  } catch (erro) {
    $("lastUpdate").textContent = "Backend não conectado. Inicie o servidor local para carregar dados.";
  }
}

async function gerarLeitura() {
  try {
    const resposta = await fetch("/api/simulate", {method:"POST"});
    if (!resposta.ok) throw new Error("Falha na simulação");

    const dados = await resposta.json();
    mostrarLeitura(dados);

  } catch (erro) {
    // Alternativa de interface: continua demonstrando a tela, mas sem persistência.
    const exemplo = {
      temperature: 20 + Math.random()*12,
      humidity: 40 + Math.random()*45,
      pressure: 995 + Math.random()*30,
      air_quality: ["Boa","Moderada","Atenção"][Math.floor(Math.random()*3)],
      light: 100 + Math.random()*1400,
      rain_mm: Math.random()*8,
      source: "simulação local",
      created_at: new Date().toISOString()
    };

    mostrarLeitura(exemplo);
    $("lastUpdate").textContent += " (sem persistência no servidor)";
  }
}

$("updateBtn").addEventListener("click", gerarLeitura);

carregarUltimaLeitura();