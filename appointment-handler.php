<?php
// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Start session for rate limiting
session_start();

// Prevent direct access
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /fix-appointment');
    exit;
}

// Rate limiting - prevent spam (max 3 submissions per hour per IP)
$ip = $_SERVER['REMOTE_ADDR'];
$current_time = time();
$rate_limit_key = 'appointment_form_' . md5($ip);

if (!isset($_SESSION[$rate_limit_key])) {
    $_SESSION[$rate_limit_key] = [];
}

// Clean old timestamps (older than 1 hour)
$_SESSION[$rate_limit_key] = array_filter($_SESSION[$rate_limit_key], function($timestamp) use ($current_time) {
    return ($current_time - $timestamp) < 3600; // 1 hour
});

// Check if rate limit exceeded
if (count($_SESSION[$rate_limit_key]) >= 3) {
    header('Location: /fix-appointment?error=rate_limit');
    exit;
}

// Honeypot spam protection
if (!empty($_POST['_honey'])) {
    // Silently redirect - don't let spammers know we detected them
    header('Location: /fix-appointment?success=true');
    exit;
}

// Sanitize and validate inputs
$fullName = isset($_POST['fullName']) ? htmlspecialchars(strip_tags(trim($_POST['fullName'])), ENT_QUOTES, 'UTF-8') : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$phone = isset($_POST['phone']) ? htmlspecialchars(strip_tags(trim($_POST['phone'])), ENT_QUOTES, 'UTF-8') : '';
$meetingType = isset($_POST['meetingType']) ? htmlspecialchars(strip_tags(trim($_POST['meetingType'])), ENT_QUOTES, 'UTF-8') : '';
$appointmentDate = isset($_POST['appointmentDate']) ? htmlspecialchars(strip_tags(trim($_POST['appointmentDate'])), ENT_QUOTES, 'UTF-8') : '';
$appointmentTime = isset($_POST['appointmentTime']) ? htmlspecialchars(strip_tags(trim($_POST['appointmentTime'])), ENT_QUOTES, 'UTF-8') : '';
$timezone = isset($_POST['timezone']) ? htmlspecialchars(strip_tags(trim($_POST['timezone'])), ENT_QUOTES, 'UTF-8') : '';
$notes = isset($_POST['notes']) ? htmlspecialchars(strip_tags(trim($_POST['notes'])), ENT_QUOTES, 'UTF-8') : '';

// Additional validation - length limits
if (strlen($fullName) > 100 || strlen($phone) > 20 || strlen($notes) > 2000) {
    header('Location: /fix-appointment?error=invalid_length');
    exit;
}

// Validate required fields
if (empty($fullName) || empty($email) || empty($meetingType) || empty($appointmentDate) || empty($appointmentTime) || empty($timezone)) {
    header('Location: /fix-appointment?error=missing');
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: /fix-appointment?error=invalid_email');
    exit;
}

// Check for email header injection attempts
if (preg_match("/[\r\n]/", $email) || preg_match("/[\r\n]/", $fullName)) {
    header('Location: /fix-appointment?error=invalid_input');
    exit;
}

// Validate date format (YYYY-MM-DD)
if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $appointmentDate)) {
    header('Location: /fix-appointment?error=invalid_date');
    exit;
}

// Validate that the date is in the future
$date = DateTime::createFromFormat('Y-m-d', $appointmentDate);
$today = new DateTime();
$today->setTime(0, 0, 0);
if (!$date || $date < $today) {
    header('Location: /fix-appointment?error=past_date');
    exit;
}

// Your email address where you want to receive submissions
$to = 'contact@csrinsights.net';

// Email subject
$subject = 'New Appointment Request - CSRInsights';

// Build email content
$email_content = "New appointment request from CSRInsights website:\n\n";
$email_content .= "===== PERSONAL INFORMATION =====\n";
$email_content .= "Name: $fullName\n";
$email_content .= "Email: $email\n";
if (!empty($phone)) {
    $email_content .= "Phone: $phone\n";
}
$email_content .= "\n===== APPOINTMENT DETAILS =====\n";
$email_content .= "Meeting Platform: $meetingType\n";
$email_content .= "Date: $appointmentDate\n";
$email_content .= "Time: $appointmentTime\n";
$email_content .= "Timezone: $timezone\n";
if (!empty($notes)) {
    $email_content .= "\n===== ADDITIONAL NOTES =====\n";
    $email_content .= "$notes\n";
}

// Email headers
$headers = "From: CSRInsights Appointment System <noreply@csrinsights.net>\r\n";
$headers .= "Reply-To: $fullName <$email>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
if (mail($to, $subject, $email_content, $headers)) {
    // Add timestamp to rate limiting
    $_SESSION[$rate_limit_key][] = $current_time;

    // Success - redirect to appointment page with success parameter
    header('Location: /fix-appointment?success=true');
} else {
    // Error - redirect to appointment page with error parameter
    header('Location: /fix-appointment?error=send_failed');
}

exit;
?>
