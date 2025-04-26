import { calcularGrafico, dibujarGrafico } from './graficoFunciones.js';

document.addEventListener('DOMContentLoaded', () => {
    const botonGenerar = document.getElementById('btnGenerarGrafico');

    botonGenerar.addEventListener('click', async () => {
        const fechaInicio = document.getElementById('fecha_inicio').value;
        const fechaFin = document.getElementById('fecha_fin').value;

        if (!fechaInicio || !fechaFin) {
            alert('Por favor selecciona ambas fechas.');
            return;
        }

        const data = await calcularGrafico(fechaInicio, fechaFin);

        if (data && !data.message) {
            dibujarGrafico(data);
        } else if (data.message) {
            alert(data.message);
        }
    });
});
