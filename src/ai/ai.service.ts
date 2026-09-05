import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

type Role = 'system' | 'user' | 'assistant';

interface Message {
  role: Role;
  content: string;
}

interface GenerateOptions {
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * AI service wrapping Google GenAI (Gemini).
 *
 * Exposes low-level helpers (chat / reason / structuredJson) mirroring the
 * resume-builder LLM layer of hroute_server, but backed by @google/genai
 * (koso uses GEMINI_API_KEY, not Groq). Structured extraction is requested with
 * responseMimeType: application/json and falls back to a tolerant fenced-JSON
 * parse so a non-JSON response never crashes the caller.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ai: GoogleGenAI;

  // Default to a current, widely-available Gemini model; override with GEMINI_MODEL.
  private readonly model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not set — AI endpoints will fail at request time');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  async generateContent(
    messages: Message[],
    options: GenerateOptions = {},
  ): Promise<string> {
    const { system, temperature = 0.7, maxOutputTokens = 2048 } = options;

    const systemContent = system
      ? messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n')
      : undefined;
    const userMessages = messages.filter((m) => m.role !== 'system');

    const contents = userMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    this.logger.log(
      `generateContent (model=${this.model} messages=${messages.length} maxOutputTokens=${maxOutputTokens})`,
    );

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents,
        config: {
          systemInstruction: systemContent || undefined,
          temperature,
          maxOutputTokens,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from Google GenAI');
      }
      return text;
    } catch (error) {
      this.logger.error(`generateContent error: ${String(error)}`);
      throw error;
    }
  }

  /** Simple single-turn chat with an optional system instruction. */
  async chat(prompt: string, options?: GenerateOptions): Promise<string> {
    const messages: Message[] = [];
    if (options?.system) {
      messages.push({ role: 'system', content: options.system });
    }
    messages.push({ role: 'user', content: prompt });
    return this.generateContent(messages, options);
  }

  /** Precise, analytical completion at a low temperature — for structured reasoning. */
  async reason(prompt: string, options?: GenerateOptions): Promise<string> {
    return this.generateContent(
      [
        {
          role: 'system',
          content:
            'You are a precise, analytical engine. Be concise and factual. If uncertain, state your confidence.',
        },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.3, ...options },
    );
  }

  /**
   * Ask the model for a JSON object and parse it robustly.
   * Uses responseMimeType: application/json when possible; otherwise strips
   * markdown fences before JSON.parse.
   */
  async structuredJson<T>(prompt: string, options: GenerateOptions = {}): Promise<T> {
    const system =
      options.system ??
      'You are a data extraction engine. Respond with valid JSON only. No markdown, no explanation.';

    const text = await this.generateContent(
      [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      { temperature: 0.1, ...options },
    );

    const raw = text.replace(/```(?:json)?\s*/gi, '').trim();
    try {
      return JSON.parse(raw) as T;
    } catch {
      const fixed = raw.replace(/,(\s*[}\]])/g, '$1');
      try {
        return JSON.parse(fixed) as T;
      } catch {
        this.logger.error(`structuredJson parse failed: ${raw.slice(0, 500)}`);
        throw new BadRequestException('AI returned invalid JSON');
      }
    }
  }
}
