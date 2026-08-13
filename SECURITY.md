# Security Policy

Sunshine Care Log (`diet-log`) is a caregiving tool. The data it handles — fluid
intake and output, blood pressure, medication state — is health data about a real
person. Security reports are welcome and taken seriously.

## Supported Versions

This project ships as a static site. Only the latest commit on `main` (the version
served at <https://anwer3712.github.io/diet-log/>) is supported. Forks and
self-hosted copies are the responsibility of the operator who deployed them.

| Version | Supported |
|---|---|
| `main` (latest) | ✅ |
| Tagged releases older than the newest | ❌ |
| Forks / self-hosted copies | ❌ (operator's responsibility) |

## Reporting a Vulnerability

**Please do not open a public issue for security problems.**

Report privately through GitHub Security Advisories:

👉 <https://github.com/anwer3712/diet-log/security/advisories/new>

Please include:

- The affected file or page (`index.html`, `anak.html`, `trends.html`,
  `admin.html`, `admin-settings.html`, `mirror-u1.html`, `mirror-u2.html`,
  `care-tasks.js`, `care-clinical.js`, `mirror-ui.js`, or a workflow under
  `.github/workflows/`)
- Steps to reproduce, or a proof-of-concept payload
- What an attacker gains (read data, write data, execute script, escalate)
- Any suggested fix

**Never include real patient data in a report.** Use synthetic values.

### What to expect

This is a single-maintainer project, not a company. Realistic timelines:

| Stage | Target |
|---|---|
| Acknowledgement | within 7 days |
| Initial assessment | within 14 days |
| Fix for critical / high severity | within 30 days |
| Public advisory + credit | after the fix ships |

Reporters are credited in the advisory unless they ask not to be.

## Scope

**In scope**

- DOM XSS and HTML injection in any page or script in this repository
- Injection through data returned by the Google Apps Script backend and rendered
  in the UI
- Supply-chain issues in `vendor/` (bundled Chart.js), `package.json`, or the
  GitHub Actions workflows
- Secrets or personal data accidentally committed to this repository
- Logic flaws in the clinical thresholds that could cause the app to suppress a
  warning that should fire (e.g. the fluid-overload alert or the 60–72 h bowel
  alert)

**Out of scope**

- Google Sheets, Google Apps Script, or GitHub Pages platform vulnerabilities —
  report those to Google or GitHub
- Denial of service against GitHub Pages or Apps Script quotas
- Anything that requires access to a maintainer's Google account
- Social engineering
- Missing hardening headers that GitHub Pages does not let a static site set

## Known design limitations

These are properties of the architecture, not bugs. They are documented so that
anyone self-hosting understands what they are deploying.

1. **The backend authenticates in the app layer, not at the deployment layer.**
   The Web App stays deployed as *"Anyone"* — switching it to *"Anyone with a
   Google Account"* makes Apps Script answer with a 302 to `accounts.google.com`,
   which a cross-origin `fetch` cannot follow, so the app would simply stop
   working. Instead `care-auth.js` attaches a Google ID token and
   `gas/google-auth-patch.gs` verifies it against Google plus an email allowlist.
   Enforcement is controlled by the `AUTH_ENFORCE` script property; with it off,
   the backend verifies and logs but does not block.
   **A deployment that has not applied that patch is fully open: anyone who knows
   the `/exec` URL can read and write records.** The U1–U4 buttons are caregiver
   labels, not accounts, and never were.
2. **Device keys are a deliberate hole, sized to the household.** Caregivers
   without a Google account can be given a long random key
   (`AUTH_DEVICE_TOKENS`) that their device stores and sends instead of an ID
   token. Anyone holding that string has full read/write access, it does not
   expire, and it identifies a device rather than a person. Keep it out of the
   repository, hand it over on the device itself, and rotate the property if it
   leaks.
3. **A static frontend cannot keep a secret.** The `GAS_URL` constant lives in
   client-side JavaScript. Any value the browser needs is a value the visitor can
   read. Do not add API keys, tokens, or passwords to these files — they will be
   public.
4. **Therefore: treat your own `/exec` URL as sensitive.** If you fork this
   project, deploy your own Apps Script backend and **do not publish that URL**.
   Restrict the Web App to your Google account or workspace where possible, and
   keep the spreadsheet itself private (not "anyone with the link").
5. **No encryption at rest beyond Google's.** Records live in your Google Sheet
   under your Google account. Access control is whatever you set on that file.
6. **This is not a medical device.** Thresholds and the urine-target algorithm are
   caregiving aids, not diagnoses. See the in-app disclaimers.

## Automated security checks

Every push and pull request runs:

- [CodeQL](.github/workflows/codeql.yml) — JavaScript static analysis
- [Semgrep](.github/workflows/semgrep.yml) — pattern-based scanning
- [OSV-Scanner](.github/workflows/osv-scanner.yml) — dependency vulnerabilities
- [Super-Linter](.github/workflows/super-linter.yml) — lint and syntax checks

All user-supplied strings rendered into the DOM must go through the
`careEscapeHtml()` helper. A pull request that writes unescaped input into
`innerHTML` will be rejected.

## Disclosure

Coordinated disclosure. Please give the maintainer a chance to ship a fix before
publishing. Given that this software is used by families caring for elderly
patients, a quiet fix beats a fast headline.

Thank you for helping keep caregivers' data safe.
