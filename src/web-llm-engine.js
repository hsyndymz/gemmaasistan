import * as webllm from "@mlc-ai/web-llm";

export class LocalLLMEngine {
  constructor() {
    this.engine = null;
    this.modelId = "gemma-2b-it-q4f16_1-MLC";
  }

  async requestPersistence() {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      console.log(`Storage persistence: ${isPersisted ? "enabled" : "not supported/denied"}`);
      return isPersisted;
    }
    return false;
  }

  async initialize(onProgress) {
    if (this.engine) return;

    // Try to request persistence before initializing
    await this.requestPersistence();

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

  async clearCache() {
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
    }
    console.log("Memory cleared.");
  }
}
