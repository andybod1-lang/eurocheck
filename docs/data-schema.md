# EuroCheck Data Schema Documentation

This document describes the data schemas for the EuroCheck browser extension database.

## Overview

EuroCheck uses two main data files:

| File | Purpose | Schema |
|------|---------|--------|
| `data/companies.json` | Company records with ownership info | `data/schemas/company.schema.json` |
| `data/domains.json` | Domain-to-company mappings | `data/schemas/domain.schema.json` |

TypeScript interfaces are available in `src/types.d.ts`.

---

## Data Relationships

```
┌─────────────────┐         ┌─────────────────┐
│  domains.json   │         │ companies.json  │
├─────────────────┤         ├─────────────────┤
│ domain          │         │ id (PK)         │
│ company_id (FK)─┼────────►│ name            │
│ is_primary      │         │ parent_company ─┼──┐
│ country_specific│         │ ultimate_parent─┼──┤ (self-referencing)
└─────────────────┘         │ eu_status       │◄─┘
                            │ ...             │
                            └─────────────────┘
```

### Foreign Key Relationships

1. **domains.company_id → companies.id**  
   Every domain must reference an existing company ID.

2. **companies.parent_company → companies.id** (self-referencing)  
   References the direct parent company. NULL if independent.

3. **companies.ultimate_parent → companies.id** (self-referencing)  
   References the top-level parent company. NULL if this IS the ultimate parent.

---

## Company Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (lowercase alphanumeric with hyphens) |
| `name` | string | Official company name |
| `hq_country` | string | ISO 3166-1 alpha-2 country code |
| `eu_status` | enum | EU classification status |
| `confidence` | enum | Data confidence level |
| `last_verified` | string | ISO 8601 date (YYYY-MM-DD) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `hq_city` | string | Headquarters city |
| `founded_year` | integer | Year founded (1600-2100) |
| `parent_company` | string/null | FK to direct parent company |
| `ultimate_parent` | string/null | FK to ultimate parent company |
| `sources` | string[] | Source URLs for verification |
| `aliases` | string[] | Alternative/former names |
| `wikidata_id` | string | Wikidata entity ID (Q###) |
| `lei` | string | Legal Entity Identifier |
| `notes` | string | Additional context |

### Enum: eu_status

| Value | Meaning | Example |
|-------|---------|---------|
| `eu` | HQ and ownership in EU/EEA/CH | SAP, Spotify, Nokia |
| `mixed` | EU presence, non-EU ultimate parent | Google Ireland, Microsoft Deutschland |
| `non-eu` | Non-European company | Apple, Amazon, Alibaba |

### Enum: confidence

| Value | Meaning | Sources |
|-------|---------|---------|
| `high` | Verified official sources | SEC filings, company registries, annual reports |
| `medium` | Reliable secondary sources | Wikidata, reputable news, GLEIF |
| `low` | Unverified or conflicting | Wikipedia, press releases, user submissions |

### ID Format

- Lowercase alphanumeric with hyphens
- Pattern: `^[a-z0-9][a-z0-9-]*[a-z0-9]$` or single character
- Max length: 64 characters
- Examples: `apple-inc`, `sap`, `volkswagen-ag`, `alphabet-inc`

### Country Codes

Use ISO 3166-1 alpha-2 codes:
- Two uppercase letters
- Examples: `US`, `DE`, `FI`, `GB`, `FR`, `NL`

---

## Domain Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `domain` | string | Fully qualified domain name |
| `company_id` | string | FK to companies.id |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `is_primary` | boolean | Is this the company's main domain? Default: false |
| `country_specific` | string | ISO country code for regional domains |
| `acquired_date` | string | ISO date when domain was acquired |
| `notes` | string | Additional context |

### Domain Format

- No protocol prefix (no `https://`)
- No trailing slash
- Can include subdomains
- Pattern: Valid FQDN
- Examples: `google.com`, `aws.amazon.com`, `amazon.de`

---

## Validation Rules

### Company Validation

```javascript
// ID must be unique across all companies
// parent_company must reference an existing company ID or be null
// ultimate_parent must reference an existing company ID or be null
// If parent_company is set, ultimate_parent should also be set
// hq_country must be a valid ISO 3166-1 alpha-2 code
// sources must be valid URLs
// wikidata_id must match pattern Q followed by digits
// lei must be exactly 20 alphanumeric characters
```

### Domain Validation

```javascript
// domain must be unique across all mappings
// company_id must reference an existing company ID
// Each company should have exactly one domain with is_primary: true
// country_specific should match the TLD where applicable (amazon.de → DE)
```

### Cross-File Validation

```javascript
// All domain.company_id values must exist in companies[].id
// All company.parent_company values must exist in companies[].id
// All company.ultimate_parent values must exist in companies[].id
// No circular parent references allowed
// Version fields should match between files
```

---

## EU Classification Rules

### Determining eu_status

```
IF ultimate_parent is NULL (independent company):
    IF hq_country in EU/EEA/CH:
        eu_status = 'eu'
    ELSE:
        eu_status = 'non-eu'
ELSE:
    Look up ultimate_parent's eu_status:
    IF ultimate_parent.eu_status = 'eu':
        eu_status = 'eu'
    ELSE IF hq_country in EU/EEA/CH:
        eu_status = 'mixed'  # EU subsidiary of non-EU parent
    ELSE:
        eu_status = 'non-eu'
```

### European Countries

For classification purposes, "European" includes:

**EU Member States (27):**
AT, BE, BG, CY, CZ, DE, DK, EE, ES, FI, FR, GR, HR, HU, IE, IT, LT, LU, LV, MT, NL, PL, PT, RO, SE, SI, SK

**EEA (EU + 3):**
IS, LI, NO

**Associated (special status):**
CH (Switzerland - included due to close economic integration)

---

## Edge Cases

### 1. Complex Ownership Structures

Some companies have complex ownership that doesn't fit the simple parent/child model:

```json
{
  "id": "nokia-solutions-networks",
  "name": "Nokia Solutions and Networks",
  "parent_company": "nokia-corp",
  "ultimate_parent": "nokia-corp",
  "notes": "Joint venture dissolved 2013, now fully owned by Nokia"
}
```

**Solution:** Use `notes` field to explain complexity. Set parent/ultimate to primary owner.

### 2. Recently Acquired Companies

When ownership changes:

```json
{
  "id": "vmware-inc",
  "parent_company": "broadcom-inc",
  "ultimate_parent": "broadcom-inc",
  "eu_status": "non-eu",
  "last_verified": "2024-11-01",
  "notes": "Acquired by Broadcom November 2023, formerly independent"
}
```

**Solution:** Update parent references, update `last_verified`, document in `notes`.

### 3. Dual-Listed Companies

Companies with multiple headquarters:

```json
{
  "id": "unilever-plc",
  "name": "Unilever PLC",
  "hq_country": "GB",
  "eu_status": "non-eu",
  "notes": "Dual-listed company unified to single London HQ in 2020"
}
```

**Solution:** Use the primary/legal headquarters. Document complexity in `notes`.

### 4. Unknown Ownership

When ownership is unclear:

```json
{
  "id": "mystery-corp",
  "parent_company": null,
  "ultimate_parent": null,
  "eu_status": "non-eu",
  "confidence": "low",
  "notes": "Ownership structure unclear, believed to be Chinese-owned"
}
```

**Solution:** Set `confidence: "low"`, leave parents as null, explain in `notes`.

### 5. Country-Specific Domains

Regional domains that may have different operators:

```json
{
  "domain": "amazon.de",
  "company_id": "amazon-inc",
  "is_primary": false,
  "country_specific": "DE",
  "notes": "Operated by Amazon EU S.à r.l. (Luxembourg subsidiary)"
}
```

**Solution:** Reference ultimate parent company, use `country_specific` and `notes` for context.

### 6. Subdomain Handling

For subdomains like `aws.amazon.com`:

```json
[
  { "domain": "amazon.com", "company_id": "amazon-inc", "is_primary": true },
  { "domain": "aws.amazon.com", "company_id": "amazon-web-services" }
]
```

**Solution:** Create separate mappings for subdomains with distinct ownership.

---

## Sample Data

### companies.json

```json
{
  "$schema": "./schemas/company.schema.json",
  "version": "1.0.0",
  "generated": "2025-01-26T12:00:00Z",
  "companies": [
    {
      "id": "alphabet-inc",
      "name": "Alphabet Inc.",
      "hq_country": "US",
      "hq_city": "Mountain View",
      "founded_year": 2015,
      "parent_company": null,
      "ultimate_parent": null,
      "eu_status": "non-eu",
      "confidence": "high",
      "sources": [
        "https://www.wikidata.org/wiki/Q20800404",
        "https://www.sec.gov/cgi-bin/browse-edgar?company=alphabet"
      ],
      "last_verified": "2025-01-15",
      "aliases": ["Google Parent Company"],
      "wikidata_id": "Q20800404"
    },
    {
      "id": "google-llc",
      "name": "Google LLC",
      "hq_country": "US",
      "hq_city": "Mountain View",
      "founded_year": 1998,
      "parent_company": "alphabet-inc",
      "ultimate_parent": "alphabet-inc",
      "eu_status": "non-eu",
      "confidence": "high",
      "sources": ["https://www.wikidata.org/wiki/Q95"],
      "last_verified": "2025-01-15",
      "aliases": ["Google", "Google Inc"],
      "wikidata_id": "Q95"
    },
    {
      "id": "spotify-ab",
      "name": "Spotify AB",
      "hq_country": "SE",
      "hq_city": "Stockholm",
      "founded_year": 2006,
      "parent_company": null,
      "ultimate_parent": null,
      "eu_status": "eu",
      "confidence": "high",
      "sources": ["https://www.wikidata.org/wiki/Q689141"],
      "last_verified": "2025-01-10",
      "wikidata_id": "Q689141"
    }
  ]
}
```

### domains.json

```json
{
  "$schema": "./schemas/domain.schema.json",
  "version": "1.0.0",
  "generated": "2025-01-26T12:00:00Z",
  "domains": [
    {
      "domain": "google.com",
      "company_id": "google-llc",
      "is_primary": true
    },
    {
      "domain": "youtube.com",
      "company_id": "google-llc",
      "is_primary": false,
      "acquired_date": "2006-10-09"
    },
    {
      "domain": "google.de",
      "company_id": "google-llc",
      "is_primary": false,
      "country_specific": "DE"
    },
    {
      "domain": "spotify.com",
      "company_id": "spotify-ab",
      "is_primary": true
    }
  ]
}
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-26 | Initial schema release |

---

## References

- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core.html)
- [ISO 3166-1 alpha-2 Country Codes](https://www.iso.org/iso-3166-country-codes.html)
- [ISO 8601 Date Format](https://www.iso.org/iso-8601-date-and-time-format.html)
- [GLEIF LEI Format](https://www.gleif.org/en/about-lei/iso-17442-the-lei-code-structure)
- [Wikidata](https://www.wikidata.org/)
