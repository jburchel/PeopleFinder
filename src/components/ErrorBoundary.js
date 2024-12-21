export class ErrorBoundary {
  constructor(fallbackUI) {
    this.fallbackUI = fallbackUI;
  }

  static handleError(error, errorInfo) {
    console.error('Application error:', error);
    console.error('Error info:', errorInfo);

    // Display fallback UI
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="error-message">
          <h3>Something went wrong</h3>
          <p>Please try refreshing the page. If the problem persists, contact support.</p>
        </div>
      `;
    }
  }
} 