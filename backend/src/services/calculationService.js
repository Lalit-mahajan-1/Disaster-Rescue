const geolib = require('geolib');

class CalculationService {
  
  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    return geolib.getDistance(
      { latitude: lat1, longitude: lon1 },
      { latitude: lat2, longitude: lon2 }
    ) / 1000; // Convert meters to kilometers
  }

  /**
   * Check if a point is within radius of another point
   */
  isWithinRadius(centerLat, centerLon, pointLat, pointLon, radiusKm) {
    const distance = this.calculateDistance(centerLat, centerLon, pointLat, pointLon);
    return distance <= radiusKm;
  }

  /**
   * Get bounding box coordinates for a radius
   */
  getBoundingBox(latitude, longitude, radiusKm) {
    const bounds = geolib.getBoundsOfDistance(
      { latitude, longitude },
      radiusKm * 1000 // Convert km to meters
    );

    return {
      minLat: bounds[0].latitude,
      minLon: bounds[0].longitude,
      maxLat: bounds[1].latitude,
      maxLon: bounds[1].longitude
    };
  }

  /**
   * Calculate disaster frequency score (0-10)
   */
  calculateFrequencyScore(disasterCount, timeRangeYears) {
    const avgPerYear = disasterCount / timeRangeYears;
    
    if (avgPerYear >= 5) return 10;
    if (avgPerYear >= 3) return 8;
    if (avgPerYear >= 2) return 6;
    if (avgPerYear >= 1) return 4;
    if (avgPerYear >= 0.5) return 2;
    return 1;
  }

  /**
   * Calculate overall risk score based on multiple factors
   */
  calculateRiskScore(statistics) {
    let score = 0;

    // Factor 1: Total number of disasters (max 3 points)
    score += Math.min(statistics.total / 10, 3);

    // Factor 2: Diversity of disaster types (max 2 points)
    const typeCount = Object.keys(statistics.byType).length;
    score += Math.min(typeCount / 3, 2);

    // Factor 3: High severity disasters (max 3 points)
    const severeFive = statistics.bySeverity[5] || 0;
    const severeFour = statistics.bySeverity[4] || 0;
    score += Math.min((severeFive * 0.3 + severeFour * 0.2), 3);

    // Factor 4: Recent activity (max 2 points)
    const currentYear = new Date().getFullYear();
    const lastThreeYears = [currentYear, currentYear - 1, currentYear - 2];
    const recentCount = lastThreeYears.reduce((sum, year) => 
      sum + (statistics.byYear[year] || 0), 0
    );
    score += Math.min(recentCount / 5, 2);

    return Math.min(Math.round(score), 10);
  }

  /**
   * Get seasonal patterns from disaster data
   */
  getSeasonalPatterns(disasters) {
    const monthCounts = Array(12).fill(0);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    disasters.forEach(disaster => {
      const month = new Date(disaster.dateOccurred).getMonth();
      monthCounts[month]++;
    });

    const patterns = monthCounts.map((count, index) => ({
      month: monthNames[index],
      count: count,
      risk: count > 5 ? 'high' : count > 2 ? 'medium' : 'low'
    }));

    return patterns;
  }

  /**
   * Predict future risk based on historical trends
   */
  predictFutureRisk(disasters, type = null) {
    const filtered = type 
      ? disasters.filter(d => d.type === type)
      : disasters;

    if (filtered.length < 2) {
      return { trend: 'insufficient_data', prediction: null };
    }

    // Group by year
    const yearCounts = {};
    filtered.forEach(disaster => {
      const year = new Date(disaster.dateOccurred).getFullYear();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    const years = Object.keys(yearCounts).map(Number).sort();
    const counts = years.map(year => yearCounts[year]);

    // Simple linear regression
    const n = years.length;
    const sumX = years.reduce((a, b) => a + b, 0);
    const sumY = counts.reduce((a, b) => a + b, 0);
    const sumXY = years.reduce((sum, year, i) => sum + year * counts[i], 0);
    const sumX2 = years.reduce((sum, year) => sum + year * year, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const predictedCount = Math.max(0, Math.round(slope * nextYear + intercept));

    let trend = 'stable';
    if (slope > 0.5) trend = 'increasing';
    else if (slope < -0.5) trend = 'decreasing';

    return {
      trend,
      prediction: predictedCount,
      confidence: n >= 5 ? 'high' : n >= 3 ? 'medium' : 'low'
    };
  }

  /**
   * Generate recommendations based on risk analysis
   */
  generateRecommendations(statistics, topDisasters) {
    const recommendations = [];

    topDisasters.forEach(([type, count]) => {
      const severity = this.calculateFrequencyScore(count, 10);
      
      const typeRecommendations = {
        earthquake: [
          'Secure heavy furniture to walls',
          'Create a family emergency plan',
          'Maintain earthquake insurance',
          'Prepare an emergency kit with supplies for 72 hours'
        ],
        flood: [
          'Purchase flood insurance',
          'Keep important documents in waterproof containers',
          'Know your evacuation routes',
          'Install sump pumps and check drains regularly'
        ],
        hurricane: [
          'Install storm shutters',
          'Trim trees and secure outdoor items',
          'Have plywood ready to cover windows',
          'Stock up on non-perishable food and water'
        ],
        wildfire: [
          'Create defensible space around your home',
          'Keep gutters clear of debris',
          'Have evacuation bags ready',
          'Sign up for local fire alerts'
        ],
        tornado: [
          'Identify a safe room in your home',
          'Install a weather radio',
          'Conduct tornado drills',
          'Keep emergency supplies in your safe room'
        ]
      };

      if (typeRecommendations[type]) {
        recommendations.push({
          type,
          severity,
          count,
          actions: typeRecommendations[type]
        });
      }
    });

    return recommendations;
  }
}

module.exports = new CalculationService();