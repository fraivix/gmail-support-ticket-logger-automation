const SUPPORT_SIGNALS = [
  "refund",
  "return",
  "exchange",
  "wrong item",
  "incorrect item",
  "damaged",
  "broken",
  "defective",
  "missing",
  "missing item",
  "incomplete order",
  "not received",
  "haven't received",
  "has not arrived",
  "delayed",
  "delay",
  "late delivery",
  "package lost",
  "tracking issue",
  "shipping issue",
  "delivery issue",
  "cannot access",
  "can't access",
  "unable to access",
  "unable to login",
  "can't login",
  "login issue",
  "password reset",
  "account locked",
  "access denied",
  "verification issue",
  "charged twice",
  "double charged",
  "overcharged",
  "payment failed",
  "payment issue",
  "billing issue",
  "invoice issue",
  "subscription cancellation",
  "cancel my subscription",
  "app error",
  "bug",
  "not working",
  "failed",
  "malfunction",
  "replay link",
  "recording",
  "workshop recording",
  "webinar recording",
  "bonus template",
  "prompt templates",
  "download link",
  "access link",
  "course access",
  "materials",
  "resend",
  "urgent",
  "asap",
  "immediately",
  "today",
  "before my meeting",
  "help",
  "support",
  "complaint",
  "disappointed",
  "frustrated",
  "upset"
];

const SKIP_SIGNALS = [
  "newsletter",
  "daily digest",
  "digest",
  "promotion",
  "discount announcement",
  "marketing update",
  "sale announcement",
  "ads",
  "social media notification",
  "security alert",
  "login alert",
  "calendar invitation",
  "automatic receipt",
  "delivery confirmation",
  "spam"
];

async function fetchRecentGmailMessages(gmailClient, options = {}) {
  assertGmailClient(gmailClient);

  const response = await gmailClient.fetchEmails({
    user_id: "me",
    query: options.query || "newer_than:7d",
    max_results: options.maxResults || 10,
    include_payload: false,
    include_spam_trash: false,
    ids_only: false,
    verbose: false
  });

  return extractMessagesFromResponse(response);
}

async function readFullGmailMessage(gmailClient, message) {
  assertGmailClient(gmailClient);

  const messageId = message.messageId || message.id;
  if (!messageId) {
    throw new Error("Cannot read Gmail message because no message ID was provided.");
  }

  const response = await gmailClient.fetchMessageByMessageId({
    user_id: "me",
    message_id: messageId,
    format: "full"
  });

  const fullMessage = response.data || response;
  return {
    ...message,
    ...fullMessage,
    fullBody: extractBodyFromPayload(fullMessage.payload)
  };
}

function isSupportComplaintMessage(message) {
  const normalized = normalizeGmailMessageToEmailInput(message);
  const text = [
    normalized.subject,
    normalized.senderName,
    normalized.senderEmail,
    message.snippet || "",
    normalized.body
  ].join(" ").toLowerCase();

  const hasSupportSignal = SUPPORT_SIGNALS.some((signal) => text.includes(signal));
  const hasSkipSignal = SKIP_SIGNALS.some((signal) => text.includes(signal));
  const isObviousBulkEmail = /noreply|no-reply|daily digest|newsletter|unsubscribe|become a member/.test(text);
  const hasDirectSupportLanguage = /(^|\s)(i|we)\s+(need|ordered|received|requested|purchased|tried|can't|cannot|haven't|have not|was|were)\b|could you please|please help|hi support|hello support|customer support/i.test(text);

  if (hasSkipSignal && isObviousBulkEmail && !hasDirectSupportLanguage) {
    return {
      isSupportRequest: false,
      reason: findFirstSignal(text, SKIP_SIGNALS) || "Obvious newsletter or bulk email"
    };
  }

  if (hasSupportSignal) {
    return {
      isSupportRequest: true,
      reason: findFirstSignal(text, SUPPORT_SIGNALS) || "Matches support request rules"
    };
  }

  if (hasSkipSignal) {
    return {
      isSupportRequest: false,
      reason: findFirstSignal(text, SKIP_SIGNALS) || "Matches skip rules"
    };
  }

  return {
    isSupportRequest: false,
    reason: "No clear support request signal found"
  };
}

function normalizeGmailMessageToEmailInput(message) {
  const headers = extractHeaders(message.payload);
  const from = message.from || message.sender || headers.from || "";
  const parsedSender = parseSender(from);

  return {
    receivedDate: formatReceivedDate(message.internalDate || message.receivedDate || message.messageTimestamp || headers.date),
    senderName: message.senderName || parsedSender.name,
    senderEmail: message.senderEmail || parsedSender.email,
    subject: message.subject || headers.subject || "No Subject",
    body: message.fullBody || message.body || message.messageText || message.textPlain || message.snippet || ""
  };
}

function extractMessagesFromResponse(response) {
  const data = response && response.data ? response.data : response;
  return data && Array.isArray(data.messages) ? data.messages : [];
}

function extractHeaders(payload) {
  const headers = {};
  const headerList = payload && Array.isArray(payload.headers) ? payload.headers : [];

  for (const header of headerList) {
    if (header.name && header.value) {
      headers[header.name.toLowerCase()] = header.value;
    }
  }

  return headers;
}

function extractBodyFromPayload(payload) {
  if (!payload) {
    return "";
  }

  const plainText = collectMimeBodies(payload, "text/plain");
  if (plainText.length > 0) {
    return plainText.join("\n\n").trim();
  }

  const htmlText = collectMimeBodies(payload, "text/html");
  return htmlText.map(stripHtml).join("\n\n").trim();
}

function collectMimeBodies(part, mimeType) {
  const bodies = [];

  if (part.mimeType === mimeType && part.body && part.body.data) {
    bodies.push(decodeBase64Url(part.body.data));
  }

  if (Array.isArray(part.parts)) {
    for (const childPart of part.parts) {
      bodies.push(...collectMimeBodies(childPart, mimeType));
    }
  }

  return bodies;
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function stripHtml(value) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function parseSender(fromHeader) {
  const match = fromHeader.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].replace(/^"|"$/g, "").trim(),
      email: match[2].trim()
    };
  }

  return {
    name: "",
    email: fromHeader.includes("@") ? fromHeader.trim() : ""
  };
}

function formatReceivedDate(value) {
  if (!value) {
    return "Unknown";
  }

  const valueAsNumber = Number(value);
  if (Number.isFinite(valueAsNumber)) {
    return new Date(valueAsNumber).toISOString();
  }

  return String(value);
}

function findFirstSignal(text, signals) {
  return signals.find((signal) => text.includes(signal));
}

function assertGmailClient(gmailClient) {
  if (
    !gmailClient ||
    typeof gmailClient.fetchEmails !== "function" ||
    typeof gmailClient.fetchMessageByMessageId !== "function"
  ) {
    throw new Error("A Composio MCP Gmail client adapter is required for Gmail reading.");
  }
}

module.exports = {
  fetchRecentGmailMessages,
  readFullGmailMessage,
  isSupportComplaintMessage,
  normalizeGmailMessageToEmailInput
};
