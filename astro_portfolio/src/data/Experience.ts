export interface ExperienceEntry {
  company: string;
  role: string;
  dateRange: string;
  location: string;
  bullets: string[];
  stack: string[];
}

export const experience: ExperienceEntry[] = [
  {
    company: 'Moniepoint',
    role: 'Mobile Engineer',
    dateRange: 'Aug 2025 — Jul 2026',
    location: 'Lagos, Nigeria',
    bullets: [
      'Owned mobile analytics & customer-engagement across Personal, Business and MonieWorld apps — 50M+ users.',
      'Architected an analytics SDK event dispatcher with queuing, retries and circuit breakers for unstable networks.',
      'Drove SDK test coverage from 4% to 76%; led Braze integration (push, in-app, SDUI surveys).',
    ],
    stack: ['Flutter', 'Kotlin', 'Swift', 'Braze', 'Mixpanel'],
  },
  {
    company: 'Migrapay',
    role: 'Senior Android Engineer',
    dateRange: 'Apr — Aug 2025',
    location: 'British Columbia, Canada',
    bullets: [
      'Led a multicurrency wallet supporting CAD, NGN, EUR, KES and ZAR transactions.',
      'Migrated critical UI flows to Jetpack Compose, cutting code complexity by 40%.',
      'Built region-specific KYC modules for regulatory compliance across countries.',
    ],
    stack: ['Kotlin', 'Jetpack Compose', 'Hilt', 'Retrofit'],
  },
  {
    company: 'Identigo',
    role: 'Senior Mobile Engineer',
    dateRange: 'Sep 2024 — Jun 2025',
    location: 'Lagos, Nigeria · Contract',
    bullets: [
      'Owned architecture & delivery of a cross-platform identity-verification platform.',
      'Built facial-recognition onboarding with Google ML Kit — ↓65% verification time, +40% accuracy.',
      'Integrated anti-spoofing & computer-vision checks to strengthen fraud prevention.',
    ],
    stack: ['Flutter', 'Firebase', 'Google ML Kit'],
  },
  {
    company: 'Synergyy',
    role: 'Senior Mobile Engineer',
    dateRange: 'Mar 2023 — Feb 2025',
    location: 'Abuja, Nigeria',
    bullets: [
      'Led end-to-end mobile development of a talent & payroll platform across the product lifecycle.',
      'Drove +30% active users and +40% engagement through high-impact features and quality work.',
      'Automated CI/CD with GitHub Actions & Fastlane, cutting deployment time by 50%.',
    ],
    stack: ['Flutter', 'Riverpod', 'GitHub Actions', 'Fastlane'],
  },
  {
    company: 'Polaris Bank',
    role: 'Mobile Engineer',
    dateRange: 'Sep 2023 — Mar 2024',
    location: 'Lagos, Nigeria',
    bullets: [
      'Engineered card payments for Afrigo, Visa & Mastercard with geo-tagged audit trails — ↓25% fraud.',
      'Shipped Vulte 2.0 onboarding with face verification and user-type-aware flows.',
      'Led a Flutter 2 → 3.7 migration, reducing crashes by 60%.',
    ],
    stack: ['Flutter', 'Provider', 'Firebase'],
  },
  {
    company: 'TellerOne',
    role: 'Mobile Engineer',
    dateRange: 'Sep 2021 — Sep 2023',
    location: 'Delaware, USA',
    bullets: [
      'Designed & delivered a QR payment system from scratch — $250K+ in monthly transaction volume.',
      'Integrated Mono Connect SDK for bank-account linking across payment & onboarding flows.',
    ],
    stack: ['Flutter', 'Firebase'],
  },
];
