/**
 * Pragati Patola Art — order sheet receiver (Google Apps Script web app).
 *
 * The storefront server POSTs every verified Razorpay payment here. This
 * script:
 *   - authenticates the shared secret (Script Property ORDER_SECRET),
 *   - serialises writes with LockService,
 *   - skips duplicates by "Payment ID" (checkout + webhook both report a payment),
 *     only refreshing "Payment Status" (e.g. authorized → captured),
 *   - writes every value with a leading apostrophe (Sheets' "force text"
 *     marker, not displayed) so customer input such as "=..." or "+91…" can
 *     never execute as a formula or be mangled into a number/date,
 *   - keeps the header row in sync with the fields the store sends.
 *
 * Setup: see RAZORPAY_ONBOARDING_GUIDE.md → "Google Sheet setup".
 */

var ALLOWED_SHEETS = ["Orders", "Test Orders"];
var LINK_COLUMN = "WhatsApp Link";
var STATUS_COLUMN = "Payment Status";

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var expected = PropertiesService.getScriptProperties().getProperty("ORDER_SECRET");
    if (!expected || !safeEqual_(String(body.secret || ""), expected)) {
      return json_({ ok: false, error: "unauthorized" });
    }
    if (ALLOWED_SHEETS.indexOf(body.sheet) === -1 || !body.row || typeof body.row !== "object") {
      return json_({ ok: false, error: "bad request" });
    }
    var dedupeColumn = String(body.dedupeColumn || "Payment ID");

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      return json_(writeRow_(body.sheet, body.row, dedupeColumn));
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "server error" });
  }
}

/** Visiting the web app URL in a browser just confirms it is deployed. */
function doGet() {
  return json_({ ok: true, service: "ppa-order-sheet" });
}

function writeRow_(sheetName, row, dedupeColumn) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  var keys = Object.keys(row);

  // Header row: create on first use, append any new fields at the end.
  var headers = sheet.getLastColumn() > 0
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String)
    : [];
  var missing = keys.filter(function (k) { return headers.indexOf(k) === -1; });
  if (missing.length) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    headers = headers.concat(missing);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }

  // De-duplicate on Payment ID.
  var dedupeIndex = headers.indexOf(dedupeColumn);
  var dedupeValue = String(row[dedupeColumn] || "");
  if (dedupeIndex !== -1 && dedupeValue && sheet.getLastRow() > 1) {
    var match = sheet
      .getRange(2, dedupeIndex + 1, sheet.getLastRow() - 1, 1)
      .createTextFinder(dedupeValue)
      .matchEntireCell(true)
      .findNext();
    if (match) {
      var statusIndex = headers.indexOf(STATUS_COLUMN);
      if (statusIndex !== -1 && row[STATUS_COLUMN] === "captured") {
        sheet.getRange(match.getRow(), statusIndex + 1).setValue("captured");
      }
      return { ok: true, duplicate: true };
    }
  }

  var values = headers.map(function (h) {
    return Object.prototype.hasOwnProperty.call(row, h) ? row[h] : "";
  });
  var rowIndex = sheet.getLastRow() + 1;
  var range = sheet.getRange(rowIndex, 1, 1, headers.length);
  range.setValues([values.map(toCellText_)]);

  // Amount columns as numbers so the owner can total them.
  headers.forEach(function (h, i) {
    if (/\(INR\)$/.test(h) || h === "Item Count") {
      var n = Number(row[h]);
      if (isFinite(n)) sheet.getRange(rowIndex, i + 1).setNumberFormat("#,##0").setValue(n);
    }
  });

  // Clickable WhatsApp link. The URL is built server-side and percent-encoded,
  // so it cannot contain quotes; validate the prefix anyway.
  var linkIndex = headers.indexOf(LINK_COLUMN);
  var link = String(row[LINK_COLUMN] || "");
  if (linkIndex !== -1 && /^https:\/\/wa\.me\/[0-9]+\?text=[A-Za-z0-9%._~!*'()-]*$/.test(link)) {
    var rich = SpreadsheetApp.newRichTextValue()
      .setText("Send on WhatsApp")
      .setLinkUrl(link)
      .build();
    sheet.getRange(rowIndex, linkIndex + 1).setRichTextValue(rich);
  }

  return { ok: true, duplicate: false };
}

/**
 * Force every value to literal text: strip control characters and prefix an
 * apostrophe, which Sheets stores as "treat as text" (it is not displayed).
 * Blocks formula injection (=, +, -, @) and keeps phone numbers intact.
 */
function toCellText_(value) {
  if (value === null || value === undefined || value === "") return "";
  var text = String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, 5000);
  return "'" + text;
}

function safeEqual_(a, b) {
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/** Run once from the editor to confirm the sheet + secret are wired correctly. */
function testWrite() {
  var secret = PropertiesService.getScriptProperties().getProperty("ORDER_SECRET");
  var res = doPost({
    postData: {
      contents: JSON.stringify({
        secret: secret,
        sheet: "Test Orders",
        dedupeColumn: "Payment ID",
        row: {
          "Order Date (IST)": new Date().toString(),
          "Order Ref": "PPA-TEST",
          "Payment Status": "captured",
          "Payment ID": "pay_test_" + Date.now(),
          "Customer Name": "=HYPERLINK(\"https://example.com\",\"formula injection check\")",
          Phone: "+91 98765 43210",
          "Total Paid (INR)": 112000,
          "WhatsApp Link": "https://wa.me/919876543210?text=Namaste",
        },
      }),
    },
  });
  console.log(res.getContent());
}
