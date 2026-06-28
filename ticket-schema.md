# Customer Support Ticket Schema and AI Analysis Rules

============================================================
Customer Support Ticket Schema and AI Analysis Rules
====================================================

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

General AI Rules

The workflow should process emails that are real customer support requests, complaints, issue reports, refund requests, delivery problems, billing problems, account problems, product problems, technical bugs, or digital access problems.

The workflow should skip irrelevant emails such as newsletters, promotions, ads, social notifications, generic security alerts, calendar invitations, spam, receipts with no complaint, delivery confirmations with no complaint, and personal messages unrelated to support.

The workflow must analyze the full email body before parsing. Do not rely only on the Gmail sender name, email subject, or snippet.

The AI should be helpful but not overconfident. If information is clear, extract it. If information is unclear, use safe assumptions. If information is missing, use fallback values like “Unknown Customer,” “Unknown,” “Not provided,” “Other Support,” “Hi there,” or “New.”

Do not invent details.

---

## Column 1: Received Date

Definition:
The date and time when the email was received.

Extraction rule:
Use the Gmail message received timestamp if available.

Do:

* Use the real Gmail received timestamp.
* Keep the date format consistent.
* Use a readable format.

Don’t:

* Do not invent a date.
* Do not use the current time if Gmail already provides the email timestamp.

Fallback:
If Gmail timestamp is not available, use “Unknown”.

---

## Column 2: Customer Name

Definition:
The name of the customer who is asking for help.

Extraction priority:

First priority: extract from explicit body phrases:

* under the name Daniel Lee
* my name is Daniel Lee
* I am Daniel Lee
* this is Daniel Lee
* name: Daniel Lee
* customer name: Daniel Lee
* account name: Daniel Lee
* registered under Daniel Lee

Second priority: extract from email closing or signature:

* Thanks,
  Daniel
* Thank you,
  Sarah
* Best,
  John Lee
* Regards,
  Amanda
* Sincerely,
  Michael
* Cheers,
  Rachel

Third priority:
Use Gmail sender display name only if no name is found in the body or signature.

Last fallback:
Use “Unknown Customer”.

Do:

* Prefer the name inside the email body.
* Prefer the signature name over the Gmail sender display name.
* Use sender display name only as fallback.
* Use only realistic human names.

Don’t:

* Do not automatically use the Gmail sender display name.
* Do not use the connected inbox/account name as the customer name.
* Do not use the sender email address as the customer name.
* Do not invent a name.
* Do not assume gender.
* Do not use Mr., Mrs., or Miss unless the email clearly provides that title.

Outlier rule:
If no reliable human name is found, Customer Name should be “Unknown Customer” and Suggested Reply should start with “Hi there,” or “Dear Customer,”.

---

## Column 3: Customer Email

Definition:
The customer’s sender email address.

Extraction rule:
Use the sender email address from Gmail.

Do:

* Use the actual sender email.
* Keep it in valid email format.
* Use the sender email even if the body mentions another account/payment email.

Don’t:

* Do not use the connected Gmail inbox email.
* Do not use another email mentioned in the body as Customer Email unless the workflow is explicitly designed to do that.
* Do not put the customer name here.

Outlier rule:
If the customer says “I paid with another email” or “my account email is...”, keep Customer Email as the sender email, but place the other email in Order / Account Reference if relevant.

---

## Column 4: Email Subject

Definition:
The original subject line of the email.

Extraction rule:
Use the Gmail email subject.

Do:

* Keep the subject close to the original.
* Remove repeated “Re:” or “Fwd:” only if needed for cleanliness.

Don’t:

* Do not rewrite the subject into a new title.
* Do not summarize it too aggressively.
* Do not invent a subject.

Fallback:
If there is no subject, use “No Subject”.

---

## Column 5: Product / Service

Definition:
The product, service, course, order, app, subscription, feature, workshop, or digital material related to the issue.

Examples:

* AI Workshop
* Workshop Recording
* Prompt Templates
* Mobile App
* Online Course
* Subscription
* Delivery Order
* Payment System
* Account Access
* Unknown

Extraction rule:
Infer from the subject and full email body.

Do:

* Be specific when the email clearly mentions a product or service.
* Use “AI Workshop” if the email says workshop.
* Use “Workshop Recording” if the issue is specifically about a replay or recording.
* Use “Prompt Templates” if the issue is about missing templates.
* Use “Mobile App” if the issue is about an app crash or app bug.
* Use “Subscription” if the issue is about canceling or recurring billing.

Don’t:

* Do not use “General Support” if the email clearly mentions a product or service.
* Do not invent a product name.
* Do not put the issue category here.

Fallback:
If the product or service is unclear, use “Unknown”.

---

## Column 6: Issue Category

Definition:
The main type of customer issue.

Allowed categories:

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

Category rules:

Use “Missing / Not Received” when:

* Customer has not received an item, link, recording, material, order, or bonus.

Use “Wrong / Incorrect Item” when:

* Customer received the wrong product, wrong item, incorrect file, or incorrect order.

Use “Damaged / Defective Product” when:

* Product arrived broken, damaged, defective, faulty, or unusable.

Use “Delivery / Shipping Delay” when:

* The issue is about late shipping, delayed delivery, lost package, or tracking.

Use “Refund / Return / Exchange” when:

* Customer asks for refund, return, exchange, cancellation refund, or replacement because of dissatisfaction.

Use “Billing / Payment / Invoice” when:

* Customer was charged twice, overcharged, payment failed, invoice is wrong, or payment is missing.

Use “Login / Account Access” when:

* Customer cannot log in, cannot access account, password reset fails, account is locked, or access is denied.

Use “Subscription / Cancellation” when:

* Customer wants to cancel, stop renewal, or manage subscription.

Use “Technical Bug / App Issue” when:

* App crashes, page errors, bugs, features not working, or system failure.

Use “Digital Access / Download Issue” when:

* Customer cannot access a course, download link, replay link, webinar recording, templates, or digital materials.

Use “Promo Code / Discount Issue” when:

* Promo code, voucher, or discount did not apply.

Use “Product Question” when:

* Customer is asking about product details, availability, compatibility, usage, or features.

Use “Complaint / Negative Feedback” when:

* Customer mainly expresses dissatisfaction but the specific operational category is unclear.

Use “Other Support” when:

* It is a support request but no specific category fits.

Do:

* Choose one main category.
* Choose the most specific category.
* If multiple issues exist, choose the issue that blocks the customer the most.

Don’t:

* Do not classify everything as “General Support”.
* Do not create random new categories.
* Do not classify newsletters or promotions as support issues.

Outlier rule:
If an email contains multiple problems, choose the main blocker as Issue Category and mention secondary context in Issue Summary.

---

## Column 7: Priority

Definition:
How urgent the issue is from a support operation perspective.

Allowed values:

* High
* Normal
* Low

Use High when:

* The customer cannot access a paid product.
* There is a deadline today or tomorrow.
* Money is involved, such as refund, double charge, overcharge, or failed payment.
* The customer cannot log in.
* The customer is blocked from using the service.
* The issue affects a client meeting, business deadline, or paid access.
* The customer uses urgency phrases like “today,” “ASAP,” “immediately,” “before my meeting,” or “urgent.”
* The customer is angry or very frustrated and the issue has real operational impact.

Use Normal when:

* The issue needs support but is not clearly urgent.
* The customer reports a problem without a strong deadline.
* The issue is important but not blocking immediate use.
* The customer asks for help politely with no major risk.

Use Low when:

* The email is a simple clarification.
* The issue is not blocking the customer.
* The request is informational and non-urgent.
* The customer is asking a general product question.

Do:

* Consider urgency, business impact, money impact, access impact, deadline, and emotion.
* Use High only when faster attention is truly needed.

Don’t:

* Do not mark everything High.
* Do not use “Urgent” as Priority. Use “High”.
* Do not mark High only because there is an exclamation mark.
* Do not confuse sentiment with priority.

Outlier rule:
If the customer sounds emotional but the issue is low impact, do not automatically mark it High.

Example:
“I’m disappointed with the color.”

Priority: Low or Normal
Sentiment: Disappointed

---

## Column 8: Sentiment

Definition:
The emotional tone of the customer.

Allowed values:

* Neutral
* Confused
* Frustrated
* Angry
* Disappointed
* Positive

Use Neutral when:

* The customer is straightforward, calm, or factual.

Use Confused when:

* The customer seems unsure, asks for clarification, or does not understand what happened.

Use Frustrated when:

* The customer sounds annoyed, tired of waiting, or bothered, but still polite.

Use Angry when:

* The customer uses harsh language, strong blame, threats, or very strong dissatisfaction.

Use Disappointed when:

* The customer expresses sadness, unmet expectations, or dissatisfaction without strong anger.

Use Positive when:

* The customer is thankful, friendly, appreciative, or polite in a clearly positive way.

Do:

* Separate emotion from urgency.
* Use sentiment only for emotional tone.
* Use priority for operational urgency.

Don’t:

* Do not use “Urgent” as sentiment.
* Do not call the customer angry if they are only politely asking for help.
* Do not ignore polite frustration.

Outlier rule:
If sentiment is mixed, choose the strongest relevant customer emotion but do not exaggerate.

Example:
“Thanks, but I still haven’t received the link and I need it today.”

Sentiment: Frustrated or Neutral
Priority: High because of deadline

---

## Column 9: Order / Account Reference

Definition:
This column should contain the best available verification reference that helps the support team find the customer’s order, account, payment, subscription, course, workshop, delivery, or product record.

This field is not only for Order ID. It can also contain account, payment, invoice, tracking, subscription, workshop, course, or product reference information.

Priority order for extraction:

1. Exact transaction or order references:

* Order ID
* Order number
* Invoice number
* Transaction ID
* Payment ID
* Receipt number
* Tracking number
* Subscription ID
* Account ID
* Booking ID
* Ticket ID

Use clear labels, for example:

* Order ID: ORD-31876
* Invoice: INV-2026-041
* Transaction ID: TXN-88291
* Tracking Number: JNE123456789
* Subscription ID: SUB-2041

2. Account or payment references:
Use these when explicitly mentioned in the body:

* Account email
* Registered email
* Payment email
* Billing email
* Login email

Examples:

* Account email: [daniel@example.com](mailto:daniel@example.com)
* Payment email: same as sender
* Registered email: [sarah@example.com](mailto:sarah@example.com)

3. Digital product, course, or workshop references:
If there is no order ID but the issue is about a digital product, course, workshop, recording, replay link, template, or access material, use the available product/context reference.

Examples:

* Workshop: AI Workshop; Payment email: same as sender
* Course: UX Writing Bootcamp; Account email: same as sender
* Digital product: Prompt Templates; Access email: same as sender
* Webinar: AI Productivity Webinar; Session: last Thursday

4. Subscription or account access references:
For login, subscription, or account access issues, use the account reference when available.

Examples:

* Account email: same as sender
* Subscription: Monthly Plan; Account email: same as sender
* Account access: same sender email

5. Product or delivery references:
For physical product, wrong item, missing item, delivery, refund, return, or exchange issues, prioritize order-related references.

Examples:

* Order ID: ORD-31876
* Tracking Number: JNE123456789
* Product: Wireless Keyboard
* Delivery reference: Not provided

Important:
For delivery, wrong item, damaged item, refund, return, and exchange cases, if no order ID, tracking number, invoice, or payment reference is provided, use:
Not provided

Reason:
The support team usually needs an order/payment/shipping reference to verify the case.

6. Fallback:
Use `Not provided` only when no meaningful tracking reference can be extracted.

Do not use `Not provided` if there is a useful alternative reference such as:

* Workshop name
* Course name
* Account email
* Payment email
* Subscription name
* Product name
* Session/date reference

Do:

* Use clear labels before values.
* Combine multiple useful references with semicolons.
* Prefer exact IDs over inferred context.
* Use “same as sender” only when the email body clearly says the payment/account email is the same as the sender, or when the issue is account/digital access and the sender email is the best available account reference.
* Keep the field concise but useful for support tracking.

Don’t:

* Do not automatically put the sender email here for every email.
* Do not invent order IDs, invoice numbers, or payment references.
* Do not put the issue summary here.
* Do not use vague text like “customer issue”.
* Do not use `Not provided` when a useful workshop/course/account/payment reference exists.

Examples:

Example 1:
Email body:
“I joined the AI workshop last Thursday under the name Daniel Lee. I paid with the same email I’m sending from.”
Order / Account Reference:
Workshop: AI Workshop; Payment email: same as sender

Example 2:
Email body:
“My order ORD-31876 arrived damaged.”
Order / Account Reference:
Order ID: ORD-31876

Example 3:
Email body:
“I can’t log in to my account. My registered email is [maya@example.com](mailto:maya@example.com).”
Order / Account Reference:
Account email: [maya@example.com](mailto:maya@example.com)

Example 4:
Email body:
“I was charged twice. The invoice number is INV-2026-041.”
Order / Account Reference:
Invoice: INV-2026-041

Example 5:
Email body:
“I received the wrong item. Please help.”
Order / Account Reference:
Not provided

Status and next action update:

If `Order / Account Reference` is `Not provided` and the issue requires verification, such as:

* wrong item
* damaged item
* missing order
* delivery issue
* refund
* return
* exchange
* billing/payment issue

Then:

* Status should be `Waiting for Customer`
* Suggested Next Action should ask the support team to request the missing reference, such as order ID, invoice number, payment receipt, tracking number, or product photo.

If `Order / Account Reference` contains a useful reference, such as account email, payment email, workshop, course, invoice, or order ID:

* Status can remain `New` unless escalation is required.

---

## Column 10: Issue Summary

Definition:
A short, clear summary of the customer’s main issue.

Format:
One concise sentence.

Good examples:

* Daniel Lee joined the AI workshop last Thursday but has not received the replay link or bonus prompt templates.
* The customer received the wrong item and wants the correct item to be sent.
* The customer was charged twice and is asking for a billing review.
* The customer cannot log in to their account and needs access restored.

Do:

* Mention the core problem.
* Include important context such as deadline, missing item, or payment issue.
* Keep it specific and neutral.
* Use one sentence when possible.

Don’t:

* Do not copy the full email body.
* Do not make it too long.
* Do not add information that was not in the email.
* Do not write vague summaries like “Customer has an issue.”

Outlier rule:
If there are multiple issues, summarize the main issue first and include the most important secondary context.

---

## Column 11: Suggested Next Action

Definition:
The internal next step that the support team should take.

Good examples:

* Verify the customer’s workshop registration and resend the replay link and bonus templates.
* Check the order details and confirm whether the wrong item was shipped.
* Review the payment history and confirm whether the customer was charged twice.
* Check the account status and help the customer regain access.
* Ask the customer for an order number or payment receipt if no reference is provided.

Do:

* Make the action specific and operational.
* Tell the support team what to check or do next.
* Mention verification when money, access, or orders are involved.
* Ask for missing information if needed.

Don’t:

* Do not write the customer-facing reply here.
* Do not promise refunds, replacements, or access before verification.
* Do not use vague actions like “Handle this issue” or “Follow up.”

Outlier rule:
If the email lacks necessary details, Suggested Next Action should ask the support team to request missing information from the customer.

---

## Column 12: Suggested Reply

Definition:
A polite customer-facing draft response.

Rules:

* Start with the correct customer name if reliable.
* If customer name is unknown, use “Hi there,” or “Dear Customer,”.
* Acknowledge the issue.
* Mention the next step.
* Avoid overpromising.
* Keep it concise.

Greeting rules:

* If name is clear: “Hi Daniel,”
* If name is not clear: “Hi there,”
* If formal tone is preferred and name is unknown: “Dear Customer,”
* Do not use Mr., Mrs., or Miss unless the email clearly provides that title.

Good example:
Hi Daniel, thanks for reaching out. I’m sorry you haven’t received the workshop recording and bonus prompt templates yet. We’ll verify your workshop registration and resend the materials as soon as possible.

If information is missing:
Hi there, thanks for reaching out. I’m sorry about the issue. Could you please share your order number or payment receipt so we can check this for you?

Do:

* Use a warm and professional tone.
* Greet the correct customer name.
* Acknowledge the issue clearly.
* Use safe wording like “we’ll check,” “we’ll verify,” or “we’ll help review this.”
* Ask for missing details when necessary.

Don’t:

* Do not greet the Gmail sender display name if the body contains a different customer name.
* Do not say “Hi Chan Frai” unless the email body says the customer is Chan Frai.
* Do not use Mr./Ms./Miss unless clearly provided.
* Do not promise a refund, replacement, or delivery before verification.
* Do not blame the customer.
* Do not sound too robotic or too casual.

Outlier rule:
If the issue involves payment, access, refunds, or replacement, the reply should say the team will verify or review first.

---

## Column 13: Status

Definition:
The current workflow status of the ticket.

Allowed values:

* New
* In Progress
* Waiting for Customer
* Escalated
* Resolved

Default:
New

Use New when:

* A new ticket is created and no human has handled it yet.

Use Waiting for Customer when:

* The workflow cannot proceed without more information from the customer.
* Important details like order number, account email, payment receipt, or screenshot are missing.

Use Escalated when:

* The issue involves serious payment failure, repeated unresolved issue, legal threat, security/data concern, angry customer with business risk, or high-impact technical failure.

Use In Progress only if:

* The workflow or support team has already started handling the issue.

Use Resolved only if:

* The email clearly says the issue has already been fixed.

Do:

* Use “New” for most newly logged tickets.
* Use “Waiting for Customer” if missing information blocks the next step.
* Use “Escalated” only for serious cases.

Don’t:

* Do not mark new emails as Resolved.
* Do not infer resolution without evidence.
* Do not create random statuses.

---

## Final Classification Rules

Process emails about:

* Refunds
* Returns
* Exchanges
* Wrong items
* Damaged products
* Missing orders
* Late delivery
* Lost package
* Tracking issues
* Login problems
* Account access
* Payment issues
* Invoice problems
* Subscription cancellation
* App bugs
* Download/access links
* Workshop/course materials
* Customer complaints
* Negative feedback
* Urgent support requests

Skip emails that are:

* Newsletters
* Promotions
* Ads
* Social media notifications
* Generic security alerts with no support request
* Calendar invitations
* Automatic receipts with no complaint
* Delivery confirmations with no complaint
* Personal messages unrelated to support
* Spam or irrelevant emails

Ambiguous Email Rule:

If the email is unclear but might be a real support request, process it with safe fallback values:

* Issue Category: Other Support
* Priority: Low or Normal
* Sentiment: Neutral or Confused
* Order / Account Reference: Not provided
* Status: Waiting for Customer if more information is needed
* Suggested Next Action: Ask the customer for clarification or missing details

Do not skip a possible customer support request only because the wording is unusual.

Do not process obvious marketing, notification, or spam emails.

============================================================
End of ticket-schema.md content
===============================
