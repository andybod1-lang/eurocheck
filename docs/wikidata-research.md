# Wikidata SPARQL Research for Company Ownership Data

This document provides tested SPARQL queries for retrieving company ownership and location data from Wikidata, for use in the EuroCheck browser extension.

## Table of Contents
1. [API Overview](#api-overview)
2. [Key Properties](#key-properties)
3. [Basic Queries](#basic-queries)
4. [Ownership Chain Traversal](#ownership-chain-traversal)
5. [Test Results](#test-results)
6. [Example JSON Responses](#example-json-responses)
7. [Rate Limits & Best Practices](#rate-limits--best-practices)

---

## API Overview

### SPARQL Endpoint
```
https://query.wikidata.org/sparql
```

### Request Format
- **Method:** GET (preferred for caching) or POST (for large queries)
- **Query Parameter:** `query` (URL-encoded SPARQL)
- **Format Parameter:** `format=json` for JSON responses

### Response Formats
| Format | Accept Header | Parameter |
|--------|--------------|-----------|
| JSON | `application/sparql-results+json` | `format=json` |
| XML | `application/sparql-results+xml` | `format=xml` |
| CSV | `text/csv` | `format=csv` |
| TSV | `text/tab-separated-values` | `format=tsv` |

### Example API Call
```bash
curl -G https://query.wikidata.org/sparql \
  --data-urlencode "query=SELECT ?item WHERE { ?item wdt:P31 wd:Q4830453 } LIMIT 1" \
  -H "Accept: application/sparql-results+json"
```

---

## Key Properties

| Property | ID | Description | Usage |
|----------|-----|-------------|-------|
| **Headquarters Location** | P159 | Physical location where the organization's HQ is located | Primary for determining company base |
| **Parent Organization** | P749 | Direct parent/owning organization | Ownership chain traversal |
| **Country of Origin** | P495 | Country where the entity originated | Fallback for founding country |
| **Country** | P17 | Country of a location (used with P159) | Get country from headquarters city |
| **Instance Of** | P31 | Type classification | Filter for businesses (Q4830453) |
| **Owned By** | P127 | Owner of the subject | Alternative ownership relation |

### Entity Types for Companies
- `Q4830453` - business enterprise
- `Q6881511` - enterprise  
- `Q783794` - company
- `Q891723` - public company
- `Q163740` - nonprofit organization

---

## Basic Queries

### 1. Get Headquarters Country (P159 → P17)

Retrieves the headquarters location and its country for a company.

```sparql
SELECT ?company ?companyLabel ?hq ?hqLabel ?country ?countryLabel
WHERE {
  # Replace with company Wikidata ID
  BIND(wd:Q95 AS ?company)
  
  ?company wdt:P159 ?hq .
  ?hq wdt:P17 ?country .
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
```

**Try it:** [Run on query.wikidata.org](https://query.wikidata.org/#SELECT%20%3Fcompany%20%3FcompanyLabel%20%3Fhq%20%3FhqLabel%20%3Fcountry%20%3FcountryLabel%0AWHERE%20%7B%0A%20%20BIND%28wd%3AQ95%20AS%20%3Fcompany%29%0A%20%20%3Fcompany%20wdt%3AP159%20%3Fhq%20.%0A%20%20%3Fhq%20wdt%3AP17%20%3Fcountry%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22%20.%20%7D%0A%7D)

---

### 2. Get Parent Organization (P749)

Retrieves the immediate parent/owner of a company.

```sparql
SELECT ?company ?companyLabel ?parent ?parentLabel
WHERE {
  BIND(wd:Q95 AS ?company)
  
  ?company wdt:P749 ?parent .
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
```

**Try it:** [Run on query.wikidata.org](https://query.wikidata.org/#SELECT%20%3Fcompany%20%3FcompanyLabel%20%3Fparent%20%3FparentLabel%0AWHERE%20%7B%0A%20%20BIND%28wd%3AQ95%20AS%20%3Fcompany%29%0A%20%20%3Fcompany%20wdt%3AP749%20%3Fparent%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22%20.%20%7D%0A%7D)

---

### 3. Get Country of Origin (P495)

Retrieves the country where the company was founded/originated.

```sparql
SELECT ?company ?companyLabel ?origin ?originLabel
WHERE {
  BIND(wd:Q312 AS ?company)
  
  ?company wdt:P495 ?origin .
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
```

**Try it:** [Run on query.wikidata.org](https://query.wikidata.org/#SELECT%20%3Fcompany%20%3FcompanyLabel%20%3Forigin%20%3ForiginLabel%0AWHERE%20%7B%0A%20%20BIND%28wd%3AQ312%20AS%20%3Fcompany%29%0A%20%20%3Fcompany%20wdt%3AP495%20%3Forigin%20.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%22%20.%20%7D%0A%7D)

---

### 4. Combined Query: All Ownership Data

Retrieves headquarters, country of origin, and parent organization in one query.

```sparql
SELECT ?company ?companyLabel ?hqLabel ?hqCountryLabel ?originLabel ?parentLabel
WHERE {
  BIND(wd:Q95 AS ?company)
  
  OPTIONAL { 
    ?company wdt:P159 ?hq . 
    ?hq wdt:P17 ?hqCountry . 
  }
  OPTIONAL { ?company wdt:P495 ?origin . }
  OPTIONAL { ?company wdt:P749 ?parent . }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
```

---

## Ownership Chain Traversal

### 5. Traverse to Ultimate Parent

Uses SPARQL property paths (`wdt:P749+`) to find all ancestors in ownership chain, then filters for the one with no parent.

```sparql
SELECT ?company ?companyLabel ?parent ?parentLabel 
       ?ultimateParent ?ultimateParentLabel ?ultimateParentCountryLabel
WHERE {
  BIND(wd:Q215293 AS ?company)
  
  # Get direct parent
  ?company wdt:P749 ?parent .
  
  # Traverse ownership chain (+ means one or more steps)
  ?company wdt:P749+ ?ultimateParent .
  
  # Ultimate parent has no parent
  FILTER NOT EXISTS { ?ultimateParent wdt:P749 ?grandparent . }
  
  # Get ultimate parent's HQ country
  ?ultimateParent wdt:P159/wdt:P17 ?ultimateParentCountry .
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
```

**Property Path Operators:**
- `wdt:P749+` - One or more P749 relations (transitive closure)
- `wdt:P749*` - Zero or more P749 relations
- `wdt:P749/wdt:P17` - P749 followed by P17 (path chaining)

---

### 6. Full Ownership Chain with Depth

Returns each step in the ownership hierarchy.

```sparql
SELECT ?company ?companyLabel ?depth ?ancestorLabel ?ancestorCountryLabel
WHERE {
  BIND(wd:Q215293 AS ?company)
  
  # This requires recursive subquery pattern
  {
    SELECT ?ancestor (COUNT(?mid) AS ?depth)
    WHERE {
      wd:Q215293 wdt:P749* ?mid .
      ?mid wdt:P749 ?ancestor .
    }
    GROUP BY ?ancestor
  }
  
  OPTIONAL { ?ancestor wdt:P159/wdt:P17 ?ancestorCountry . }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
ORDER BY ?depth
```

---

### 7. Batch Query: Multiple Companies

Efficient query for looking up multiple companies at once.

```sparql
SELECT ?company ?companyLabel ?hqLabel ?hqCountryLabel ?originLabel ?parentLabel ?parentHqCountryLabel
WHERE {
  VALUES ?company { 
    wd:Q689141    # Spotify
    wd:Q54078     # IKEA
    wd:Q215293    # Volvo Cars
    wd:Q163810    # AB Volvo
    wd:Q1165072   # Klarna
    wd:Q3884      # Amazon
    wd:Q95        # Google
    wd:Q312       # Apple
    wd:Q380       # Meta
    wd:Q2283      # Microsoft
  }
  
  OPTIONAL { ?company wdt:P159 ?hq . ?hq wdt:P17 ?hqCountry . }
  OPTIONAL { ?company wdt:P495 ?origin . }
  OPTIONAL { ?company wdt:P749 ?parent . ?parent wdt:P159/wdt:P17 ?parentHqCountry . }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
```

---

### 8. Search Company by Name

Find company Wikidata ID by name (useful for initial lookup).

```sparql
SELECT ?company ?companyLabel ?instanceLabel
WHERE {
  ?company rdfs:label "Google"@en .
  ?company wdt:P31/wdt:P279* wd:Q4830453 .  # Instance of business or subclass
  ?company wdt:P31 ?instance .
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 10
```

---

### 9. EuroCheck Optimized Query

Single query optimized for the extension's needs - returns country determination with fallback logic.

```sparql
SELECT ?company ?companyLabel 
       ?hqCountry ?hqCountryLabel
       ?origin ?originLabel
       ?ultimateParent ?ultimateParentLabel
       ?ultimateParentCountry ?ultimateParentCountryLabel
WHERE {
  BIND(wd:Q215293 AS ?company)  # Input company ID
  
  # Try headquarters country first
  OPTIONAL { 
    ?company wdt:P159 ?hq . 
    ?hq wdt:P17 ?hqCountry . 
  }
  
  # Fallback: country of origin
  OPTIONAL { ?company wdt:P495 ?origin . }
  
  # Follow ownership chain to ultimate parent
  OPTIONAL {
    ?company wdt:P749+ ?ultimateParent .
    FILTER NOT EXISTS { ?ultimateParent wdt:P749 ?grandparent . }
    ?ultimateParent wdt:P159/wdt:P17 ?ultimateParentCountry .
  }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
```

---

### 10. Get Company ID from Domain/Website

Look up company by official website (useful for domain matching).

```sparql
SELECT ?company ?companyLabel ?website
WHERE {
  ?company wdt:P856 ?website .  # P856 = official website
  FILTER(CONTAINS(STR(?website), "spotify.com"))
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 5
```

---

## Test Results

### EU Companies

| Company | Wikidata ID | HQ Country | Origin | Parent | Ultimate Parent |
|---------|-------------|------------|--------|--------|-----------------|
| **Spotify** | Q689141 | *(not set)* | Sweden | *(none)* | *(none)* |
| **Spotify Technology** | Q60269744 | Luxembourg | *(not set)* | *(none)* | *(none)* |
| **IKEA** | Q54078 | *(not set)* | *(not set)* | *(none)* | *(complex structure)* |
| **Volvo Cars** | Q215293 | Sweden (Gothenburg) | Sweden | Geely | **Geely (China)** |
| **AB Volvo** | Q163810 | Sweden (Gothenburg) | *(not set)* | *(none)* | *(none)* |
| **Klarna** | Q1165072 | Sweden (Stockholm) | *(not set)* | *(none)* | *(none)* |

### Non-EU Companies

| Company | Wikidata ID | HQ Country | Origin | Parent | Ultimate Parent |
|---------|-------------|------------|--------|--------|-----------------|
| **Amazon** | Q3884 | USA (Seattle) | *(not set)* | *(none)* | *(none)* |
| **Google** | Q95 | USA (Mountain View) | *(not set)* | Alphabet Inc. | **Alphabet Inc. (USA)** |
| **Apple** | Q312 | USA (Cupertino) | USA | *(none)* | *(none)* |
| **Meta** | Q380 | USA (Menlo Park) | *(not set)* | *(none)* | *(none)* |
| **Microsoft** | Q2283 | USA (Redmond) | *(not set)* | *(none)* | *(none)* |

### Key Findings

1. **Volvo Cars** demonstrates successful ownership chain traversal:
   - Company: Swedish (HQ in Gothenburg)
   - Ultimate Parent: **Geely (China)**
   - This is crucial for EuroCheck - shows Swedish brand is Chinese-owned

2. **Google** ownership chain works:
   - Parent: Alphabet Inc.
   - Both are US-based

3. **Data gaps in Wikidata:**
   - IKEA lacks structured HQ/origin data (complex foundation structure)
   - Spotify has origin=Sweden but no HQ country
   - Oatly not properly represented as a company

4. **Spotify Technology S.A.** (Q60269744) is the legal entity:
   - HQ: Luxembourg (tax structure)
   - For EuroCheck, we may want origin (Sweden) as the "real" country

---

## Example JSON Responses

### Single Company Query Response

```json
{
  "head": {
    "vars": ["company", "companyLabel", "hqLabel", "hqCountryLabel", "originLabel", "parentLabel"]
  },
  "results": {
    "bindings": [
      {
        "company": {
          "type": "uri",
          "value": "http://www.wikidata.org/entity/Q95"
        },
        "companyLabel": {
          "xml:lang": "en",
          "type": "literal",
          "value": "Google"
        },
        "hqLabel": {
          "xml:lang": "en",
          "type": "literal",
          "value": "Mountain View"
        },
        "hqCountryLabel": {
          "xml:lang": "en",
          "type": "literal",
          "value": "United States"
        },
        "parentLabel": {
          "xml:lang": "en",
          "type": "literal",
          "value": "Alphabet Inc."
        }
      }
    ]
  }
}
```

### Ultimate Parent Query Response (Volvo Cars)

```json
{
  "head": {
    "vars": ["company", "companyLabel", "parent", "parentLabel", "ultimateParent", "ultimateParentLabel", "ultimateParentCountryLabel"]
  },
  "results": {
    "bindings": [
      {
        "company": {
          "type": "uri",
          "value": "http://www.wikidata.org/entity/Q215293"
        },
        "companyLabel": {
          "xml:lang": "en",
          "type": "literal",
          "value": "Volvo Cars"
        },
        "parent": {
          "type": "uri",
          "value": "http://www.wikidata.org/entity/Q739000"
        },
        "parentLabel": {
          "xml:lang": "en",
          "type": "literal",
          "value": "Geely"
        },
        "ultimateParent": {
          "type": "uri",
          "value": "http://www.wikidata.org/entity/Q739000"
        },
        "ultimateParentLabel": {
          "xml:lang": "en",
          "type": "literal",
          "value": "Geely"
        },
        "ultimateParentCountryLabel": {
          "xml:lang": "en",
          "type": "literal",
          "value": "People's Republic of China"
        }
      }
    ]
  }
}
```

### Batch Query Response

```json
{
  "head": {
    "vars": ["company", "companyLabel", "hqLabel", "hqCountryLabel", "originLabel", "parentLabel", "parentHqCountryLabel"]
  },
  "results": {
    "bindings": [
      {
        "company": {"type": "uri", "value": "http://www.wikidata.org/entity/Q215293"},
        "companyLabel": {"xml:lang": "en", "type": "literal", "value": "Volvo Cars"},
        "hqLabel": {"xml:lang": "en", "type": "literal", "value": "Gothenburg"},
        "hqCountryLabel": {"xml:lang": "en", "type": "literal", "value": "Sweden"},
        "originLabel": {"xml:lang": "en", "type": "literal", "value": "Sweden"},
        "parentLabel": {"xml:lang": "en", "type": "literal", "value": "Geely"},
        "parentHqCountryLabel": {"xml:lang": "en", "type": "literal", "value": "People's Republic of China"}
      },
      {
        "company": {"type": "uri", "value": "http://www.wikidata.org/entity/Q3884"},
        "companyLabel": {"xml:lang": "en", "type": "literal", "value": "Amazon"},
        "hqLabel": {"xml:lang": "en", "type": "literal", "value": "Seattle"},
        "hqCountryLabel": {"xml:lang": "en", "type": "literal", "value": "United States"}
      },
      {
        "company": {"type": "uri", "value": "http://www.wikidata.org/entity/Q312"},
        "companyLabel": {"xml:lang": "en", "type": "literal", "value": "Apple Inc."},
        "hqLabel": {"xml:lang": "en", "type": "literal", "value": "Cupertino"},
        "hqCountryLabel": {"xml:lang": "en", "type": "literal", "value": "United States"},
        "originLabel": {"xml:lang": "en", "type": "literal", "value": "United States"}
      }
    ]
  }
}
```

---

## Rate Limits & Best Practices

### Official Rate Limits

From Wikidata documentation:
- **Query timeout:** 60 seconds (queries taking longer will be killed)
- **Response size limit:** Results are limited to prevent memory issues
- **Concurrent connections:** Be respectful; no official limit but aggressive crawling may be blocked
- **User-Agent required:** Include a descriptive User-Agent header

### Recommended Limits for EuroCheck

| Parameter | Recommendation |
|-----------|---------------|
| Queries per minute | ≤ 30 |
| Concurrent requests | 1-2 max |
| Retry delay on 429 | Exponential backoff (1s, 2s, 4s...) |
| Cache TTL | 24 hours (company data rarely changes) |
| Batch size | ≤ 50 companies per query |

### Best Practices

1. **Use caching aggressively**
   - Company ownership data changes rarely
   - Cache Wikidata IDs indefinitely
   - Cache query results for 24+ hours

2. **Batch queries when possible**
   - Use `VALUES` clause to query multiple companies
   - Single batched query is better than multiple individual queries

3. **Include User-Agent header**
   ```
   User-Agent: EuroCheck/1.0 (https://github.com/yourname/eurocheck; contact@example.com)
   ```

4. **Handle missing data gracefully**
   - Use `OPTIONAL` for all property fetches
   - Implement fallback logic: HQ country → origin country → parent's country

5. **Pre-compute for common domains**
   - Build a local database of domain → Wikidata ID mappings
   - Only query Wikidata for unknown domains

### Error Handling

| HTTP Status | Meaning | Action |
|-------------|---------|--------|
| 200 | Success | Process response |
| 400 | Bad query syntax | Check SPARQL syntax |
| 429 | Rate limited | Wait and retry with backoff |
| 500 | Server error | Retry after delay |
| 503 | Service unavailable | Wikidata maintenance; retry later |

---

## Implementation Notes for EuroCheck

### Recommended Flow

1. **Domain → Company ID mapping**
   - Maintain local database of known domain → Wikidata ID
   - Use website search query (Query #10) for unknown domains
   - Fall back to company name search if needed

2. **Country determination priority**
   1. Check ultimate parent's country (if ownership chain exists)
   2. Check headquarters country (P159 → P17)
   3. Check country of origin (P495)
   4. Flag as "unknown" if all fail

3. **EU/Non-EU classification**
   - EU member states list is static, store locally
   - Compare resolved country against EU list
   - Handle edge cases (UK post-Brexit, Norway/Switzerland EEA status)

### Wikidata ID Reference

For quick lookups, here are verified company IDs:

```javascript
const COMPANY_IDS = {
  // EU Companies
  'spotify.com': 'Q689141',      // Spotify (brand) or Q60269744 (legal entity)
  'ikea.com': 'Q54078',          // IKEA
  'volvo.com': 'Q215293',        // Volvo Cars (Chinese-owned!)
  'volvocars.com': 'Q215293',
  'klarna.com': 'Q1165072',      // Klarna
  
  // Non-EU Companies  
  'amazon.com': 'Q3884',         // Amazon
  'google.com': 'Q95',           // Google
  'apple.com': 'Q312',           // Apple Inc.
  'meta.com': 'Q380',            // Meta
  'facebook.com': 'Q380',
  'microsoft.com': 'Q2283',      // Microsoft
};
```

---

## Appendix: Property Reference

### Company-Related Properties

| Property | Name | Description |
|----------|------|-------------|
| P31 | instance of | Type of entity |
| P17 | country | Country containing the location |
| P127 | owned by | Owner of subject |
| P131 | located in administrative entity | Location hierarchy |
| P154 | logo image | Company logo |
| P159 | headquarters location | Where the HQ is |
| P169 | chief executive officer | CEO |
| P355 | subsidiary | Companies owned by subject |
| P452 | industry | Business sector |
| P495 | country of origin | Founding country |
| P571 | inception | Founding date |
| P749 | parent organization | Owning organization |
| P856 | official website | Company website |
| P1128 | employees | Number of employees |
| P1454 | legal form | Business type (Inc, GmbH, etc.) |

### Country Entity IDs (EU Members)

```javascript
const EU_COUNTRIES = {
  'Q40': 'Austria',
  'Q31': 'Belgium', 
  'Q219': 'Bulgaria',
  'Q224': 'Croatia',
  'Q229': 'Cyprus',
  'Q213': 'Czechia',
  'Q35': 'Denmark',
  'Q191': 'Estonia',
  'Q33': 'Finland',
  'Q142': 'France',
  'Q183': 'Germany',
  'Q41': 'Greece',
  'Q28': 'Hungary',
  'Q27': 'Ireland',
  'Q38': 'Italy',
  'Q211': 'Latvia',
  'Q37': 'Lithuania',
  'Q32': 'Luxembourg',
  'Q233': 'Malta',
  'Q55': 'Netherlands',
  'Q36': 'Poland',
  'Q45': 'Portugal',
  'Q218': 'Romania',
  'Q214': 'Slovakia',
  'Q215': 'Slovenia',
  'Q29': 'Spain',
  'Q34': 'Sweden'
};
```

---

*Document created: 2026-01-26*  
*Last tested: All queries executed successfully on query.wikidata.org*
