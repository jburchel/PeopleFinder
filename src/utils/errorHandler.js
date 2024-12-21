export const errorHandler = {
  handleError: (error) => {
    console.error('Application error:', error);
    
    // Log to monitoring service if available
    if (process.env.NODE_ENV === 'production') {
      // Add your error logging service here
    }
    
    // Show user-friendly error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = 'An error occurred. Please try again later.';
    document.body.appendChild(errorMessage);
  }
}; 