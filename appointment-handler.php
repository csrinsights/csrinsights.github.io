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

// Create calendar invite (.ics file)
function createIcsFile($fullName, $email, $appointmentDate, $appointmentTime, $timezone, $meetingType, $notes) {
    // Create DateTime object for the appointment
    $dateTimeString = $appointmentDate . ' ' . $appointmentTime;
    $startDateTime = new DateTime($dateTimeString, new DateTimeZone($timezone));

    // End time is 45 minutes after start
    $endDateTime = clone $startDateTime;
    $endDateTime->add(new DateInterval('PT45M'));

    // Convert to UTC for iCal format
    $startDateTime->setTimezone(new DateTimeZone('UTC'));
    $endDateTime->setTimezone(new DateTimeZone('UTC'));

    // Format dates for iCal
    $startDateFormatted = $startDateTime->format('Ymd\THis\Z');
    $endDateFormatted = $endDateTime->format('Ymd\THis\Z');
    $nowFormatted = gmdate('Ymd\THis\Z');

    // Generate unique ID
    $uid = uniqid() . '@csrinsights.net';

    // Meeting platform text
    $platformText = $meetingType === 'zoom' ? 'Zoom Meeting' : 'Google Meet';

    // Build description
    $description = "Thank you for scheduling a consultation with CSRInsights.\\n\\n";
    $description .= "Meeting Platform: $platformText\\n";
    $description .= "A meeting link will be sent to you before the appointment.\\n\\n";
    if (!empty($notes)) {
        $description .= "Your Notes: $notes\\n\\n";
    }
    $description .= "If you need to reschedule, please contact us at contact@csrinsights.net";

    // Build ICS content
    $ics = "BEGIN:VCALENDAR\r\n";
    $ics .= "VERSION:2.0\r\n";
    $ics .= "PRODID:-//CSRInsights//Appointment System//EN\r\n";
    $ics .= "METHOD:REQUEST\r\n";
    $ics .= "CALSCALE:GREGORIAN\r\n";
    $ics .= "BEGIN:VEVENT\r\n";
    $ics .= "UID:$uid\r\n";
    $ics .= "DTSTAMP:$nowFormatted\r\n";
    $ics .= "DTSTART:$startDateFormatted\r\n";
    $ics .= "DTEND:$endDateFormatted\r\n";
    $ics .= "SUMMARY:CSRInsights Consultation Meeting\r\n";
    $ics .= "DESCRIPTION:$description\r\n";
    $ics .= "LOCATION:Online - $platformText\r\n";
    $ics .= "STATUS:CONFIRMED\r\n";
    $ics .= "SEQUENCE:0\r\n";
    $ics .= "ORGANIZER;CN=CSRInsights:mailto:contact@csrinsights.net\r\n";
    $ics .= "ATTENDEE;CN=$fullName;RSVP=TRUE:mailto:$email\r\n";
    $ics .= "BEGIN:VALARM\r\n";
    $ics .= "TRIGGER:-PT15M\r\n";
    $ics .= "ACTION:DISPLAY\r\n";
    $ics .= "DESCRIPTION:Reminder: CSRInsights meeting in 15 minutes\r\n";
    $ics .= "END:VALARM\r\n";
    $ics .= "END:VEVENT\r\n";
    $ics .= "END:VCALENDAR\r\n";

    return $ics;
}

// Generate the .ics file
$icsContent = createIcsFile($fullName, $email, $appointmentDate, $appointmentTime, $timezone, $meetingType, $notes);

// Your email address where you want to receive notifications
$admin_email = 'contact@csrinsights.net';

// Email boundary for multipart message
$boundary = md5(uniqid(time()));

// Build notification email content for admin
$admin_subject = 'New Appointment Request - CSRInsights';
$admin_content = "New appointment request from CSRInsights website:\n\n";
$admin_content .= "===== PERSONAL INFORMATION =====\n";
$admin_content .= "Name: $fullName\n";
$admin_content .= "Email: $email\n";
if (!empty($phone)) {
    $admin_content .= "Phone: $phone\n";
}
$admin_content .= "\n===== APPOINTMENT DETAILS =====\n";
$admin_content .= "Meeting Platform: $meetingType\n";
$admin_content .= "Date: $appointmentDate\n";
$admin_content .= "Time: $appointmentTime\n";
$admin_content .= "Timezone: $timezone\n";
if (!empty($notes)) {
    $admin_content .= "\n===== ADDITIONAL NOTES =====\n";
    $admin_content .= "$notes\n";
}

// Admin email headers
$admin_headers = "From: CSRInsights Appointment System <noreply@csrinsights.net>\r\n";
$admin_headers .= "Reply-To: $fullName <$email>\r\n";
$admin_headers .= "X-Mailer: PHP/" . phpversion();

// Customer email with calendar invite
$customer_subject = 'Your CSRInsights Consultation is Confirmed';
$platformName = $meetingType === 'zoom' ? 'Zoom Meeting' : 'Google Meet';

// Customer email headers with calendar attachment
$customer_headers = "From: CSRInsights <contact@csrinsights.net>\r\n";
$customer_headers .= "Reply-To: CSRInsights <contact@csrinsights.net>\r\n";
$customer_headers .= "MIME-Version: 1.0\r\n";
$customer_headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";
$customer_headers .= "X-Mailer: PHP/" . phpversion();

// Customer email body
$customer_message = "--$boundary\r\n";
$customer_message .= "Content-Type: text/plain; charset=UTF-8\r\n";
$customer_message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$customer_message .= "Dear $fullName,\n\n";
$customer_message .= "Thank you for scheduling a consultation with CSRInsights!\n\n";
$customer_message .= "Your appointment has been confirmed for:\n";
$customer_message .= "Date: $appointmentDate\n";
$customer_message .= "Time: $appointmentTime ($timezone)\n";
$customer_message .= "Platform: $platformName\n\n";
if (!empty($notes)) {
    $customer_message .= "Your notes: $notes\n\n";
}
$customer_message .= "A calendar invitation is attached to this email. Please add it to your calendar.\n";
$customer_message .= "We will send you the meeting link shortly before the appointment.\n\n";
$customer_message .= "If you need to reschedule or have any questions, please contact us at contact@csrinsights.net or call (555) 123-4567.\n\n";
$customer_message .= "We look forward to speaking with you!\n\n";
$customer_message .= "Best regards,\n";
$customer_message .= "The CSRInsights Team\n\n";

// Attach the .ics file
$customer_message .= "--$boundary\r\n";
$customer_message .= "Content-Type: text/calendar; charset=UTF-8; method=REQUEST; name=\"appointment.ics\"\r\n";
$customer_message .= "Content-Transfer-Encoding: base64\r\n";
$customer_message .= "Content-Disposition: attachment; filename=\"appointment.ics\"\r\n\r\n";
$customer_message .= chunk_split(base64_encode($icsContent));
$customer_message .= "--$boundary--";

// Send emails
$admin_sent = mail($admin_email, $admin_subject, $admin_content, $admin_headers);
$customer_sent = mail($email, $customer_subject, $customer_message, $customer_headers);

if ($admin_sent && $customer_sent) {
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
