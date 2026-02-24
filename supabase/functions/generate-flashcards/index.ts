import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, numFlashcards = 5 } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an educational content creator specializing in creating step-by-step learning flashcards for children with special needs. Generate ${numFlashcards} flashcards based on the user's request. Each flashcard should have a clear title, a simple encouraging description, and a relevant emoji icon that represents the action. Format your response as a JSON array of objects with "title", "description", and "icon" fields. Keep language simple, positive, and actionable. Choose colorful, engaging emojis that children will love.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_flashcards",
              description: "Generate educational flashcards for learning routines",
              parameters: {
                type: "object",
                properties: {
                  flashcards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Short, clear step title" },
                        description: { type: "string", description: "Simple, encouraging instructions" },
                        icon: { type: "string", description: "Single emoji that represents this step" }
                      },
                      required: ["title", "description", "icon"]
                    }
                  }
                },
                required: ["flashcards"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_flashcards" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    const message = data.choices?.[0]?.message;
    if (!message) {
      throw new Error("No message in AI response");
    }

    let flashcards: Array<{ title: string; description: string; icon: string }>;

    // Prefer tool call (structured output)
    const toolCall = message.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        flashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards : [];
      } catch {
        flashcards = [];
      }
    } else {
      // Fallback: try to parse message content as JSON (e.g. model returned text instead of tool call)
      const raw = message.content || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/) || raw.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          flashcards = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.flashcards) ? parsed.flashcards : [];
        } catch {
          flashcards = [];
        }
      } else {
        flashcards = [];
      }
    }

    const normalized = flashcards
      .filter((f: unknown) => f && typeof f === "object" && "title" in f)
      .slice(0, numFlashcards)
      .map((f: { title?: string; description?: string; icon?: string }) => ({
        title: String(f?.title ?? "Step").trim() || "Step",
        description: String(f?.description ?? "").trim() || "Do this step.",
        icon: String(f?.icon ?? "✨").trim().slice(0, 2) || "✨",
      }));

    if (normalized.length === 0) {
      return new Response(
        JSON.stringify({ error: "AI did not return valid steps. Try a different prompt." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ flashcards: normalized }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-flashcards:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
