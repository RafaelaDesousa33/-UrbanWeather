const $ = (id) => document.getElementById(id);
const history = [];
const labels = [];
let chart;

function drawChart() {
  if (chart) chart.destroy();
  chart = new Chart($("temperatureChart"), {
    type: "line",
    data: { labels, datasets: [{
      label: "Temperatura (°C)", data: history,
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
function showReading(r) {
  $("temperature").innerHTML = `${Number(r.temperature).toFixed(1).replace(".", ",")} <small>°C</small>`;
  $("humidity").innerHTML = `${Number(r.humidity).toFixed(0)} <small>%</small>`;
  $("pressure").innerHTML = `${Number(r.pressure).toFixed(0)} <small>hPa</small>`;
  $("air").textContent = r.air_quality || "Não classificada";
  $("light").innerHTML = `${Number(r.light).toFixed(0)} <small>lux</small>`;
  $("rain").innerHTML = `${Number(r.rain_mm).toFixed(1).replace(".", ",")} <small>mm</small>`;
  const dt = r.created_at ? new Date(r.created_at).toLocaleString("pt-BR") : new Date().toLocaleString("pt-BR");
  $("lastUpdate").textContent = `Última leitura: ${dt} | Origem: ${r.source || "não informada"}`;
  history.push(Number(r.temperature)); labels.push(new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}));
  if (history.length > 10) { history.shift(); labels.shift(); }
  drawChart();
}
async function loadLatest() {
  try {
    const response = await fetch("/api/readings/latest");
    if (!response.ok) throw new Error("API indisponível");
    const data = await response.json();
    if (data && data.id) showReading(data);
    else $("lastUpdate").textContent = "Backend conectado. Ainda não existem leituras salvas.";
  } catch (error) {
    $("lastUpdate").textContent = "Backend não conectado. Inicie o servidor local para carregar dados.";
  }
}
async function generateReading() {
  try {
    const response = await fetch("/api/simulate", {method:"POST"});
    if (!response.ok) throw new Error("Falha na simulação");
    const data = await response.json();
    showReading(data);
  } catch (error) {
    // Fallback de interface: continua demonstrando a tela, mas sem persistência.
    const sample = {
      temperature: 20 + Math.random()*12, humidity: 40 + Math.random()*45,
      pressure: 995 + Math.random()*30, air_quality: ["Boa","Moderada","Atenção"][Math.floor(Math.random()*3)],
      light: 100 + Math.random()*1400, rain_mm: Math.random()*8,
      source: "simulação local", created_at: new Date().toISOString()
    };
    showReading(sample);
    $("lastUpdate").textContent += " (sem persistência no servidor)";
  }
}
$("updateBtn").addEventListener("click", generateReading);
loadLatest();
