# Connect Gmail + data — Inventory Tracker For A Furniture Wareho

This build is intentionally safe to hand to a client.

## Demo mode (works immediately)

1. Open the site and press **Connect** (or **Connect Gmail & data**).
2. Enter an inbox and save. The address is stored in this browser under
   `localStorage` key `botlancer:connect:b50628d6-42dd-486c-b1a9-6d5d6f8be215`.
3. Import a CSV or JSON file, or choose the labelled sample data.
4. Press **Mark setup complete**.

Demo mode does not contact Google, does not transmit the address and cannot send email.
Clearing site data removes everything.

## Production Gmail (operator steps)

1. Create a Google Cloud project and enable the Gmail API.
2. Configure the OAuth consent screen. Keep it in testing until the client approves scopes.
3. Create an OAuth 2.0 Client ID of type **Web application**.
4. Add the production redirect URI, for example `https://your-domain.example/oauth/callback`.
5. Request only `gmail.readonly` and `gmail.compose`. Do not request send scope.
6. Store the client ID and secret on the server. Never place them in this static site.
7. On a new enquiry, create a Gmail **draft** with the reply. A human reviews and sends.

## Data

- Local board data: `localStorage`, key `botlancer:data:b50628d6-42dd-486c-b1a9-6d5d6f8be215`.
- Seed data: `data.json`.
- Export: the board writes a dated CSV from the browser.
- Production database: replace the seed/loader with your API. The interface does not need to change.

## Automations and guardrails

- **Enquiry → Gmail draft** (demo) — Summarise the enquiry and create a Gmail draft reply with the next step.
  - Guard: Draft only. You read it, edit it, and press send.
- **Lead triage** (demo) — Score fit, tag the request, and write the record into the data board.
  - Guard: No record is deleted; every change is logged.
- **Follow-up sequence** (demo) — Prepare three short follow-up drafts with the original context attached.
  - Guard: You approve each draft. The sequence stops the moment the client replies.
- **Weekly operator report** (production) — Summarise enquiries, bookings, failed checks and open follow-ups into one message.
  - Guard: Internal message to you only.
- **Live delivery check** (production) — Fetch the live site and every asset, then record HTTP status and response time.
  - Guard: Read-only. Alerts on failure; never changes the site.
- **Data snapshot** (production) — Export the current board to a dated CSV so nothing lives in one place.
  - Guard: Local file only. No third-party upload.
- **Threshold alert** (demo) — Flag the row, write a note, and prepare an internal alert.
  - Guard: Internal alert only. No supplier is contacted automatically.

Nothing in this delivery auto-sends client email.
