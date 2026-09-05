import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Llm } from "../utils/types";

dotenv.config();


class LLM {
  private Model = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
  });
  private modelName: string;
  constructor(modelName: string) {
    this.modelName = modelName;
  }
  
  public async generateContent(input: Llm) {
    const result = await this.Model.models.generateContent(
      {
        model: this.modelName,
        contents: [
          {
            role: "user",
            parts: [
              { text: input.prompt }
            ]
          }
        ]
      }
    )
    return result;
  }
  
}
