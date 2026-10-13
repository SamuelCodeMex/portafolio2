import { Component, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactoService } from '../../services/contacto.service';
import * as XLSX from 'xlsx';
import { Chart, registerables } from 'chart.js';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.css'
})
export class ProyectosComponent implements OnInit, OnDestroy {
  private apiService = inject(ContactoService);
  private cdr = inject(ChangeDetectorRef);

  productosCargados: any[] = [];
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  datosCaducidadParaPDF: any[] = [];
  datosTiposParaPDF: any[] = [];

  private chartCaducidad: Chart | null = null;
  private chartTipos: Chart | null = null;

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.cargarMetricasGraficas();
  }

  ngOnDestroy(): void {
    if (this.chartCaducidad) this.chartCaducidad.destroy();
    if (this.chartTipos) this.chartTipos.destroy();
  }

  cargarMetricasGraficas(): void {
    this.apiService.obtenerMetricasProyectos().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.datosCaducidadParaPDF = res.caducidad;
          this.datosTiposParaPDF = res.tipos;
          this.renderizarGraficaCaducidad(res.caducidad);
          this.renderizarGraficaTipos(res.tipos);
        }
      },
      error: (err) => console.error('Error al solicitar métricas analíticas:', err)
    });
  }

  /**
   * 🌟 EL MÉTODO QUE BUSCA EL BOTÓN 🌟
   */
  descargarPlantilla(): void {
    const dataEjemplo = [
      { nombre: 'Leche Entera 1L', tipo: 'Lácteos', caducidad: '2026-11-15', fecha: '2026-10-12' },
      { nombre: 'Atún en Agua', tipo: 'Enlatados', caducidad: '2026-10-14', fecha: '2026-10-12' },
      { nombre: 'Pan Cemola', tipo: 'Panadería', caducidad: '2026-10-15', fecha: '2026-10-12' }
    ];
    
    const hojaTrabajo = XLSX.utils.json_to_sheet(dataEjemplo);
    const libroTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroTrabajo, hojaTrabajo, 'Plantilla Productos');
    XLSX.writeFile(libroTrabajo, 'plantilla_productos.xlsx');
  }

  onFileChange(evento: any): void {
    this.mensajeExito = null; 
    this.mensajeError = null; 
    this.productosCargados = [];
    
    const target: DataTransfer = <DataTransfer>(evento.target);
    if (!target || !target.files || target.files.length !== 1) return;
    const archivoFisico = target.files[0];

    const lector = new FileReader();
    lector.onload = (e: any) => {
      const datosBinarios = e.target.result;
      const libro = XLSX.read(datosBinarios, { 
        type: 'binary',
        cellDates: true,
        dateNF: 'yyyy-mm-dd'
      });
      const hoja = libro.Sheets[libro.SheetNames[0]];
      const jsonRaw: any[] = XLSX.utils.sheet_to_json(hoja, { raw: false });

      if (jsonRaw.length > 0) {
        this.productosCargados = jsonRaw.map(fila => ({
          nombre: fila.nombre || fila.Nombre,
          tipo: fila.tipo || fila.Tipo,
          caducidad: fila.caducidad || fila.Caducidad,
          fecha: fila.fecha || fila.Fecha
        }));
        this.mensajeExito = `Archivo validado correctamente. ${jsonRaw.length} productos listos.`;
      } else {
        this.mensajeError = 'El archivo Excel está vacío.';
      }
      this.cdr.detectChanges();
    };
    lector.readAsBinaryString(archivoFisico);
  }

  subirDatos(): void {
    if (this.productosCargados.length === 0) return;
    this.apiService.cargarProductosExcel(this.productosCargados).subscribe({
      next: (respuesta) => {
        if (respuesta.status === 'success') {
          this.mensajeExito = respuesta.message;
          this.productosCargados = [];
          this.cargarMetricasGraficas();
        } else {
          this.mensajeError = respuesta.message;
        }
        this.cdr.detectChanges();
      }
    });
  }

    generarReportePDF(): void {
    // 1. Capturar los Canvas físicos de Chart.js desde la pantalla
    const canvasCaducidad = document.getElementById('graficaCaducidad') as HTMLCanvasElement;
    const canvasTipos = document.getElementById('graficaTipos') as HTMLCanvasElement;

    if (!canvasCaducidad || !canvasTipos) {
      alert('Error: No se pudieron encontrar las gráficas en la pantalla para generar el PDF.');
      return;
    }

    // 2. Convertir los gráficos interactivos a imágenes estáticas Base64
    const imgCaducidadBase64 = canvasCaducidad.toDataURL('image/png', 1.0);
    const imgTiposBase64 = canvasTipos.toDataURL('image/png', 1.0);

    // 3. Inicializar el documento PDF tamaño A4 estándar
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const azulCorporativo = '#0d6efd';
    const grisOscuro = '#333333';
    const grisClaro = '#777777';

    // Banner superior decorativo
    doc.setFillColor(13, 110, 253);
    doc.rect(0, 0, 210, 25, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor('#ffffff');
    doc.text('INFORME ANALÍTICO DE CONTROL DE INVENTARIO', 15, 16);

    // Metadatos del informe
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(grisOscuro);
    const fechaActual = new Date().toLocaleDateString();
    doc.text(`Fecha de Emisión: ${fechaActual}`, 15, 33);
    doc.text('Origen de Datos: Sistema de Gestión Portafolio Web (MySQL)', 15, 38);

    // --- SECCIÓN 1: COMPONENTES GRÁFICOS (DASHBOARD VISUAL) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(azulCorporativo);
    doc.text('1. Dashboard Visual Diagnóstico', 15, 48);

    // Inyectar la gráfica de barras de caducidad (X, Y, Ancho, Alto)
    // Reducimos tamaños para que convivan juntas de forma armónica
    doc.addImage(imgCaducidadBase64, 'PNG', 15, 53, 110, 55);

    // Inyectar la gráfica de dona de categorías
    doc.addImage(imgTiposBase64, 'PNG', 130, 53, 65, 55);

    // --- SECCIÓN 2: ALERTA CRÍTICA DE CADUCIDAD (TABLA TEXTUAL) ---
    let yIndex = 120; // Bajamos el puntero vertical para dar espacio a las imágenes anteriores
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(azulCorporativo);
    doc.text('2. Alerta Crítica: Productos Próximos a Caducar', 15, yIndex);

    yIndex += 5;
    // Cabecera de Tabla 1
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yIndex, 180, 7, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(grisOscuro);
    doc.text('Nombre del Producto', 18, yIndex + 5);
    doc.text('Fecha de Caducidad', 110, yIndex + 5);
    doc.text('Días Restantes', 165, yIndex + 5);

    yIndex += 17;
    
    this.datosCaducidadParaPDF.forEach((producto) => {
      // Validar que la hoja no se sature de filas (Control de salto de página básico)
      if (yIndex > 200) return; 

      const diasRestantes = producto.dias_restantes !== null ? parseInt(producto.dias_restantes, 10) : 0;

      if (diasRestantes <= 5) {
        doc.setTextColor(220, 53, 69);
        doc.setFont("helvetica", "bold");
        doc.text(`${producto.nombre} (CRÍTICO)`, 18, yIndex);
      } else {
        doc.setTextColor(grisOscuro);
        doc.setFont("helvetica", "normal");
        doc.text(producto.nombre, 18, yIndex);
      }
      
      doc.text(producto.caducidad ? producto.caducidad : 'No registrada', 110, yIndex);
      doc.text(`${diasRestantes} días`, 165, yIndex);
      
      doc.setDrawColor(235, 235, 235);
      doc.line(15, yIndex + 3, 195, yIndex + 3);
      yIndex += 9;
    });

    // --- SECCIÓN 3: RESUMEN DE CATEGORÍAS (TABLA TEXTUAL) ---
    yIndex += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(azulCorporativo);
    doc.text('3. Resumen Estadístico: Distribución por Categorías', 15, yIndex);

    yIndex += 5;
    // Cabecera de Tabla 2
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yIndex, 180, 7, 'F');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(grisOscuro);
    doc.text('Categoría / Tipo de Producto', 18, yIndex + 5);
    doc.text('Cantidad Almacenada', 145, yIndex + 5);

    yIndex += 17;
    doc.setFont("helvetica", "normal");
    
    this.datosTiposParaPDF.forEach((item) => {
      if (yIndex > 270) return;
      doc.text(item.tipo, 18, yIndex);
      doc.text(`${item.cantidad} unidades`, 145, yIndex);
      
      doc.line(15, yIndex + 3, 195, yIndex + 3);
      yIndex += 9;
    });

    // Pie de página
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grisClaro);
    doc.text('Este documento es un reporte automatizado estructurado por el Portafolio Analítico Angular/PHP.', 15, 287);
    doc.text('Página 1 de 1', 183, 287);

    // Descargar el archivo binario final
    doc.save(`informe_ejecutivo_inventario_${new Date().getTime()}.pdf`);
  }


  private renderizarGraficaCaducidad(datos: any[]): void {
    if (this.chartCaducidad) this.chartCaducidad.destroy();
    const etiquetas = datos.map(p => p.nombre);
    const dias = datos.map(p => parseInt(p.dias_restantes, 10));
    this.chartCaducidad = new Chart('graficaCaducidad', {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Días para caducar',
          data: dias,
          backgroundColor: dias.map(d => d <= 5 ? 'rgba(220, 53, 69, 0.8)' : 'rgba(54, 162, 235, 0.7)'),
          borderColor: dias.map(d => d <= 5 ? 'rgba(220, 53, 69, 1)' : 'rgba(54, 162, 235, 1)'),
          borderWidth: 2,
          minBarLength: 8
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, suggestedMax: 10 } } }
    });
  }

  private renderizarGraficaTipos(datos: any[]): void {
    if (this.chartTipos) this.chartTipos.destroy();
    const etiquetas = datos.map(t => t.tipo);
    const cantidades = datos.map(t => t.cantidad);
    this.chartTipos = new Chart('graficaTipos', {
      type: 'doughnut',
      data: {
        labels: etiquetas,
        datasets: [{ data: cantidades, backgroundColor: ['rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)', 'rgba(201, 203, 207, 0.7)'] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}
