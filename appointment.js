// Appointment Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const appointmentForm = document.getElementById('appointmentForm');
    const appointmentDate = document.getElementById('appointmentDate');
    const timezoneSelect = document.getElementById('timezone');
    const timeSlotSelect = document.getElementById('appointmentTime');

    // Check for success/error messages in URL
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'true') {
        showMessage('success', 'Appointment Confirmed!', 'Your appointment has been scheduled successfully. A calendar invite has been sent to your email address.');
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
        let errorMessage = 'An error occurred. Please try again.';
        switch(error) {
            case 'rate_limit':
                errorMessage = 'Too many submissions. Please wait an hour before trying again.';
                break;
            case 'missing':
                errorMessage = 'Please fill in all required fields.';
                break;
            case 'invalid_email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'invalid_length':
                errorMessage = 'Some fields exceed the maximum allowed length.';
                break;
            case 'invalid_date':
                errorMessage = 'Please enter a valid date.';
                break;
            case 'past_date':
                errorMessage = 'Please select a future date for your appointment.';
                break;
            case 'invalid_input':
                errorMessage = 'Invalid input detected. Please check your information.';
                break;
            case 'send_failed':
                errorMessage = 'Failed to send appointment confirmation. Please try again or contact us directly.';
                break;
        }
        showMessage('error', 'Appointment Failed', errorMessage);
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    function showMessage(type, title, message) {
        const messageContainer = document.getElementById('messageContainer');
        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const bgColor = type === 'success' ? '#4CAF50' : '#f44336';

        const messageHTML = `
            <div style="background-color: ${bgColor}; color: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <i class="fas ${iconClass}" style="font-size: 2rem;"></i>
                    <div>
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.25rem;">${title}</h3>
                        <p style="margin: 0; opacity: 0.95;">${message}</p>
                    </div>
                </div>
            </div>
        `;

        messageContainer.innerHTML = messageHTML;

        // Scroll to message
        messageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Auto-hide success messages after 10 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageContainer.innerHTML = '';
            }, 10000);
        }
    }

    // Timezone offset mapping (in hours from UTC)
    const timezoneOffsets = {
        'America/New_York': -5,      // EST (Eastern)
        'America/Chicago': -6,       // CST (Central)
        'America/Denver': -7,        // MST (Mountain)
        'America/Los_Angeles': -8,   // PST (Pacific)
        'Asia/Kolkata': 5.5,         // IST
        'Europe/London': 0,          // GMT
        'UTC': 0
    };

    // IST availability: 8:00 AM to 1:00 AM (next day)
    const istStartHour = 8;  // 8 AM IST
    const istEndHour = 25;   // 1 AM next day (25 = 1 AM in 24h + 24)

    // Generate time slots based on selected timezone
    function generateTimeSlots(selectedTimezone) {
        const slots = [];
        const localWorkingStart = 9;   // 9 AM local time
        const localWorkingEnd = 18;    // 6 PM local time

        // Generate slots for local working hours (9 AM - 6 PM) in 30-minute intervals
        for (let hour = localWorkingStart; hour < localWorkingEnd; hour++) {
            for (let minutes = 0; minutes < 60; minutes += 30) {
                const timeValue = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                const displayTime = formatTime12Hour(hour, minutes);
                slots.push({ value: timeValue, display: displayTime });
            }
        }

        // Add final 6:00 PM slot
        slots.push({ value: '18:00', display: '6:00 PM' });

        return slots;
    }

    // Format time in 12-hour format
    function formatTime12Hour(hour, minutes) {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${String(minutes).padStart(2, '0')} ${ampm}`;
    }

    // Populate time slots when timezone changes
    function updateTimeSlots() {
        const selectedTimezone = timezoneSelect.value;
        const slots = generateTimeSlots(selectedTimezone);

        // Clear existing options except the first one
        timeSlotSelect.innerHTML = '<option value="">Select time slot</option>';

        // Add new options
        slots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot.value;
            option.textContent = slot.display;
            timeSlotSelect.appendChild(option);
        });
    }

    // Initialize time slots on page load
    if (timezoneSelect && timeSlotSelect) {
        updateTimeSlots();

        // Update time slots when timezone changes
        timezoneSelect.addEventListener('change', function() {
            updateTimeSlots();
            // Reset selected time
            timeSlotSelect.value = '';
        });
    }

    // Set minimum date to today
    if (appointmentDate) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const minDate = tomorrow.toISOString().split('T')[0];
        appointmentDate.setAttribute('min', minDate);

        // Set max date to 90 days from now
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 90);
        appointmentDate.setAttribute('max', maxDate.toISOString().split('T')[0]);

        // Disable weekends
        appointmentDate.addEventListener('input', function(e) {
            const selectedDate = new Date(e.target.value);
            const dayOfWeek = selectedDate.getDay();

            // If Saturday (6) or Sunday (0), clear the selection
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                alert('Please select a weekday (Monday-Friday). Appointments are not available on weekends.');
                e.target.value = '';
            }
        });
    }

    // Form submission handler
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            // Get form data
            const formData = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                meetingType: document.getElementById('meetingType').value,
                appointmentDate: document.getElementById('appointmentDate').value,
                appointmentTime: document.getElementById('appointmentTime').value,
                timezone: document.getElementById('timezone').value,
                notes: document.getElementById('notes').value
            };

            // Validate form data
            if (!formData.fullName || !formData.email || !formData.meetingType ||
                !formData.appointmentDate || !formData.appointmentTime) {
                e.preventDefault();
                alert('Please fill in all required fields.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                e.preventDefault();
                alert('Please enter a valid email address.');
                return;
            }

            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scheduling...';
            submitButton.disabled = true;

            // Let the form submit to PHP backend
        });
    }

    function formatAppointmentDateTime(date, time, timezone) {
        const dateObj = new Date(date);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('en-US', options);

        // Convert 24-hour time to 12-hour format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        const formattedTime = `${displayHour}:${minutes} ${ampm}`;

        // Get timezone display name
        const timezoneNames = {
            'America/New_York': 'ET',
            'America/Chicago': 'CT',
            'America/Denver': 'MT',
            'America/Los_Angeles': 'PT',
            'Asia/Kolkata': 'IST',
            'Europe/London': 'GMT',
            'UTC': 'UTC'
        };

        const timezoneName = timezoneNames[timezone] || timezone;

        return `${formattedDate} at ${formattedTime} (${timezoneName})`;
    }

    function submitAppointment(formData) {
        // Show loading state
        const submitButton = appointmentForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitButton.disabled = true;

        // Simulate API call
        setTimeout(function() {
            // In a real application, you would send this data to your backend
            console.log('Appointment Data:', formData);

            // Create calendar event data
            const calendarData = createCalendarEvent(formData);
            console.log('Calendar Event:', calendarData);

            // Show success message
            showSuccessMessage(formData);

            // Reset form
            appointmentForm.reset();

            // Restore button
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }, 1500);
    }

    function createCalendarEvent(formData) {
        const startDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
        const endDateTime = new Date(startDateTime.getTime() + 45 * 60000); // 45 minutes

        return {
            summary: 'CSRInsights Consultation',
            description: `Consultation meeting with CSRInsights\n\nMeeting Platform: ${formData.meetingType}\nNotes: ${formData.notes || 'None'}`,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: formData.timezone
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: formData.timezone
            },
            attendees: [
                { email: formData.email, displayName: formData.fullName }
            ]
        };
    }

    function showSuccessMessage(formData) {
        const successHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;" id="successModal">
                <div style="background: white; padding: 3rem; border-radius: 10px; max-width: 500px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                    <div style="width: 80px; height: 80px; background: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                        <i class="fas fa-check" style="color: white; font-size: 3rem;"></i>
                    </div>
                    <h2 style="color: #1a4d2e; margin-bottom: 1rem;">Appointment Confirmed!</h2>
                    <p style="color: #666; margin-bottom: 1.5rem; line-height: 1.6;">
                        Thank you, ${formData.fullName}! Your appointment has been scheduled successfully.
                        We've sent a meeting invite to <strong>${formData.email}</strong> with all the details.
                    </p>
                    <p style="color: #666; margin-bottom: 2rem;">
                        <i class="fas fa-envelope" style="color: #ff6b35; margin-right: 0.5rem;"></i>
                        Please check your email for the meeting link and calendar invitation.
                    </p>
                    <button onclick="document.getElementById('successModal').remove(); window.location.href='index.html';"
                            style="background: #1a4d2e; color: white; border: none; padding: 1rem 2rem; border-radius: 5px; font-size: 1rem; cursor: pointer; font-weight: 600;">
                        Return to Home
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', successHTML);

        // Auto close after 10 seconds
        setTimeout(function() {
            const modal = document.getElementById('successModal');
            if (modal) {
                modal.remove();
                window.location.href = 'index.html';
            }
        }, 10000);
    }

    // Add real-time validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.style.borderColor = '#f44336';
                showFieldError(this, 'Please enter a valid email address');
            } else {
                this.style.borderColor = '#e0e0e0';
                hideFieldError(this);
            }
        });
    }

    function showFieldError(field, message) {
        hideFieldError(field);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#f44336';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    function hideFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
});
