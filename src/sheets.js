const SHEET_COLUMNS = [
  "Received Date",
  "Customer Name",
  "Customer Email",
  "Email Subject",
  "Product / Service",
  "Issue Category",
  "Priority",
  "Sentiment",
  "Order / Account Reference",
  "Issue Summary",
  "Suggested Next Action",
  "Suggested Reply",
  "Status"
];

function ticketToSheetRow(ticket) {
  return SHEET_COLUMNS.map((columnName) => ticket[columnName] || "");
}

module.exports = {
  SHEET_COLUMNS,
  ticketToSheetRow
};
