import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingSpinner component that displays an animated loading spinner
 * @param {Object} props - Component props
 * @param {('xs'|'sm'|'md'|'lg'|'xl')} [props.size='md'] - Size of the spinner
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.color='primary'] - Color of the spinner (primary, secondary, success, danger, warning, info)
 * @param {string} [props.label='Loading...'] - Accessibility label for screen readers
 * @returns {JSX.Element} Rendered spinner component
 */
const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  color = 'primary',
  label = 'Loading...' 
}) => {
  // Size classes mapping
  const sizeClasses = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-2',
    xl: 'h-16 w-16 border-4',
  };

  // Color classes mapping
  const colorClasses = {
    primary: 'border-t-blue-500 border-b-blue-500',
    secondary: 'border-t-gray-500 border-b-gray-500',
    success: 'border-t-green-500 border-b-green-500',
    danger: 'border-t-red-500 border-b-red-500',
    warning: 'border-t-yellow-500 border-b-yellow-500',
    info: 'border-t-cyan-500 border-b-cyan-500',
  };

  return (
    <div 
      className={`inline-flex flex-col items-center justify-center ${className}`}
      role="status"
      aria-label={label}
    >
      <div 
        className={`
          ${sizeClasses[size]} 
          animate-spin rounded-full 
          border-t-2 border-b-2 
          ${colorClasses[color]}
        `}
      >
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  label: PropTypes.string
};

LoadingSpinner.defaultProps = {
  size: 'md',
  className: '',
  color: 'primary',
  label: 'Loading...'
};

export default LoadingSpinner;
