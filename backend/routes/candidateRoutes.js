const express = require("express");
const router = express.Router();
const {
  addCandidate,
  getAllCandidates,
  getCandidateById,
  deleteCandidate,
} = require("../controllers/candidateController");

router.post("/", addCandidate);
router.get("/", getAllCandidates);
router.get("/:id", getCandidateById);
router.delete("/:id", deleteCandidate);

module.exports = router;
