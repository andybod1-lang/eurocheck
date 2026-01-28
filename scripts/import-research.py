#!/usr/bin/env python3
"""
Import all companies from research files into the EuroCheck database.
Parses markdown tables and extracts company data.
"""

import json
import re
import os
from pathlib import Path

RESEARCH_DIR = Path(__file__).parent.parent / "research"
DATA_DIR = Path(__file__).parent.parent / "data"

# EU country codes
EU_COUNTRIES = {
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    # EEA
    'IS', 'LI', 'NO',
    # Often treated as EU-equivalent
    'CH'
}

# Country name to code mapping
COUNTRY_CODES = {
    'usa': 'US', 'united states': 'US', 'america': 'US',
    'germany': 'DE', 'deutschland': 'DE',
    'france': 'FR',
    'uk': 'GB', 'united kingdom': 'GB', 'britain': 'GB', 'england': 'GB',
    'netherlands': 'NL', 'holland': 'NL',
    'sweden': 'SE',
    'norway': 'NO',
    'denmark': 'DK',
    'finland': 'FI',
    'ireland': 'IE',
    'spain': 'ES',
    'italy': 'IT',
    'portugal': 'PT',
    'belgium': 'BE',
    'austria': 'AT',
    'switzerland': 'CH',
    'poland': 'PL',
    'czech republic': 'CZ', 'czechia': 'CZ',
    'hungary': 'HU',
    'romania': 'RO',
    'bulgaria': 'BG',
    'greece': 'GR',
    'croatia': 'HR',
    'slovenia': 'SI',
    'slovakia': 'SK',
    'lithuania': 'LT',
    'latvia': 'LV',
    'estonia': 'EE',
    'luxembourg': 'LU',
    'malta': 'MT',
    'cyprus': 'CY',
    'iceland': 'IS',
    'canada': 'CA',
    'australia': 'AU',
    'new zealand': 'NZ',
    'japan': 'JP',
    'china': 'CN',
    'india': 'IN',
    'israel': 'IL',
    'russia': 'RU',
    'brazil': 'BR',
    'south korea': 'KR', 'korea': 'KR',
    'taiwan': 'TW',
    'singapore': 'SG',
    'hong kong': 'HK',
    'uae': 'AE', 'united arab emirates': 'AE',
    'saudi arabia': 'SA',
    'south africa': 'ZA',
    'mexico': 'MX',
    'argentina': 'AR',
    'serbia': 'RS',
    'ukraine': 'UA',
    'turkey': 'TR',
    'panama': 'PA',
    'kuwait': 'KW',
}

def get_country_code(country_str):
    """Convert country name to ISO code."""
    if not country_str:
        return None
    country_lower = country_str.lower().strip()
    # Remove flag emojis
    country_lower = re.sub(r'[\U0001F1E0-\U0001F1FF]+', '', country_lower).strip()
    
    # Check if already a code
    if len(country_lower) == 2:
        return country_lower.upper()
    
    # Look up in mapping
    return COUNTRY_CODES.get(country_lower, country_lower[:2].upper())

def get_eu_status(status_str, country_code):
    """Determine EU status from status string or country code."""
    if not status_str:
        status_str = ''
    status_lower = status_str.lower()
    
    if '🟢' in status_str or 'european' in status_lower or 'eu' in status_lower:
        return 'eu'
    elif '🟡' in status_str or 'mixed' in status_lower:
        return 'mixed'
    elif '🔴' in status_str or 'non' in status_lower:
        return 'non-eu'
    
    # Fallback to country code
    if country_code and country_code.upper() in EU_COUNTRIES:
        return 'eu'
    return 'non-eu'

def normalize_domain(domain_str):
    """Extract and normalize domain from string."""
    if not domain_str:
        return []
    
    # Split by comma, space, or pipe
    domains = re.split(r'[,|\s]+', domain_str)
    result = []
    
    for d in domains:
        d = d.strip().lower()
        # Remove protocol
        d = re.sub(r'^https?://', '', d)
        # Remove path
        d = d.split('/')[0]
        # Remove markdown links
        d = re.sub(r'\[.*?\]\(.*?\)', '', d)
        # Clean up
        d = d.strip('[]() ')
        
        if d and '.' in d and len(d) > 3:
            result.append(d)
    
    return result

def make_id(name):
    """Create a slug ID from company name."""
    if not name:
        return None
    # Remove parenthetical content
    name = re.sub(r'\s*\([^)]*\)', '', name)
    # Convert to lowercase, replace spaces with hyphens
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug if slug else None

def parse_markdown_table(content):
    """Parse markdown tables and extract company data."""
    companies = []
    
    # Find all table rows
    # Match lines starting with | and containing data
    table_pattern = r'\|\s*\d+\s*\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|'
    
    for match in re.finditer(table_pattern, content):
        company_name = match.group(1).strip()
        domain_str = match.group(2).strip()
        country_str = match.group(3).strip()
        status_str = match.group(4).strip()
        
        # Skip header rows
        if 'Company' in company_name or 'Domain' in domain_str:
            continue
        
        company_id = make_id(company_name)
        if not company_id:
            continue
            
        country_code = get_country_code(country_str)
        eu_status = get_eu_status(status_str, country_code)
        domains = normalize_domain(domain_str)
        
        companies.append({
            'id': company_id,
            'name': company_name,
            'hq_country': country_code,
            'eu_status': eu_status,
            'domains': domains
        })
    
    return companies

def parse_detailed_profile(content):
    """Parse detailed company profiles (### sections)."""
    companies = []
    
    # Match profile sections
    profile_pattern = r'###\s+(?:\d+\.\s+)?(.+?)(?:\s+🟢|🟡|🔴)?\n(.*?)(?=###|\Z)'
    
    for match in re.finditer(profile_pattern, content, re.DOTALL):
        name = match.group(1).strip()
        details = match.group(2)
        
        company_id = make_id(name)
        if not company_id:
            continue
        
        # Extract domain
        domain_match = re.search(r'\*\*Domain[s]?\*\*:?\s*([^\n]+)', details)
        domains = normalize_domain(domain_match.group(1) if domain_match else '')
        
        # Extract HQ
        hq_match = re.search(r'\*\*HQ(?:\s+Country)?\*\*:?\s*([^\n]+)', details)
        country_str = hq_match.group(1).strip() if hq_match else ''
        country_code = get_country_code(country_str)
        
        # Extract status
        status_match = re.search(r'\*\*(?:EU\s+)?Status\*\*:?\s*([^\n]+)', details)
        status_str = status_match.group(1) if status_match else ''
        eu_status = get_eu_status(status_str, country_code)
        
        if company_id and (domains or country_code):
            companies.append({
                'id': company_id,
                'name': name,
                'hq_country': country_code,
                'eu_status': eu_status,
                'domains': domains
            })
    
    return companies

def process_research_file(filepath):
    """Process a single research markdown file."""
    print(f"Processing: {filepath.name}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    companies = []
    
    # Try table parsing first
    table_companies = parse_markdown_table(content)
    companies.extend(table_companies)
    
    # Also try detailed profile parsing
    profile_companies = parse_detailed_profile(content)
    
    # Merge, preferring profile data (more detailed)
    existing_ids = {c['id'] for c in companies}
    for pc in profile_companies:
        if pc['id'] not in existing_ids:
            companies.append(pc)
        else:
            # Update existing with more domains
            for c in companies:
                if c['id'] == pc['id']:
                    c['domains'] = list(set(c.get('domains', []) + pc.get('domains', [])))
                    break
    
    print(f"  Found {len(companies)} companies")
    return companies

def expand_country_domains(companies):
    """Expand domains with country-specific TLDs."""
    EU_TLDS = ['de', 'fr', 'fi', 'nl', 'es', 'it', 'pl', 'se', 'dk', 'no', 
               'at', 'ch', 'be', 'ie', 'pt', 'cz', 'hu', 'ro', 'gr', 'co.uk']
    
    for company in companies:
        domains = company.get('domains', [])
        if not domains:
            continue
        
        # Find base domains (those with .com)
        base_names = set()
        for d in domains:
            if d.endswith('.com'):
                base = d.replace('.com', '')
                if '.' not in base:  # Simple domain like spotify.com
                    base_names.add(base)
        
        # Expand for major companies
        new_domains = set(domains)
        for base in base_names:
            for tld in EU_TLDS:
                new_domains.add(f"{base}.{tld}")
        
        company['domains'] = sorted(list(new_domains))
    
    return companies

def main():
    # Load existing companies
    companies_file = DATA_DIR / "companies.json"
    with open(companies_file, 'r') as f:
        existing_companies = json.load(f)
    
    existing_ids = {c['id']: c for c in existing_companies}
    print(f"Existing companies: {len(existing_ids)}")
    
    # Process all research files
    all_new_companies = []
    for md_file in RESEARCH_DIR.glob("*.md"):
        companies = process_research_file(md_file)
        all_new_companies.extend(companies)
    
    # Deduplicate and merge
    new_by_id = {}
    for c in all_new_companies:
        cid = c['id']
        if cid in new_by_id:
            # Merge domains
            existing_domains = set(new_by_id[cid].get('domains', []))
            new_domains = set(c.get('domains', []))
            new_by_id[cid]['domains'] = list(existing_domains | new_domains)
        else:
            new_by_id[cid] = c
    
    print(f"\nTotal unique new companies: {len(new_by_id)}")
    
    # Expand country domains
    new_companies = expand_country_domains(list(new_by_id.values()))
    
    # Add new companies
    added = 0
    updated = 0
    for nc in new_companies:
        if nc['id'] in existing_ids:
            # Update existing with new domains
            existing = existing_ids[nc['id']]
            old_domains = set(existing.get('domains', []))
            new_domains = set(nc.get('domains', []))
            if new_domains - old_domains:
                existing['domains'] = sorted(list(old_domains | new_domains))
                updated += 1
        else:
            # Add new company
            existing_companies.append(nc)
            existing_ids[nc['id']] = nc
            added += 1
    
    print(f"Added: {added}")
    print(f"Updated: {updated}")
    
    # Save companies
    with open(companies_file, 'w') as f:
        json.dump(existing_companies, f, indent=2)
    print(f"\nSaved {len(existing_companies)} companies to {companies_file}")
    
    # Sync domains.json
    domains_file = DATA_DIR / "domains.json"
    with open(domains_file, 'r') as f:
        domains_data = json.load(f)
    
    existing_domains = {d['domain'] for d in domains_data['domains']}
    domains_added = 0
    
    for company in existing_companies:
        for domain in company.get('domains', []):
            if domain not in existing_domains:
                domains_data['domains'].append({
                    'domain': domain,
                    'company_id': company['id']
                })
                existing_domains.add(domain)
                domains_added += 1
    
    with open(domains_file, 'w') as f:
        json.dump(domains_data, f, indent=2)
    print(f"Added {domains_added} domains to {domains_file}")
    print(f"Total domains: {len(domains_data['domains'])}")

if __name__ == '__main__':
    main()
