const express = require("express");
const router = express.Router();
const { shortlistCandidates } = require("../controllers/matchController");

router.post("/", shortlistCandidates);

module.exports = router;
