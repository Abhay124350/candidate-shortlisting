const express = require("express");
const router = express.Router();
const { aiShortlist, generateInterviewQuestions } = require("../controllers/aiController");

router.post("/shortlist", aiShortlist);
router.post("/interview-questions", generateInterviewQuestions);

module.exports = router;
