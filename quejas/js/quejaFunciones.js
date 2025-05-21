// quejaFunciones.js
const form = document.getElementById("formQueja");
const mensaje = document.getElementById("mensaje");
const apiBase = "http://localhost/metodosApi/ApiMetodos/quejas";
let chartC = null;
let chartPie = null;
let promedioAlert = document.getElementById("alert-promedio");

// 1) Registro de nueva queja
form.addEventListener("submit", async e => {
    e.preventDefault();
    mensaje.className = "";

    try {
        // Construir JSON para envío application/json
        const jsonData = {
            atendido_por: form.querySelector('#atendido_por').value,
            descripcion: form.querySelector('#descripcion').value,
            categoria: form.querySelector('#categoria').value,
            puntuacion: form.querySelector('#puntuacion').value,
            fecha_evento: form.querySelector('#fecha_evento').value,
            costo_viaje: form.querySelector('#costo_viaje').value
        };

        // Mostrar mensaje de carga
        mensaje.innerText = '⌛ Enviando queja...';
        mensaje.classList.add('text-info');

        const res = await fetch(`${apiBase}/registrar.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors', // Explícitamente indicar modo CORS
            credentials: 'omit', // No enviar cookies para simplificar
            body: JSON.stringify(jsonData)
        });
        
        if (!res.ok) {
            const errorData = await res.text();
            console.error('Respuesta del servidor:', errorData);
            throw new Error(`HTTP ${res.status}: ${errorData}`);
        }
        
        const data = await res.json();
        console.log('Respuesta exitosa:', data);

        mensaje.innerText = '✅ Queja registrada correctamente.';
        mensaje.classList.add('text-success');
        form.reset();
        document.getElementById('puntuacion_valor').innerText = 'Nivel de insatisfacción: 5';

        // Refrescar gráficos
        await cargarGraficos();
    } catch (err) {
        console.error('Error al registrar:', err);
        mensaje.innerText = `❌ Error al registrar la queja: ${err.message}`;
        mensaje.classList.add('text-danger');
    }
});

// Actualizar texto del nivel de insatisfacción al cambiar el slider
document.getElementById('puntuacion').addEventListener('input', function() {
    document.getElementById('puntuacion_valor').innerText = `Nivel de insatisfacción: ${this.value}`;
});

// 2) Carga datos y genera gráficos
async function cargarGraficos() {
    try {
        const res = await fetch(`${apiBase}/listar.php`, {
            mode: 'cors', // Explícitamente indicar modo CORS
            credentials: 'omit', // No enviar cookies para simplificar
        });
        
        if (!res.ok) {
            console.error('Error en la respuesta:', await res.text());
            throw new Error(`HTTP ${res.status}`);
        }
        
        const { records } = await res.json();
        
        if (!records || records.length === 0) {
            console.log('No hay registros para mostrar');
            promedioAlert.innerHTML = '<strong>No hay datos disponibles aún.</strong>';
            promedioAlert.classList.remove('d-none');
            return;
        }

        // Calcular quejas por día
        const quejasPorDia = records.reduce((acc, q) => {
            const f = q.fecha_evento;
            acc[f] = (acc[f] || 0) + 1;
            return acc;
        }, {});
        const fechas = Object.keys(quejasPorDia).sort();
        const conteos = fechas.map(d => quejasPorDia[d]);

        // Estadísticas C
        const cBar = conteos.reduce((a,b) => a + b, 0) / conteos.length;
        
        // Calcular LCL sin forzar mínimo de 0 para mostrar el valor teórico
        const LCL_teorico = cBar - 3 * Math.sqrt(cBar);
        // Para el gráfico sí se usa el valor práctico (mínimo 0)
        const LCL_grafico = Math.max(0, LCL_teorico);
        const UCL = cBar + 3 * Math.sqrt(cBar);
        const total = conteos.reduce((a,b) => a + b, 0);

        // Mostrar ambos valores de LCL
        promedioAlert.innerHTML = `
        
            <strong>Promedio diario (c̄):</strong> ${cBar.toFixed(2)}<br>
            <strong>LIC teórico:</strong> ${LCL_teorico.toFixed(2)} <br>
            <strong>LIC RENDER:</strong> ${LCL_grafico.toFixed(2)} <br>
            <strong>LSC:</strong> ${UCL.toFixed(2)}<br>
            <strong>Total de quejas:</strong> ${total}
        `;
        promedioAlert.classList.remove('d-none');

        // Destruir gráficos previos
        if (chartC) chartC.destroy();
        if (chartPie) chartPie.destroy();

        // Gráfico de Control C
        const ctxC = document.getElementById('graficoC').getContext('2d');
        chartC = new Chart(ctxC, {
            type: 'line',
            data: {
                labels: fechas,
                datasets: [
                    { label: '# Quejas/día', data: conteos, fill:false, borderColor:'rgba(75,192,192,1)', tension:0.2, pointRadius:4 },
                    { label: 'LIC', data: fechas.map(()=>LCL_grafico), borderDash:[5,5], fill:false, borderColor:'rgba(255,99,132,1)', pointRadius:0 },
                    { label: 'c̄', data: fechas.map(()=>cBar), borderDash:[2,2], fill:false, borderColor:'rgba(54,162,235,1)', pointRadius:0 },
                    { label: 'LSC', data: fechas.map(()=>UCL), borderDash:[5,5], fill:false, borderColor:'rgba(255,206,86,1)', pointRadius:0 }
                ]
            },
            options: {
                responsive:true,
                scales: {
                    y:{ 
                        beginAtZero:false, // Cambiado a false para permitir valores negativos
                        title:{ display:true, text:'Número de Quejas' } 
                    },
                    x:{ title:{ display:true, text:'Fecha' } }
                },
                plugins:{ title:{ display:true, text:'Control C de Quejas Diarias', font:{ size:16 } }, legend:{ position:'bottom' } }
            }
        });

        // Pastel por categoría
        const cat = records.reduce((a,q)=>{ a[q.categoria]=(a[q.categoria]||0)+1; return a; },{});
        const ctxP = document.getElementById('graficoPie').getContext('2d');
        chartPie = new Chart(ctxP, { 
            type:'pie', 
            data:{ 
                labels:Object.keys(cat), 
                datasets:[{ 
                    data:Object.values(cat), 
                    backgroundColor:['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40'], 
                    borderWidth:1 
                }] 
            }, 
            options:{ 
                responsive:true, 
                plugins:{ 
                    title:{ display:true, text:'Distribución por Categoría', font:{ size:16 } } 
                } 
            } 
        });

        // Tabla de quejas
        generarTablaQuejas(fechas, quejasPorDia);
    } catch(err) {
        console.error('Error cargando gráficos:', err);
        promedioAlert.innerHTML = `<strong>Error al cargar datos:</strong> ${err.message}`;
        promedioAlert.classList.remove('d-none');
    }
}

function generarTablaQuejas(fechas, datos) {
    const cont = document.getElementById('tabla-container');
    const rows = fechas.map(f=>`<tr><td>${f}</td><td>${datos[f]}</td></tr>`).join('');
   cont.innerHTML = `
                    <div class='table-responsive' style="max-height: 300px; overflow-y: auto;">
                        <table class='table table-striped mb-0'>
                        <thead class="table-light">
                            <tr>
                            <th>Fecha</th>
                            <th>Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                        </table>
                    </div>
                    `;

}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Establecer el valor inicial para el texto del nivel de insatisfacción
    const puntuacionInput = document.getElementById('puntuacion');
    if (puntuacionInput) {
        document.getElementById('puntuacion_valor').innerText = `Nivel de insatisfacción: ${puntuacionInput.value}`;
    }
    
    cargarGraficos();
});