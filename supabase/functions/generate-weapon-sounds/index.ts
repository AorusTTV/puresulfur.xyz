import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { weaponType } = await req.json()
    
    if (!weaponType) {
      throw new Error('Weapon type is required')
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    // Define sound descriptions based on weapon type
    const soundPrompts = {
      'explosive': 'A powerful explosion sound with a deep boom and echoing blast',
      'automatic': 'Three rapid gunshots from an automatic rifle with muzzle flash sounds',
      'sniper': 'A single precise rifle shot with a sharp crack and echo',
      'melee': 'A swift sword swinging through the air with a swoosh sound'
    }

    const prompt = soundPrompts[weaponType] || soundPrompts['sniper']

    // Generate sound effect using ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/iP95p4xoKVk53GoZ742B', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: prompt,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.5,
          use_speaker_boost: true
        }
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`ElevenLabs API error: ${error}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        weaponType: weaponType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error generating weapon sound:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})