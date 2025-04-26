// Modelo Queja en JavaScript
export class QuejaModel {
    constructor(atendido_por, descripcion, categoria, puntuacion, fecha_evento) {
      this.atendido_por = atendido_por;
      this.descripcion = descripcion;
      this.categoria = categoria;
      this.puntuacion = puntuacion;
      this.fecha_evento = fecha_evento;
    }
  
    // Método estático para crear fácilmente una nueva queja
    static forAdd(atendido_por, descripcion, categoria, puntuacion, fecha_evento) {
      return new QuejaModel(atendido_por, descripcion, categoria, puntuacion, fecha_evento);
    }
  }
  