<?php
// 1. Cabeceras obligatorias e inmediatas para evitar bloqueos de CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Manejo inmediato del Preflight de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Restricción estricta del método de petición
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson("error", "Método no permitido.", 405);
}

// Obtener la conexión a la base de datos de manera controlada
$conexion = obtenerConexionBD();

// Leer y decodificar la entrada JSON de Angular
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Asegurar que las variables existan
$nombreRaw  = isset($data['nombre'])  ? $data['nombre']  : '';
$correoRaw  = isset($data['correo'])  ? $data['correo']  : '';
$mensajeRaw = isset($data['mensaje']) ? $data['mensaje'] : '';

// Cláusula de Guarda: Validar campos vacíos
if (trim($nombreRaw) === '' || trim($correoRaw) === '' || trim($mensajeRaw) === '') {
    responderJson("error", "Por favor, rellena todos los campos obligatorios.", 400);
}

// Sanitización y Validación de Datos
$nombre  = htmlspecialchars(trim(strip_tags($nombreRaw)));
$correo  = filter_var(trim($correoRaw), FILTER_VALIDATE_EMAIL);
$mensaje = htmlspecialchars(trim(strip_tags($mensajeRaw)));

// Cláusula de Guarda: Validar formato del correo electrónico
if (!$correo) {
    responderJson("error", "El formato del correo electrónico no es válido.", 400);
}

// Intentar guardar el mensaje de forma segura en MySQL
try {
    $query = "INSERT INTO mensajes_contacto (nombre, correo, mensaje) VALUES (:nombre, :correo, :mensaje)";
    $stmt = $conexion->prepare($query);

    $stmt->execute([
        ':nombre'  => $nombre,
        ':correo'  => $correo,
        ':mensaje' => $mensaje
    ]);

    responderJson("success", "¡Mensaje guardado con éxito en la base de datos de manera instantánea!", 201);

} catch (PDOException $e) {
    responderJson("error", "Error interno en la consulta SQL de MySQL: " . $e->getMessage(), 500);
}


/**
 * Inicializa y retorna una conexión PDO segura a MySQL
 */
function obtenerConexionBD(): PDO {
    $host     = "localhost";
    $db_name  = "bd_portafolio";
    $username = "root";
    $password = "";

    try {
        $pdo = new PDO("mysql:host={$host};dbname={$db_name};charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        // Si la base de datos falla, inyectamos las cabeceras aquí para que Angular pueda leer el mensaje del error
        header("Access-Control-Allow-Origin: *");
        header("Content-Type: application/json; charset=UTF-8");
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "XAMPP MySQL dice: No se pudo conectar a la base de datos. Revisa el nombre 'bd_portafolio'. Detalle: " . $e->getMessage()
        ]);
        exit;
    }
}

/**
 * Normaliza y despacha las respuestas JSON
 */
function responderJson(string $status, string $message, int $httpCode = 200): void {
    http_response_code($httpCode);
    echo json_encode([
        "status"  => $status,
        "message" => $message
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
