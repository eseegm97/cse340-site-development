// Account Update Form Validation
document.addEventListener('DOMContentLoaded', function() {
    const updateForm = document.getElementById('updateForm');
    
    if (updateForm) {
        // Get form elements
        const firstNameInput = document.getElementById('account_firstname');
        const lastNameInput = document.getElementById('account_lastname');
        const emailInput = document.getElementById('account_email');
        const submitBtn = document.getElementById('updateAccountBtn');
        
        // Error message elements
        const firstNameError = document.getElementById('firstname-error');
        const lastNameError = document.getElementById('lastname-error');
        const emailError = document.getElementById('email-error');
        
        // Validation functions
        function validateFirstName() {
            const value = firstNameInput.value.trim();
            let isValid = true;
            let message = '';
            
            if (!value) {
                message = 'First name is required.';
                isValid = false;
            } else if (value.length < 1) {
                message = 'First name must be at least 1 character long.';
                isValid = false;
            } else if (value.length > 50) {
                message = 'First name must be no more than 50 characters long.';
                isValid = false;
            }
            
            showError(firstNameError, message, isValid);
            return isValid;
        }
        
        function validateLastName() {
            const value = lastNameInput.value.trim();
            let isValid = true;
            let message = '';
            
            if (!value) {
                message = 'Last name is required.';
                isValid = false;
            } else if (value.length < 2) {
                message = 'Last name must be at least 2 characters long.';
                isValid = false;
            } else if (value.length > 50) {
                message = 'Last name must be no more than 50 characters long.';
                isValid = false;
            }
            
            showError(lastNameError, message, isValid);
            return isValid;
        }
        
        function validateEmail() {
            const value = emailInput.value.trim();
            let isValid = true;
            let message = '';
            
            if (!value) {
                message = 'Email address is required.';
                isValid = false;
            } else if (!isValidEmail(value)) {
                message = 'Please enter a valid email address.';
                isValid = false;
            } else if (value.length > 100) {
                message = 'Email address must be no more than 100 characters long.';
                isValid = false;
            }
            
            showError(emailError, message, isValid);
            return isValid;
        }
        
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        
        function showError(errorElement, message, isValid) {
            if (isValid) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
                errorElement.parentElement.classList.remove('has-error');
            } else {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
                errorElement.parentElement.classList.add('has-error');
            }
        }
        
        // Real-time validation on blur
        firstNameInput.addEventListener('blur', validateFirstName);
        lastNameInput.addEventListener('blur', validateLastName);
        emailInput.addEventListener('blur', validateEmail);
        
        // Real-time validation on input (for immediate feedback)
        firstNameInput.addEventListener('input', function() {
            if (firstNameInput.value.trim()) {
                validateFirstName();
            }
        });
        
        lastNameInput.addEventListener('input', function() {
            if (lastNameInput.value.trim()) {
                validateLastName();
            }
        });
        
        emailInput.addEventListener('input', function() {
            if (emailInput.value.trim()) {
                validateEmail();
            }
        });
        
        // Form submission validation
        updateForm.addEventListener('submit', function(event) {
            const isFirstNameValid = validateFirstName();
            const isLastNameValid = validateLastName();
            const isEmailValid = validateEmail();
            
            if (!isFirstNameValid || !isLastNameValid || !isEmailValid) {
                event.preventDefault();
                event.stopPropagation();
                
                // Focus on first invalid field
                if (!isFirstNameValid) {
                    firstNameInput.focus();
                } else if (!isLastNameValid) {
                    lastNameInput.focus();
                } else if (!isEmailValid) {
                    emailInput.focus();
                }
                
                return false;
            }
        });
        
        // Clear error messages when user starts typing
        [firstNameInput, lastNameInput, emailInput].forEach(input => {
            input.addEventListener('focus', function() {
                const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
                if (errorElement) {
                    errorElement.style.display = 'none';
                    input.parentElement.classList.remove('has-error');
                }
            });
        });
    }
    
    // Password Change Form Validation
    const passwordForm = document.getElementById('passwordForm');
    
    if (passwordForm) {
        const passwordInput = document.getElementById('account_password');
        const passwordError = document.getElementById('password-error');
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        
        function validatePassword() {
            const value = passwordInput.value;
            let isValid = true;
            let message = '';
            
            if (!value) {
                message = 'Password is required.';
                isValid = false;
            } else if (value.length < 12) {
                message = 'Password must be at least 12 characters long.';
                isValid = false;
            } else if (value.length > 255) {
                message = 'Password must be no more than 255 characters long.';
                isValid = false;
            } else if (!/(?=.*\d)/.test(value)) {
                message = 'Password must contain at least one number.';
                isValid = false;
            } else if (!/(?=.*[a-z])/.test(value)) {
                message = 'Password must contain at least one lowercase letter.';
                isValid = false;
            } else if (!/(?=.*[A-Z])/.test(value)) {
                message = 'Password must contain at least one uppercase letter.';
                isValid = false;
            } else if (!/(?=.*[^a-zA-Z0-9])/.test(value)) {
                message = 'Password must contain at least one special character.';
                isValid = false;
            } else if (/\s/.test(value)) {
                message = 'Password cannot contain spaces.';
                isValid = false;
            }
            
            showError(passwordError, message, isValid);
            return isValid;
        }
        
        // Real-time validation
        passwordInput.addEventListener('blur', validatePassword);
        passwordInput.addEventListener('input', function() {
            if (passwordInput.value) {
                validatePassword();
            }
        });
        
        // Form submission validation
        passwordForm.addEventListener('submit', function(event) {
            const isPasswordValid = validatePassword();
            
            if (!isPasswordValid) {
                event.preventDefault();
                event.stopPropagation();
                passwordInput.focus();
                return false;
            }
        });
        
        // Clear error message on focus
        passwordInput.addEventListener('focus', function() {
            passwordError.style.display = 'none';
            passwordInput.parentElement.classList.remove('has-error');
        });
    }
});