import * as webllm from "@mlc-ai/web-llm";

export class LocalLLMEngine {
  constructor() {
    this.engine = null;
    this.modelId = "gemma-2b-it-q4f16_1-MLC";
  }

  async initialize(onProgress) {
    if (this.engine) return;

    this.engine = await webllm.CreateMLCEngine(this.modelId, {
      initProgressCallback: (report) => {
        console.log(report.text);
        if (onProgress) onProgress(report.progress, report.text);
      },
    });
  }

  async generateResponse(messages, onUpdate) {
    if (!this.engine) throw new Error("Engine not initialized");

    const chunks = await this.engine.chat.completions.create({
      messages,
      stream: true,
    });

    let fullText = "";
    for await (const chunk of chunks) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullText += content;
      if (onUpdate) onUpdate(fullText);
    }
    return fullText;
  }
}
