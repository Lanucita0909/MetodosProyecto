const apiBase = "https://metodos-metodosapi-es6noa-e36110-145-223-74-28.traefik.me/quejas/";
let chartImpacto = null;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${apiBase}listar.php`);
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
                <td>
                  <button class="btn btn-sm btn-info" onclick="verDetalles('${nombre}')">
                    Ver Detalles
                  </button>
                </td>
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
 // Preparar los datos para múltiples métricas
const datosQuejas = [];
const datosClientes = [];
const datosPerdidas = [];
const datosPromedio = [];

conductores.forEach(nombre => {
  const { quejas, totalCosto } = dataPorConductor[nombre];
  const promedioCosto = totalCosto / quejas;
  const clientesPerdidos = Math.floor(quejas / 3);
  const dineroPerdido = clientesPerdidos * promedioCosto;

  datosQuejas.push(quejas);
  datosClientes.push(clientesPerdidos);
  datosPerdidas.push(dineroPerdido);
  datosPromedio.push(promedioCosto);
});

// Crear gráfico de barras con múltiples datasets
const ctx = document.getElementById("graficoImpacto").getContext("2d");
if (chartImpacto) chartImpacto.destroy();

chartImpacto = new Chart(ctx, {
  type: "bar",
  data: {
    labels: conductores,
    datasets: [
      {
        label: "Quejas",
        data: datosQuejas,
        backgroundColor: "rgba(241, 196, 15, 0.7)"
      },
      {
        label: "Clientes Perdidos",
        data: datosClientes,
        backgroundColor: "rgba(231, 76, 60, 0.7)"
      },
      {
        label: "₡ Perdido Estimado",
        data: datosPerdidas,
        backgroundColor: "rgba(155, 89, 182, 0.7)"
      },
      {
        label: "Costo Promedio",
        data: datosPromedio,
        backgroundColor: "rgba(52, 152, 219, 0.7)"
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Indicadores por Conductor",
        font: { size: 18 }
      },
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Valores"
        }
      },
      x: {
        title: {
          display: true,
          text: "Conductor"
        }
      }
    }
  }
});
  } catch (err) {
    console.error("Error al cargar datos:", err);
    document.getElementById("tablaImpacto").innerHTML = `<div class='alert alert-danger'>Error: ${err.message}</div>`;
  }

  
});
async function verDetalles(nombre) {
  try {
    const res = await fetch(`${apiBase}listarNombre.php?nombre=${encodeURIComponent(nombre)}`);
    const { records } = await res.json();

    if (!records || records.length === 0) {
      document.getElementById("modalDetallesBody").innerHTML = `
        <p class="text-muted">No se encontraron quejas para ${nombre}.</p>`;
    } else {
      const detallesHTML = records.map(q => `
        <div class="border-start border-4 border-warning bg-light p-3 rounded mb-3 shadow-sm">
          <p class="mb-1"><span class="fw-bold ">📅 Fecha del evento:</span> ${q.descripcion.match(/El día (.*?),/)[1]}</p>
          <p class="mb-1"><span class="fw-bold text-secondary">🚕 Conductor:</span> ${nombre}</p>
          <p class="mb-1"><span class="fw-bold text-danger">🚨 Motivo:</span> ${q.descripcion.match(/razón: \*(.*?)\*/)?.[1] || 'No especificado'}</p>
          <p class="mb-1"><span class="fw-bold text-dark">📝 Descripción:</span> ${q.descripcion.match(/La descripción indica: "(.*?)"/)?.[1] || 'Sin descripción'}</p>
          <p class="mb-1"><span class="fw-bold ">😠 Nivel de Insatisfacción:</span> ${q.descripcion.match(/Puntuación: \*\*(.*?)\*\*/)?.[1] || '-'}/10</p>
          <p class="mb-0"><span class="fw-bold text-danger">💰 Costo del viaje:</span> ${q.descripcion.match(/Costo del viaje: \*\*(.*?)\*\*/)?.[1] || '-'}</p>
        </div>
      `).join("");

      document.getElementById("modalDetallesBody").innerHTML = `
        <h5 class="text-primary mb-4">🚕 Detalles para ${nombre}</h5>
        ${detallesHTML}
      `;
    }

    const modal = new bootstrap.Modal(document.getElementById("modalDetalles"));
    modal.show();

  } catch (error) {
    document.getElementById("modalDetallesBody").innerHTML = `
      <p class="text-danger">Error al cargar detalles.</p>`;
    console.error(error);
  }
}

