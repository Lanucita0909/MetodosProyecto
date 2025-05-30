// Modelo Queja en JavaScript
export class QuejaModel {
    constructor(atendido_por, descripcion, categoria, puntuacion, fecha_evento, costo_viaje) {
      this.atendido_por = atendido_por;
      this.descripcion = descripcion;
      this.categoria = categoria;
      this.puntuacion = puntuacion;
      this.fecha_evento = fecha_evento;
      this.costo_viaje = costo_viaje;
    }
  
    // Método estático para crear fácilmente una nueva queja
    static forAdd(atendido_por, descripcion, categoria, puntuacion, fecha_evento,costo_viaje) {
      return new QuejaModel(atendido_por, descripcion, categoria, puntuacion, fecha_evento,costo_viaje);
    }
  }
  