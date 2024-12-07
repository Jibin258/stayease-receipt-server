const express = require("express");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const receiptDetailsRouter = express.Router();

const headers = [
  "Receipt No.",
  "Name",
  "Phone",
  "Email",
  "Booking ID",
  "Rental Month",
  "Room Type",
  "Number of Tenants",
  "Total Amount",
  "Payment Type",
  "Payment Mode",
  "Payment Status",
  "Receipt Date",
];

const parentFolder = path.join(__dirname, "..");
const filePath = path.join(parentFolder, "/public/assets/receipts.xlsx");

receiptDetailsRouter.get("/export-excel", (req, res) => {
  if (fs.existsSync(filePath)) {
    res.download(filePath, "receipts.xlsx", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ error: "Error sending the file" });
      }
    });
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

receiptDetailsRouter.get("/receipt-excel", (req, res) => {
  try {
    if (fs.existsSync(filePath)) {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (data.length > 0) {
        const lastReceiptData = data[data.length - 1];
        res.json(lastReceiptData);
      } else {
        res.status(404).json({ message: "No data found in the Excel file" });
      }
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("Error reading the Excel file:", error);
    res.status(500).json({ message: "Error reading the Excel file" });
  }
});

receiptDetailsRouter.post("/receipt-form", async (req, res) => {
  const {
    guestName,
    guestPhone,
    guestEmail,
    bookingId,
    checkInDate,
    roomType,
    numberOfGuests,
    totalAmount,
    paymentType,
    paymentMode,
    paymentStatus,
  } = req.body;

  if (
    !guestName ||
    !guestPhone ||
    !guestEmail ||
    !bookingId ||
    !checkInDate ||
    !roomType ||
    !numberOfGuests ||
    !totalAmount ||
    !paymentType ||
    !paymentMode ||
    !paymentStatus
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let workbook;
  let receiptNo = "00001";

  try {
    if (fs.existsSync(filePath)) {
      workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      const lastReceiptNo = data.map((item) => item["Receipt No."]).at(-1);
      receiptNo = (parseInt(lastReceiptNo, 10) + 1).toString().padStart(5, "0");
    } else {
      workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.aoa_to_sheet([headers]);
      xlsx.utils.book_append_sheet(workbook, worksheet, "Receipts");
    }
  } catch (error) {
    console.error("Error reading Excel file:", error);
    return res.status(500).json({ error: "Error reading Excel file" });
  }

  const date = new Date(checkInDate);
  const rentalMonth = `${date.toLocaleString("default", { month: "short" })}-${date.getFullYear()}`;
  const currentDate = new Date();
  const formattedDate = `${String(currentDate.getDate()).padStart(2, "0")}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${currentDate.getFullYear()}`;

  const newRow = [
    receiptNo,
    guestName,
    guestPhone,
    guestEmail,
    bookingId,
    rentalMonth,
    roomType,
    numberOfGuests,
    totalAmount,
    paymentType,
    paymentMode,
    paymentStatus,
    formattedDate,
  ];

  try {
    const worksheet =
      workbook.Sheets["Receipts"] || xlsx.utils.aoa_to_sheet([headers]);
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    rows.push(newRow);
    const updatedWorksheet = xlsx.utils.aoa_to_sheet(rows);
    workbook.Sheets["Receipts"] = updatedWorksheet;

    xlsx.writeFile(workbook, filePath);
    res.status(200).json({ message: "Data added successfully" });
  } catch (error) {
    console.error("Error saving the Excel file:", error);
    res.status(500).json({ error: "Error saving the Excel file" });
  }
});

module.exports = receiptDetailsRouter;
