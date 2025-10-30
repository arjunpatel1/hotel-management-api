const Packages = require("../../model/schema/packages");

// get packages list
const getList = async (req, res) => {
  try{
    const allData = await Packages.find({ deleted: false });
    console.log(" allData ==>",allData);

    const  totalRecords = allData.length;
    console.log("totalRecords ==>",totalRecords);

    if(allData.length === 0 ){
      return res.status(204).send({ message: "no Data Found." });
    }
    res.status(200).send({ packagesAllData: allData, count: totalRecords });
  }catch(error){
    console.error("Failed to fetch packages data:", error);
    res.status(400).json({ error: "Failed to fetch packages data" });
  }
};
// get specific package list
const getSpecificPackage = async (req, res) => {
  try {
    const _id = req.params.id;
    let packagesData = await Packages.find({ _id });
    res.status(200).json({ packagesData });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// add package
const add = async (req, res) => {
  try {
    const packages = new Packages(req.body);
    await packages.save();
    res.status(201).json({ packages, message: "Packages saved successfully" });
  } catch (err) {
    console.error("Failed to create packages:", err);
    res.status(500).json({ error: "Failed to create Packages" });
  }
};

// edit package
const edit = async (req, res) => {
  try {
    let result = await Packages.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json({ result, message: "Packages updated successfully" });
  } catch (err) {
    console.error("Failed to Update Packages:", err);
    res.status(400).json({ error: "Failed to Update Packages" });
  }
};

// delete package
const deleteData = async (req, res) => {
  try {
    let packages = await Packages.findByIdAndUpdate(
      { _id: req.params.id },
      { deleted: true }
    );
    res
      .status(200)
      .json({ message: "Packages deleted successfully", packages });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

module.exports = { getList, add, edit, deleteData, getSpecificPackage };
