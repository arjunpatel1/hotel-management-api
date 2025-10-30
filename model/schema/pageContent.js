const mongoose = require('mongoose');

const PageContentSchema = new mongoose.Schema({
    page: { type: String, required: true },
    htmlContent: { type: String, required: true },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
    },
}, { timestamps: true });

module.exports = mongoose.model('PageContent', PageContentSchema);