# Google Sheets Formatting Rules

## Purpose

These rules define the final formatting, conditional formatting, and dropdown validation for the `Tickets` Google Sheet.

This file controls sheet presentation and validation only. It must not change ticket extraction, Gmail logic, workflow logic, ticket values, or the 13-column ticket schema.

## Required 13 Visible Columns

The `Tickets` sheet must keep exactly these visible columns:

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

Do not add Gmail Message ID, Ticket Key, hidden columns, raw email body, sender display name, or any other metadata column.

## Header Formatting

Apply formatting to the first row only:

* Header row should be bold.
* Header row can use a clean light green background.
* Header row should be frozen if supported.
* Header text should remain readable.
* Do not rename the 13 required columns.
* Do not add extra columns.

## Body Formatting

Apply body formatting without changing ticket values:

* Normal body cells should be white by default.
* Do not make the whole table grey.
* Do not color the whole row.
* Do not use alternating colors unless explicitly needed.
* Enable text wrapping for long text columns:
  * Issue Summary
  * Suggested Next Action
  * Suggested Reply

## Conditional Formatting Rules

Conditional formatting should apply only to these columns:

* Priority
* Sentiment
* Status
* Order / Account Reference

Do not use conditional formatting on whole rows.

### Priority

Allowed values:

* High
* Normal
* Low

Formatting:

* High = light red background
* Normal = light yellow background
* Low = light green background

### Sentiment

Allowed values:

* Neutral
* Confused
* Frustrated
* Angry
* Disappointed
* Positive

Formatting:

* Angry = light red background
* Frustrated = light orange background
* Disappointed = light yellow or soft orange background
* Confused = light purple or light blue background
* Neutral = white or very light grey background
* Positive = light green background

### Status

Allowed values:

* New
* In Progress
* Waiting for Customer
* Escalated
* Resolved

Formatting:

* New = light blue or neutral background
* In Progress = light purple or light blue background
* Waiting for Customer = light orange background
* Escalated = light red background
* Resolved = light green background

### Order / Account Reference

Formatting:

* If the value is exactly `Not provided`, highlight only that cell with a light red background and dark red text.
* If the value contains a useful reference, keep the cell white.
* Do not color the whole row.

## Dropdown / Data Validation Rules

Add dropdown validation so CS can click and select valid values in Google Sheets.

### Issue Category

Allowed dropdown values:

* Missing / Not Received
* Wrong / Incorrect Item
* Damaged / Defective Product
* Delivery / Shipping Delay
* Refund / Return / Exchange
* Billing / Payment / Invoice
* Login / Account Access
* Account Management
* Subscription / Cancellation
* Technical Bug / App Issue
* Digital Access / Download Issue
* Promo Code / Discount Issue
* Product Question
* Complaint / Negative Feedback
* Other Support

### Priority

Allowed dropdown values:

* High
* Normal
* Low

### Sentiment

Allowed dropdown values:

* Neutral
* Confused
* Frustrated
* Angry
* Disappointed
* Positive

### Status

Allowed dropdown values:

* New
* In Progress
* Waiting for Customer
* Escalated
* Resolved

## Safety Rules

Formatting and validation must not:

* Delete ticket rows.
* Delete ticket data.
* Rewrite ticket content.
* Add visible or hidden columns.
* Add Gmail Message ID.
* Add Ticket Key.
* Rename the 13 required columns.
* Modify Gmail.
* Rerun the Gmail workflow.

Formatting should only make the `Tickets` sheet cleaner, more readable, and easier for CS to use.
