const OnlineReservation = require('../../model/schema/onlineReservation.schema');

exports.getOnlineReservations = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { from, to, search } = req.query;

    let filter = { hotelId };

    // Date filter
    if (from || to) {
      filter.checkInDate = {};
      if (from) filter.checkInDate.$gte = new Date(from);
      if (to) filter.checkInDate.$lte = new Date(to);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { roomNo: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const data = await OnlineReservation.find(filter)
      .sort({ createdAt: -1 });

    // Transform data to match frontend column expectations
    const transformedData = data.map(reservation => {
      const checkIn = new Date(reservation.checkInDate);
      const checkOut = new Date(reservation.checkOutDate);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

      return {
        _id: reservation._id,
        roomNo: reservation.roomNo,
        roomType: reservation.roomType,
        bookingType: reservation.bookingType,
        floor: reservation.floor,
        adults: reservation.adults,
        kids: reservation.kids,
        price: reservation.totalPayment,          
        advance: reservation.advanceAmount,        
        customer: reservation.customer?.name || 'N/A', 
        customerEmail: reservation.customer?.email || 'N/A',
        customerPhone: reservation.customer?.phone || 'N/A', 
        specialRequests: reservation.customer?.specialRequests || 'None', 
        checkInDate: reservation.checkInDate,
        checkOutDate: reservation.checkOutDate,
        days: days,                                
        status: reservation.status
      };
    });

    res.status(200).json({
      success: true,
      count: transformedData.length,
      reservationData: transformedData
    });
  } catch (error) {
    console.error('Online reservation fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch online reservations'
    });
  }
};

exports.deleteOnlineReservations = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json({
        success: false,
        message: 'No reservation IDs provided'
      });
    }

    await OnlineReservation.deleteMany({
      _id: { $in: ids }
    });

    res.status(200).json({
      success: true,
      message: 'Online reservations deleted successfully'
    });
  } catch (error) {
    console.error('Delete online reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete online reservations'
    });
  }
};

exports.exportOnlineReservations = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const data = await OnlineReservation.find({ hotelId })
      .sort({ createdAt: -1 });

    const exportData = data.map((r) => ({
      roomNo: r.roomNo,
      roomType: r.roomType,
      bookingType: r.bookingType,
      floor: r.floor,
      adults: r.adults,
      kids: r.kids,
      price: r.totalPayment,
      advance: r.advanceAmount,
      customer: r.customer?.name,
      phone: r.customer?.phone,
      checkIn: r.checkInDate,
      checkOut: r.checkOutDate,
      status: r.status
    }));

    res.status(200).json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
};

exports.editOnlineReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedReservation = await OnlineReservation.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({
        success: false,
        message: 'Online reservation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Online reservation updated successfully',
      data: updatedReservation
    });
  } catch (error) {
    console.error('Edit online reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update online reservation'
    });
  }
};

