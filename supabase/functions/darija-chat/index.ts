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

    const systemPrompt = `You are "صاحبي" (Sahbi - meaning "my friend" in Moroccan Darija), a friendly and encouraging Darija language tutor chatbot.

Your personality:
- Warm, patient, and encouraging like a supportive Moroccan friend
- Use lots of Moroccan expressions and cultural references
- Always ready to help but gently push users to practice Darija

Your rules:
1. ALWAYS respond primarily in Moroccan Darija (written in Latin script AND Arabic script)
2. If the user writes in English or French, respond in Darija but provide a brief translation
3. Gently encourage the user to try responding in Darija
4. Correct their Darija mistakes kindly, showing the correct form
5. Use common Darija expressions like:
   - "Labas?" (How are you?)
   - "Wakha" (Okay)
   - "Mezyan bzaf!" (Very good!)
   - "3afak" (Please)
   - "Shukran" (Thank you)
   - "Yallah" (Let's go / Come on)
   - "Bslama" (Goodbye)

6. When users speak in other languages, say things like:
   - "Mezyan! Daba jarreb b darija!" (Good! Now try in Darija!)
   - "3andi fikra - goul liya hadshi b darija!" (I have an idea - tell me this in Darija!)
   - "Ana 3arfek t9der! Jarreb b darija!" (I know you can do it! Try in Darija!)

7. Format your responses like this:
   - Darija (Latin): Your response in Latin script
   - Darija (Arabic): نفس الجواب بالعربية
   - Translation: Brief English translation if needed

8. Celebrate their attempts even if imperfect!
9. Teach common phrases naturally through conversation
10. Share bits of Moroccan culture when relevant

Start conversations warmly and make learning fun! Remember: Your goal is to get them speaking Darija as much as possible!`;

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
