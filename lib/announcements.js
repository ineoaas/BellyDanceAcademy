const db = require("./db");

function listActiveAnnouncements() {
  return db
    .prepare(`SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC`)
    .all();
}

function listAllAnnouncements() {
  return db.prepare(`SELECT * FROM announcements ORDER BY created_at DESC`).all();
}

function createAnnouncement(message) {
  db.prepare(`INSERT INTO announcements (message) VALUES (?)`).run(message);
}

// Toggled inactive rather than deleted, same as reviews' hide/unhide.
function setAnnouncementActive(id, isActive) {
  db.prepare(`UPDATE announcements SET is_active = ? WHERE id = ?`).run(isActive ? 1 : 0, id);
}

module.exports = {
  listActiveAnnouncements,
  listAllAnnouncements,
  createAnnouncement,
  setAnnouncementActive,
};
