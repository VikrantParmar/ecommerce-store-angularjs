import { NgModel } from '@angular/forms';

export const fieldLabels: { [field: string]: string } = {
  email: 'Email',
  password: 'Password',
  username: 'Username',
  newPassword: 'New password',
  confirmPassword: 'Confirm password',

  billingFirstName: 'First name',
  billingLastName: 'Last name',
  billingPhone: 'Phone number',
  billingEmail: 'Email',
  billingAddress: 'Address',
  billingCity: 'City',
  billingState: 'State',
  billingPostalCode: 'Postal code',

  shippingFirstName: 'First name',
  shippingLastName: 'Last name',
  shippingPhone: 'Phone number',
  shippingEmail: 'Email',
  shippingAddress: 'Address',
  shippingCity: 'City',
  shippingState: 'State',
  shippingPostalCode: 'Postal code'
};

export const defaultErrorMessages: { [errorType: string]: string } = {
  required: '{field} is required.',
  minlength: '{field} must be at least {requiredLength} characters.',
  maxlength: '{field} must be at most {requiredLength} characters.',
  email: 'Enter a valid {field}.',
  pattern: 'Invalid {field}.',
};

export let useFrontendValidation = true;

export function setValidationMode(mode: 'frontend' | 'backend') {
  useFrontendValidation = mode === 'frontend';
}


export function getFieldError(
  control: NgModel,
  backendErrors: { [key: string]: string } = {}
): string | null {
  if (!control || !control.name) return null;

  const fieldName = control.name;

  // First: check backend error
  if (backendErrors[fieldName]) {
    return backendErrors[fieldName];
  }

  // Then check frontend errors
  if (useFrontendValidation && control.errors && (control.touched || control.dirty)) {
    const errorKey = Object.keys(control.errors)[0];
    const errorDetails = control.errors[errorKey];
    const label = fieldLabels[fieldName] || 'This field';

    const template = defaultErrorMessages[errorKey];
    if (template) {
      return template
        .replace('{field}', label)
        .replace('{requiredLength}', errorDetails?.requiredLength || '')
        .replace('{actualLength}', errorDetails?.actualLength || '');
    }

    return `Invalid ${label.toLowerCase()}`;
  }

  return null;
}
