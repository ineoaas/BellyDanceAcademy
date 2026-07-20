const db = require("./db");

function getCommissionRatePercent() {
  const row = db
    .prepare(`SELECT commission_rate_percent FROM platform_settings WHERE id = 1`)
    .get();
  return row.commission_rate_percent;
}

// Only affects purchases from this point on — amounts are snapshotted
// onto each purchase row at checkout time (Phase 2), so past sales never
// get rewritten by a later rate change.
function setCommissionRatePercent(percent) {
  db.prepare(`UPDATE platform_settings SET commission_rate_percent = ? WHERE id = 1`).run(percent);
}

module.exports = { getCommissionRatePercent, setCommissionRatePercent };
