import { QuejaModel } from '../model/quejaModel.js';

const URL_API = 'http://localhost/ApiMetodos/quejas/';
const agregarAPI = 'registrar.php'; 

// ----------------------------------------------------------------------AGREGAR
function crearQueja() {
    const atendido_por = document.getElementById('atendido_por').value;
    const descripcion = document.getElementById('descripcion').value;
    const categoria = document.getElementById('categoria').value;
    const puntuacion = parseInt(document.getElementById('puntuacion').value); // Parse a entero
    const fecha_evento = document.getElementById('fecha_evento').value;


    const nuevaQueja = new QuejaModel(atendido_por, descripcion, categoria, puntuacion, fecha_evento);
    console.log(nuevaQueja);

    fetch(`${URL_API}${agregarAPI}`, {
        method: 'POST',
      
        body: JSON.stringify(nuevaQueja)
    })
    .then(response => response.json())
    .then(data => {
        finalizarCreacion(); // Aquí llamas una función para mostrar mensaje
    })
    .catch(error => console.error('Error al registrar queja:', error));
}// esta me permite dar un mensaje cuando se completo el proceso de creacion 
function finalizarCreacion() {
    const mensajePersonalizado = document.getElementById('mensaje');

    mensajePersonalizado.innerHTML = mensajeExitoso;

    document.getElementById('formQueja').reset();

}
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('formQueja').addEventListener('submit', (evento) => {
        evento.preventDefault();
        crearQueja();
    })

});

const mensajeExitoso = `
                <div
                    class="alert alert-success alert-dismissible fade show"
                    role="alert"
                >
                    <button
                        type="button" 
                        class="btn-close"
                        data-bs-dismiss="alert"
                        aria-label="Close"
                    ></button>
                    <strong>Curso</strong> Curso guardado con exito
                </div>`;







