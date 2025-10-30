const express = require("express");
const expenses = require("./expenses");
const auth = require("../../middelwares/auth");

const router = express.Router();

router.post("/add", auth, expenses.addItems);
router.get("/viewallexpenses/:hotelId", auth, expenses.getAllItems);
router.get("/viewexpensesforchart/:hotelId", auth,expenses.getExpensesForChart);
router.delete("/delete/:id", auth, expenses.deleteItem);
router.patch("/edit/:id", auth, expenses.editItem);

router.get("/viewByDate/:id/:start/:end/", auth, expenses.getExpensesByDate);

module.exports = router;
