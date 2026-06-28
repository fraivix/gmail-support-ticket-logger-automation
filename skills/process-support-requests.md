# /process-support-requests

## Purpose

Process recent Gmail messages and turn real customer support requests into structured Google Sheets ticket rows.

This skill should use `ticket-schema.md` as the source of truth for support request classification, field extraction, assumptions, fallback values, priority analysis, sentiment analysis, and suggested reply generation.

Optional Google Sheets formatting should use `sheet-formatting.md` as the source of truth for visual formatting and validation rules.

## Intended Workflow

1. Fetch recent Gmail emails using Composio MCP.
2. Include both read and unread emails.
3. Read the full email body, not only snippet or sender metadata.
4. Use `ticket-schema.md` as the source of truth for:
   - support request classification
   - field extraction
   - assumptions
   - fallback values
   - priority analysis
   - sentiment analysis
   - suggested reply generation
5. Skip irrelevant emails such as newsletters, promotions, ads, generic alerts, and personal messages unrelated to support.
6. Parse relevant support emails into the 13 required ticket fields.
7. Convert each ticket into the exact Google Sheets column order.
8. Write the ticket row to the `Tickets` sheet through Composio Google Sheets MCP.
9. Apply optional Google Sheets formatting after ticket rows are written, following `sheet-formatting.md`.
10. Do not add visible Gmail Message ID or Ticket Key columns.
11. Avoid duplicates using visible fields only, such as Customer Email + Email Subject + Received Date.
12. Print a summary after the workflow runs:
    - total emails fetched
    - support requests identified
    - skipped emails
    - rows inserted
    - rows updated
    - errors, if any

## Required Google Sheets Column Order

1. Received Date
2. Customer Name
3. Customer Email
4. Email Subject
5. Product / Service
6. Issue Category
7. Priority
8. Sentiment
9. Order / Account Reference
10. Issue Summary
11. Suggested Next Action
12. Suggested Reply
13. Status

## Important Notes

This skill should not rely only on unread status. Read and unread emails can both be valid support requests.

The skill must analyze the full email body before classification or extraction. It should not rely only on the sender name, subject line, or Gmail snippet.

The skill must not add visible Gmail Message ID or Ticket Key columns to the Google Sheet.

Formatting must happen after ticket rows are written. Formatting must not add extra columns, change ticket content, or alter the 13-column schema.
