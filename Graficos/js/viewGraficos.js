import { calcularGraficoC } from './graficoFunciones.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnGenerarGrafico').addEventListener('click', () => {
        const fechaInicio = document.getElementById('fecha_inicio').value;
        const fechaFin = document.getElementById('fecha_fin').value;

        if (!fechaInicio || !fechaFin) {
            alert('Debes seleccionar ambas fechas.');
            return;
        }

        calcularGraficoC(fechaInicio, fechaFin);
    });
});