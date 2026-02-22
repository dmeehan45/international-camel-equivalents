export const uxCopy = {
  disclaimer: {
    key: 'ccc-shell-disclaimer-v1',
    text: 'Educational satire only. No camels were notarized, appraised, or emotionally consulted during these proceedings.',
    dismissCta: 'Dismiss notice',
  },
  legal: {
    footerLabel: 'Entirely Serious Legal Department™',
    links: [
      { href: '/fine-print', label: 'Fine Print' },
      { href: '/privacy-theater', label: 'Privacy Theater' },
      { href: '/terms-of-camelage', label: 'Terms of Camelage' },
    ],
  },
  loadingFacts: [
    'Statute 4.2 requires every export to receive at least one ceremonial stamp.',
    'Two clerks are currently debating whether one camel equals exactly three alpacas.',
    'The archive vault opens only after a dramatic pause for legal suspense.',
  ],
  phases: {
    phase1: {
      heading: 'Phase I: Petition Intake & Bid Filing',
      subtitle: 'File the opening camel bid under the Courtship Equivalency Act.',
      cta: 'Proceed to Valuation Hearing',
      secondaryCta: 'Strike Optional Addenda',
      labels: {
        bidName: 'Petitioner Name *',
        bidRegion: 'Venue Region *',
        camelQuantity: 'Filed Camel Quantity',
        warriorStatus: 'Warrior Status Addendum (optional)',
        hobby: 'Hobby Exhibit (optional)',
        courtshipYears: 'Courtship Duration Exhibit (optional)',
        artifact: 'Ceremonial Artifact Exhibit (optional)',
        quirks: 'Notable Quirks Addendum (optional)',
      },
      placeholders: {
        bidName: 'e.g. Layla',
        bidRegion: 'Select venue region',
        hobby: 'e.g. falconry',
        quirks: 'Record any notable facts for the hearing docket',
      },
      helper: {
        requiredFields: '* Required by Statute 1.0 for intake docketing.',
        quantityRange: (min: number, max: number) => `Court clerk guardrails enforce ${min}–${max} camels per filing.`,
        examples: 'Examples accepted by the clerk: 2 camels, 5 yaks, 2 cows.',
      },
    },
    phase2: {
      heading: 'Phase II: Valuation Hearing & Adjustment Review',
      cta: 'Affirm and Seal Bid',
      secondaryCta: 'Revert to Original Filing',
      noResult: 'No hearing record yet. File a petition in Phase I to open valuation.',
      compareCta: 'Run Comparative Hearing',
    },
    phase3: {
      heading: 'Phase III: Instrument Drafting & Service',
      cta: 'Issue Service Copy',
    },
    phase4: {
      heading: 'Phase IV: Docketing & Archival Seal',
      subtitle: 'Review the executed instrument and archive the sealed record.',
      cta: 'Enter into Permanent Archive',
      empty: 'No sealed bid on record yet.',
    },
  },
  errors: {
    defaultStatute: 'Statute 0',
    parseUnknown: "By order of the Camel Court, that filing is indecipherable. Try '2 camels' or '5 yaks'.",
    proxyNotFound: (proxyName: string) => `Statute 12(b): '${proxyName}' is not a recognized proxy witness in this jurisdiction.`,
    calculationFailed: 'Statute 3.14 stayed these proceedings; valuation could not be computed.',
    compareFailed: 'Comparative hearing adjourned under Statute 7. Please review selected proxies and retry.',
    formalizerFailed: 'Instrument clerk unavailable under Statute 9. Message drafting could not proceed.',
    exportFailed: 'Seal application denied under Statute 11. Export did not complete.',
    archiveFailed: 'Archive registrar refused entry under Statute 15. Record not saved.',
    createProxyFailed: 'Proxy petition rejected under Statute 5. Provide valid proxy evidence and retry.',
  },
} as const;
