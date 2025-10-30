const mongoose = require("mongoose");
const kot = require("../../model/schema/kot");
const employee = require("../../model/schema/employee");


const addTicket = async (req,res) => {
    console.log("req.body ======>", req.body);
    try {
        console.log("In try addTicket");
        const newKot = await kot.create(req.body);
        res.status(200).json(newKot);
      } catch (error) {
        console.error("Failed to add newKot:", error);
        res.status(400).json({ error: "Failed to add newKot" });
      }
}

    const viewAllTicket = async (req,res) => {
    const hotelId = new mongoose.Types.ObjectId(req.params.hotelId);
    console.log("hotelId here ===>", hotelId);
        try {
            // Fetch kot data
            const kotData = await kot.find({ hotelId });
            console.log("kotData ======>", kotData);

            if (kotData.length === 0) {
                return res.status(204).json({ message: "No Data Found." });
            }
            //marge data
            const mergedData = await Promise.all(
                kotData.map(async (kotItem) => {
                    const emply = await employee.findById(kotItem.staffId);
                    if (emply) {
                        return {
                            ...kotItem._doc,
                            staffName: `${emply.firstName} ${emply.lastName}`,
                        };
                    } else {
                        return kotItem;
                    }
                })
            );
            console.log("mergedData======>",mergedData);
            res.status(200).json({message: "Data get Successfully!!", mergedData });
        } catch (error) {
            console.error("Failed to fetch data:", error);
            res.status(400).json({ error: "Failed to fetch data" });
        }
    }

    const editTicket = async(req, res) => {
        console.log("in editTicket id =>",req.params.id);
        console.log("==>body", req.body);

        try {
            let result = await kot.updateOne(
              { _id: req.params.id },
              { $set: req.body }
            );
            res.status(200).json(result);
          } catch (err) {
            console.error("Failed to Update Ticket:", err);
            res.status(400).json({ error: "Failed to Update Ticket" });
          }
    }


    const deleteTicket = async (req, res) => {
    console.log("in deleteTicket id =>",req.params.id);
    try {
        const result = await kot.deleteOne({ _id: req.params.id });
        console.log("result==>",result);
        res.status(200).json({ message: "Ticket Deleted Successfully!!", result });
        } catch (error) {
        res.status(404).json({ message: "error", error });
        console.log(error);
        }
    }

module.exports = {
    addTicket,
    viewAllTicket,
    editTicket,
    deleteTicket,
};

