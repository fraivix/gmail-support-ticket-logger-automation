# Gmail Support Ticket Logger Automation

## Project Objective 

This project turns messy Gmail customer support emails into clean, structured Google Sheets tickets.

The automation helps identify real customer support requests, skip irrelevant emails, extract important ticket details, and store the result in a Google Sheet tab named `Tickets`.

## Problem Statement

Customer support inboxes often contain a mix of real customer issues, newsletters, promotions, receipts, alerts, and other unrelated messages.

Manually reviewing each email, deciding the issue type, setting priority, writing summaries, and copying everything into a spreadsheet can be repetitive and easy to miss.

This project helps reduce manual copy-paste work and makes customer issues easier to track, prioritize, and follow up.

## Tools Used

* Codex
* Composio MCP
* Gmail
* Google Sheets
* Node.js

## How It Works

```text
Gmail Inbox
→ Composio MCP
→ Codex Workflow
→ Support Request Detection
→ Ticket Parsing
→ Google Sheets Row Formatting
→ Tickets Sheet
```

Codex runs the workflow, while Composio MCP acts as the bridge that connects Codex with Gmail and Google Sheets.

The workflow reads recent Gmail messages, checks whether each email is a real support request, skips irrelevant emails, parses valid support emails, and writes structured ticket rows into Google Sheets.

## Google Sheet Columns

The `Tickets` sheet uses exactly these 13 visible columns:

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

## Ticket Rules

The ticket extraction rules are documented in `ticket-schema.md`.

This file defines:

* Which emails should be processed
* Which emails should be skipped
* How each column should be filled
* How priority and sentiment should be decided
* How missing or unclear information should be handled
* How suggested replies should be generated

## Sheet Formatting

The Google Sheets formatting rules are documented in `sheet-formatting.md`.

This file defines visual and validation rules such as:

* Header formatting
* Text wrapping
* Conditional formatting
* Dropdown values
* Missing reference highlighting

Formatting is used only to make the sheet easier to review. It does not change the ticket data or add extra columns.

## Project Folder Structure

```text
Gmail Support Ticket Logger Automation/
├── README.md
├── ticket-schema.md
├── sheet-formatting.md
├── .gitignore
├── package.json
├── sample-emails/
├── skills/
│   └── process-support-requests.md
└── src/
    ├── index.js
    ├── gmail.js
    ├── parser.js
    └── sheets.js
```

## Implementation Status

The project includes:

* Project documentation
* Ticket schema and AI rules
* Sample emails
* Node.js workflow structure
* Gmail integration through Composio MCP
* Google Sheets integration through Composio MCP
* Support request classification
* Ticket parsing
* Google Sheets row writing
* Sheet formatting and dropdown rules
