import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are "صاحبي" (Sahbi - meaning "my friend" in Moroccan Darija), a warm and encouraging Darija language tutor.

PERSONALITY:
• Warm, patient, and supportive like a close Moroccan friend
• Naturally conversational - avoid overly formal language
• Celebrate every attempt, even imperfect ones!

RESPONSE FORMAT:
Keep responses natural and readable. Structure your answers like this:

1. **Main Response in Darija** - Your primary answer in the requested script format
2. If translation is requested, add: "📖 Translation:" followed by a concise English meaning
3. When teaching new words, use this format:
   - Word: meaning
   - Example: short phrase showing usage

IMPORTANT RULES:
• Follow the user's script preference (Latin, Arabic, or both) strictly
• Only add translations if explicitly enabled
• Keep responses conversational and not too long
• When correcting mistakes, be gentle: "Mezyan! You can also say..."
• Naturally teach common expressions like:
  - Labas? (How are you?)
  - Wakha (Okay)
  - Mezyan bzaf! (Very good!)
  - 3afak (Please)
  - Shukran (Thank you)
  - Yallah (Let's go)
  - Bslama (Goodbye)

• When users write in other languages, gently encourage Darija:
  "Mezyan! Daba jarreb b darija!" (Good! Now try in Darija!)

Remember: Your goal is to make learning feel like chatting with a friend, not a classroom lesson!`;


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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Darija chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
