# GLEIF API Research for Corporate Ownership Verification

> Research completed: 2026-01-26
> API Version: v1 (Production since Fall 2020)
> Total LEI Records: ~3.19 million entities

## Table of Contents
1. [Overview](#overview)
2. [LEI Structure](#lei-structure)
3. [Authentication & Access](#authentication--access)
4. [Rate Limits & Pricing](#rate-limits--pricing)
5. [API Endpoints](#api-endpoints)
6. [Entity Lookup Methods](#entity-lookup-methods)
7. [Parent Relationship Queries](#parent-relationship-queries)
8. [Relationship Types](#relationship-types)
9. [Working curl Examples](#working-curl-examples)
10. [Sample Companies](#sample-companies)
11. [API Response Structure](#api-response-structure)
12. [EuroCheck Integration Notes](#eurocheck-integration-notes)

---

## Overview

The **GLEIF (Global Legal Entity Identifier Foundation) API** provides free access to the Global LEI Index, containing legal entity reference data and corporate ownership information. It's the authoritative source for LEI data worldwide.

**Key Features:**
- Full-text search with fuzzy matching
- Autocomplete for entity names
- Corporate structure relationships (parent/child)
- Cross-reference with BIC, ISIN codes
- ISO-standard data format (JSON:API)

**Base URL:** `https://api.gleif.org/api/v1`

**Documentation:** https://api.gleif.org/docs (Postman collection)

---

## LEI Structure

A **Legal Entity Identifier (LEI)** is a 20-character alphanumeric code based on ISO 17442.

### Format: `[LOU ID (4)] + [Entity ID (14)] + [Check Digits (2)]`

```
Example: HWUPKR0MPOU8FGXBT394 (Apple Inc.)
         ^^^^                = LOU prefix (Local Operating Unit)
             ^^^^^^^^^^^^^^  = Unique entity identifier  
                           ^^ = ISO 7064 check digits
```

### Character Set
- Uppercase letters A-Z (excluding vowels in some positions to avoid confusion)
- Digits 0-9
- No special characters

### LEI Statuses
| Status | Description |
|--------|-------------|
| `ISSUED` | Active, valid LEI |
| `LAPSED` | Not renewed, expired |
| `MERGED` | Entity merged with another |
| `RETIRED` | Permanently deactivated |
| `DUPLICATE` | Superseded by another LEI |
| `ANNULLED` | Erroneously issued |
| `PENDING_TRANSFER` | Being transferred between LOUs |

---

## Authentication & Access

### 🎉 No Authentication Required!

The GLEIF API is **completely free and public**. No API key, registration, or authentication needed.

```bash
# Just call it directly
curl "https://api.gleif.org/api/v1/lei-records/HWUPKR0MPOU8FGXBT394"
```

### Headers (Recommended)
```
Accept: application/vnd.api+json
```

### CORS
Full CORS support - can call directly from browser JavaScript.

---

## Rate Limits & Pricing

### Pricing: **FREE** 💰
- No cost for any usage
- No tiered plans
- Commercial use allowed

### Rate Limits
GLEIF does not publish explicit rate limits, but based on testing:

| Aspect | Observed Behavior |
|--------|-------------------|
| Requests/second | No hard limit observed |
| Daily limit | None documented |
| Concurrent requests | Works fine with parallel requests |
| Response headers | No rate-limit headers returned |

### Best Practices
- Cache responses (data updates daily at 08:00 UTC)
- Use pagination for large result sets (max 200 per page)
- Batch lookups where possible using filters

### Data Freshness
- **Golden Copy** published daily at 08:00 UTC
- All responses include `meta.goldenCopy.publishDate`

---

## API Endpoints

### Core Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /lei-records` | List/search LEI records |
| `GET /lei-records/{lei}` | Get single LEI record |
| `GET /autocompletions` | Autocomplete search |
| `GET /fuzzycompletions` | Fuzzy search |

### Relationship Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /lei-records/{lei}/direct-parent` | Get direct parent entity |
| `GET /lei-records/{lei}/ultimate-parent` | Get ultimate parent entity |
| `GET /lei-records/{lei}/direct-children` | List direct subsidiaries |
| `GET /lei-records/{lei}/ultimate-children` | List all subsidiaries |
| `GET /lei-records/{lei}/direct-parent-relationship` | Relationship record details |
| `GET /lei-records/{lei}/direct-parent-reporting-exception` | Why no parent reported |

### Reference Data Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /lei-issuers` | List LEI issuing organizations |
| `GET /registration-authorities` | Business registries |
| `GET /entity-legal-forms` | Legal form codes |
| `GET /jurisdictions` | Country/region codes |

---

## Entity Lookup Methods

### 1. Search by Exact Legal Name

```bash
curl "https://api.gleif.org/api/v1/lei-records?filter[entity.legalName]=Apple%20Inc."
```

### 2. Autocomplete (Recommended for UI)

```bash
curl "https://api.gleif.org/api/v1/autocompletions?field=fulltext&q=Google"
```

Returns top 10 matches with highlighting:
```json
{
  "data": [{
    "type": "autocompletions",
    "attributes": {
      "value": "GOOGLE LLC",
      "highlighting": "<b>GOOGLE</b> LLC"
    },
    "relationships": {
      "lei-records": {
        "data": { "id": "7ZW8QJWVPR4P1J1KQY45" }
      }
    }
  }]
}
```

### 3. Fuzzy Search (Typo-tolerant)

```bash
curl "https://api.gleif.org/api/v1/fuzzycompletions?field=fulltext&q=Volkswaagen"
```

### 4. Full-Text Search

```bash
curl "https://api.gleif.org/api/v1/lei-records?filter[fulltext]=Amazon.com%20Inc"
```

### 5. Search by BIC Code

```bash
curl "https://api.gleif.org/api/v1/lei-records?filter[bic]=MSFTUS66XXX"
```

### 6. Filter by Country/Jurisdiction

```bash
# All Finnish entities with ISSUED status
curl "https://api.gleif.org/api/v1/lei-records?filter[registration.status]=ISSUED&filter[entity.jurisdiction]=FI"
```

### 7. Direct LEI Lookup

```bash
curl "https://api.gleif.org/api/v1/lei-records/HWUPKR0MPOU8FGXBT394"
```

---

## Parent Relationship Queries

### Get Direct Parent

```bash
curl "https://api.gleif.org/api/v1/lei-records/7ZW8QJWVPR4P1J1KQY45/direct-parent"
```

Returns the immediate parent company's full LEI record.

### Get Ultimate Parent

```bash
curl "https://api.gleif.org/api/v1/lei-records/7ZW8QJWVPR4P1J1KQY45/ultimate-parent"
```

Returns the top-level parent in the corporate hierarchy.

### Get Relationship Details

```bash
curl "https://api.gleif.org/api/v1/lei-records/7ZW8QJWVPR4P1J1KQY45/direct-parent-relationship"
```

Returns relationship metadata including:
- Relationship type (`IS_DIRECTLY_CONSOLIDATED_BY`)
- Start date
- Accounting periods
- Corroboration level

### Get Reporting Exceptions

When a company has no parent reported, check why:

```bash
curl "https://api.gleif.org/api/v1/lei-records/HWUPKR0MPOU8FGXBT394/direct-parent-reporting-exception"
```

Returns exception reason (e.g., `NATURAL_PERSONS` for publicly traded companies).

### List Direct Children (Subsidiaries)

```bash
curl "https://api.gleif.org/api/v1/lei-records/5493006MHB84DD0ZWV18/direct-children?page[size]=50"
```

---

## Relationship Types

### Parent-Child Relationships

| Type | Description |
|------|-------------|
| `IS_DIRECTLY_CONSOLIDATED_BY` | Entity is directly owned/consolidated by parent |
| `IS_ULTIMATELY_CONSOLIDATED_BY` | Entity is ultimately owned by top parent |

### Relationship Status

| Status | Meaning |
|--------|---------|
| `ACTIVE` | Current relationship |
| `INACTIVE` | Historical relationship |

### Reporting Exception Reasons

| Code | Meaning |
|------|---------|
| `NATURAL_PERSONS` | Owned by individuals (publicly traded) |
| `NON_CONSOLIDATING` | Parent doesn't consolidate financials |
| `NO_LEI` | Parent exists but has no LEI |
| `NO_KNOWN_PERSON` | Parent unknown |
| `BINDING_LEGAL_OBSTACLES` | Legal restrictions on disclosure |
| `CONSENT_NOT_OBTAINED` | Parent didn't consent |
| `DETRIMENT_NOT_EXCLUDED` | Disclosure could cause harm |
| `DISCLOSURE_DETRIMENTAL` | Disclosure would be harmful |

---

## Working curl Examples

### Example 1: Find Company by Name

```bash
# Search for "Apple"
curl -s "https://api.gleif.org/api/v1/autocompletions?field=fulltext&q=Apple" | jq '.data[0:3]'
```

### Example 2: Get Full Company Details

```bash
# Get Apple Inc. details
curl -s "https://api.gleif.org/api/v1/lei-records/HWUPKR0MPOU8FGXBT394" | jq '.data.attributes'
```

### Example 3: Trace Corporate Ownership

```bash
# Google LLC -> Alphabet Inc.
# Step 1: Get Google's direct parent
curl -s "https://api.gleif.org/api/v1/lei-records/7ZW8QJWVPR4P1J1KQY45/direct-parent" | \
  jq '.data.attributes.entity.legalName'
# Returns: { "name": "ALPHABET INC.", "language": "en" }
```

### Example 4: Get All Subsidiaries of a Parent

```bash
# List Alphabet's direct subsidiaries
curl -s "https://api.gleif.org/api/v1/lei-records/5493006MHB84DD0ZWV18/direct-children?page[size]=50" | \
  jq '[.data[].attributes.entity.legalName.name]'
```

### Example 5: Check Why No Parent Reported

```bash
# Apple is publicly traded - owned by shareholders (natural persons)
curl -s "https://api.gleif.org/api/v1/lei-records/HWUPKR0MPOU8FGXBT394/direct-parent-reporting-exception" | \
  jq '.data.attributes'
# Returns: { "reason": "NATURAL_PERSONS", ... }
```

### Example 6: Search by Jurisdiction

```bash
# Find German active companies
curl -s "https://api.gleif.org/api/v1/lei-records?filter[registration.status]=ISSUED&filter[entity.jurisdiction]=DE&page[size]=5" | \
  jq '[.data[].attributes.entity.legalName.name]'
```

### Example 7: Full Ownership Chain Query

```bash
#!/bin/bash
# Trace a company to its ultimate parent
LEI="7ZW8QJWVPR4P1J1KQY45"  # Google LLC

echo "Entity: $(curl -s "https://api.gleif.org/api/v1/lei-records/$LEI" | jq -r '.data.attributes.entity.legalName.name')"
echo "Direct Parent: $(curl -s "https://api.gleif.org/api/v1/lei-records/$LEI/direct-parent" | jq -r '.data.attributes.entity.legalName.name')"
echo "Ultimate Parent: $(curl -s "https://api.gleif.org/api/v1/lei-records/$LEI/ultimate-parent" | jq -r '.data.attributes.entity.legalName.name')"
```

---

## Sample Companies

### 1. Apple Inc. (US)

| Field | Value |
|-------|-------|
| **LEI** | `HWUPKR0MPOU8FGXBT394` |
| **Legal Name** | Apple Inc. |
| **Jurisdiction** | US-CA |
| **HQ Address** | One Apple Park Way, Cupertino, CA 95014 |
| **BIC** | APLEUS66XXX |
| **Status** | ISSUED |
| **Parent** | None (NATURAL_PERSONS - publicly traded) |

```bash
curl -s "https://api.gleif.org/api/v1/lei-records/HWUPKR0MPOU8FGXBT394"
```

### 2. Google LLC → Alphabet Inc. (US)

| Company | LEI | Relationship |
|---------|-----|--------------|
| **Google LLC** | `7ZW8QJWVPR4P1J1KQY45` | Child |
| **Alphabet Inc.** | `5493006MHB84DD0ZWV18` | Ultimate Parent |

```bash
# Google LLC
curl -s "https://api.gleif.org/api/v1/lei-records/7ZW8QJWVPR4P1J1KQY45"

# Alphabet Inc. (parent)
curl -s "https://api.gleif.org/api/v1/lei-records/5493006MHB84DD0ZWV18"
```

**Ownership Chain:**
- Google LLC → Alphabet Inc. (direct & ultimate parent)

### 3. Microsoft Corporation (US)

| Field | Value |
|-------|-------|
| **LEI** | `INR2EJN1ERAN0W5ZP974` |
| **Legal Name** | MICROSOFT CORPORATION |
| **Jurisdiction** | US-WA |
| **HQ Address** | One Microsoft Way, Redmond, WA 98052 |
| **BIC** | MSFTUS66XXX |
| **Status** | ISSUED |
| **Parent** | None (publicly traded) |

```bash
curl -s "https://api.gleif.org/api/v1/lei-records/INR2EJN1ERAN0W5ZP974"
```

### 4. Amazon.com, Inc. (US)

| Field | Value |
|-------|-------|
| **LEI** | `ZXTILKJKG63JELOEG630` |
| **Legal Name** | AMAZON.COM, INC. |
| **Jurisdiction** | US-DE |
| **HQ Address** | 410 Terry Ave North, Seattle, WA 98109 |
| **Status** | ISSUED |
| **Direct Children** | 13 entities (Day One Insurance, Amazon Payments, etc.) |

```bash
# Amazon parent company
curl -s "https://api.gleif.org/api/v1/lei-records/ZXTILKJKG63JELOEG630"

# Amazon subsidiaries
curl -s "https://api.gleif.org/api/v1/lei-records/ZXTILKJKG63JELOEG630/direct-children"
```

### 5. Volkswagen AG → Porsche SE (Germany)

| Company | LEI | Role |
|---------|-----|------|
| **Volkswagen AG** | `529900NNUPAGGOMPXZ31` | Subsidiary |
| **Porsche Automobil Holding SE** | (parent) | Ultimate Parent |

```bash
# Volkswagen AG
curl -s "https://api.gleif.org/api/v1/lei-records/529900NNUPAGGOMPXZ31"

# Volkswagen has 109+ direct children
curl -s "https://api.gleif.org/api/v1/lei-records/529900NNUPAGGOMPXZ31/direct-children?page[size]=10"
```

### 6. Nestlé S.A. (Switzerland)

| Field | Value |
|-------|-------|
| **LEI** | `KY37LUS27QQX7BB93L28` |
| **Legal Name** | NESTLÉ S.A. |
| **Jurisdiction** | CH (Switzerland) |
| **HQ Address** | Avenue Nestle 55, Vevey 1800 |
| **Status** | ISSUED |
| **Direct Children** | 52+ entities worldwide |

```bash
# Nestlé parent
curl -s "https://api.gleif.org/api/v1/lei-records/KY37LUS27QQX7BB93L28"

# Nestlé subsidiaries (includes Wyeth, Purina, etc.)
curl -s "https://api.gleif.org/api/v1/lei-records/KY37LUS27QQX7BB93L28/direct-children?page[size]=10"
```

---

## API Response Structure

### Single LEI Record Response

```json
{
  "meta": {
    "goldenCopy": {
      "publishDate": "2026-01-26T08:00:00Z"
    }
  },
  "data": {
    "type": "lei-records",
    "id": "HWUPKR0MPOU8FGXBT394",
    "attributes": {
      "lei": "HWUPKR0MPOU8FGXBT394",
      "entity": {
        "legalName": {
          "name": "Apple Inc.",
          "language": "en"
        },
        "otherNames": [
          {
            "name": "Apple Computer, Inc.",
            "type": "PREVIOUS_LEGAL_NAME"
          }
        ],
        "legalAddress": {
          "addressLines": ["C/O C T Corporation System", "330 N. Brand Blvd"],
          "city": "Glendale",
          "region": "US-CA",
          "country": "US",
          "postalCode": "91203"
        },
        "headquartersAddress": {
          "addressLines": ["One Apple Park Way"],
          "city": "Cupertino",
          "region": "US-CA",
          "country": "US",
          "postalCode": "95014"
        },
        "registeredAs": "806592",
        "jurisdiction": "US-CA",
        "category": "GENERAL",
        "status": "ACTIVE",
        "creationDate": "1977-01-03T00:00:00Z"
      },
      "registration": {
        "initialRegistrationDate": "2012-06-06T15:53:00Z",
        "lastUpdateDate": "2025-03-04T16:01:50Z",
        "status": "ISSUED",
        "nextRenewalDate": "2026-03-08T17:27:20Z",
        "managingLou": "5493001KJTIIGC8Y1R12",
        "corroborationLevel": "FULLY_CORROBORATED"
      },
      "bic": ["APLEUS66XXX"],
      "conformityFlag": "CONFORMING"
    },
    "relationships": {
      "direct-parent": {
        "links": {
          "reporting-exception": "https://api.gleif.org/api/v1/lei-records/HWUPKR0MPOU8FGXBT394/direct-parent-reporting-exception"
        }
      },
      "direct-children": {
        "links": {
          "related": "https://api.gleif.org/api/v1/lei-records/HWUPKR0MPOU8FGXBT394/direct-children"
        }
      }
    }
  }
}
```

### Relationship Record Response

```json
{
  "data": {
    "type": "relationship-records",
    "id": "7ZW8QJWVPR4P1J1KQY45|LEI|IS_DIRECTLY_CONSOLIDATED_BY|...",
    "attributes": {
      "relationship": {
        "startNode": {
          "id": "7ZW8QJWVPR4P1J1KQY45",
          "type": "LEI"
        },
        "endNode": {
          "id": "5493006MHB84DD0ZWV18",
          "type": "LEI"
        },
        "type": "IS_DIRECTLY_CONSOLIDATED_BY",
        "status": "ACTIVE",
        "periods": [
          {
            "startDate": "2002-10-22T12:00:00Z",
            "type": "RELATIONSHIP_PERIOD"
          }
        ]
      },
      "registration": {
        "status": "PUBLISHED",
        "corroborationLevel": "ENTITY_SUPPLIED_ONLY"
      }
    }
  }
}
```

---

## EuroCheck Integration Notes

### Recommended Approach for Domain → Company Ownership

1. **Domain to Company Name:** Use separate service (WHOIS, company registry) to map domain to company name

2. **Company Name to LEI:** 
   ```javascript
   const response = await fetch(
     `https://api.gleif.org/api/v1/autocompletions?field=fulltext&q=${encodeURIComponent(companyName)}`
   );
   const data = await response.json();
   const lei = data.data[0]?.relationships?.['lei-records']?.data?.id;
   ```

3. **LEI to Ownership Chain:**
   ```javascript
   // Get ultimate parent
   const parent = await fetch(
     `https://api.gleif.org/api/v1/lei-records/${lei}/ultimate-parent`
   ).then(r => r.json());
   
   const ultimateParentName = parent.data?.attributes?.entity?.legalName?.name;
   const ultimateParentCountry = parent.data?.attributes?.entity?.headquartersAddress?.country;
   ```

### Key Fields for EuroCheck

| Field | Path | Use Case |
|-------|------|----------|
| Company Name | `data.attributes.entity.legalName.name` | Display |
| Country | `data.attributes.entity.headquartersAddress.country` | EU/non-EU check |
| Jurisdiction | `data.attributes.entity.jurisdiction` | Legal jurisdiction |
| Status | `data.attributes.registration.status` | Valid entity check |
| Parent LEI | via `/direct-parent` or `/ultimate-parent` | Ownership trace |

### Caching Strategy

- Cache LEI records for 24 hours (data updates daily)
- Cache autocomplete results for 1 hour
- Store LEI→company mapping for faster lookups

### Error Handling

```javascript
// No parent exists (top-level company)
if (!parent.data) {
  // Check reporting exception
  const exception = await fetch(
    `https://api.gleif.org/api/v1/lei-records/${lei}/direct-parent-reporting-exception`
  ).then(r => r.json());
  
  if (exception.data?.attributes?.reason === 'NATURAL_PERSONS') {
    // Publicly traded company - no corporate parent
  }
}
```

### Limitations

1. **Not all companies have LEIs** - LEIs are required for financial transactions but not universal
2. **No domain data** - GLEIF doesn't store website/domain information
3. **Relationship data voluntary** - Parent relationships are self-reported
4. **Updates daily** - Not real-time; changes may take 24h to appear

---

## References

- [GLEIF API Documentation](https://api.gleif.org/docs)
- [GLEIF API Demo Application](https://api.gleif.org/demo)
- [ISO 17442 LEI Standard](https://www.iso.org/standard/78829.html)
- [GLEIF Data Dictionary](https://www.gleif.org/en/lei-data/gleif-data-dictionary)
- [ROC Policy on Relationship Data](https://www.gleif.org/en/lei-data/lei-data-access-and-use/level-2-data-who-owns-whom)
