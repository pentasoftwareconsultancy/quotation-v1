db.otp_challenges.createIndex(
  { challengeIdHash: 1 },
  { unique: true, name: "otp_challenge_hash_unique" }
);

db.otp_challenges.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 86400, name: "otp_challenge_expiry_ttl" }
);
