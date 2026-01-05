const LaundryInvoice = require("../../model/schema/laundryinvoice");
const Laundry = require("../../model/schema/laundry");

/* CREATE INVOICE */
exports.createInvoice = async (req, res) => {
  try {
    const {
      laundryId,
      subTotal,
      gstAmount,
      discount,
      advanceAmount,
      grandTotal
    } = req.body;

    const count = await LaundryInvoice.countDocuments();
    const invoiceNo = `LINV-${count + 1}`;

    const invoice = await LaundryInvoice.create({
      laundryId,
      invoiceNo,
      subTotal,
      gstAmount,
      discount,
      advanceAmount,
      grandTotal,
      totalPaid: advanceAmount,
      balanceAmount: grandTotal - advanceAmount
    });

    // ✅ link invoice to laundry
    await Laundry.findByIdAndUpdate(laundryId, {
      invoice: invoice._id,
      status: "Complete"
    });

    res.status(200).json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
};

/* GET INVOICE BY ID */
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await LaundryInvoice.findById(req.params.id)
      .populate({
        path: "laundryId",
        populate: ["providerId", "hotelId"]
      });

    res.status(200).json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
};

/* DELETE INVOICE */
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await LaundryInvoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // remove invoice reference from laundry
    await Laundry.findByIdAndUpdate(invoice.laundryId, {
      $unset: { invoice: "" },
      status: "Delivered"
    });

    await LaundryInvoice.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Invoice deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
};

