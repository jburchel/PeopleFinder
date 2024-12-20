import { config } from './config.js';

export const api = {
  async fetchPeopleGroups(country) {
    const url = `https://joshuaproject.net/api/v2/peoples?api_key=${config.apiKey}&ROG3=${country}`;
    // API call implementation
  },
  
  async fetchCountries() {
    const url = `https://joshuaproject.net/api/v2/countries?api_key=${config.apiKey}`;
    // API call implementation
  }
  // Other API methods...
}; 