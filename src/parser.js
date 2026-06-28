function parseEmailToTicket(emailInput) {
  const rawText = getRawText(emailInput);
  const subject = extractSubject(rawText);
  const body = extractBody(rawText);

  if (shouldSkipEmail(subject, body)) {
    return null;
  }

  const customerName = extractCustomerName(body, emailInput);
  const customerEmail = extractCustomerEmail(emailInput);
  const productService = detectProductService(subject, body);
  const issueCategory = detectIssueCategory(subject, body);
  const priority = detectPriority(subject, body, issueCategory);
  const sentiment = detectSentiment(body);
  const orderReference = extractOrderReference(body, productService, issueCategory, emailInput);
  const issueSummary = buildIssueSummary(customerName, productService, issueCategory, body);
  const nextAction = buildSuggestedNextAction(issueCategory, orderReference, productService);
  const suggestedReply = buildSuggestedReply(customerName, issueCategory, productService, orderReference);
  const status = orderReference === "Not provided" && needsReference(issueCategory)
    ? "Waiting for Customer"
    : "New";

  return {
    "Received Date": extractReceivedDate(emailInput),
    "Customer Name": customerName,
    "Customer Email": customerEmail,
    "Email Subject": subject,
    "Product / Service": productService,
    "Issue Category": issueCategory,
    "Priority": priority,
    "Sentiment": sentiment,
    "Order / Account Reference": orderReference,
    "Issue Summary": issueSummary,
    "Suggested Next Action": nextAction,
    "Suggested Reply": suggestedReply,
    "Status": status
  };
}

function getRawText(emailInput) {
  if (typeof emailInput === "string") {
    return emailInput;
  }

  if (emailInput && typeof emailInput.rawText === "string") {
    return emailInput.rawText;
  }

  if (emailInput && typeof emailInput.body === "string") {
    return `Subject: ${emailInput.subject || "No Subject"}\n\n${emailInput.body}`;
  }

  return "";
}

function extractSubject(rawText) {
  const subjectMatch = rawText.match(/^Subject:\s*(.+)$/im);
  if (!subjectMatch) {
    return "No Subject";
  }

  return subjectMatch[1].replace(/^(Re:\s*)+/i, "").replace(/^(Fwd:\s*)+/i, "").trim() || "No Subject";
}

function extractBody(rawText) {
  return rawText.replace(/^Subject:\s*.+$/im, "").trim();
}

function shouldSkipEmail(subject, body) {
  const text = `${subject} ${body}`.toLowerCase();
  const marketingSignals = [
    "newsletter",
    "daily digest",
    "this week only",
    "limited-time discount",
    "browse the latest resources",
    "marketing team",
    "upcoming webinar announcements",
    "new productivity templates"
  ];
  const supportSignals = [
    "wrong item",
    "charged twice",
    "overcharged",
    "refund",
    "cannot log in",
    "can't log in",
    "password reset",
    "haven't received",
    "havent received",
    "not received",
    "resend",
    "order id",
    "invoice number",
    "payment reference"
  ];

  const hasMarketingSignal = marketingSignals.some((signal) => text.includes(signal));
  const hasSupportSignal = supportSignals.some((signal) => text.includes(signal));
  const hasDirectSupportLanguage = /(^|\s)(i|we)\s+(ordered|received|requested|purchased|tried|can't|cannot|haven't|have not|was|were|need)\b|could you please|please help|hi support|hello support|customer support/i.test(text);

  return hasMarketingSignal && !hasSupportSignal && !hasDirectSupportLanguage;
}

function extractCustomerName(body, emailInput) {
  const explicitPatterns = [
    /\bunder the name\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/,
    /\b[Mm]y name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/,
    /\bI am\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/,
    /\b[Tt]his is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/,
    /\b[Nn]ame:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/,
    /\b[Cc]ustomer name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/,
    /\b[Aa]ccount name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/,
    /\b[Rr]egistered under\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/
  ];

  for (const pattern of explicitPatterns) {
    const match = body.match(pattern);
    const possibleName = match ? cleanName(match[1]) : "";
    if (possibleName && isLikelyHumanName(possibleName)) {
      return possibleName;
    }
  }

  const signatureMatch = body.match(/(?:Thanks|Thank you|Best regards|Best|Regards|Sincerely|Cheers),?\s*(?:[\r\n]+|,\s+)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*$/i);
  const signatureName = signatureMatch ? cleanName(signatureMatch[1]) : "";
  if (signatureName && isLikelyHumanName(signatureName)) {
    return signatureName;
  }

  if (emailInput && typeof emailInput.senderName === "string" && isLikelyHumanName(emailInput.senderName)) {
    return cleanName(emailInput.senderName);
  }

  return "Unknown Customer";
}

function cleanName(name) {
  return name.replace(/[.,]+$/g, "").trim();
}

function isLikelyHumanName(name) {
  const cleanedName = cleanName(name).replace(/\s+/g, " ");
  const lowerName = cleanedName.toLowerCase();
  const words = lowerName.split(" ").filter(Boolean);
  const rejectedNames = new Set([
    "quite urgent",
    "urgent",
    "asap",
    "immediately",
    "today",
    "help",
    "support",
    "issue",
    "problem",
    "complaint",
    "refund",
    "payment",
    "invoice",
    "missing",
    "not received",
    "delayed",
    "wrong item",
    "broken",
    "damaged",
    "frustrated",
    "disappointed",
    "angry",
    "confused",
    "customer",
    "team",
    "hi team",
    "hello",
    "regards",
    "thanks",
    "thank you"
  ]);
  const rejectedWords = new Set([
    "urgent",
    "asap",
    "immediately",
    "today",
    "help",
    "support",
    "issue",
    "problem",
    "complaint",
    "refund",
    "payment",
    "invoice",
    "missing",
    "received",
    "delayed",
    "wrong",
    "item",
    "broken",
    "damaged",
    "frustrated",
    "disappointed",
    "angry",
    "confused",
    "customer",
    "team",
    "hello",
    "regards",
    "thanks"
  ]);

  if (!cleanedName || rejectedNames.has(lowerName)) {
    return false;
  }

  if (words.length < 1 || words.length > 3) {
    return false;
  }

  if (words.some((word) => rejectedWords.has(word))) {
    return false;
  }

  if (/@|\d|#|:|\/|\\/.test(cleanedName)) {
    return false;
  }

  return /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}$/.test(cleanedName);
}

function extractCustomerEmail(emailInput) {
  if (emailInput && typeof emailInput.senderEmail === "string" && emailInput.senderEmail.includes("@")) {
    return emailInput.senderEmail;
  }

  return "Unknown";
}

function extractReceivedDate(emailInput) {
  if (emailInput && typeof emailInput.receivedDate === "string" && emailInput.receivedDate.trim()) {
    return emailInput.receivedDate.trim();
  }

  return "Unknown";
}

function detectProductService(subject, body) {
  const text = `${subject} ${body}`.toLowerCase();

  if (text.includes("workshop recording") || text.includes("replay link")) {
    return "Workshop Recording";
  }
  if (text.includes("ai workshop") || text.includes("workshop")) {
    return "AI Workshop";
  }
  if (text.includes("prompt templates")) {
    return "Prompt Templates";
  }
  if (text.includes("promo code") || text.includes("discount")) {
    return "Payment System";
  }
  if (text.includes("app") || text.includes("dashboard")) {
    return "Mobile App";
  }
  if (text.includes("subscription")) {
    return "Subscription";
  }
  if (text.includes("log in") || text.includes("logging in") || text.includes("account") || text.includes("suspended")) {
    return "Account Access";
  }
  if (text.includes("order")) {
    return "Delivery Order";
  }
  if (text.includes("invoice") || text.includes("payment") || text.includes("charged")) {
    return "Payment System";
  }

  return "Unknown";
}

function detectIssueCategory(subject, body) {
  const text = `${subject} ${body}`.toLowerCase();

  if (text.includes("wrong item") || text.includes("wrong product") || text.includes("incorrect item")) {
    return "Wrong / Incorrect Item";
  }
  if (text.includes("damaged") || text.includes("broken") || text.includes("defective") || text.includes("crack")) {
    return "Damaged / Defective Product";
  }
  if (text.includes("promo code") || text.includes("discount")) {
    return "Promo Code / Discount Issue";
  }
  if (text.includes("cancel my subscription") || text.includes("cancel subscription") || text.includes("subscription cancellation")) {
    return "Subscription / Cancellation";
  }
  if (text.includes("charged twice") || text.includes("overcharged") || text.includes("invoice") || text.includes("payment reference")) {
    return "Billing / Payment / Invoice";
  }
  if (text.includes("cannot log in") || text.includes("can't log in") || text.includes("logging in") || text.includes("password reset") || text.includes("regain access") || text.includes("restore access") || text.includes("account has been suspended") || text.includes("access denied")) {
    return "Login / Account Access";
  }
  if ((text.includes("app") && text.includes("crashing")) || text.includes("app error") || text.includes("bug") || text.includes("not working") || text.includes("page freezes")) {
    return "Technical Bug / App Issue";
  }
  if (text.includes("refund") || text.includes("return") || text.includes("exchange") || text.includes("replacement")) {
    return "Refund / Return / Exchange";
  }
  if (text.includes("replay link") || text.includes("download") || text.includes("recording") || text.includes("templates")) {
    return "Digital Access / Download Issue";
  }
  if (text.includes("haven't received") || text.includes("havent received") || text.includes("not received")) {
    return "Missing / Not Received";
  }
  if (text.includes("has not arrived") || text.includes("late delivery") || text.includes("tracking") || text.includes("no package arrived")) {
    return "Delivery / Shipping Delay";
  }
  return "Other Support";
}

function detectPriority(subject, body, issueCategory) {
  const text = `${subject} ${body}`.toLowerCase();
  const highSignals = [
    "tomorrow",
    "asap",
    "immediately",
    "urgent",
    "client meeting",
    "charged twice",
    "overcharged",
    "cannot log in",
    "can't log in",
    "regain access"
  ];

  if (highSignals.some((signal) => text.includes(signal))) {
    return "High";
  }

  if (/resend it today|need (it|access|this) today|by today|before .* tomorrow|client meeting/.test(text)) {
    return "High";
  }

  if (
    issueCategory === "Billing / Payment / Invoice" ||
    issueCategory === "Login / Account Access" ||
    issueCategory === "Refund / Return / Exchange" ||
    issueCategory === "Subscription / Cancellation"
  ) {
    return "High";
  }

  if (issueCategory === "Product Question") {
    return "Low";
  }

  return "Normal";
}

function detectSentiment(body) {
  const text = body.toLowerCase();

  if (text.includes("angry") || text.includes("unacceptable")) {
    return "Angry";
  }
  if (text.includes("very frustrating") || text.includes("frustrating") || text.includes("as soon as possible")) {
    return "Frustrated";
  }
  if (text.includes("disappointed")) {
    return "Disappointed";
  }
  if (text.includes("confused") || text.includes("not sure") || text.includes("don't understand")) {
    return "Confused";
  }
  if (text.includes("thank you") || text.includes("thanks")) {
    return "Neutral";
  }

  return "Neutral";
}

function extractOrderReference(body, productService, issueCategory, emailInput) {
  const references = [];
  const senderEmail = extractCustomerEmail(emailInput);
  const idValuePattern = "([A-Z]{2,}[-A-Z0-9]*\\d[A-Z0-9-]*|\\d{4,})";

  addReferenceFromMatch(references, "Order ID", body.match(new RegExp(`\\b(?:order id|order number|order)\\s*(?:is|:)?\\s*#?${idValuePattern}`, "i")));
  addReferenceFromMatch(references, "Invoice", body.match(new RegExp(`\\b(?:invoice number|invoice)\\s*(?:is|:)?\\s*#?${idValuePattern}`, "i")));
  addReferenceFromMatch(references, "Transaction ID", body.match(new RegExp(`\\b(?:transaction id|transaction)\\s*(?:is|:)?\\s*#?${idValuePattern}`, "i")));
  addReferenceFromMatch(references, "Payment ID", body.match(new RegExp(`\\b(?:payment id|payment reference)\\s*(?:on my card statement)?\\s*(?:is|:)?\\s*#?${idValuePattern}`, "i")));
  addReferenceFromMatch(references, "Receipt Number", body.match(new RegExp(`\\b(?:receipt number|receipt)\\s*(?:is|:)?\\s*#?${idValuePattern}`, "i")));
  addReferenceFromMatch(references, "Tracking Number", body.match(new RegExp(`\\b(?:tracking number|tracking)\\s*(?:is|:)?\\s*#?${idValuePattern}`, "i")));
  addReferenceFromMatch(references, "Subscription ID", body.match(new RegExp(`\\b(?:subscription id)\\s*(?:is|:)?\\s*#?${idValuePattern}`, "i")));
  addReferenceFromMatch(references, "Account ID", body.match(new RegExp(`\\b(?:account id)\\s*(?:is|:)?\\s*#?${idValuePattern}`, "i")));
  addReferenceFromMatch(references, "Booking ID", body.match(new RegExp(`\\b(?:booking id|booking number)\\s*(?:is|:)?\\s*#?${idValuePattern}`, "i")));
  addReferenceFromMatch(references, "Ticket ID", body.match(new RegExp(`\\b(?:ticket id|ticket number)\\s*(?:is|:)?\\s*#?${idValuePattern}`, "i")));

  addEmailReference(references, "Account email", body, /\baccount email\s*(?:is|:)?\s*([^\s,;<>]+@[^\s,;<>]+)/i);
  addEmailReference(references, "Registered email", body, /\bregistered email\s*(?:is|:)?\s*([^\s,;<>]+@[^\s,;<>]+)/i);
  addEmailReference(references, "Payment email", body, /\bpayment email\s*(?:is|:)?\s*([^\s,;<>]+@[^\s,;<>]+)/i);
  addEmailReference(references, "Billing email", body, /\bbilling email\s*(?:is|:)?\s*([^\s,;<>]+@[^\s,;<>]+)/i);
  addEmailReference(references, "Login email", body, /\blogin email\s*(?:is|:)?\s*([^\s,;<>]+@[^\s,;<>]+)/i);

  if (mentionsSameSenderPayment(body)) {
    addReference(references, "Payment email", "same as sender");
  }

  addDigitalContextReferences(references, body, productService, issueCategory, senderEmail);
  addAccountContextReferences(references, body, productService, issueCategory, senderEmail);

  return references.length > 0 ? references.join("; ") : "Not provided";
}

function addReferenceFromMatch(references, label, match) {
  if (match && match[1]) {
    addReference(references, label, match[1].replace(/[.,]+$/g, ""));
  }
}

function addEmailReference(references, label, body, pattern) {
  const match = body.match(pattern);
  if (match && match[1]) {
    addReference(references, label, match[1].replace(/[.,]+$/g, ""));
  }
}

function addReference(references, label, value) {
  const reference = `${label}: ${value}`;
  if (!references.includes(reference)) {
    references.push(reference);
  }
}

function mentionsSameSenderPayment(body) {
  return /paid with (the )?same email|payment (used|is with) (the )?same email|same email i.?m sending from/i.test(body);
}

function addDigitalContextReferences(references, body, productService, issueCategory, senderEmail) {
  const isDigitalContext = issueCategory === "Digital Access / Download Issue" ||
    ["AI Workshop", "Workshop Recording", "Prompt Templates"].includes(productService) ||
    /\b(workshop|course|webinar|recording|replay link|download link|access link|templates?)\b/i.test(body);

  if (!isDigitalContext) {
    return;
  }

  if (productService === "AI Workshop" || productService === "Workshop Recording") {
    addReference(references, "Workshop", "AI Workshop");
  } else if (productService === "Prompt Templates") {
    addReference(references, "Digital product", "Prompt Templates");
  }

  const courseMatch = body.match(/\b(?:course|program)\s*(?:called|named|:)?\s*([A-Z][A-Za-z0-9 &-]{2,40})/);
  if (courseMatch && !/materials|access|recording|link/i.test(courseMatch[1])) {
    addReference(references, "Course", courseMatch[1].trim());
  }

  const sessionMatch = body.match(/\b(last\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|yesterday|today)\b/i);
  if (sessionMatch) {
    addReference(references, "Session", sessionMatch[1].toLowerCase());
  }

  if (senderEmail !== "Unknown" && !references.some((reference) => /(?:payment|account|registered|billing|login|access) email:/i.test(reference))) {
    addReference(references, mentionsSameSenderPayment(body) ? "Payment email" : "Access email", "same as sender");
  }
}

function addAccountContextReferences(references, body, productService, issueCategory, senderEmail) {
  const isAccountContext = issueCategory === "Login / Account Access" ||
    issueCategory === "Subscription / Cancellation" ||
    productService === "Account Access" ||
    productService === "Subscription";

  if (!isAccountContext || senderEmail === "Unknown") {
    return;
  }

  if (productService === "Subscription" || issueCategory === "Subscription / Cancellation") {
    const planMatch = body.match(/\b(monthly|annual|yearly|premium|basic|pro)\s+(?:plan|subscription)\b/i);
    addReference(references, "Subscription", planMatch ? `${capitalize(planMatch[1])} Plan` : "Subscription");
  }

  if (!references.some((reference) => /(?:account|registered|billing|login) email:/i.test(reference))) {
    addReference(references, "Account email", "same as sender");
  }
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function buildIssueSummary(customerName, productService, issueCategory, body) {
  const namePrefix = customerName === "Unknown Customer" ? "The customer" : customerName;

  if (issueCategory === "Digital Access / Download Issue") {
    return `${namePrefix} has not received access to the ${productService.toLowerCase()} materials and needs them resent.`;
  }
  if (issueCategory === "Wrong / Incorrect Item") {
    return `${namePrefix} received the wrong item and wants the correct item to be sent.`;
  }
  if (issueCategory === "Damaged / Defective Product") {
    return `${namePrefix} received a damaged product and is asking for support with a replacement or refund.`;
  }
  if (issueCategory === "Delivery / Shipping Delay") {
    return `${namePrefix} has not received the order even though tracking indicates delivery.`;
  }
  if (issueCategory === "Refund / Return / Exchange") {
    return `${namePrefix} requested a refund and is asking for the refund status to be checked.`;
  }
  if (issueCategory === "Subscription / Cancellation") {
    return `${namePrefix} cannot cancel the subscription through account settings and needs help before renewal.`;
  }
  if (issueCategory === "Promo Code / Discount Issue") {
    return `${namePrefix} tried to use a promo code, but the discount was not applied at checkout.`;
  }
  if (issueCategory === "Technical Bug / App Issue") {
    return `${namePrefix} reports that the app or page is not working and needs technical support.`;
  }
  if (issueCategory === "Login / Account Access") {
    return `${namePrefix} cannot log in after trying password reset and needs account access restored.`;
  }
  if (issueCategory === "Billing / Payment / Invoice") {
    return `${namePrefix} was charged twice and is asking for a billing review and refund of the duplicate charge.`;
  }

  const firstSentence = body.split(/[.!?]\s/)[0].replace(/\s+/g, " ").trim();
  return firstSentence || "The customer has a support request that needs review.";
}

function buildSuggestedNextAction(issueCategory, orderReference, productService) {
  if (orderReference === "Not provided" && needsReference(issueCategory)) {
    if (issueCategory === "Wrong / Incorrect Item") {
      return "Ask the customer for an order ID and product photo so support can verify the wrong item.";
    }
    if (issueCategory === "Damaged / Defective Product") {
      return "Ask the customer for an order ID, payment receipt, and product photo so support can verify the damaged item.";
    }
    if (issueCategory === "Delivery / Shipping Delay" || issueCategory === "Missing / Not Received") {
      return "Ask the customer for an order ID, tracking number, invoice number, or payment receipt so support can verify the missing or delayed order.";
    }
    if (issueCategory === "Refund / Return / Exchange") {
      return "Ask the customer for an order ID, invoice number, transaction ID, or payment receipt so support can verify the refund, return, or exchange.";
    }
    if (issueCategory === "Billing / Payment / Invoice") {
      return "Ask the customer for an invoice number, transaction ID, payment receipt, or billing email so support can verify the charge.";
    }
  }

  if (issueCategory === "Digital Access / Download Issue") {
    return "Verify the customer’s workshop registration and resend the replay link and bonus templates.";
  }
  if (issueCategory === "Wrong / Incorrect Item") {
    return "Check the order details and confirm whether the wrong item was shipped.";
  }
  if (issueCategory === "Damaged / Defective Product") {
    return "Check the order details and review whether a replacement or refund is appropriate after verification.";
  }
  if (issueCategory === "Delivery / Shipping Delay") {
    return "Check the order and tracking details, then confirm the delivery status with the customer.";
  }
  if (issueCategory === "Refund / Return / Exchange") {
    return "Review the refund request and payment history before confirming the refund status.";
  }
  if (issueCategory === "Subscription / Cancellation") {
    return "Check the subscription status and help the customer cancel before the next renewal if eligible.";
  }
  if (issueCategory === "Promo Code / Discount Issue") {
    return "Verify the promo code terms and checkout details, then confirm why the discount was not applied.";
  }
  if (issueCategory === "Technical Bug / App Issue") {
    return "Review the reported app issue and gather device or account details if needed.";
  }
  if (issueCategory === "Login / Account Access") {
    return "Check the account status and help the customer regain access.";
  }
  if (issueCategory === "Billing / Payment / Invoice") {
    return "Review the payment history and confirm whether the customer was charged twice.";
  }
  if (orderReference === "Not provided" && productService === "Unknown") {
    return "Ask the customer for clarification and any relevant order, account, or payment details.";
  }

  return "Review the customer’s request and follow up with the next support step.";
}

function buildSuggestedReply(customerName, issueCategory, productService, orderReference) {
  const greeting = customerName === "Unknown Customer" ? "Hi there," : `Hi ${customerName.split(" ")[0]},`;

  if (issueCategory === "Digital Access / Download Issue") {
    return `${greeting} thanks for reaching out. I’m sorry you have not received the workshop recording and bonus materials yet. We’ll verify your workshop registration and resend the materials as soon as possible.`;
  }
  if (issueCategory === "Wrong / Incorrect Item") {
    return `${greeting} thanks for reaching out. I’m sorry the wrong item arrived. We’ll check your order details and help review the next step for getting the correct item to you.`;
  }
  if (issueCategory === "Damaged / Defective Product") {
    return `${greeting} thanks for reaching out. I’m sorry the product arrived damaged. We’ll review the order details and help check the next step for a replacement or refund.`;
  }
  if (issueCategory === "Delivery / Shipping Delay") {
    return `${greeting} thanks for reaching out. I’m sorry your order has not arrived. We’ll check the order and tracking details before confirming the next step.`;
  }
  if (issueCategory === "Refund / Return / Exchange") {
    return `${greeting} thanks for reaching out. I’m sorry the refund has not arrived yet. We’ll review the refund request and payment history before confirming the next step.`;
  }
  if (issueCategory === "Subscription / Cancellation") {
    return `${greeting} thanks for reaching out. I’m sorry you are having trouble canceling your subscription. We’ll check your subscription status and help review the next step.`;
  }
  if (issueCategory === "Promo Code / Discount Issue") {
    return `${greeting} thanks for reaching out. I’m sorry the promo code was not applied at checkout. We’ll verify the promotion details and help review what happened.`;
  }
  if (issueCategory === "Technical Bug / App Issue") {
    return `${greeting} thanks for reaching out. I’m sorry the app is not working properly. We’ll review the issue and help check the next step.`;
  }
  if (issueCategory === "Login / Account Access") {
    return `${greeting} thanks for reaching out. I’m sorry you are having trouble logging in. We’ll check your account status and help you regain access.`;
  }
  if (issueCategory === "Billing / Payment / Invoice") {
    return `${greeting} thanks for reaching out. I’m sorry about the duplicate charge. We’ll review the invoice and payment reference before confirming the next step.`;
  }
  if (orderReference === "Not provided") {
    return `${greeting} thanks for reaching out. Could you please share any relevant order, account, or payment details so we can check this for you?`;
  }

  return `${greeting} thanks for reaching out. We’ll review this and follow up with the next step.`;
}

function needsReference(issueCategory) {
  return [
    "Wrong / Incorrect Item",
    "Billing / Payment / Invoice",
    "Refund / Return / Exchange",
    "Damaged / Defective Product",
    "Missing / Not Received",
    "Delivery / Shipping Delay",
    "Subscription / Cancellation"
  ].includes(issueCategory);
}

module.exports = {
  parseEmailToTicket
};
