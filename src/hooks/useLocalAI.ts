import { useState, useEffect, useCallback, useRef } from 'react';
import { CreateMLCEngine, MLCEngine, type InitProgressCallback } from '@mlc-ai/web-llm';

// Using Qwen2-0.5B - small model (~350MB) for fast loading
const SELECTED_MODEL = "Qwen2-0.5B-Instruct-q4f16_1-MLC";

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export function useLocalAI() {
    const [engine, setEngine] = useState<MLCEngine | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const initAttempted = useRef(false);

    const initEngine = useCallback(async () => {
        if (engine || initAttempted.current) return;
        initAttempted.current = true;

        setIsLoading(true);
        setError(null);

        try {
            const initProgressCallback: InitProgressCallback = (report) => {
                console.log('Model loading:', report.text);
                setProgress(report.text);
            };

            const newEngine = await CreateMLCEngine(
                SELECTED_MODEL,
                {
                    initProgressCallback,
                    logLevel: "INFO",
                }
            );

            setEngine(newEngine);
            setIsLoading(false);
            console.log('Model loaded successfully!');
        } catch (err: any) {
            console.error("Failed to load model:", err);
            let errorMessage = "Failed to load model.";

            if (err.message?.includes("Cache") || err.message?.includes("network")) {
                errorMessage = "Network error downloading model. Click retry to try again.";
            } else if (err.message?.includes("GPU") || err.message?.includes("WebGPU")) {
                errorMessage = "WebGPU not supported. Try using Chrome or Edge.";
            } else {
                errorMessage = err.message || "Unknown error occurred.";
            }

            setError(errorMessage);
            setIsLoading(false);
        }
    }, [engine]);

    useEffect(() => {
        initEngine();
    }, [initEngine]);

    const resetError = useCallback(() => {
        setError(null);
        initAttempted.current = false;
        setEngine(null);
        initEngine();
    }, [initEngine]);

    const sendMessage = useCallback(async (text: string) => {
        if (!engine) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setIsGenerating(true);

        try {
            const chunks = await engine.chat.completions.create({
                messages: [...messages, userMessage],
                stream: true,
                temperature: 0.7,
                max_tokens: 1024,
            });

            let assistantMessage = "";
            setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

            for await (const chunk of chunks) {
                const content = chunk.choices[0]?.delta?.content || "";
                assistantMessage += content;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = assistantMessage;
                    return newMessages;
                });
            }
        } catch (err) {
            console.error("Generation failed:", err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error generating response. Please try again." }]);
        } finally {
            setIsGenerating(false);
        }
    }, [engine, messages]);

    return {
        isLoading,
        progress,
        messages,
        sendMessage,
        isGenerating,
        isReady: !!engine,
        error,
        resetError
    };
}
