// Simple router to handle page navigation
export const router = {
  navigateToResults: (searchParams) => {
    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const resultsPath = `/results.html?${queryString}`;
      window.location.href = resultsPath;
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to error page
      window.location.href = '/error.html';
    }
  }
}; 