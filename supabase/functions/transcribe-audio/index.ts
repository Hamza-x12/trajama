import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { audio } = body;
    
    // Input validation
    if (!audio || typeof audio !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Audio data is required and must be a base64 string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculate approximate size (base64 is ~33% larger than binary)
    const approximateSize = (audio.length * 3) / 4;
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (approximateSize > maxSize) {
      return new Response(
        JSON.stringify({ error: 'Audio file must be less than 10MB' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Transcription request received', {
      audioSize: approximateSize,
      timestamp: new Date().toISOString()
    });

    const binaryAudio = processBase64Chunks(audio);
    
    const assemblyAIApiKey = Deno.env.get('ASSEMBLYAI_API_KEY');
    if (!assemblyAIApiKey) {
      throw new Error('ASSEMBLYAI_API_KEY not configured');
    }

    // Step 1: Upload audio to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': assemblyAIApiKey,
      },
      body: binaryAudio,
    });

    if (!uploadResponse.ok) {
      console.error('AssemblyAI upload error', { status: uploadResponse.status });
      throw new Error(`AssemblyAI upload error: ${uploadResponse.status}`);
    }

    const { upload_url } = await uploadResponse.json();
    console.log('Audio uploaded to AssemblyAI');

    // Step 2: Request transcription
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyAIApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        language_detection: true,
      }),
    });

    if (!transcriptResponse.ok) {
      console.error('AssemblyAI transcript request error', { status: transcriptResponse.status });
      throw new Error(`AssemblyAI transcript error: ${transcriptResponse.status}`);
    }

    const { id } = await transcriptResponse.json();
    console.log('Transcription requested, ID:', id);

    // Step 3: Poll for completion
    let transcript;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout
    
    while (attempts < maxAttempts) {
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: {
          'authorization': assemblyAIApiKey,
        },
      });

      if (!pollResponse.ok) {
        throw new Error(`AssemblyAI polling error: ${pollResponse.status}`);
      }

      transcript = await pollResponse.json();

      if (transcript.status === 'completed') {
        console.log('Transcription successful');
        return new Response(
          JSON.stringify({ text: transcript.text }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (transcript.status === 'error') {
        throw new Error(`Transcription failed: ${transcript.error}`);
      }

      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Transcription timeout');

  } catch (error) {
    console.error('Transcription error', {
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ error: 'Transcription failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
