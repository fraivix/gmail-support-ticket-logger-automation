const {
  fetchRecentGmailMessages,
  readFullGmailMessage,
  isSupportComplaintMessage,
  normalizeGmailMessageToEmailInput
} = require("./gmail");
const { parseEmailToTicket } = require("./parser");
const { SHEET_COLUMNS, ticketToSheetRow } = require("./sheets");

const SPREADSHEET_ID = "14M07kvgGzhKCpv05K5j833OpseakexrxT-w63mrudQc";
const SHEET_NAME = "Tickets";

async function processSupportRequestsWorkflow({ gmailClient, sheetsClient }) {
  const summary = {
    expectedConnectedGmailInbox: "serenilac@gmail.com",
    totalGmailMessagesFetched: 0,
    totalMessagesReadWithFullBody: 0,
    totalSupportRequestsIdentified: 0,
    totalNonSupportEmailsSkipped: 0,
    totalTicketsParsed: 0,
    totalSheetRowsGenerated: 0,
    allRowsHadExactly13Values: true,
    totalRowsInserted: 0,
    totalRowsUpdated: 0,
    totalDuplicatesSkipped: 0,
    customerNameFromBodyOrSignatureWhenAvailable: true,
    customerEmailFromSenderAddress: true,
    errors: []
  };

  await ensureSheetHeader(sheetsClient);
  const existingRows = await readExistingRows(sheetsClient);
  const existingKeys = new Set(existingRows.map(buildDuplicateKey));

  const recentMessages = await fetchRecentGmailMessages(gmailClient, {
    query: "newer_than:7d",
    maxResults: 10
  });

  summary.totalGmailMessagesFetched = recentMessages.length;

  for (const message of recentMessages) {
    try {
      const fullMessage = await readFullGmailMessage(gmailClient, message);
      summary.totalMessagesReadWithFullBody += 1;

      const classification = isSupportComplaintMessage(fullMessage);
      if (!classification.isSupportRequest) {
        summary.totalNonSupportEmailsSkipped += 1;
        continue;
      }

      summary.totalSupportRequestsIdentified += 1;

      const emailInput = normalizeGmailMessageToEmailInput(fullMessage);
      const ticket = parseEmailToTicket(emailInput);
      if (!ticket) {
        summary.totalNonSupportEmailsSkipped += 1;
        continue;
      }

      summary.totalTicketsParsed += 1;

      const row = ticketToSheetRow(ticket);
      summary.totalSheetRowsGenerated += 1;

      if (row.length !== SHEET_COLUMNS.length) {
        summary.allRowsHadExactly13Values = false;
        summary.errors.push(`Skipped ${ticket["Email Subject"]}: row had ${row.length} values.`);
        continue;
      }

      const key = buildDuplicateKey(row);
      if (existingKeys.has(key)) {
        summary.totalDuplicatesSkipped += 1;
        continue;
      }

      await appendTicketRow(sheetsClient, row);
      existingKeys.add(key);
      summary.totalRowsInserted += 1;
    } catch (error) {
      summary.errors.push(error.message);
    }
  }

  return summary;
}

async function runGmailReadTest(gmailClient) {
  const recentMessages = await fetchRecentGmailMessages(gmailClient, {
    query: "newer_than:7d",
    maxResults: 10
  });

  for (const message of recentMessages) {
    const fullMessage = await readFullGmailMessage(gmailClient, message);
    const emailInput = normalizeGmailMessageToEmailInput(fullMessage);
    const classification = isSupportComplaintMessage(fullMessage);

    console.log(`Subject: ${emailInput.subject}`);
    console.log(`Sender Email: ${emailInput.senderEmail || "Unknown"}`);
    console.log(`Sender Display Name: ${emailInput.senderName || "Unknown"}`);
    console.log(`Received Date: ${emailInput.receivedDate}`);
    console.log(`Support Request: ${classification.isSupportRequest ? "YES" : "NO"}`);
    console.log(`Reason: ${classification.reason}`);
    console.log("Body Preview:");
    console.log(emailInput.body.slice(0, 600) || "(No body text found)");
    console.log("");
  }
}

async function ensureSheetHeader(sheetsClient) {
  assertSheetsClient(sheetsClient);
  const headerRows = await sheetsClient.getSheetValues({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:M1`
  });

  const currentHeader = Array.isArray(headerRows) && Array.isArray(headerRows[0]) ? headerRows[0] : [];
  if (JSON.stringify(currentHeader) === JSON.stringify(SHEET_COLUMNS)) {
    return;
  }

  await sheetsClient.updateSheetValues({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:M1`,
    values: [SHEET_COLUMNS]
  });
}

async function readExistingRows(sheetsClient) {
  assertSheetsClient(sheetsClient);
  const rows = await sheetsClient.getSheetValues({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:M500`
  });

  return Array.isArray(rows) ? rows.map((row) => padRow(row)) : [];
}

async function appendTicketRow(sheetsClient, row) {
  assertSheetsClient(sheetsClient);
  await sheetsClient.appendSheetValues({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:M`,
    values: [row]
  });
}

function buildDuplicateKey(row) {
  const padded = padRow(row);
  return [padded[0], padded[2], padded[3]].join("||").toLowerCase();
}

function padRow(row) {
  return [...row, ...Array(SHEET_COLUMNS.length).fill("")].slice(0, SHEET_COLUMNS.length);
}

function assertSheetsClient(sheetsClient) {
  if (
    !sheetsClient ||
    typeof sheetsClient.getSheetValues !== "function" ||
    typeof sheetsClient.updateSheetValues !== "function" ||
    typeof sheetsClient.appendSheetValues !== "function"
  ) {
    throw new Error("A Composio MCP Google Sheets client adapter is required for sheet writing.");
  }
}

module.exports = {
  processSupportRequestsWorkflow,
  runGmailReadTest
};

if (require.main === module) {
  console.log("This file is configured for the /process-support-requests workflow.");
  console.log("Run it with Composio MCP client adapters for Gmail and Google Sheets.");
  console.log("The workflow writes only the 13 visible ticket columns and does not modify Gmail messages.");
}
