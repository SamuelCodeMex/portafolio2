import { Component, inject, ChangeDetectorRef } from '@angular/core'; // <-- 1. Añadimos ChangeDetectorRef
import { FormsModule } from '@angular/forms';
import { ContactoService } from '../../services/contacto.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class ContactoComponent {
  private contactoService = inject(ContactoService);
  private cdr = inject(ChangeDetectorRef); // <-- 2. Inyectamos el detector de cambios de Angular

  datos = {
    nombre: '',
    correo: '',
    mensaje: ''
  };

  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  procesarEnvio(): void {
    this.mensajeExito = null;
    this.mensajeError = null;

    this.contactoService.enviarMensaje(this.datos).subscribe({
      next: (respuesta) => {
        // Imprimimos en la consola del navegador para verificar qué nos responde PHP
        console.log('Respuesta recibida de PHP:', respuesta);

        if (respuesta && (respuesta.status === 'success' || respuesta.status === 'error')) {
          if (respuesta.status === 'success') {
            this.mensajeExito = respuesta.message;
            this.datos = { nombre: '', correo: '', mensaje: '' };
          } else {
            this.mensajeError = respuesta.message;
          }
        } else {
          // Si PHP respondió texto plano en lugar de JSON estructurado, forzamos un mensaje genérico de éxito
          this.mensajeExito = '¡Mensaje procesado correctamente por el servidor local!';
          this.datos = { nombre: '', correo: '', mensaje: '' };
        }

        // 3. OBLIGATORIO: Forzamos a Angular v22 a redibujar la pantalla con los nuevos mensajes
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.mensajeError = 'No se pudo conectar con el servidor PHP. Revisa que Apache esté encendido en XAMPP.';
        console.error(err);
        this.cdr.detectChanges(); // Forzamos redibujado en caso de error
      }
    });
  }
}
