export function InputField(inputNode, errNode) {
    return { markAsValid, markAsInvalid };

    function markAsValid() {
        inputNode.ariaInvalid = false;
        errNode.innerText = "";
    }

    function markAsInvalid(reason) {
        inputNode.ariaInvalid = true;
        errNode.innerText = reason;
    }
}

export function validateName(name) {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
        return [false, "Name cannot be empty"];
    }

    if (trimmed.length < 3) {
        return [false, "Name must be at least 3 characters long"];
    }

    if (trimmed.length > 20) {
        return [false, "Name must be at most 20 characters long"];
    }

    // Only allow letters and spaces
    const validPattern = /^[A-Za-z\s]+$/;
    if (!validPattern.test(trimmed)) {
        return [false, "Name can only contain letters and spaces"];
    }

    return [true, null];
}

export function validateEmail(email) {
    const trimmed = email.trim();

    if (trimmed.length === 0) {
        return [false, "Email is required"];
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
        return [false, "Invalid email format"];
    }

    return [true, null];
}

export function validateTel(telephone) {
    if (typeof telephone !== "string") {
        return [false, "Telephone must be a string"];
    }

    const trimmed = telephone.trim();

    if (trimmed.length === 0) {
        return [false, "Telephone is required"];
    }

    // Allow digits, spaces, dashes, parentheses, and leading +
    const validCharsRegex = /^[\d+\-\s()]+$/;
    if (!validCharsRegex.test(trimmed)) {
        return [false, "Telephone contains invalid characters"];
    }

    // Remove all non-digit characters for length validation
    const digitsOnly = trimmed.replace(/\D/g, "");

    // Basic sanity check: most phone numbers are between 7 and 15 digits
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return [false, "Telephone must have between 7 and 15 digits"];
    }

    // Ensure + appears only at the start if present
    if (trimmed.includes("+") && !trimmed.startsWith("+")) {
        return [false, "Invalid '+' placement"];
    }

    return [true, null];
}
