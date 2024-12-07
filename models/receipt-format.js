const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
    {
        receiptNo: {
            type: String,
            required: true,
        },
        guestName: {
            type: String,
            required: true,
        },
        guestPhone: {
            type: String,
            required: true,
        },
        guestEmail: {
            type: String,
            required: true,
        },
        bookingId: {
            type: String,
            required: true,
        },
        checkInDate: {
            type: String,
            required: true,
        },
        roomType: {
            type: String,
            required: true,
        },
        numberOfGuests: {
            type: Number,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        paymentType: {
            type: String,
            required: true,
        },
        paymentMode: {
            type: String,
            required: true,
        },
        paymentStatus: {
            type: String,
            required: true,
        },
        receiptDate: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Receipt = mongoose.model('receipt_details', receiptSchema);

module.exports = Receipt;
