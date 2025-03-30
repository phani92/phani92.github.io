// Author: Phani!
// Purpose: JavaScript file for the contact

const ContactForm = (function () {
    // Initialize EmailJS
    function loadEmailJS() {
        return new Promise((resolve, reject) => {
            if (window.emailjs) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
            script.onload = () => {
                emailjs.init({
                    publicKey: 'LbUyNez59XSRigbrb',
                    blockHeadless: true,
                    blockList: {
                        list: [],
                        watchVariable: 'from_email',
                    },
                    limitRate: {
                        id: 'app',
                        throttle: 60000,
                    },
                });
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        // Simple phone validation - adjust as needed
        const phoneRegex = /^[\d\s\+\-\(\)]{10,20}$/;
        return phoneRegex.test(phone);
    }

    function showError(input, message) {
        const formGroup = input.parentElement;
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = '#ff3860';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '-5px';
        errorElement.style.marginBottom = '5px';

        // Highlight the input field
        input.style.borderColor = '#ff3860';

        // Add error message after the input
        formGroup.insertBefore(errorElement, input.nextSibling);
    }

    function removeErrorMessages() {
        // Remove all error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());

        // Reset input borders
        const inputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
        inputs.forEach(input => input.style.borderColor = '');
    }

    function showSuccessMessage(contactForm) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Your message has been sent successfully!';
        successMessage.style.color = '#48c774';
        successMessage.style.marginTop = '10px';
        successMessage.style.padding = '10px';
        successMessage.style.backgroundColor = 'rgba(72, 199, 116, 0.2)';
        successMessage.style.borderRadius = '5px';
        successMessage.style.textAlign = 'center';

        // Remove existing success messages
        const existingMessages = document.querySelectorAll('.success-message');
        existingMessages.forEach(msg => msg.remove());

        // Add the success message to the end of the form
        contactForm.appendChild(successMessage);

        // Remove success message after 5 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }

    function validateForm(e) {
        e.preventDefault();

        // Get form fields
        const nameInput = document.getElementById('input-name');
        const emailInput = document.getElementById('input-email');
        const phoneInput = document.getElementById('input-phone');
        const subjectInput = document.getElementById('input-subject');
        const messageInput = document.getElementById('input-message');

        // Reset previous error messages
        removeErrorMessages();

        // Validate fields
        let isValid = true;

        // Name validation - required and letters only
        if (!nameInput.value.trim()) {
            showError(nameInput, 'Name is required');
            isValid = false;
        } else if (!/^[a-zA-Z\s]+$/.test(nameInput.value.trim())) {
            showError(nameInput, 'Name should contain only letters');
            isValid = false;
        }

        // Email validation - required and format
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }

        // Subject validation - optional but min length if provided
        if (subjectInput.value.trim() && subjectInput.value.length < 3) {
            showError(subjectInput, 'Subject should be at least 3 characters');
            isValid = false;
        }

        // Message validation - required and min length
        if (!messageInput.value.trim()) {
            showError(messageInput, 'Message is required');
            isValid = false;
        } else if (messageInput.value.length < 10) {
            showError(messageInput, 'Message should be at least 10 characters');
            isValid = false;
        }

        // If valid, submit the form (or show success message)
        if (isValid) {
            const templateParams = {
                from_name: nameInput.value,
                from_email: emailInput.value,
                phone: phoneInput.value.trim(),
                subject: subjectInput.value,
                message: messageInput.value
            };

            emailjs.send("service_rxiyvj9", "template_vak1gc5", templateParams)
                .then((response) => {
                    console.log("SUCCESS!", response.status, response.text);
                    showSuccessMessage(this);
                    this.reset();
                }, (error) => {
                    console.error("FAILED...", error);
                    alert("Oops! Failed to send message. Please try again later.");
                });
        }
    }

    // Public methods
    return {
        init: function () {
            loadEmailJS().then(() => {
                const contactForm = document.querySelector('.contact-form');
                if (contactForm) {
                    contactForm.addEventListener('submit', validateForm);
                }
            }).catch((error) => {
                console.error('Error loading EmailJS:', error);
            });
        },
    };
})();
