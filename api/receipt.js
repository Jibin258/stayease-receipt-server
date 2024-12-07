const express = require("express");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const Receipt_details = require('../models/receipt-format');
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

receiptDetailsRouter.get("/export-receipts", async (req, res) => {
  try {
    const receiptData = await Receipt_details.find({});

    if (receiptData.length === 0) {
      return res.status(404).json({ message: "No receipts found" });
    }

    const excelData = receiptData.map((item) => [
      item.receiptNo,
      item.guestName,
      item.guestPhone,
      item.guestEmail,
      item.bookingId,
      item.checkInDate,
      item.roomType,
      item.numberOfGuests,
      item.totalAmount,
      item.paymentType,
      item.paymentMode,
      item.paymentStatus,
      item.receiptDate,
    ]);

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([headers, ...excelData]);

    xlsx.utils.book_append_sheet(workbook, worksheet, "Receipts");

    const fileBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

    const fileName = "receipts.xlsx";

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    res.send(fileBuffer);
  } catch (error) {
    console.error("Error exporting receipts:", error);
    res.status(500).json({ message: "Error exporting receipts" });
  }
});

receiptDetailsRouter.get("/receipt-excel", async (req, res) => {
  try {
    const lastReceiptData = await Receipt_details.findOne().sort({ receiptNo: -1 });

    res.json(lastReceiptData);
  } catch (error) {
    console.error("Error reading the receipt data:", error);
    res.status(500).json({ message: "Error reading the receipt data" });
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

  try {
    const lastReceipt = await Receipt_details.findOne().sort({ receiptNo: -1 });
    const receiptNo = lastReceipt
      ? (parseInt(lastReceipt.receiptNo, 10) + 1).toString().padStart(5, "0")
      : "00001";

    const formattedCheckInDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
    }).format(new Date(checkInDate)).replace(' ', '-');

    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(2, "0")}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${currentDate.getFullYear()}`;

    const receipt_details = new Receipt_details({
      receiptNo: receiptNo,
      guestName: guestName,
      guestPhone: guestPhone,
      guestEmail: guestEmail,
      bookingId: bookingId,
      checkInDate: formattedCheckInDate,
      roomType: roomType,
      numberOfGuests: numberOfGuests,
      totalAmount: totalAmount,
      paymentType: paymentType,
      paymentMode: paymentMode,
      paymentStatus: paymentStatus,
      receiptDate: formattedDate,
    });

    await receipt_details.save();
    res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    console.error("Error saving receipt details:", error);
    res.status(500).json({ error: "Failed to save receipt details" });
  }
});


module.exports = receiptDetailsRouter;
