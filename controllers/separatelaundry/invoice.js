const SeparateLaundryInvoice = require("../../model/schema/separatelaundryinvoice");
const Invoice = require("../../model/schema/Invoice");
const SingleInvoice = require("../../model/schema/singleinvoice");
exports.createLaundryInvoice = async (req, res) => {
  try {
    const data = req.body;

    if (!data || !data.items || data.items.length === 0) {
      return res.status(400).json({
        message: "Laundry items are required"
      });
    }
    const invoice = await SeparateLaundryInvoice.create({
      reservationId: data.reservationId,
      hotelId: data.hotelId,
      name: data.customerName,
      address: data.address,
      customerPhoneNumber: data.customerPhoneNumber || "",
      laundryProviderName: data.laundryProviderName || "",
      laundryPhone: data.laundryPhone || "",
      roomNumber: data.roomNumber || "",
      items: data.items.map((item) => ({
        itemName: item.itemName,
        price: Number(item.price),
        quantity: Number(item.quantity),
        totalAmount: Number(item.price) * Number(item.quantity)
      })),
      discount: Number(data.discount || 0),
      haveGST: Boolean(data.haveGST ?? data.includeGST),

      gstNumber: data.gstNumber || "",
      gstAmount: Number(data.gstAmount || 0),
      totalAmount: Number(data.totalAmount),
      paymentMethod: data.paymentMethod,
      invoiceNumber: `LINV-${Date.now()}`
    });
   await Invoice.create({
  reservationId: data.reservationId,
  hotelId: data.hotelId,

  name: data.customerName,
  address: data.address,
  customerPhoneNumber: data.customerPhoneNumber,

  type: "laundry",
  invoiceNumber: invoice.invoiceNumber,
  laundryAmount: data.subTotal || data.laundryTotal,

  discount: invoice.discount || 0,
  totalAmount: invoice.totalAmount,

  laundryInvoiceId: invoice._id,

  paymentMethod: data.paymentMethod,
  createdDate: new Date()
});
await SingleInvoice.updateOne(
  { reservationId: data.reservationId },
  {
    $inc: {
      laundryAmount: invoice.totalAmount,
      totalFoodAndRoomAmount: invoice.totalAmount,
      totalAmount: invoice.totalAmount,
      pendingAmount: invoice.totalAmount
    }
  }
);

    res.status(200).json({
      message: "Laundry invoice created successfully",
      data: invoice
    });

  } catch (error) {
    console.error(" Laundry Invoice Create Error:", error);
    res.status(500).json({
      message: "Failed to create laundry invoice",
      error
    });
  }
};

exports.viewSpecificLaundryInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    if (!invoiceId) {
      return res.status(400).json({
        message: "Invoice ID is required"
      });
    }

    const invoice = await SeparateLaundryInvoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        message: "Laundry invoice not found"
      });
    }

    res.status(200).json({
      InvoiceData: invoice
    });
  } catch (error) {
    console.error(" Fetch Laundry Invoice Error:", error);
    res.status(500).json({
      message: "Failed to fetch laundry invoice",
      error
    });
  }
};

exports.viewLaundryByReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;

    const invoices = await SeparateLaundryInvoice.find({ reservationId });

    res.status(200).json({
      InvoiceData: invoices
    });
  } catch (error) {
    console.error(" Fetch Laundry By Reservation Error:", error);
    res.status(500).json({
      message: "Failed to fetch laundry invoices",
      error
    });
  }
};

