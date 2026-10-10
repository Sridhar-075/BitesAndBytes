Problem Statement: A patient's medical history exists, but it is scattered across providers and rarely available, or safely shareable, at the moment a clinician needs it. Several specific challenges follow from this:
Scattered records: Prescriptions, lab reports, scans, and discharge summaries sit in different places and formats, with no single timeline of a patient's health.
Unreliable recall: Patients struggle to remember past diagnoses, allergies, current medications, and doses. Clinicians in a short consultation often work from incomplete or wrong information.
Repeated tests and conflicting treatment: Without prior results, tests are redone, and different doctors may prescribe overlapping or interacting medicines without knowing what the patient already takes.
Insecure and difficult sharing: Handing records to a new doctor means forwarding files over chat or carrying folders, which is slow and leaves sensitive data exposed. There is no simple, secure way to share the right history with the right doctor, or to stop sharing it afterward.
Broken continuity of care: When a patient changes doctors, moves cities, or arrives at an emergency room, the new clinician starts from scratch, with no view of earlier diagnoses, treatments, and test results.
**Google Drive Video Link: https://drive.google.com/file/d/1U3RAwW2Bk5AmvBQBf4SJVh5rj7hJISn-/view?usp=sharing**__
# Continuum Health

**A patient-controlled medical-record catalogue and consent-coordination prototype.**



Continuum Health is designed to help patients organise references to medical records scattered across healthcare providers, review access requests, and grant or revoke document-specific permissions. It distinguishes records stored by the platform from records that remain with an external source.

> **Prototype notice:** This repository uses seeded demo data, an in-memory store, and mock DigiLocker/hospital connectors. It is not a production medical-record system and does not establish a live connection to DigiLocker or any hospital EHR. Do not use real patient data.

## Contents

- [What it demonstrates](#what-it-demonstrates)
- [Architecture and privacy boundary](#architecture-and-privacy-boundary)
- [Technology stack](#technology-stack)
- [Run locally](#run-locally)
- [Demo roles](#demo-roles)
- [Security checks](#security-checks)
- [API overview](#api-overview)
- [Project structure](#project-structure)
- [Current limitations](#current-limitations)
- [Contributing](#contributing)
- [License](#license)

## What it demonstrates

- **Patient catalogue:** Browse and search a consolidated list of medical-record entries and their source metadata.
- **Multiple record sources:** Represent platform-uploaded documents and externally held records, including DigiLocker and hospital-source references.
- **Patient consent workflow:** Review provider requests and approve or deny access at document level.
- **Permission lifecycle:** View active permissions and revoke grants for platform-hosted uploads.
- **External sharing coordination:** Track a separate external-sharing workflow, including pending, confirmed, denied, and revoked states.
- **Provider workflows:** Create access requests and review documents for which access has been granted.
- **Audit trail:** Record relevant actions and workflow outcomes.
- **Security test panel:** Run built-in checks for document-level isolation and external-document access boundaries.
- **Demo reset:** Restore the in-memory store to its seeded state.

## Architecture and privacy boundary

The central design rule is that **a catalogue entry is not the same thing as access to the document itself**.

### Records held by external sources

For records originating in DigiLocker or a hospital EHR, the platform is intended to keep permitted metadata and an external reference. The platform must not fetch, proxy, download, preview, OCR, cache, or store the external document contents. The patient-facing consent action in this prototype does not itself prove that the external source has granted access. The external workflow is tracked separately and is explicitly simulated in this repository.

### Documents uploaded to the platform

Uploaded documents are represented as platform-stored records. Provider viewing is subject to the backend permission decision service and an active, document-specific grant. A grant for one document must not allow access to another document, including another record belonging to the same patient. Revocation should block subsequent access checks.

### External source status

The mock connector actions demonstrate how external sharing may be confirmed, denied, or revoked. They are **demo simulations**, not live DigiLocker OAuth or hospital integration. In a real integration, source-side authorization and confirmation must be verified independently; if a source cannot revoke access programmatically, the product should clearly direct the patient to take action at that source.

## Technology stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript (`tsx` for local execution)
- **UI and animation:** Tailwind CSS 4, Lucide React, Motion
- **Development/build tooling:** Vite, TypeScript, esbuild
- **Data layer:** In-memory TypeScript `Map`-based store seeded with demo data

The repository currently does not configure a persistent database or database migrations. Data changes are lost when the server process restarts.

## Run locally

### Prerequisites

- Node.js (use a current LTS release)
- npm
- Git

### 1. Get the source code

Open the project repository or extract the project archive, then run the remaining commands from the directory containing `package.json`. Use the clone URL for the repository where this **Continuum Health** code actually lives; the GitHub URL originally provided in the chat was named `BitesAndBytes`, which does not match the project name in this archive.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Express server mounts the API at `/api/v1` and runs the Vite development middleware in development mode.

No database setup is required for the current seeded demo. The current application code does not read `GEMINI_API_KEY` for its main workflows; `.env.example` contains AI Studio deployment-oriented variables, so do not assume a Gemini integration is active just because the variable is listed there.

### Other scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the server with the Vite development middleware |
| `npm run build` | Build the frontend into `dist/` |
| `npm start` | Start the server in production mode; build first |
| `npm run preview` | Run Vite's preview server for the built frontend |
| `npm run lint` | Run TypeScript type-checking with `tsc --noEmit` |
| `npm run clean` | Remove generated `dist` and `server.js` artifacts |

For a production-style local run:

```bash
npm run build
npm start
```

The server uses `PORT` when set and otherwise defaults to port `3000`.

## Demo roles

The app seeds example accounts for patient, provider, and platform-admin flows. The frontend's account selector and the backend's seeded users are intended for demonstration only.

| Role | Seeded account |
| --- | --- |
| Patient | `priya.sharma@example.com` |
| Provider | `dr.ananya.sharma@sunrisemedical.org` |
| Provider | `dr.rahul.mehta@greenvalleyclinic.org` |
| Provider | `dr.neha.iyer@citydiagnostics.in` |
| Platform administrator | `admin@continuumhealth.in` |

This prototype uses a mock user-selection mechanism, not production authentication. The API accepts an `x-user-id` header and defaults to the seeded patient when no valid user is supplied. **Do not expose this configuration to the public internet or treat it as secure authentication.**

## Security checks

The application includes a built-in security test service accessible from the UI and through the API:

```http
POST /api/v1/security-tests/run
```

The checks cover scenarios including:

- A provider cannot access a different document without a grant for that specific document.
- A provider cannot cross patient boundaries by changing a document ID.
- An external DigiLocker record is not retrieved through the platform's document-view endpoint, even when external sharing is marked confirmed.
- Revoking a grant blocks subsequent access checks.
- Other consent and external-source boundary checks implemented by the security test service.

These are prototype-level checks, not a substitute for an independent security review, automated test suite, penetration testing, or production compliance assessment.

## API overview

The backend is mounted under `/api/v1`. Important route groups include:

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Server health check |
| `GET /api/v1/auth/me` | Current mock user and available demo accounts |
| `POST /api/v1/auth/login` | Select a seeded demo account |
| `GET /api/v1/patient/dashboard` | Patient dashboard data |
| `GET /api/v1/documents` | List catalogue records |
| `GET /api/v1/documents/:documentId` | Retrieve a record's safe metadata |
| `GET /api/v1/documents/:documentId/view` | Apply the document access decision before viewing |
| `POST /api/v1/documents/upload` | Add a platform-uploaded record |
| `GET /api/v1/source-connections` | List source connections |
| `POST /api/v1/source-connections/digilocker/start` | Start the mock DigiLocker flow |
| `POST /api/v1/source-connections/digilocker/mock-complete` | Simulate completion of the DigiLocker flow |
| `GET /api/v1/access-requests` | List access requests |
| `POST /api/v1/access-requests` | Create an access request |
| `POST /api/v1/access-requests/:requestId/decision` | Approve or deny a request |
| `GET /api/v1/permissions` | List consent grants |
| `POST /api/v1/permissions/:grantId/revoke` | Revoke a platform grant |
| `GET /api/v1/external-sharing` | List external-sharing workflows |
| `GET /api/v1/audit-events` | List audit events |
| `POST /api/v1/security-tests/run` | Run built-in security checks |
| `POST /api/v1/admin/reset-demo` | Reset the seeded demo state |

The route list is an overview, not a full API contract. Inspect `server/routes/index.ts` for request payloads, response shapes, validation, and the complete route definitions.

## Project structure

```text
.
├── src/
│   ├── components/       # Reusable UI and modal components
│   ├── services/api.ts   # Frontend API client
│   ├── views/            # Patient, provider, and admin screens
│   ├── App.tsx           # Main application and navigation
│   └── main.tsx          # Frontend entry point
├── server/
│   ├── db/store.ts       # Seeded in-memory data store
│   ├── routes/index.ts   # REST API routes
│   ├── services/         # Catalogue, consent, audit, decisions, tests
│   ├── services/connectors/ # Mock external-source connectors
│   └── types.ts          # Shared domain types
├── server.ts             # Express/Vite server entry point
├── package.json          # Scripts and dependencies
├── vite.config.ts        # Vite configuration
└── .env.example          # Example deployment environment variables
```

## Current limitations

- DigiLocker and hospital integrations are mocked; there are no live external-source credentials or verified live integrations in this codebase.
- The store is in memory and resets on server restart.
- Demo account selection is not real authentication or identity verification.
- The project is a prototype and has not been represented as compliant with any healthcare regulation or certification.
- Do not upload real medical records or use the project for clinical decisions.

Before production use, implement real authentication and authorization, durable storage, secure file storage and delivery, secret management, input validation, rate limiting, operational monitoring, formal consent and retention policies, and independently reviewed security controls. Integrations must preserve the external-source privacy boundary described above.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-change`.
3. Make and test your changes.
4. Commit with a descriptive message.
5. Open a pull request describing the change and how it was tested.

Please avoid committing secrets, real patient information, generated build artifacts, or environment files containing credentials.

## License

No license file was present in the supplied project archive. Until a license is added, do not assume the code is released under an open-source license. Add a `LICENSE` file if you intend to permit reuse or redistribution.

---

Built as a prototype exploring patient-controlled medical record discovery, document-level consent, and safer coordination across fragmented healthcare systems.
