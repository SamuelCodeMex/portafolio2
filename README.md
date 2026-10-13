# Portafolio Web & Generador de Reportes Analíticos Full-Stack

¡Bienvenido a mi portafolio profesional! Este proyecto es una aplicación web empresarial con **arquitectura desacoplada** (*decoupled architecture*). Incluye un módulo avanzado para la gestión de inventarios que procesa archivos binarios de Excel, almacena datos de forma masiva en una base de datos relacional, renderiza métricas dinámicas y exporta reportes ejecutivos en formato PDF.

---

## Características Clave

*   **Arquitectura Desacoplada:** Frontend y Backend totalmente independientes comunicados mediante una API RESTful y servicios HTTP asíncronos.
*   **Procesamiento de Archivos (XLSX):** Lógica en el cliente para parsear y normalizar estructuras de datos desde hojas de cálculo de Excel (`.xlsx`).
*   **Dashboard Analítico Dinámico:** Gráficos interactivos de barras y donas que se actualizan en tiempo real sin recargar la página.
*   **Alertas Inteligentes de Caducidad:** Algoritmo visual que resalta en color rojo de alerta crítica los productos con 5 días o menos de vigencia.
*   **Reportería en PDF:** Generación nativa en el navegador de informes corporativos listos para impresión.
*   **Seguridad Backend:** API robusta en PHP estructurada con Cláusulas de Guarda y consultas preparadas con PDO para mitigar inyecciones SQL.

---

## Tecnologías Utilizadas

| Capa del Proyecto | Tecnología / Librería | Descripción |
| :--- | :--- | :--- |
| **Frontend UI** | Angular v22 (Zoneless) | Framework principal enfocado en rendimiento y modularidad. |
| **Diseño y Estilos** | Bootstrap 5 | Maquetación limpia, moderna y 100% responsiva. |
| **Análisis de Datos** | XLSX (SheetJS) | Motor de lectura y conversión de archivos Excel a JSON. |
| **Métricas Visuales** | Chart.js | Renderizado de indicadores y gráficos estadísticos. |
| **Exportación** | jsPDF | Compilación y maquetación de informes en PDF. |
| **Backend API** | PHP Moderno | Endpoints REST con validación y sanitización estricta. |
| **Persistencia** | MySQL (PDO) | Base de datos relacional con control transaccional. |

---

## 📂 Estructura del Proyecto

```text
mi-portafolio/
│
├── backend/                  # Servidor de Producción / API RESTful en PHP
│   ├── enviar-contacto.php   # Procesamiento seguro del formulario de contacto
│   ├── obtener-metricas.php  # Agregaciones analíticas y consultas SQL (DATEDIFF)
│   └── procesar-excel.php    # Transacciones PDO para inserción masiva
│
└── src/                      # Aplicación Frontend en Angular v22
    └── app/
        ├── components/
        │   ├── inicio/       # Vista de presentación inicial (Hero section)
        │   ├── proyectos/    # Panel del Generador de Reportes (Lógica y Vista)
        │   └── contacto/     # Formulario interactivo con NgModel
        └── services/
            └── contacto.service.ts # Cliente HTTP centralizado e inyectado
```

---

##  Requisitos e Instalación Local

### 1. Clonar el proyecto y preparar el Frontend
Asegúrate de tener instalado [Node.js (versión LTS)](https://nodejs.org).
```bash
# Instalar las dependencias del proyecto
npm install

# Encender el servidor local de Angular
ng serve -o
```

### 2. Configurar el Backend (XAMPP)
1. Activa los módulos **Apache** y **MySQL** en tu panel de control de XAMPP.
2. Mueve o copia la carpeta `backend/` de este proyecto dentro de tu directorio público: `C:\xampp\htdocs\mi-portafolio\backend\`.
3. Ingresa a `http://localhost/phpmyadmin/` y crea una base de datos llamada **`bd_portafolio`**.
4. Importa la estructura SQL ejecutando el siguiente script en la pestaña SQL:

```sql
CREATE TABLE mensajes_contacto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos_reporte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    caducidad DATE NOT NULL,
    fecha_registro DATE NOT NULL
);
```

---

## Formato del Archivo Excel Requerido

Para alimentar de forma correcta el generador de reportes, el archivo `.xlsx` debe contener exactamente las siguientes columnas en su primera fila (puedes descargar el archivo muestra usando el botón **"Descargar Plantilla"** en la interfaz):

*   `nombre`: Texto descriptivo (ej: `Pan Cemola`).
*   `tipo`: Categoría del producto (ej: `Panadería`).
*   `caducidad`: Fecha de vencimiento con formato `AAAA-MM-DD` (ej: `2026-10-15`).
*   `fecha`: Fecha de ingreso al almacén con formato `AAAA-MM-DD` (ej: `2026-10-12`).

---

## Despliegue en Producción (Hosting Apache)

1. Cambia las URLs base del archivo `src/app/services/contacto.service.ts` por tu dominio web real (`https://tudominio.com...`).
2. Compila el frontend para producción ejecutando: `ng build`.
3. Sube el contenido de la carpeta resultante `dist/mi-portafolio/browser/` directamente a la raíz de tu servidor (carpeta `public_html`).
4. Sube la carpeta `backend/` al mismo nivel y asegúrate de actualizar las credenciales de conexión en los scripts de PHP con el usuario y clave provistos por tu hosting.
5. El archivo `.htaccess` incluido redirigirá de manera automática el tráfico hacia el `index.html` para dar soporte nativo a las rutas de Angular.

---
Diseñado y Desarrollado con PHP, Angular y Bootstrap por Samuel Orozco Cuevas - 2026.
