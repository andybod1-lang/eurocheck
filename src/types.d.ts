/**
 * EuroCheck Type Definitions
 * 
 * TypeScript interfaces for all EuroCheck data structures.
 * These types correspond to the JSON schemas in data/schemas/
 * 
 * @packageDocumentation
 */

// =============================================================================
// Enums
// =============================================================================

/**
 * EU classification status for a company
 * - 'eu': Headquarters and ultimate ownership in EU/EEA/Switzerland
 * - 'mixed': EU presence but non-EU ultimate parent company
 * - 'non-eu': Non-European company with no significant EU ownership
 */
export type EuStatus = 'eu' | 'mixed' | 'non-eu';

/**
 * Confidence level in the accuracy of company data
 * - 'high': Verified from official sources (SEC filings, company registries)
 * - 'medium': Reliable secondary sources (Wikidata, reputable news)
 * - 'low': Unverified, conflicting sources, or user-submitted
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

/**
 * ISO 3166-1 alpha-2 country codes (2 uppercase letters)
 * Examples: 'US', 'DE', 'FI', 'GB', 'FR'
 */
export type CountryCode = string;

/**
 * Wikidata entity ID format (Q followed by digits)
 * Examples: 'Q312' (Apple), 'Q95' (Google)
 */
export type WikidataId = `Q${number}`;

/**
 * Legal Entity Identifier (20 alphanumeric characters)
 */
export type LEI = string;

// =============================================================================
// Company Types
// =============================================================================

/**
 * A company record with ownership and EU status information
 */
export interface Company {
  /**
   * Unique identifier (lowercase alphanumeric with hyphens)
   * Pattern: ^[a-z0-9][a-z0-9-]*[a-z0-9]$ or single char ^[a-z0-9]$
   * @example "apple-inc", "sap", "volkswagen-ag"
   */
  id: string;

  /**
   * Official company name
   * @example "Apple Inc.", "SAP SE", "Volkswagen AG"
   */
  name: string;

  /**
   * ISO 3166-1 alpha-2 country code of headquarters
   * @example "US", "DE", "FI"
   */
  hq_country: CountryCode;

  /**
   * City where headquarters is located
   * @example "Cupertino", "Walldorf", "Espoo"
   */
  hq_city?: string;

  /**
   * Year the company was founded
   * @example 1976, 1972, 1938
   */
  founded_year?: number;

  /**
   * ID of the direct parent company (foreign key to Company.id)
   * null if the company is independent or is itself the parent
   * @example "alphabet-inc" for Google LLC
   */
  parent_company?: string | null;

  /**
   * ID of the ultimate parent company at the top of the ownership chain
   * null if this company is itself the ultimate parent
   * @example "alphabet-inc" for YouTube, Google Cloud, etc.
   */
  ultimate_parent?: string | null;

  /**
   * EU classification status
   */
  eu_status: EuStatus;

  /**
   * Confidence level in the data accuracy
   */
  confidence: ConfidenceLevel;

  /**
   * Array of source URLs for verification
   * @example ["https://www.wikidata.org/wiki/Q312", "https://www.sec.gov/..."]
   */
  sources?: string[];

  /**
   * ISO 8601 date when this record was last verified
   * Format: YYYY-MM-DD
   * @example "2025-01-26"
   */
  last_verified: string;

  /**
   * Alternative names, former names, or common abbreviations
   * @example ["Google", "Google LLC"] for Alphabet Inc.
   */
  aliases?: string[];

  /**
   * Wikidata entity ID
   * @example "Q312" for Apple Inc.
   */
  wikidata_id?: WikidataId;

  /**
   * Legal Entity Identifier (20 alphanumeric characters)
   * @example "HWUPKR0MPOU8FGXBT394"
   */
  lei?: LEI;

  /**
   * Additional notes about ownership complexity or special cases
   */
  notes?: string;
}

/**
 * Root structure of the companies.json file
 */
export interface CompanyDatabase {
  /**
   * Reference to the JSON schema
   */
  $schema: string;

  /**
   * Semantic version of the data file
   * @example "1.0.0"
   */
  version: string;

  /**
   * ISO 8601 timestamp when this file was generated
   * @example "2025-01-26T12:00:00Z"
   */
  generated: string;

  /**
   * Array of company records
   */
  companies: Company[];
}

// =============================================================================
// Domain Types
// =============================================================================

/**
 * A mapping from a domain to its owning company
 */
export interface DomainMapping {
  /**
   * Fully qualified domain name without protocol
   * @example "google.com", "aws.amazon.com", "amazon.de"
   */
  domain: string;

  /**
   * Foreign key referencing Company.id
   * @example "google-llc", "amazon-inc"
   */
  company_id: string;

  /**
   * True if this is the company's primary/main domain
   * @default false
   * @example true for "google.com", false for "youtube.com"
   */
  is_primary?: boolean;

  /**
   * ISO 3166-1 alpha-2 country code if this is a country-specific domain
   * @example "DE" for amazon.de, "FI" for google.fi
   */
  country_specific?: CountryCode;

  /**
   * ISO 8601 date when this domain was acquired
   * Useful for tracking ownership changes
   * @example "2006-10-09" for Google's acquisition of YouTube
   */
  acquired_date?: string;

  /**
   * Additional context about the domain mapping
   */
  notes?: string;
}

/**
 * Root structure of the domains.json file
 */
export interface DomainDatabase {
  /**
   * Reference to the JSON schema
   */
  $schema: string;

  /**
   * Semantic version of the data file (should match companies.json)
   * @example "1.0.0"
   */
  version: string;

  /**
   * ISO 8601 timestamp when this file was generated
   * @example "2025-01-26T12:00:00Z"
   */
  generated: string;

  /**
   * Array of domain-to-company mappings
   */
  domains: DomainMapping[];
}

// =============================================================================
// Lookup Types (Runtime)
// =============================================================================

/**
 * Result of looking up a domain
 */
export interface DomainLookupResult {
  /** Whether a match was found */
  found: boolean;
  /** The matched domain (may differ from input if subdomain matched) */
  matchedDomain?: string;
  /** The company that owns this domain */
  company?: Company;
  /** The ultimate parent company (if different from company) */
  ultimateParent?: Company;
  /** Whether the input was a subdomain of the matched domain */
  isSubdomainMatch?: boolean;
}

/**
 * Ownership chain from a subsidiary to its ultimate parent
 */
export interface OwnershipChain {
  /** The company being queried */
  company: Company;
  /** Parent companies in order from direct parent to ultimate parent */
  parents: Company[];
  /** The ultimate parent (last in parents array, or company if independent) */
  ultimateParent: Company;
  /** Number of levels in the ownership chain */
  depth: number;
}

/**
 * Statistics about the database
 */
export interface DatabaseStats {
  /** Total number of companies */
  companyCount: number;
  /** Total number of domain mappings */
  domainCount: number;
  /** Breakdown by EU status */
  byEuStatus: Record<EuStatus, number>;
  /** Breakdown by confidence level */
  byConfidence: Record<ConfidenceLevel, number>;
  /** Number of unique countries */
  countryCount: number;
  /** Database version */
  version: string;
  /** When the database was generated */
  generated: string;
}

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Result of validating data against schemas
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Array of validation error messages */
  errors: ValidationError[];
}

/**
 * A single validation error
 */
export interface ValidationError {
  /** JSON path to the invalid field */
  path: string;
  /** Human-readable error message */
  message: string;
  /** The invalid value */
  value?: unknown;
  /** The expected type or format */
  expected?: string;
}

// =============================================================================
// EU Country Lists
// =============================================================================

/**
 * EU member state country codes
 */
export const EU_MEMBER_STATES: readonly CountryCode[] = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
] as const;

/**
 * EEA member states (EU + Norway, Iceland, Liechtenstein)
 */
export const EEA_MEMBER_STATES: readonly CountryCode[] = [
  ...EU_MEMBER_STATES,
  'NO', 'IS', 'LI'
] as const;

/**
 * Countries considered "European" for eu_status purposes
 * Includes EEA + Switzerland (close economic ties)
 */
export const EUROPEAN_COUNTRIES: readonly CountryCode[] = [
  ...EEA_MEMBER_STATES,
  'CH'
] as const;

/**
 * Type guard to check if a country is in the EU
 */
export function isEuCountry(code: CountryCode): boolean {
  return EU_MEMBER_STATES.includes(code as typeof EU_MEMBER_STATES[number]);
}

/**
 * Type guard to check if a country is in the EEA
 */
export function isEeaCountry(code: CountryCode): boolean {
  return EEA_MEMBER_STATES.includes(code as typeof EEA_MEMBER_STATES[number]);
}

/**
 * Type guard to check if a country is considered "European" for classification
 */
export function isEuropeanCountry(code: CountryCode): boolean {
  return EUROPEAN_COUNTRIES.includes(code as typeof EUROPEAN_COUNTRIES[number]);
}
