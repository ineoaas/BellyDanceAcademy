const Mux = require("@mux/mux-node");

// Shared client, same idea as lib/stripe.js. Falls back to placeholder
// credentials so importing this file never crashes a page on its own —
// only an actual Mux API call fails if the real keys aren't set yet.
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || "not_configured",
  tokenSecret: process.env.MUX_TOKEN_SECRET || "not_configured",
});

// Signed playback is how a non-preview lesson stays gated — only our
// server (holding the signing key) can mint a token, and it only does so
// after checking the viewer actually owns the course.
async function signPlaybackToken(playbackId) {
  return mux.jwt.signPlaybackId(playbackId, {
    keyId: process.env.MUX_SIGNING_KEY,
    keySecret: process.env.MUX_PRIVATE_KEY,
    type: "video",
    expiration: "4h",
  });
}

module.exports = mux;
module.exports.signPlaybackToken = signPlaybackToken;
