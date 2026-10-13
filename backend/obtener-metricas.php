<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$host = "localhost"; $db_name = "bd_portafolio"; $username = "root"; $password = "";

try {
    $conexion = new PDO("mysql:host={$host};dbname={$db_name};charset=utf8mb4", $username, $password);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    exit;
}

// 1. Obtener productos próximos a caducar (Ordenados por fecha más cercana)
$queryCaducidad = "SELECT nombre, caducidad, DATEDIFF(caducidad, CURDATE()) as dias_restantes 
                   FROM productos_reporte 
                   ORDER BY caducidad ASC LIMIT 10";
$stmt1 = $conexion->prepare($queryCaducidad);
$stmt1->execute();
$proximosACaducar = $stmt1->fetchAll(PDO::FETCH_ASSOC);

// 2. Obtener los tipos de productos más abundantes (Agrupados y contados)
$queryTipos = "SELECT tipo, COUNT(*) as cantidad 
               FROM productos_reporte 
               GROUP BY tipo 
               ORDER BY cantidad DESC LIMIT 10";
$stmt2 = $conexion->prepare($queryTipos);
$stmt2->execute();
$tiposAbundantes = $stmt2->fetchAll(PDO::FETCH_ASSOC);

// Responder los dos bloques de datos en un solo JSON estructurado
echo json_encode([
    "status" => "success",
    "caducidad" => $proximosACaducar,
    "tipos" => $tiposAbundantes
], JSON_UNESCAPED_UNICODE);
?>
