# Contributing to EuroCheck

Thanks for helping make EuroCheck better! 🇪🇺

## Adding Companies

The easiest way to contribute is adding companies to our database.

### Quick Add (via Issue)

1. [Open a new issue](../../issues/new?template=company-request.md)
2. Fill in the company details
3. We'll add it for you

### Full Add (via PR)

1. Fork the repo
2. Edit `data/companies.json`:
```json
{
  "id": "company-name",
  "name": "Company Name",
  "hq_country": "XX",
  "hq_city": "City",
  "founded_year": 2000,
  "parent_company": null,
  "ultimate_parent": null,
  "eu_status": "eu|non-eu|mixed",
  "confidence": "high|medium|low",
  "sources": ["wikipedia.org", "company-website.com"],
  "last_verified": "2025-01-26"
}
```

3. Add domain mapping to `data/domains.json`:
```json
{
  "domain": "company.com",
  "company_id": "company-name",
  "is_primary": true
}
```

4. Run `npm run build:chrome` to validate
5. Submit PR

### Country Codes

Use ISO 3166-1 alpha-2 codes:
- 🇩🇪 Germany = `DE`
- 🇫🇷 France = `FR`
- 🇸🇪 Sweden = `SE`
- 🇺🇸 USA = `US`
- 🇨🇳 China = `CN`

### EU Status Rules

| Status | When to use |
|--------|-------------|
| `eu` | HQ in EU/EEA, no non-EU parent |
| `non-eu` | HQ outside EU/EEA |
| `mixed` | EU HQ but non-EU ultimate parent |

## Code Contributions

1. Fork & clone
2. `npm install`
3. Make changes in `src/`
4. `npm run build:chrome` to test
5. Submit PR

## Questions?

Open an issue or email ea.pekka@proton.me
