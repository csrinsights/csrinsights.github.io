<?php
// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Start session for rate limiting
session_start();

// Prevent direct access
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /contact');
    exit;
}

// Rate limiting - prevent spam (max 3 submissions per hour per IP)
$ip = $_SERVER['REMOTE_ADDR'];
$current_time = time();
$rate_limit_key = 'contact_form_' . md5($ip);

if (!isset($_SESSION[$rate_limit_key])) {
    $_SESSION[$rate_limit_key] = [];
}

// Clean old timestamps (older than 1 hour)
$_SESSION[$rate_limit_key] = array_filter($_SESSION[$rate_limit_key], function($timestamp) use ($current_time) {
    return ($current_time - $timestamp) < 3600; // 1 hour
});

// Check if rate limit exceeded
if (count($_SESSION[$rate_limit_key]) >= 3) {
    header('Location: /contact?error=rate_limit');
    exit;
}

// Honeypot spam protection
if (!empty($_POST['_honey'])) {
    // Silently redirect - don't let spammers know we detected them
    header('Location: /contact?success=true');
    exit;
}

// Sanitize and validate inputs
$name = isset($_POST['name']) ? htmlspecialchars(strip_tags(trim($_POST['name'])), ENT_QUOTES, 'UTF-8') : '';
$phone = isset($_POST['phone']) ? htmlspecialchars(strip_tags(trim($_POST['phone'])), ENT_QUOTES, 'UTF-8') : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$service = isset($_POST['services']) ? htmlspecialchars(strip_tags(trim($_POST['services'])), ENT_QUOTES, 'UTF-8') : '';
$message = isset($_POST['message']) ? htmlspecialchars(strip_tags(trim($_POST['message'])), ENT_QUOTES, 'UTF-8') : '';

// Additional validation - length limits
if (strlen($name) > 100 || strlen($phone) > 20 || strlen($message) > 2000) {
    header('Location: /contact?error=invalid_length');
    exit;
}

// Validate required fields
if (empty($name) || empty($email) || empty($service) || empty($message)) {
    header('Location: /contact?error=missing');
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: /contact?error=invalid_email');
    exit;
}

// Check for email header injection attempts
if (preg_match("/[\r\n]/", $email) || preg_match("/[\r\n]/", $name)) {
    header('Location: /contact?error=invalid_input');
    exit;
}

// Your email address where you want to receive submissions
$to = 'contact@csrinsights.net';

// Email subject
$subject = 'New Contact Form Submission - CSRInsights';

// Build email content
$email_content = "New contact form submission from CSRInsights website:\n\n";
$email_content .= "Name: $name\n";
$email_content .= "Email: $email\n";
if (!empty($phone)) {
    $email_content .= "Phone: $phone\n";
}
$email_content .= "Service Interested In: $service\n";
$email_content .= "Message:\n$message\n";

// Email headers
$headers = "From: CSRInsights Contact Form <noreply@csrinsights.net>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
if (mail($to, $subject, $email_content, $headers)) {
    // Add timestamp to rate limiting
    $_SESSION[$rate_limit_key][] = $current_time;

    // Success - redirect to contact page with success parameter
    header('Location: /contact?success=true');
} else {
    // Error - redirect to contact page with error parameter
    header('Location: /contact?error=send_failed');
}

exit;
?>
