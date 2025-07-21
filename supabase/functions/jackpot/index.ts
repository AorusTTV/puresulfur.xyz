
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, gameId, amount } = await req.json()

    if (action === 'join') {
      // Get auth header
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders })
      }

      // Get user from auth token
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )

      if (authError || !user) {
        return new Response('Unauthorized', { status: 401, headers: corsHeaders })
      }

      // Get current active game
      const { data: game, error: gameError } = await supabase
        .from('jackpot_games')
        .select('*')
        .eq('id', gameId)
        .eq('status', 'active')
        .single()

      if (gameError || !game) {
        return new Response('Game not found or not active', { status: 404, headers: corsHeaders })
      }

      // Check user balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || profile.balance < amount) {
        return new Response('Insufficient balance', { status: 400, headers: corsHeaders })
      }

      // Start transaction
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ balance: profile.balance - amount })
        .eq('id', user.id)

      if (deductError) {
        throw deductError
      }

      // Add entry to jackpot
      const { error: entryError } = await supabase.rpc('add_jackpot_entry', {
        p_game_id: gameId,
        p_user_id: user.id,
        p_amount: amount
      })

      if (entryError) {
        throw entryError
      }

      return new Response('Successfully joined jackpot', { headers: corsHeaders })
    }

    if (action === 'end') {
      // End the game and determine winner
      const { data: result, error: endError } = await supabase.rpc('end_jackpot_game', {
        p_game_id: gameId
      })

      if (endError) {
        throw endError
      }

      return new Response(JSON.stringify(result), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    return new Response('Invalid action', { status: 400, headers: corsHeaders })

  } catch (error) {
    console.error('Error:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
