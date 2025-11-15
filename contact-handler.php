<?php
// Prevent direct access
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /contact');
    exit;
}

// Honeypot spam protection
if (!empty($_POST['_honey'])) {
    header('Location: /contact?success=true');
    exit;
}

// Sanitize and validate inputs
$name = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
$phone = isset($_POST['phone']) ? strip_tags(trim($_POST['phone'])) : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$service = isset($_POST['services']) ? strip_tags(trim($_POST['services'])) : '';
$message = isset($_POST['message']) ? strip_tags(trim($_POST['message'])) : '';

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
    // Success - redirect to contact page with success parameter
    header('Location: /contact?success=true');
} else {
    // Error - redirect to contact page with error parameter
    header('Location: /contact?error=send_failed');
}

exit;
?>
