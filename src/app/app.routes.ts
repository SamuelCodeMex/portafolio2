import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio';
import { ProyectosComponent } from './components/proyectos/proyectos';
import { ContactoComponent } from './components/contacto/contacto';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'proyectos', component: ProyectosComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
