// Example data processing for EuroCheck Analytics Dashboard MVP
// This shows how to generate the three core visualizations

const fs = require('fs');
const path = require('path');

// Load company data (using companies-min.json as example)
const companiesPath = path.join(__dirname, '../data/companies-min.json');
const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));

// 1. Company Count by Country
function getCompanyCountByCountry(companies) {
  const countryCounts = {};
  const euStatusCounts = { eu: 0, european: 0, 'non-eu': 0, unknown: 0 };
  
  companies.forEach(company => {
    const country = company.hq_country || 'Unknown';
    const euStatus = company.eu_status || 'unknown';
    
    // Count by country
    countryCounts[country] = (countryCounts[country] || 0) + 1;
    
    // Count by EU status
    euStatusCounts[euStatus] = (euStatusCounts[euStatus] || 0) + 1;
  });
  
  // Sort countries by count (descending)
  const sortedCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15); // Top 15 countries
  
  return {
    totalCompanies: companies.length,
    topCountries: sortedCountries,
    euStatusBreakdown: euStatusCounts
  };
}

// 2. Recent Additions (simulated - needs actual added_date field)
function getRecentAdditions(companies, days = 30) {
  // For MVP, we'll simulate by taking random companies
  // In production, this would filter by actual added_date
  
  const recent = companies
    .sort(() => Math.random() - 0.5) // Random shuffle for demo
    .slice(0, 20) // Show 20 recent additions
    .map(company => ({
      id: company.id,
      name: company.name,
      hq_country: company.hq_country,
      eu_status: company.eu_status,
      added_date: new Date().toISOString().split('T')[0] // Today's date for demo
    }));
  
  return {
    count: recent.length,
    period: `${days} days`,
    additions: recent
  };
}

// 3. Search Trends (simulated - needs actual search logs)
function getSearchTrends() {
  // Simulated search data for MVP
  // In production, this would come from extension search logs
  
  const days = 7;
  const searches = [
    { domain: 'amazon.com', count: 245, trend: 'up' },
    { domain: 'zalando.com', count: 189, trend: 'up' },
    { domain: 'aliexpress.com', count: 156, trend: 'down' },
    { domain: 'ebay.com', count: 132, trend: 'stable' },
    { domain: 'mediamarkt.com', count: 98, trend: 'up' },
    { domain: 'apple.com', count: 87, trend: 'stable' },
    { domain: 'samsung.com', count: 76, trend: 'down' },
    { domain: 'spotify.com', count: 65, trend: 'up' },
    { domain: 'netflix.com', count: 54, trend: 'stable' },
    { domain: 'microsoft.com', count: 43, trend: 'up' }
  ];
  
  const dailyTrend = Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0],
    searches: Math.floor(Math.random() * 500) + 200
  }));
  
  return {
    period: `${days} days`,
    topSearches: searches,
    dailyTrend: dailyTrend,
    totalSearches: searches.reduce((sum, s) => sum + s.count, 0)
  };
}

// Generate all analytics data
function generateAnalyticsData() {
  console.log('Generating EuroCheck Analytics Dashboard data...');
  
  const countryData = getCompanyCountByCountry(companies);
  const recentAdditions = getRecentAdditions(companies);
  const searchTrends = getSearchTrends();
  
  const analyticsData = {
    generated_at: new Date().toISOString(),
    data_source: 'companies-min.json',
    company_count_by_country: countryData,
    recent_additions: recentAdditions,
    search_trends: searchTrends
  };
  
  return analyticsData;
}

// Save to file (for dashboard to load)
function saveAnalyticsData(data, outputPath) {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`Analytics data saved to: ${outputPath}`);
}

// Example usage
if (require.main === module) {
  const analyticsData = generateAnalyticsData();
  
  // Display summary
  console.log('\n=== EuroCheck Analytics Summary ===');
  console.log(`Total companies: ${analyticsData.company_count_by_country.totalCompanies}`);
  console.log(`Top 5 countries:`);
  analyticsData.company_count_by_country.topCountries.slice(0, 5).forEach(([country, count]) => {
    console.log(`  ${country}: ${count} companies`);
  });
  
  console.log(`\nEU Status breakdown:`);
  Object.entries(analyticsData.company_count_by_country.euStatusBreakdown).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} companies`);
  });
  
  console.log(`\nRecent additions: ${analyticsData.recent_additions.count} companies`);
  console.log(`Top searches: ${analyticsData.search_trends.topSearches.length} domains tracked`);
  
  // Save to file
  const outputPath = path.join(__dirname, '../analytics/dashboard/data/analytics-mvp.json');
  saveAnalyticsData(analyticsData, outputPath);
}

module.exports = {
  getCompanyCountByCountry,
  getRecentAdditions,
  getSearchTrends,
  generateAnalyticsData
};