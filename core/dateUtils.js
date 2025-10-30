function parseDateOnly(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)); // Month is 0-based
}

module.exports = { parseDateOnly };