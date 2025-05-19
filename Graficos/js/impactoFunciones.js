const apiBase = "http://localhost/2025/ApiMetodos/quejas/";
let chartImpacto = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${apiBase}/listar.php`);
    const { records } = await res.json();

    if (!records || records.length === 0) {
      document.getElementById("tablaImpacto").innerHTML = "<div class='alert alert-warning'>No hay datos disponibles.</div>";
      return;
    }

    // Agrupar datos por conductor
    const dataPorConductor = {};
    records.forEach(q => {
      const conductor = q.atendido_por;
      const costo = parseFloat(q.costo_viaje || 0);

      if (!dataPorConductor[conductor]) {
        dataPorConductor[conductor] = { quejas: 0, totalCosto: 0 };
      }

      dataPorConductor[conductor].quejas += 1;
      dataPorConductor[conductor].totalCosto += costo;
    });

    // Calcular métricas
    const conductores = Object.keys(dataPorConductor);
    const perdidasEstimadas = [];
    const tablaHTML = conductores.map(nombre => {
      const { quejas, totalCosto } = dataPorConductor[nombre];
      const promedioCosto = totalCosto / quejas;
      const clientesPerdidos = Math.floor(quejas / 3);
      const dineroPerdido = clientesPerdidos * promedioCosto;

      perdidasEstimadas.push(dineroPerdido);

      return `
        <tr>
          <td>${nombre}</td>
          <td>${quejas}</td>
          <td>₡${promedioCosto.toFixed(2)}</td>
          <td>${clientesPerdidos}</td>
          <td><strong>₡${dineroPerdido.toFixed(2)}</strong></td>
        </tr>`;
    }).join("");

    // Tabla
    document.getElementById("tablaImpacto").innerHTML = `
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Conductor</th>
            <th>Quejas</th>
            <th>Costo Promedio</th>
            <th>Clientes Perdidos</th>
            <th>₡ Perdido Estimado</th>
          </tr>
        </thead>
        <tbody>${tablaHTML}</tbody>
      </table>`;

    // Gráfico
    const ctx = document.getElementById("graficoImpacto").getContext("2d");
    if (chartImpacto) chartImpacto.destroy();

    chartImpacto = new Chart(ctx, {
      type: "bar",
      data: {
        labels: conductores,
        datasets: [{
          label: "₡ Perdido Estimado",
          data: perdidasEstimadas,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Pérdida Estimada por Conductor",
            font: { size: 16 }
          },
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: "₡ Estimado Perdido" }
          },
          x: {
            title: { display: true, text: "Conductor" }
          }
        }
      }
    });

  } catch (err) {
    console.error("Error al cargar datos:", err);
    document.getElementById("tablaImpacto").innerHTML = `<div class='alert alert-danger'>Error: ${err.message}</div>`;
  }
});
