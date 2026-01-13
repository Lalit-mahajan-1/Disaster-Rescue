const axios = require('axios');
const { OPENCAGE_API_KEY } = require('../config/env');
const logger = require('../utils/logger');

class GeocodingService {
  
  /**
   * Convert address to coordinates (Geocoding)
   */
  async geocode(address) {
    try {
      // Using OpenCage Geocoding API (Free tier: 2,500 requests/day)
      const url = `https://api.opencagedata.com/geocode/v1/json`;
      const response = await axios.get(url, {
        params: {
          q: address,
          key: OPENCAGE_API_KEY,
          limit: 1,
          no_annotations: 1
        }
      });

      if (response.data.results.length === 0) {
        throw new Error('Location not found');
      }

      const result = response.data.results[0];
      const { lat, lng } = result.geometry;
      const components = result.components;

      return {
        latitude: lat,
        longitude: lng,
        city: components.city || components.town || components.village || components.county,
        state: components.state || components.region,
        country: components.country,
        countryCode: components.country_code?.toUpperCase(),
        formattedAddress: result.formatted
      };
    } catch (error) {
      logger.error(`Geocoding error: ${error.message}`);
      
      // Fallback to Nominatim (OpenStreetMap) - Free, no API key needed
      return this.geocodeWithNominatim(address);
    }
  }

  /**
   * Fallback geocoding using Nominatim (OpenStreetMap)
   */
  async geocodeWithNominatim(address) {
    try {
      const url = 'https://nominatim.openstreetmap.org/search';
      const response = await axios.get(url, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'DisasterManagementApp/1.0'
        }
      });

      if (response.data.length === 0) {
        throw new Error('Location not found');
      }

      const result = response.data[0];
      const address_data = result.address;

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        city: address_data.city || address_data.town || address_data.village,
        state: address_data.state,
        country: address_data.country,
        countryCode: address_data.country_code?.toUpperCase(),
        formattedAddress: result.display_name
      };
    } catch (error) {
      logger.error(`Nominatim geocoding error: ${error.message}`);
      throw new Error('Unable to geocode address');
    }
  }

  /**
   * Reverse geocoding - Convert coordinates to address
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const url = 'https://nominatim.openstreetmap.org/reverse';
      const response = await axios.get(url, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'DisasterManagementApp/1.0'
        }
      });

      const address_data = response.data.address;

      return {
        latitude,
        longitude,
        city: address_data.city || address_data.town || address_data.village,
        state: address_data.state,
        country: address_data.country,
        countryCode: address_data.country_code?.toUpperCase(),
        formattedAddress: response.data.display_name
      };
    } catch (error) {
      logger.error(`Reverse geocoding error: ${error.message}`);
      throw new Error('Unable to reverse geocode coordinates');
    }
  }

  /**
   * Get nearby cities within radius
   */
  async getNearbyCities(latitude, longitude, radiusKm = 50) {
    try {
      // Using Overpass API (OpenStreetMap) to find nearby cities
      const overpassUrl = 'https://overpass-api.de/api/interpreter';
      
      const query = `
        [out:json];
        (
          node["place"~"city|town"]["name"](around:${radiusKm * 1000},${latitude},${longitude});
        );
        out body;
      `;

      const response = await axios.post(overpassUrl, `data=${encodeURIComponent(query)}`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const cities = response.data.elements.map(element => ({
        name: element.tags.name,
        latitude: element.lat,
        longitude: element.lon,
        population: element.tags.population ? parseInt(element.tags.population) : null,
        type: element.tags.place
      }));

      return cities;
    } catch (error) {
      logger.error(`Error fetching nearby cities: ${error.message}`);
      // Return empty array if fails - not critical
      return [];
    }
  }
}

module.exports = new GeocodingService();