const URL_API = 'http://localhost/ApiMetodos/quejas/';
const calcularAPI = 'api_calculo_c.php';

let grafico = null;

async function calcularGrafico(fechaInicio, fechaFin) {
    try {
        const response = await fetch(`${URL_API}${calcularAPI}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            })
        });

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error al calcular gráfico:', error);
    }
}

function dibujarGrafico(data) {
    const ctx = document.getElementById('graficoC').getContext('2d');

    if (grafico) {
        grafico.destroy();
    }

    grafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['LCI', 'Promedio (𝑐̅)', 'LCS'],
            datasets: [{
                label: 'Quejas por Día',
                data: [data.LCI, data.c_promedio, data.LCS],
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                tension: 0.3,
                pointBackgroundColor: ['green', 'yellow', 'red'],
                pointBorderWidth: 3,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

export { calcularGrafico, dibujarGrafico };
