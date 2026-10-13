import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Hace que el servicio esté disponible en toda la aplicación
})
export class ContactoService {
  // Inyección moderna de dependencias en Angular v22
  private http = inject(HttpClient);

  // Define la URL donde se encuentra ejecutándose tu archivo PHP.
  // Reemplaza esta dirección por tu URL de producción o tu entorno local (XAMPP/Laragon) cuando corresponda.
  private apiUrl = 'http://localhost/mi-portafolio/backend/enviar-contacto.php';

  /**
   * Envía los datos capturados en el formulario web hacia el backend en PHP
   * @param datosContacto Objeto con el nombre, correo y mensaje del usuario
   */
  enviarMensaje(datosContacto: { nombre: string; correo: string; mensaje: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, datosContacto);
  }

    // Agrega esta URL arriba junto a las propiedades de la clase:
    private apiExcelUrl = 'http://localhost/mi-portafolio/backend/procesar-excel.php';

    // Añade este método abajo:
    cargarProductosExcel(listaProductos: any[]): Observable<any> {
    return this.http.post<any>(this.apiExcelUrl, listaProductos);
    }
    // Agrega esta URL junto a las demás propiedades de la clase:
    private apiMetricasUrl = 'http://localhost/mi-portafolio/backend/obtener-metricas.php';

    // Añade este método:
    obtenerMetricasProyectos(): Observable<any> {
    return this.http.get<any>(this.apiMetricasUrl);
    }
}
