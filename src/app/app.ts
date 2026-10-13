import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive], // Cargamos las herramientas de navegación
  templateUrl: './app.html', // Vincula a tu archivo HTML
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'mi-portafolio';
}
