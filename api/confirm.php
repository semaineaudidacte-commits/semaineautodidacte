<?php
/**
 * API - Confirmation de présence pour la Semaine de l'Autodidacte
 * Enregistrement en JSON et CSV avec support export
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
}

$jsonFile = $dataDir . '/confirmations.json';
$csvFile = $dataDir . '/confirmations.csv';
$ADMIN_TOKEN = 'admin2026'; // Mot de passe pour l'espace organisateur

// Action GET (Liste ou Export)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    $token = $_GET['token'] ?? '';

    if ($token !== $ADMIN_TOKEN) {
        http_response_code(401);
        echo json_encode(['error' => 'Non autorisé. Mot de passe incorrect.']);
        exit;
    }

    if ($action === 'list') {
        $confirmations = file_exists($jsonFile) ? json_decode(file_get_contents($jsonFile), true) : [];
        echo json_encode(['success' => true, 'data' => $confirmations ?: []]);
        exit;
    }

    if ($action === 'export_csv') {
        if (!file_exists($csvFile)) {
            touch($csvFile);
            file_put_contents($csvFile, "\xEF\xBB\xBFID;Date;Nom;Email;Telephone;Organisation;Role;Jours;Cocktail;Notes\n");
        }
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="invites_semaine_autodidacte_' . date('Y-m-d') . '.csv"');
        readfile($csvFile);
        exit;
    }

    echo json_encode(['status' => 'API active']);
    exit;
}

// Action POST (Nouvelle confirmation)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data) {
        // Fallback POST standard
        $data = $_POST;
    }

    $fullName = trim($data['fullName'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');

    if (empty($fullName)) {
        http_response_code(400);
        echo json_encode(['error' => 'Veuillez renseigner votre nom complet.']);
        exit;
    }

    $id = !empty($data['id']) ? $data['id'] : 'SAD26-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
    $timestamp = $data['timestamp'] ?? date('Y-m-d H:i:s');
    $days = is_array($data['days'] ?? null) ? implode(', ', $data['days']) : ($data['days'] ?? '');
    $organization = trim($data['organization'] ?? 'Non spécifiée');
    $role = trim($data['role'] ?? 'Participant');
    $cocktail = trim($data['cocktail'] ?? 'Non précisé');
    $notes = trim($data['notes'] ?? '');

    $record = [
        'id' => $id,
        'createdAt' => $timestamp,
        'fullName' => $fullName,
        'email' => $email,
        'phone' => $phone,
        'organization' => $organization,
        'role' => $role,
        'days' => $data['days'] ?? [],
        'daysString' => $days,
        'cocktail' => $cocktail,
        'notes' => $notes
    ];

    // Sauvegarde JSON
    $existing = [];
    if (file_exists($jsonFile)) {
        $existing = json_decode(file_get_contents($jsonFile), true) ?: [];
    }
    // Évite les doublons avec le même ID
    $filtered = array_filter($existing, fn($item) => ($item['id'] ?? '') !== $id);
    array_unshift($filtered, $record);
    file_put_contents($jsonFile, json_encode(array_values($filtered), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // Sauvegarde CSV
    $csvExists = file_exists($csvFile);
    $csvHandle = fopen($csvFile, 'a');
    if (!$csvExists || filesize($csvFile) === 0) {
        // UTF-8 BOM pour Excel
        fwrite($csvHandle, "\xEF\xBB\xBF");
        fputcsv($csvHandle, ['ID', 'Date Inscription', 'Nom Complet', 'Email', 'Telephone', 'Organisation', 'Role', 'Jours confirmes', 'Cocktail', 'Message / Notes'], ';');
    }
    fputcsv($csvHandle, [
        $id,
        $timestamp,
        $fullName,
        $email,
        $phone,
        $organization,
        $role,
        $days,
        $cocktail,
        $notes
    ], ';');
    fclose($csvHandle);

    echo json_encode([
        'success' => true,
        'message' => 'Votre présence a été enregistrée avec succès !',
        'id' => $id,
        'record' => $record
    ]);
    exit;
}
