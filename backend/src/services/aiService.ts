import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface ParsedExpense {
  amount: number;
  currency: string;
  category: string;
  description: string;
  merchant: string | null;
}

export async function parseExpense(text: string): Promise<ParsedExpense | null> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expense parser. Extract expense information from natural language input.

RULES:
1. Extract the amount as a number (no currency symbols)
2. Default currency is INR unless explicitly mentioned (USD, EUR, etc.)
3. Categorize into EXACTLY one of:
   - Food & Dining (restaurants, cafes, food delivery, groceries)
   - Transport (uber, ola, taxi, fuel, parking, metro)
   - Shopping (clothes, electronics, amazon, flipkart)
   - Entertainment (movies, netflix, spotify, games)
   - Bills & Utilities (electricity, water, internet, phone)
   - Health (medicine, doctor, gym, pharmacy)
   - Travel (flights, hotels, trips)
   - Other (anything that doesn't fit above)
4. Description should be a clean summary (not the raw input)
5. Merchant is the company/store name if mentioned, null otherwise

RESPOND ONLY WITH VALID JSON, no other text:
{
  "amount": <number>,
  "currency": "<string>",
  "category": "<string>",
  "description": "<string>",
  "merchant": "<string or null>"
}

If no amount found, return: { "error": "no amount", "amount": null }`,
        },
        {
          role: 'user',
          content: `Parse this expense: "${text}"`,
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    const raw = response.choices[0]?.message?.content?.trim() || '';
    console.log('🤖 GROQ RESPONSE:', raw);

    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.amount || parsed.error) {
      return null;
    }

    return {
      amount: Number(parsed.amount),
      currency: parsed.currency || 'INR',
      category: parsed.category || 'Other',
      description: parsed.description || text,
      merchant: parsed.merchant || null,
    };
  } catch (error: any) {
    console.error('❌ AI SERVICE ERROR:', error.message);
    return null;
  }
}