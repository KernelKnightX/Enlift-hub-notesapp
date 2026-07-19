import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { testHistory, userProfile, focusArea } = req.body;

    if (!testHistory || !Array.isArray(testHistory)) {
      return res.status(400).json({ error: 'Test history array is required' });
    }

    const prompt = `You are an expert UPSC CDS mentor. Analyze this student's test performance history and provide personalized insights and recommendations.

Student Profile: ${JSON.stringify(userProfile || {})}

Test History: ${JSON.stringify(testHistory)}

Focus Area: ${focusArea || 'General Performance'}

Please provide:

1. **Performance Trends**: Analyze score progression, consistency, and improvement areas
2. **Strength Analysis**: Identify strongest subjects/topics and why
3. **Weakness Analysis**: Pinpoint areas needing improvement with specific recommendations
4. **Study Strategy**: Personalized study plan based on performance patterns
5. **Time Management**: Analysis of speed and accuracy trade-offs
6. **Mock Test Strategy**: How to maximize remaining mock test effectiveness
7. **Exam Readiness**: Assessment of preparation level for actual exam
8. **Motivational Insights**: Encouraging analysis with specific goals

Format the response as a comprehensive report with actionable recommendations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a senior UPSC CDS mentor with 15+ years of experience in competitive exam preparation. Provide detailed, actionable insights based on test performance data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const insights = completion.choices[0].message.content;

    // Generate performance metrics
    const metrics = {
      totalTests: testHistory.length,
      averageScore: testHistory.length > 0
        ? Math.round(testHistory.reduce((sum, test) => sum + (test.score || 0), 0) / testHistory.length)
        : 0,
      bestScore: testHistory.length > 0
        ? Math.max(...testHistory.map(test => test.score || 0))
        : 0,
      improvement: testHistory.length > 1
        ? testHistory[testHistory.length - 1].score - testHistory[0].score
        : 0,
      consistency: calculateConsistency(testHistory)
    };

    res.status(200).json({
      success: true,
      insights,
      metrics,
      generatedAt: new Date().toISOString(),
      focusArea: focusArea || 'General Performance'
    });

  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({
      error: 'Failed to generate insights',
      message: error.message
    });
  }
}

function calculateConsistency(testHistory) {
  if (testHistory.length < 2) return 0;

  const scores = testHistory.map(test => test.score || 0);
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);

  // Return consistency score (lower deviation = higher consistency)
  return Math.max(0, 100 - standardDeviation * 2);
}