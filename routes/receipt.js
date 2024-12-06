const express = require('express');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const receiptDetails_router = express.Router();

const headers = ['Receipt No.', 'Name', 'Phone', 'Email', 'Booking ID', 'Rental Month', 'Room Type', 'Number of Tenants', 'Total Amount', 'Payment Type', 'Payment Mode', 'Payment Status', 'Receipt Date'];

const parentFolder = path.join(__dirname, '..');
const filePath = path.join(parentFolder, '/public/assets/receipts.xlsx');

receiptDetails_router.get('/api/export-excel', (req, res) => {
    res.download(filePath, 'receipts.xlsx', (err) => {
        if (err) {
            console.error("Error sending file:", err);
        }
    });
});

receiptDetails_router.get('/api/receipt', (req, res) => {
    try {

        if (fs.existsSync(filePath)) {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(worksheet);
            const lastReceiptData = data[data.length - 1];

            res.json(lastReceiptData);
        }
    } catch (error) {
        console.error('Error reading the Excel file:', error);
        res.status(500).json({ message: 'Error reading the Excel file' });
    }
});

receiptDetails_router.post('/api/receipt', async (req, res) => {
    const { guestName, guestPhone, guestEmail, bookingId, checkInDate, roomType, numberOfGuests, totalAmount, paymentType, paymentMode, paymentStatus } = req.body;

    if (!guestName || !guestPhone || !guestEmail || !bookingId || !checkInDate || !roomType || !numberOfGuests || !totalAmount || !paymentType || !paymentMode || !paymentStatus) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    let workbook;
    let receiptNo = '00001';

    try {
        if (fs.existsSync(filePath)) {
            workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const data = xlsx.utils.sheet_to_json(worksheet);
            const lastReceiptNo = data.map(item => item['Receipt No.']).at(-1);

            receiptNo = (parseInt(lastReceiptNo, 10) + 1).toString().padStart(5, '0');
        } else {
            workbook = xlsx.utils.book_new();
            const worksheet = xlsx.utils.aoa_to_sheet([headers]);
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Receipts');
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error reading Excel file' });
    }

    const worksheet = workbook.Sheets['Receipts'] || xlsx.utils.aoa_to_sheet([headers]);

    const date = new Date(checkInDate);
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()}`;

    const newRow = [receiptNo, guestName, guestPhone, guestEmail, bookingId, `${month}-${year}`, roomType, numberOfGuests, totalAmount, paymentType, paymentMode, paymentStatus, formattedDate];

    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    rows.push(newRow);
    const updatedWorksheet = xlsx.utils.aoa_to_sheet(rows);

    workbook.Sheets['Receipts'] = updatedWorksheet;

    try {
        xlsx.writeFile(workbook, filePath);
        res.status(200).json({ message: 'Data added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error saving the Excel file' });
    }
});

module.exports = receiptDetails_router;
