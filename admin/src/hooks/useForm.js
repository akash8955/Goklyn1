import { useState, useCallback } from 'react';
import * as Yup from 'yup';

/**
 * Custom hook for form handling with validation
 * @param {Object} options - Form configuration options
 * @param {Object} options.initialValues - Initial form values
 * @param {Object} options.validationSchema - Yup validation schema
 * @param {Function} options.onSubmit - Form submission handler
 * @returns {Object} Form utilities and state
 */
const useForm = ({ 
  initialValues = {}, 
  validationSchema = Yup.object({}),
  onSubmit 
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  /**
   * Validate form fields against the validation schema
   * @param {Object} valuesToValidate - Values to validate
   * @returns {Object} Validation errors
   */
  const validateForm = useCallback(
    async (valuesToValidate) => {
      try {
        await validationSchema.validate(valuesToValidate, { abortEarly: false });
        return {};
      } catch (validationErrors) {
        const formattedErrors = {};
        
        validationErrors.inner.forEach((error) => {
          if (error.path) {
            formattedErrors[error.path] = error.message;
          }
        });
        
        return formattedErrors;
      }
    },
    [validationSchema]
  );

  /**
   * Handle input change events
   * @param {Object} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const inputValue = type === 'checkbox' ? checked : value;
    
    setValues((prevValues) => ({
      ...prevValues,
      [name]: inputValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  /**
   * Handle input blur events
   * @param {Object} e - Input blur event
   */
  const handleBlur = async (e) => {
    const { name } = e.target;
    
    // Mark field as touched
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    // Validate only the current field
    try {
      await validationSchema.validateAt(name, values);
      
      // Clear error if validation passes
      if (errors[name]) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: undefined,
        }));
      }
    } catch (error) {
      // Set error if validation fails
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error.message,
      }));
    }
  };

  /**
   * Set a form field value programmatically
   * @param {string} name - Field name
   * @param {*} value - Field value
   */
  const setFieldValue = (name, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    // Clear error when value is set programmatically
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  /**
   * Set a form field error programmatically
   * @param {string} name - Field name
   * @param {string} message - Error message
   */
  const setFieldError = (name, message) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: message,
    }));
  };

  /**
   * Reset the form to its initial state
   */
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitError(null);
  };

  /**
   * Handle form submission
   * @param {Object} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(values).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate all fields
    const validationErrors = await validateForm(values);
    setErrors(validationErrors);
    
    // If no validation errors, submit the form
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        await onSubmit(values, { resetForm });
      } catch (error) {
        console.error('Form submission error:', error);
        setSubmitError(
          error.message || 'An error occurred while submitting the form.'
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  /**
   * Check if a field has an error and has been touched
   * @param {string} fieldName - Field name
   * @returns {boolean} True if the field has an error and has been touched
   */
  const hasError = (fieldName) => {
    return Boolean(touched[fieldName] && errors[fieldName]);
  };

  /**
   * Get error message for a field
   * @param {string} fieldName - Field name
   * @returns {string} Error message or undefined
   */
  const getError = (fieldName) => {
    return touched[fieldName] ? errors[fieldName] : undefined;
  };

  // Internal function to set submitting state
  const setSubmitting = (isSubmitting) => {
    setIsSubmitting(isSubmitting);
  };

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    
    // Form actions
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    setSubmitting, // Expose setSubmitting
    
    // Helpers
    hasError,
    getError,
    
    // For controlled components
    getFieldProps: (name) => ({
      name,
      value: values[name] ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: hasError(name),
      helperText: getError(name),
    }),
    
    // For checkboxes, radio buttons, etc.
    getCheckboxProps: (name) => ({
      name,
      checked: Boolean(values[name]),
      onChange: handleChange,
      onBlur: handleBlur,
    }),
  };
};

export default useForm;
