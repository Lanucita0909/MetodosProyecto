
function calcularGraficoC() {
    const datosInput = document.getElementById('quejas').value;
    const quejas = datosInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));

    const n = quejas.length;
    const promedio = quejas.reduce((a, b) => a + b, 0) / n;
    const LSC = promedio + 3 * Math.sqrt(promedio);
    const LIC = Math.max(0, promedio - 3 * Math.sqrt(promedio));

    let resultadosHTML = `<p><strong>Promedio (𝑐̄):</strong> ${promedio.toFixed(2)}</p>`;
    resultadosHTML += `<p><strong>Límite Superior de Control (LSC):</strong> ${LSC.toFixed(2)}</p>`;
    resultadosHTML += `<p><strong>Límite Inferior de Control (LIC):</strong> ${LIC.toFixed(2)}</p>`;
    document.getElementById('resultados').innerHTML = resultadosHTML;

    const ctx = document.getElementById('graficoC').getContext('2d');
    if (window.grafico) window.grafico.destroy();
    window.grafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: quejas.map((_, i) => i + 1),
            datasets: [{
                label: 'Quejas por día',
                data: quejas,
                fill: false,
                borderWidth: 2
            },
            {
                label: 'LSC',
                data: new Array(n).fill(LSC),
                borderColor: 'red',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            },
            {
                label: 'LIC',
                data: new Array(n).fill(LIC),
                borderColor: 'green',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            },
            {
                label: 'Promedio',
                data: new Array(n).fill(promedio),
                borderColor: 'blue',
                borderDash: [2, 2],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
