const Candidate = require("../models/Candidate");
const fetch = require("node-fetch");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini"; // cost-effective model on OpenRouter

/**
 * Build a structured prompt for OpenRouter to rank and explain candidates
 */
function buildPrompt(candidates, job) {
  const candidateList = candidates
    .map(
      (c, i) =>
        `${i + 1}. ${c.name} — Skills: ${c.skills.join(", ")} — Experience: ${c.experience} year(s) — Bio: ${c.bio || "N/A"}`
    )
    .join("\n");

  return `You are an expert technical recruiter. Analyze the following candidates for a job opening and rank them.

Job Requirements:
- Required Skills: ${job.requiredSkills.join(", ")}
- Preferred Skills: ${(job.preferredSkills || []).join(", ") || "None"}
- Minimum Experience: ${job.minExperience || 0} year(s)

Candidates:
${candidateList}

For each candidate, provide:
1. Rank (1 = best fit)
2. Match percentage (0-100%)
3. A brief explanation (2-3 sentences) of why they are or aren't a good fit
4. Key strengths relevant to the role
5. Any gaps or concerns

Respond ONLY with a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "name": "Candidate Name",
    "rank": 1,
    "aiMatchScore": 85,
    "explanation": "Brief explanation here.",
    "strengths": ["strength1", "strength2"],
    "gaps": ["gap1"]
  }
]`;
}

// POST /api/ai/shortlist — AI-based candidate ranking
const aiShortlist = async (req, res) => {
  try {
    const { requiredSkills, minExperience, preferredSkills } = req.body;

    if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
      return res.status(400).json({ success: false, message: "requiredSkills array is required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      return res.status(503).json({
        success: false,
        message: "OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env",
      });
    }

    const job = {
      requiredSkills,
      minExperience: minExperience || 0,
      preferredSkills: preferredSkills || [],
    };

    // Fetch candidates that meet minimum experience
    const candidates = await Candidate.find({
      experience: { $gte: job.minExperience },
    });

    if (candidates.length === 0) {
      return res.json({
        success: true,
        message: "No candidates found matching the experience requirement",
        data: [],
      });
    }

    const prompt = buildPrompt(candidates, job);

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Candidate Shortlisting System",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", errText);
      return res.status(502).json({
        success: false,
        message: `OpenRouter API error: ${response.status} ${response.statusText}`,
      });
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "[]";

    // Parse AI JSON response safely
    let aiRankings;
    try {
      // Strip any accidental markdown code fences
      const cleaned = rawContent.replace(/```json|```/g, "").trim();
      aiRankings = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      return res.status(502).json({
        success: false,
        message: "AI returned an unparseable response. Try again.",
        raw: rawContent,
      });
    }

    // Merge AI rankings with candidate DB data
    const enriched = aiRankings
      .map((aiResult) => {
        const candidate = candidates.find(
          (c) => c.name.toLowerCase() === aiResult.name.toLowerCase()
        );
        return {
          _id: candidate?._id,
          name: aiResult.name,
          email: candidate?.email,
          skills: candidate?.skills,
          experience: candidate?.experience,
          bio: candidate?.bio,
          rank: aiResult.rank,
          aiMatchScore: aiResult.aiMatchScore,
          explanation: aiResult.explanation,
          strengths: aiResult.strengths || [],
          gaps: aiResult.gaps || [],
        };
      })
      .sort((a, b) => a.rank - b.rank);

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    console.error("AI shortlist error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ai/interview-questions — Generate interview questions for a candidate
const generateInterviewQuestions = async (req, res) => {
  try {
    const { candidateId, jobRole, requiredSkills } = req.body;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === "your_openrouter_api_key_here") {
      return res.status(503).json({
        success: false,
        message: "OpenRouter API key not configured.",
      });
    }

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    const prompt = `You are a senior technical interviewer. Generate 5 targeted interview questions for the following candidate applying for a ${jobRole || "software developer"} role.

Candidate: ${candidate.name}
Skills: ${candidate.skills.join(", ")}
Experience: ${candidate.experience} year(s)
Bio: ${candidate.bio || "N/A"}
Required Skills for Role: ${(requiredSkills || []).join(", ") || "General software development"}

Generate questions that:
- Test their claimed skills
- Assess problem-solving ability
- Explore their experience depth
- Include at least one behavioral question

Respond ONLY with a valid JSON array (no markdown):
[
  { "question": "Question text here?", "type": "Technical|Behavioral|Situational", "skill": "Relevant skill" }
]`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Candidate Shortlisting System",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      return res.status(502).json({ success: false, message: "OpenRouter API error" });
    }

    const aiData = await response.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "[]";

    let questions;
    try {
      const cleaned = rawContent.replace(/```json|```/g, "").trim();
      questions = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ success: false, message: "Failed to parse AI response" });
    }

    res.json({ success: true, candidate: candidate.name, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { aiShortlist, generateInterviewQuestions };
