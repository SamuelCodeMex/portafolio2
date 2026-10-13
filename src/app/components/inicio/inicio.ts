import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // <-- Habilita los enlaces de Bootstrap hacia proyectos y contacto

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink], // <-- Inyectamos la directiva obligatoria
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent {}

