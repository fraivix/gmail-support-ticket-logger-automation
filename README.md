# Gmail Support Ticket Logger Automation

## Project Objective

This project is designed to turn messy Gmail customer support emails into clean, structured Google Sheets tickets.

The planned automation will read recent customer emails, identify real support requests, skip irrelevant messages, extract ticket details, and write structured rows into a Google Sheet tab named `Tickets`.

## Problem Statement

Customer support inboxes often contain a mix of real customer issues, newsletters, promotions, receipts, alerts, and personal messages. Manually reviewing each email and copying details into a spreadsheet is slow, inconsistent, and easy to duplicate.

This project aims to create a simple workflow that can:

- Read full customer email content.
- Detect whether an email is a real support request.
- Skip newsletters, promotions, ads, and other irrelevant messages.
- Extract consistent support ticket fields.
- Write clean ticket rows into Google Sheets.
- Avoid duplicates without adding visible Gmail Message ID or Ticket Key columns.

## Planned Tools

- Codex
- Composio MCP
- Gmail
- Google Sheets
- Node.js later

## High-Level Architecture

The planned workflow is:

1. Gmail provides recent email messages.
2. Composio MCP allows the automation to access Gmail and Google Sheets.
3. AI reads the full email body and classifies whether the email is a support request.
4. `ticket-schema.md` defines the extraction, classification, fallback, priority, sentiment, and reply rules.
5. Valid support requests are converted into structured ticket rows.
6. Rows are written to the `Tickets` tab in Google Sheets.
7. Formatting is applied after tickets are written to Google Sheets.
8. Duplicate tickets are avoided using visible fields only.

## Planned Workflow

The implementation will eventually:

1. Fetch recent Gmail emails through Composio MCP.
2. Include both read and unread emails.
3. Read the full email body.
4. Identify real customer support requests.
5. Skip irrelevant emails such as newsletters or promotions.
6. Parse relevant emails into structured ticket data.
7. Convert each ticket into the exact Google Sheets column order.
8. Write the row into a Google Sheet tab named `Tickets`.
9. Avoid duplicates without adding visible Gmail Message ID or Ticket Key columns.
10. Apply visual formatting to keep the sheet readable.
11. Print a workflow summary after each run.

## Google Sheet Columns

Use exactly these 13 visible Google Sheets columns:

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

Do not add visible Gmail Message ID or Ticket Key columns.

The sheet must keep exactly these 13 visible columns. Formatting must not add hidden or visible metadata columns.

## Project Folder Structure

```text
Gmail Support Ticket Logger Automation/
├── README.md
├── ticket-schema.md
├── .gitignore
├── sample-emails/
│   ├── 01-workshop-recording.txt
│   ├── 02-wrong-item.txt
│   ├── 03-login-issue.txt
│   ├── 04-billing-issue.txt
│   └── 05-newsletter-skip.txt
└── skills/
    └── process-support-requests.md
```

## Source of Truth

`ticket-schema.md` is the source of truth for ticket extraction and classification rules. It defines which emails should be processed, which emails should be skipped, how each Google Sheets column should be filled, and how the AI should handle missing or unclear information.

`sheet-formatting.md` is the source of truth for Google Sheets visual formatting and validation rules. It defines how the `Tickets` sheet should be formatted after tickets are written, without changing ticket content or the 13-column schema.

## Implementation Status

The actual code will be added later. This repository currently contains only the initial GitHub project documentation, schema rules, sample emails, and AI skill definition.

This repository only contains the GitHub project files. Hiring-task deliverables such as the Loom script, work log, educational script, and submission notes are kept separately outside this repository.
