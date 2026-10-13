<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson("error", "Método no permitido.", 405);
}

// Conectar a la base de datos
$host     = "localhost";
$db_name  = "bd_portafolio";
$username = "root";
$password = "";

try {
    $conexion = new PDO("mysql:host={$host};dbname={$db_name};charset=utf8mb4", $username, $password);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    responderJson("error", "Error de base de datos: " . $e->getMessage(), 500);
}

// Capturar el arreglo JSON de productos enviado por Angular
$input = file_get_contents("php://input");
$productos = json_decode($input, true);

if (empty($productos) || !is_array($productos)) {
    responderJson("error", "El formato de los datos es inválido o el archivo está vacío.", 400);
}

try {
    // Iniciar una transacción para asegurar que se guarden todos o ninguno (Integridad de datos)
    $conexion->beginTransaction();

    $query = "INSERT INTO productos_reporte (nombre, tipo, caducidad, fecha_registro) VALUES (:nombre, :tipo, :caducidad, :fecha_registro)";
    $stmt = $conexion->prepare($query);

    $insertados = 0;
    foreach ($productos as $fila) {
        // Validar formato básico de las columnas requeridas
        if (!isset($fila['nombre']) || !isset($fila['tipo']) || !isset($fila['caducidad']) || !isset($fila['fecha'])) {
            continue; // Se salta filas que no cumplan el formato
        }

        $stmt->execute([
            ':nombre'         => htmlspecialchars(strip_tags($fila['nombre'])),
            ':tipo'           => htmlspecialchars(strip_tags($fila['tipo'])),
            ':caducidad'      => $fila['caducidad'], // Formato YYYY-MM-DD
            ':fecha_registro' => $fila['fecha']      // Formato YYYY-MM-DD
        ]);
        $insertados++;
    }

    $conexion->commit();
    responderJson("success", "¡Excel procesado con éxito! Se cargaron {$insertados} productos a la base de datos.", 201);

} catch (PDOException $e) {
    $conexion->rollBack();
    responderJson("error", "Error al procesar la inserción masiva: " . $e->getMessage(), 500);
}

function responderJson(string $status, string $message, int $httpCode = 200): void {
    http_response_code($httpCode);
    echo json_encode(["status" => $status, "message" => $message], JSON_UNESCAPED_UNICODE);
    exit;
}
?>
