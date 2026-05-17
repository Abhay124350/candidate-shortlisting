const Candidate = require("../models/Candidate");

/**
 * Core matching logic:
 * - Skill overlap score (required skills matched / total required)
 * - Preferred skills bonus (+0.1 per preferred skill matched, capped at 0.2)
 * - Experience filter (candidates below minExperience are excluded)
 * - Tier: High (>=0.7), Partial (>=0.4), Low (<0.4)
 */
function computeMatchScore(candidate, job) {
  const requiredSkills = job.requiredSkills.map((s) => s.toLowerCase().trim());
  const preferredSkills = (job.preferredSkills || []).map((s) => s.toLowerCase().trim());
  const candidateSkills = candidate.skills.map((s) => s.toLowerCase().trim());

  const matchedRequired = requiredSkills.filter((s) => candidateSkills.includes(s));
  const matchedPreferred = preferredSkills.filter((s) => candidateSkills.includes(s));

  const requiredScore =
    requiredSkills.length > 0 ? matchedRequired.length / requiredSkills.length : 1;

  // Bonus for preferred skills (max 0.2 bonus)
  const preferredBonus =
    preferredSkills.length > 0
      ? Math.min((matchedPreferred.length / preferredSkills.length) * 0.2, 0.2)
      : 0;

  const totalScore = Math.min(requiredScore + preferredBonus, 1);

  let tier = "Low";
  if (totalScore >= 0.7) tier = "High";
  else if (totalScore >= 0.4) tier = "Partial";

  return {
    matchScore: Math.round(totalScore * 100),
    matchedRequired,
    matchedPreferred,
    tier,
    meetsExperience: candidate.experience >= (job.minExperience || 0),
  };
}

// POST /api/match — Basic shortlisting
const shortlistCandidates = async (req, res) => {
  try {
    const { requiredSkills, minExperience, preferredSkills } = req.body;

    if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({ success: false, message: "requiredSkills array is required" });
    }

    const job = {
      requiredSkills,
      minExperience: minExperience || 0,
      preferredSkills: preferredSkills || [],
    };

    const candidates = await Candidate.find({});

    const results = candidates
      .map((candidate) => {
        const match = computeMatchScore(candidate, job);
        return {
          _id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          skills: candidate.skills,
          experience: candidate.experience,
          bio: candidate.bio,
          matchScore: match.matchScore,
          matchedRequired: match.matchedRequired,
          matchedPreferred: match.matchedPreferred,
          tier: match.tier,
          meetsExperience: match.meetsExperience,
        };
      })
      .filter((c) => c.meetsExperience) // filter out those below min experience
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { shortlistCandidates };
