# FAQ Generation & Schema Prompts

## 1. Comprehensive FAQ Generation

```
Generate a complete FAQ section for [TOPIC/PRODUCT].

Target keywords: [KEYWORD_1], [KEYWORD_2], [KEYWORD_3]
Target audience: [AUDIENCE]
Product/service: [DESCRIPTION]

Create 15-20 FAQs covering:

BASICS (5 questions)
- What is [PRODUCT]?
- How does [PRODUCT] work?
- Who is [PRODUCT] for?
- Why should I use [PRODUCT]?
- What makes [PRODUCT] different?

FEATURES (4 questions)
- Questions about key features
- How to use specific functionality
- Compatibility questions

PRICING/VALUE (3 questions)
- Cost-related questions
- Free vs paid
- Refund/guarantee questions

TECHNICAL (3 questions)
- Requirements
- Installation/setup
- Troubleshooting

TRUST (3 questions)
- Security/privacy
- Support
- Company background

Format each as:
Q: [Question with keyword naturally included]
A: [Answer in 40-75 words, helpful and specific]

Answers should:
- Be direct and helpful
- Include keywords naturally
- Stand alone (don't reference other answers)
- Be suitable for schema markup
```

## 2. FAQ Schema JSON-LD Generator

```
Convert these FAQs to JSON-LD schema markup:

FAQs:
1. Q: [QUESTION_1] A: [ANSWER_1]
2. Q: [QUESTION_2] A: [ANSWER_2]
3. Q: [QUESTION_3] A: [ANSWER_3]
[...continue...]

Output valid JSON-LD that can be added to <script type="application/ld+json">

Include:
- @context
- @type: FAQPage
- mainEntity array
- Proper escaping of quotes and special characters
- Clean formatting
```

**Example output format:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is EuroCheck?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "EuroCheck is a browser extension that automatically shows Euro prices on international shopping sites, helping European shoppers compare prices without manual currency conversion."
      }
    }
  ]
}
```

## 3. Product FAQ (E-commerce Focus)

```
Generate product FAQs for [PRODUCT_NAME].

Product type: [CATEGORY]
Price: [PRICE]
Key features: [FEATURE_1], [FEATURE_2], [FEATURE_3]
Common objections: [OBJECTION_1], [OBJECTION_2]

Generate FAQs for these categories:

PRODUCT QUESTIONS
1. What's included with [PRODUCT]?
2. What are the specifications/requirements?
3. How is [PRODUCT] different from [COMPETITOR]?
4. Is [PRODUCT] compatible with [PLATFORM]?

PURCHASE QUESTIONS
5. How much does [PRODUCT] cost?
6. Is there a free trial/version?
7. What payment methods do you accept?
8. Do you offer refunds?

USAGE QUESTIONS
9. How do I get started?
10. How long does setup take?
11. Do I need technical knowledge?
12. Can I use [PRODUCT] on multiple [devices/sites]?

SUPPORT QUESTIONS
13. How do I get help?
14. Is there documentation?
15. How often is [PRODUCT] updated?

Each answer: 2-4 sentences, specific, helpful
```

## 4. Service FAQ (Local Business)

```
Generate FAQs for [SERVICE] in [LOCATION].

Business: [BUSINESS_NAME]
Services: [SERVICE_LIST]
Service area: [AREAS]
Unique selling points: [USP_1], [USP_2]

Generate location-optimized FAQs:

SERVICE QUESTIONS (include [LOCATION])
1. What [SERVICE] services do you offer in [LOCATION]?
2. How much does [SERVICE] cost in [LOCATION]?
3. How long does [SERVICE] typically take?
4. Do you offer emergency [SERVICE]?

BOOKING QUESTIONS
5. How do I schedule [SERVICE]?
6. What areas do you serve near [LOCATION]?
7. What are your hours?
8. Do you offer free estimates?

TRUST QUESTIONS
9. Are you licensed and insured?
10. How long have you been in business?
11. What warranties do you offer?
12. Do you have reviews I can check?

PREPARATION QUESTIONS
13. What do I need to prepare?
14. What should I expect during [SERVICE]?
15. What happens after [SERVICE] is complete?

Include local keywords naturally in questions and answers.
```

## 5. How-To FAQ (Tutorial Focus)

```
Generate how-to FAQs for [PROCESS/TASK].

Topic: [TOPIC]
Difficulty level: [BEGINNER/INTERMEDIATE/ADVANCED]
Target keyword: "how to [ACTION]"
Related keywords: [KEYWORD_2], [KEYWORD_3]

Questions should cover:

GETTING STARTED
1. How do I start [PROCESS]?
2. What do I need to [PROCESS]?
3. How long does it take to [PROCESS]?

STEP-BY-STEP
4. What's the first step in [PROCESS]?
5. How do I [SPECIFIC_STEP]?
6. What comes after [STEP]?

TROUBLESHOOTING
7. What if [COMMON_PROBLEM] happens?
8. Why isn't [THING] working?
9. How do I fix [ISSUE]?

ADVANCED
10. How can I [ADVANCED_TECHNIQUE]?
11. What are the best practices for [PROCESS]?
12. How do experts [PROCESS]?

Answers should be actionable with specific steps.
```

## 6. Comparison FAQ

```
Generate comparison FAQs for [PRODUCT_A] vs [PRODUCT_B].

Products being compared:
- [PRODUCT_A]: [BRIEF_DESCRIPTION]
- [PRODUCT_B]: [BRIEF_DESCRIPTION]

Target keyword: "[PRODUCT_A] vs [PRODUCT_B]"

Generate balanced comparison FAQs:

OVERVIEW
1. What's the difference between [A] and [B]?
2. Which is better, [A] or [B]?
3. Is [A] worth it compared to [B]?

FEATURES
4. Does [A] have [FEATURE] like [B]?
5. Which has better [CAPABILITY]?
6. What can [A] do that [B] can't?

USE CASES
7. Should I use [A] or [B] for [USE_CASE]?
8. Which is better for [USER_TYPE]?
9. When should I choose [A] over [B]?

PRACTICAL
10. Which is easier to use?
11. Which is more affordable?
12. Can I switch from [B] to [A]?

Be balanced and honest. Recommend based on use case, not blanket statements.
```

## 7. FAQ Validation Checklist

Before publishing FAQs, verify:

```
□ Each question uses natural language (how people actually ask)
□ Each answer is 40-75 words (not too short, not too long)
□ Target keywords appear naturally (not stuffed)
□ Questions are unique (no duplicate intents)
□ Answers are standalone (don't reference other FAQs)
□ Technical terms are explained
□ Contact info included where relevant
□ Last updated date is current
□ Schema markup validates (test with Google's tool)
□ Mobile formatting looks good
```

## 8. FAQ Schema Testing

After implementing FAQ schema:

```
Test with: https://search.google.com/test/rich-results

Validate:
1. No errors in structured data
2. All Q&A pairs detected
3. Proper encoding of special characters
4. Answers aren't truncated
5. Schema matches visible FAQ content

Common issues:
- Missing closing brackets
- Unescaped quotes in answers
- FAQ schema on non-FAQ pages
- Duplicate FAQ schemas on same page
- Answers that are too long (max ~300 words)
```

## Quick FAQ Templates

### Single FAQ Snippet
```
Q: [Question including target keyword]?
A: [Direct answer in first sentence]. [Supporting detail]. [Call to action or additional help].
```

### FAQ List for Schema
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "FAQ 1?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Answer 1."
    }
  }, {
    "@type": "Question",
    "name": "FAQ 2?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Answer 2."
    }
  }]
}
```
