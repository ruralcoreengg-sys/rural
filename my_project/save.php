<?php
/**
 * ============================================================
 * Precision CAD Solutions - Form Submission Handler
 * File: save.php
 * 
 * This script receives form data via AJAX POST request,
 * validates it, and saves it to MySQL database.
 * ============================================================
 */

// Set response type to JSON
header('Content-Type: application/json');

// Allow CORS for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed.']);
    exit();
}

// ============================================================
// DATABASE CONFIGURATION
// Change these values to match your XAMPP/WAMP setup
// ============================================================
$db_host = 'localhost';      // Database host
$db_user = 'root';           // Database username (default for XAMPP)
$db_pass = '';               // Database password (empty for XAMPP)
$db_name = 'rurale_db'; // Database name

// ============================================================
// CONNECT TO DATABASE
// ============================================================
try {
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }
    
    // Set charset to utf8
    $conn->set_charset('utf8mb4');
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection error. Please check your configuration.'
    ]);
    exit();
}

// ============================================================
// GET AND VALIDATE FORM DATA
// ============================================================

// Get POST data (supports both form-data and JSON)
$contentType = isset($_SERVER["CONTENT_TYPE"]) ? $_SERVER["CONTENT_TYPE"] : '';

if (strpos($contentType, 'application/json') !== false) {
    // JSON input
    $input = json_decode(file_get_contents('php://input'), true);
} else {
    // Form data input
    $input = $_POST;
}

// Extract and sanitize fields
$name    = isset($input['name'])    ? trim(htmlspecialchars($input['name']))    : '';
$email   = isset($input['email'])   ? trim(htmlspecialchars($input['email']))   : '';
$phone   = isset($input['phone'])   ? trim(htmlspecialchars($input['phone']))   : '';
$company = isset($input['company']) ? trim(htmlspecialchars($input['company'])) : '';
$service = isset($input['service']) ? trim(htmlspecialchars($input['service'])) : '';
$message = isset($input['message']) ? trim(htmlspecialchars($input['message'])) : '';

// Validate required fields
$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required.';
}

if (empty($email)) {
    $errors[] = 'Email is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

if (empty($message)) {
    $errors[] = 'Message/Project description is required.';
}

// Return errors if any
if (!empty($errors)) {
    echo json_encode([
        'success' => false, 
        'message' => implode(' ', $errors)
    ]);
    $conn->close();
    exit();
}

// ============================================================
// SAVE TO DATABASE
// ============================================================
try {
    // Prepare SQL statement (prevents SQL injection)
    $stmt = $conn->prepare(
        "INSERT INTO enquiries (name, email, phone, company, service, message) 
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    
    // Bind parameters
    $stmt->bind_param('ssssss', $name, $email, $phone, $company, $service, $message);
    
    // Execute
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true, 
            'message' => 'Your request has been submitted successfully! We will contact you within 2 business hours.',
            'id' => $stmt->insert_id
        ]);
    } else {
        throw new Exception('Failed to save data.');
    }
    
    // Close statement
    $stmt->close();
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error saving your request. Please try again.'
    ]);
}

// Close database connection
$conn->close();
?>
