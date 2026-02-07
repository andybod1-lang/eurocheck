# r/privacy Post Draft

## Title
I made a browser extension that helps find European products - zero tracking, fully open source

## Body

I've been increasingly aware of how much data flows to US servers when shopping online. GDPR exists for a reason, and I wanted to make it easier to support companies that actually have to follow it.

So I built **EuroCheck** - a simple browser extension that shows a 🇪🇺 badge when you're on a product page from a European company.

**What it does:**
- Displays a small EU flag badge on product pages from European companies
- Works on major e-commerce sites
- That's it. Nothing fancy.

**What it doesn't do:**
- No tracking whatsoever
- No analytics
- No external requests (the company database is bundled locally)
- No account required
- Doesn't collect browsing history
- Doesn't phone home

**Privacy approach:**
- All matching happens locally in your browser
- The extension only activates on e-commerce domains
- Open source so you can verify: [GitHub link]
- No permissions beyond what's strictly necessary

**Why I built this:**
Not trying to be preachy about "buy European." But if you already care about data privacy, you might also care that European companies are bound by stronger privacy regulations. This just makes that info visible when you're already shopping.

Available for Firefox and Chrome. The Firefox version went through Mozilla's full review process.

Happy to answer any questions about the technical implementation or privacy approach.

---

**Suggested flair:** Privacy Tools

**Best posting time:** Weekday mornings US time (high r/privacy activity)

**Engagement notes:**
- Be ready to answer technical questions about permissions
- If asked about manifest v3, explain the privacy implications honestly
- Don't be defensive if people point out limitations
