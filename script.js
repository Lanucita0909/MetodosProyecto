let graficoC, graficoPie;

function generarTablaQuejas() {
  const cantidad = parseInt(document.getElementById('cantidad').value);
  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Por favor ingresa una cantidad válida de quejas.");
    return;
  }

  const container = document.getElementById('tabla-container');
  container.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'table table-striped';

  // Cabecera
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Fecha</th>
        <th>Cantidad de errores</th>
      </tr>
    </thead>
    <tbody>
      ${Array.from({length: cantidad}, (_, i) =>
        `<tr>
          <td>${i+1}</td>
          <td><input type="date" class="form-control fecha-input"></td>
          <td><input type="number" class="form-control insuficiencia-input" min="0" step="1" oninput="validarNumero(this)" placeholder="Ej. 5"></td>
        </tr>`
      ).join('')}
    </tbody>
  `;

  container.appendChild(table);
}

function calcularGraficoC() {
  // Captura los valores numéricos
  const tiempos = Array.from(document.querySelectorAll('.insuficiencia-input'))
    .map(i => parseInt(i.value))
    .filter(n => !isNaN(n));

  if (tiempos.length === 0) {
    alert("Debes ingresar al menos un 'Tiempo de Atención' válido.");
    return;
  }

  const n = tiempos.length;
  const promedio = tiempos.reduce((a, b) => a + b, 0) / n;
  const LSC = promedio + 3 * Math.sqrt(promedio);
  const LIC = Math.max(0, promedio - 3 * Math.sqrt(promedio));

  // Mostrar alerta con promedio
  const alertProm = document.getElementById('alert-promedio');
  document.getElementById('promedio-text').textContent = promedio.toFixed(2);
  alertProm.classList.remove('d-none');

  // --- Gráfico Tipo C (línea) ---
  const ctxC = document.getElementById('graficoC').getContext('2d');
  if (graficoC) graficoC.destroy();
  graficoC = new Chart(ctxC, {
    type: 'line',
    data: {
      labels: tiempos.map((_, i) => `Muestra ${i+1}`),
      datasets: [
        {
          label: 'Quejas Presentadas',
          data: tiempos,
          borderColor: '#007bff',
          fill: false,
          tension: 0.3
        },
        {
          label: 'LSC',
          data: Array(n).fill(LSC),
          borderColor: 'red',
          borderDash: [5,5],
          fill: false
        },
        {
          label: 'LIC',
          data: Array(n).fill(LIC),
          borderColor: 'green',
          borderDash: [5,5],
          fill: false
        },
        {
          label: 'Promedio',
          data: Array(n).fill(promedio),
          borderColor: 'orange',
          borderDash: [2,2],
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Gráfico Tipo C - Control de Quejas' },
        legend: { position: 'top' }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Días' } },
        x: { title: { display: true, text: 'Muestra' } }
      }
    }
  });

  // --- Gráfico de Pastel (pie) ---
  const total = tiempos.reduce((a,b)=>a+b,0);
  const labelsPie = tiempos.map((t,i) => `Muestra ${i+1}`);
  const dataPie = tiempos.map(t => parseFloat(((t/total)*100).toFixed(1)));

  const ctxPie = document.getElementById('graficoPie').getContext('2d');
  if (graficoPie) graficoPie.destroy();
  graficoPie = new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: labelsPie,
      datasets: [{
        data: dataPie,
        // Chart.js asigna colores automáticamente si no se indican
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Porcentaje de Cada Categoria' },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.parsed}%`
          }
        },
        legend: { position: 'right' }
      }
    }
  });
}
function validarNumero(input) {
  // Eliminar puntos, comas y negativos inmediatamente
  input.value = input.value
    .replace(/[^\d]/g, '')       // Solo permite dígitos
    .replace(/^0+(?=\d)/, '');   // Elimina ceros al inicio si hay más dígitos
}
