const db = require("./db");

function getCommissionRatePercent() {
  const row = db
    .prepare(`SELECT commission_rate_percent FROM platform_settings WHERE id = 1`)
    .get();
  return row.commission_rate_percent;
}

module.exports = { getCommissionRatePercent };
