import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { testResults, testType, userProfile } = req.body;

    if (!testResults || !testType) {
      return res.status(400).json({ error: 'Test results and type are required' });
    }

    let analysisPrompt = '';

    switch (testType) {
      case 'mock-test':
        analysisPrompt = `Analyze these mock test results for a UPSC CDS aspirant:

Test Results: ${JSON.stringify(testResults)}

User Profile: ${JSON.stringify(userProfile || {})}

Please provide:
1. Performance analysis by subject
2. Strengths and weaknesses
3. Recommended study plan
4. Time management assessment
5. Improvement suggestions
6. Expected score in actual exam`;
        break;

      default:
        analysisPrompt = `Analyze these test results:

Test Results: ${JSON.stringify(testResults)}
Test Type: ${testType}
User Profile: ${JSON.stringify(userProfile || {})}

Please provide a comprehensive analysis including strengths, weaknesses, and improvement recommendations.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert UPSC CDS assessment analyst with years of experience in competitive exam preparation."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.6,
    });

    const analysis = completion.choices[0].message.content;

    res.status(200).json({
      success: true,
      analysis,
      testType,
      analyzedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({
      error: 'Failed to analyze results',
      message: error.message
    });
  }
}