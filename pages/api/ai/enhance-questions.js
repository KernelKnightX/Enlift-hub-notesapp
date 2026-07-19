import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { questions, subject, difficulty } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Questions array is required' });
    }

    const prompt = `You are an expert UPSC CDS question enhancer. Given the following questions, enhance them to be more comprehensive, clear, and suitable for competitive exams.

Subject: ${subject || 'General'}
Difficulty Level: ${difficulty || 'Intermediate'}

Original Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Please enhance each question by:
1. Making it more precise and clear
2. Adding context where needed
3. Ensuring it tests conceptual understanding
4. Making it suitable for the target difficulty level
5. Following UPSC/CDS question patterns

Return the enhanced questions in the same order, maintaining the same number of questions.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in creating high-quality competitive exam questions for UPSC CDS preparation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const enhancedQuestions = completion.choices[0].message.content
      .split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    res.status(200).json({
      success: true,
      enhancedQuestions,
      originalCount: questions.length,
      enhancedCount: enhancedQuestions.length
    });

  } catch (error) {
    console.error('AI Enhancement Error:', error);
    res.status(500).json({
      error: 'Failed to enhance questions',
      message: error.message
    });
  }
}