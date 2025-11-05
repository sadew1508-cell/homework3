/*
Program name: patient-form.html
Author: Sekinat Adewunmi
Date created: 10/28/2025
Date last edited: 11/05/2025
Version: 1.0
Description: Patient Registration Form for MIS7375 Homework 1
*/
// Global flag and references to control form submission
let isFormValid = false;
const form = document.getElementById('registration');
const submitButton = document.querySelector('input[type="submit"]');

// Immediately disable the submit button until form is validated
if (submitButton) {
    // The submit button is initially a generic button to prevent default submission
    submitButton.disabled = true;
    submitButton.value = 'Fill Out Form';
    submitButton.type = 'button';
}

/* ----------------------------
	CustomValidation Prototype
---------------------------- */

function CustomValidation(input) {
    this.invalidities = [];
    this.validityChecks = [];
    this.inputNode = input;
    this.registerListeners();
}

CustomValidation.prototype = {
    addInvalidity: function(message) {
        // Ensure message isn't duplicated
        if (this.invalidities.indexOf(message) === -1) {
             this.invalidities.push(message);
        }
    },
    clearInvalidities: function() {
        this.invalidities = [];
    },
    getInvalidities: function() {
        // Use the default HTML required message if provided, otherwise list custom errors
        if (this.invalidities.length === 0 && this.inputNode.hasAttribute('required') && this.inputNode.value === '') {
             return `${this.inputNode.name} is required.`;
        }
        return this.invalidities.join('. \n');
    },
    // Check all rules for an input and update the requirement list on the page
    checkValidity: function(input) {
        this.clearInvalidities(); // Start fresh before checking

        for (var i = 0; i < this.validityChecks.length; i++) {
            const check = this.validityChecks[i];
            const isInvalid = check.isInvalid(input);

            if (isInvalid) {
                this.addInvalidity(check.invalidityMessage);
            }

            const requirementElement = check.element;

            if (requirementElement) {
                // Remove existing classes first to prevent flashing
                requirementElement.classList.remove('invalid', 'valid');
                if (isInvalid) {
                    requirementElement.classList.add('invalid');
                } else if (input.value !== '') { // Mark as valid only if data is present and passes the check
                    requirementElement.classList.add('valid');
                }
            }
        }
    },
    checkInput: function() {
        this.checkValidity(this.inputNode);

        if (this.invalidities.length === 0) {
            // Field is valid
            this.inputNode.setCustomValidity('');
            return true;
        } else {
            // Field is invalid
            const message = this.getInvalidities();
            this.inputNode.setCustomValidity(message);
            return false;
        }
    },
    registerListeners: function() {
        const CustomValidation = this;

        // Validation on input/keyup (for real-time feedback)
        this.inputNode.addEventListener('input', function() {
            CustomValidation.checkInput();
            checkOverallFormValidity();
        });

        // Validation on blur (when user leaves the field)
        this.inputNode.addEventListener('blur', function() {
            CustomValidation.checkInput();
            checkOverallFormValidity();
        });
    }
};

/* ----------------------------
	Centralized Utility Functions
---------------------------- */

// Helper to get the value of another field for comparisons
const getInputValue = (id) => document.getElementById(id) ? document.getElementById(id).value : '';

// Helper for date validation (MM/DD/YYYY)
const isDateValid = (dateString) => {
    // Check if the input is a valid date string
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;

    const inputDate = new Date(dateString);
    // Requirements: Must not be in the future or more than 120 years old.
    const minDate = new Date('1905-01-01'); // 120 years ago
    const maxDate = new Date('2025-10-16'); // Date from original HTML

    // Check against the 120-year and future limits
    return inputDate >= minDate && inputDate <= maxDate;
};

// Helper function to create selectors for list items based on the field ID
const reqList = (id, index) => document.querySelector(`label[for="${id}"] .input-requirements li:nth-child(${index})`);


/* ----------------------------
	Validity Checks for ALL FIELDS (Updated Selectors)
---------------------------- */

// --- Personal Information ---
const firstNameValidityChecks = [
    {
        isInvalid: (input) => input.value.length < 1 || input.value.length > 30, // 1 to 30 characters
        invalidityMessage: 'First Name must be at least 1 and no more than 30 characters.',
        element: reqList('fname', 1)
    },
    {
        isInvalid: (input) => !/^[A-Za-z'-]+$/.test(input.value),
        invalidityMessage: 'Only letters, apostrophes, and dashes are allowed.', // ADVANCED EDITING
        element: reqList('fname', 2)
    }
];

const middleInitialValidityChecks = [
    {
        isInvalid: (input) => input.value !== '' && input.value.length > 1, // optional, 1 character
        invalidityMessage: 'Middle Initial must be 1 character or left blank.',
        element: reqList('mname', 1)
    },
    {
        isInvalid: (input) => input.value !== '' && !/^[A-Za-z]$/.test(input.value), // letters only
        invalidityMessage: 'Middle Initial must only contain letters if entered.',
        element: reqList('mname', 2)
    }
];

const lastNameValidityChecks = [
    {
        isInvalid: (input) => input.value.length < 1 || input.value.length > 30, // 1 to 30 characters
        invalidityMessage: 'Last Name must be at least 1 and no more than 30 characters.',
        element: reqList('lname', 1)
    },
    {
        isInvalid: (input) => !/^[A-Za-z'-]+$/.test(input.value),
        invalidityMessage: 'Only letters, apostrophes, and dashes are allowed.', // ADVANCED EDITING
        element: reqList('lname', 2)
    }
];

const dobValidityChecks = [
    {
        isInvalid: (input) => input.value === '',
        invalidityMessage: 'Date of Birth (MM/DD/YYYY) is required.',
    },
    {
        isInvalid: (input) => !isDateValid(input.value),
        invalidityMessage: 'Date must not be in the future or older than 120 years.', // ADVANCED EDITING
        element: reqList('dob', 2)
    }
];

const ssnValidityChecks = [
    {
        isInvalid: (input) => input.value === '',
        invalidityMessage: 'Social Security / ID is required.',
    },
    {
        isInvalid: (input) => !/^\d{9}$|^\d{3}-\d{2}-\d{4}$/.test(input.value), // Allow 9 digits or formatted (checking for 11 chars total with dashes)
        invalidityMessage: 'Must be 9 digits (formatted as ###-##-####).',
        element: reqList('ssn', 1)
    },
    {
        isInvalid: (input) => input.value.includes('-'), // To cover the "formatted" list item only.
        invalidityMessage: 'Text is hidden. Validated to be numeric/formatted.',
        element: reqList('ssn', 2)
    }
];

// --- Account Information ---
const emailValidityChecks = [
    {
        isInvalid: (input) => input.value === '',
        invalidityMessage: 'Email address is required.',
    },
    {
        isInvalid: (input) => !/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,6}$/.test(input.value),
        invalidityMessage: 'Must be in the format name@domain.tld.', // ADVANCED EDITING
        element: reqList('email', 1)
    },
    {
        isInvalid: (input) => input.value !== input.value.toLowerCase(),
        invalidityMessage: 'Email address must be lowercase.', // Force lower case
        element: reqList('email', 2)
    }
];

const phoneValidityChecks = [
    {
        isInvalid: (input) => input.value === '',
        invalidityMessage: 'Phone number is required.',
    },
    {
        isInvalid: (input) => !/^\d{3}-\d{3}-\d{4}$/.test(input.value),
        invalidityMessage: 'Must be in the format 000-000-0000.', // If present, validate
        element: reqList('phone', 1)
    }
];

const userIdValidityChecks = [
    {
        isInvalid: (input) => input.value.length < 5 || input.value.length > 20,
        invalidityMessage: 'User ID must be 5 to 20 characters.', //
        element: reqList('user_id', 1)
    },
    {
        isInvalid: (input) => /^\d/.test(input.value),
        invalidityMessage: 'User ID cannot start with a number.', // ADVANCED EDITING
        element: reqList('user_id', 2)
    },
    {
        isInvalid: (input) => !/^[A-Za-z0-9_-]+$/.test(input.value),
        invalidityMessage: 'Only letters, numbers, dash, and underscore are allowed. No spaces.', // ADVANCED EDITING
        element: reqList('user_id', 3)
    }
];

const passwordValidityChecks = [
    {
        isInvalid: (input) => input.value.length < 8,
        invalidityMessage: 'Password must be at least 8 characters long.', //
        element: reqList('password', 1)
    },
    {
        isInvalid: (input) => !input.value.match(/[0-9]/g),
        invalidityMessage: 'Must contain at least 1 digit (number).', // ADVANCED EDITING
        element: reqList('password', 2)
    },
    {
        isInvalid: (input) => !input.value.match(/[a-z]/g),
        invalidityMessage: 'Must contain at least 1 lowercase letter.', // ADVANCED EDITING
        element: reqList('password', 3)
    },
    {
        isInvalid: (input) => !input.value.match(/[A-Z]/g),
        invalidityMessage: 'Must contain at least 1 uppercase letter.', // ADVANCED EDITING
        element: reqList('password', 4)
    },
    {
        isInvalid: (input) => input.value !== '' && input.value === getInputValue('user_id'),
        invalidityMessage: 'Password cannot equal your User ID.', //
        element: reqList('password', 5)
    }
];

const passwordRepeatValidityChecks = [
    {
        isInvalid: (input) => input.value === '',
        invalidityMessage: 'Re-enter Password is required.',
    },
    {
        isInvalid: (input) => input.value !== getInputValue('password'),
        invalidityMessage: 'Passwords must equal each other.', //
        element: reqList('password_repeat', 1)
    }
];

// --- Address Information ---
const address1ValidityChecks = [
    {
        isInvalid: (input) => input.value.length < 2 || input.value.length > 30, // required, 2 to 30 characters
        invalidityMessage: 'Address Line 1 is required and must be 2 to 30 characters.',
    }
];

const address2ValidityChecks = [
    {
        isInvalid: (input) => input.value !== '' && (input.value.length < 2 || input.value.length > 30), // if entered, 2 to 30 characters
        invalidityMessage: 'If entered, Address Line 2 must be 2 to 30 characters.',
    }
];

const cityValidityChecks = [
    {
        isInvalid: (input) => input.value.length < 2 || input.value.length > 30, // required, 2 to 30 characters
        invalidityMessage: 'City is required and must be 2 to 30 characters.',
    }
];

const stateValidityChecks = [
    {
        isInvalid: (input) => input.value === '',
        invalidityMessage: 'State selection is required.', // Must choose a valid state
    }
];

const zipValidityChecks = [
    {
        isInvalid: (input) => input.value === '',
        invalidityMessage: 'Zip Code is required.',
    },
    {
        isInvalid: (input) => !/^\d{5}$/.test(input.value), // 5 digits only
        invalidityMessage: 'Zip Code must be exactly 5 digits.',
    }
];

/* ----------------------------
	Setup CustomValidation for all inputs
---------------------------- */

// 1. Get all relevant inputs, selects, and textareas
const allFormElements = document.querySelectorAll('.registration input:not([type="submit"]), .registration select, .registration textarea');

// 2. Map the form elements to their validation checks
allFormElements.forEach(element => {
    let checks = [];
    let elementId = element.id;

    // Use element.id to assign checks (since IDs are now unique in 3.html)
    switch(elementId) {
        case 'fname': checks = firstNameValidityChecks; break;
        case 'mname': checks = middleInitialValidityChecks; break;
        case 'lname': checks = lastNameValidityChecks; break;
        case 'dob': checks = dobValidityChecks; break;
        case 'ssn': checks = ssnValidityChecks; break;
        case 'email': checks = emailValidityChecks; break;
        case 'phone': checks = phoneValidityChecks; break;
        case 'user_id': checks = userIdValidityChecks; break;
        case 'password': checks = passwordValidityChecks; break;
        case 'password_repeat': checks = passwordRepeatValidityChecks; break;
        case 'addr1': checks = address1ValidityChecks; break;
        case 'addr2': checks = address2ValidityChecks; break;
        case 'city': checks = cityValidityChecks; break;
        case 'state': checks = stateValidityChecks; break;
        case 'zip': checks = zipValidityChecks; break;
    }

    // Only apply CustomValidation to elements that have specific checks defined
    if (checks.length > 0) {
        element.CustomValidation = new CustomValidation(element);
        element.CustomValidation.validityChecks = checks;
    }
});


/* ----------------------------
	Final Form Validation & Submission Control
---------------------------- */

// Check if all fields with CustomValidation are valid
function checkAllInputsValid() {
    let allValid = true;
    let errorCount = 0;

    // 1. Check all inputs that have CustomValidation
    allFormElements.forEach(input => {
        if (input.CustomValidation) {
            const isValid = input.CustomValidation.checkInput();
            if (!isValid) {
                allValid = false;
                errorCount++;
            }
        }
    });

    // 2. Check for required elements without CustomValidation (Radios, Selects)
    // Note: We're using standard browser validation for these, but need to count them.
    document.querySelectorAll('[required]').forEach(elem => {
        if (elem.type === 'radio') {
            const radioGroup = document.getElementsByName(elem.name);
            const isGroupChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isGroupChecked) {
                allValid = false;
                errorCount++;
            }
        } else if (elem.tagName === 'SELECT' && elem.value === '') {
            allValid = false;
            errorCount++;
        }
        // General text inputs already covered by CustomValidation.
    });

    return { allValid, errorCount };
}

// Function to update the submit button state
function checkOverallFormValidity() {
    const { allValid, errorCount } = checkAllInputsValid();
    isFormValid = allValid;

    if (submitButton) {
        if (isFormValid) {
            submitButton.disabled = false;
            submitButton.value = 'SUBMIT';
            submitButton.type = 'submit'; // Change to actual submit to load thank you page
        } else {
            submitButton.disabled = true;
            submitButton.value = `Fix ${errorCount} Errors`;
            submitButton.type = 'button'; // Prevent default submit action
        }
    }
}

// Initial check when the page loads
document.addEventListener('DOMContentLoaded', checkOverallFormValidity);


// Final Validation on Form Submission (REPLACING the VALIDATE button logic)
form.addEventListener('submit', function(event) {
    // Re-run the validation one last time (this is the VALIDATE logic)
    const { allValid } = checkAllInputsValid();

    if (!allValid) {
        // Prevent submission if errors are found, even if button was enabled by mistake
        event.preventDefault();
        // Use a custom message/modal instead of alert in a real app, but alert is used here for simplicity.
        alert('Please correct all errors before submitting.');
    }
    // If allValid is true, the form submits to the action defined in the HTML.
});


// Utility function for the slide bar (Advanced Editing Requirement)
function updateSliderValue(value) {
    const display = document.getElementById('sliderValue');
    if (display) {
        // Format the value as currency for better UX
        display.textContent = `($${Number(value).toLocaleString()})`;
    }
}

