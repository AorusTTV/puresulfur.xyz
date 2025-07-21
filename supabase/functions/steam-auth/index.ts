import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const redirectTo = url.searchParams.get('redirect_to') || 'https://5504134f-c31d-4d3f-804d-f210ad0f0546.lovableproject.com';

    console.log('[STEAM-AUTH] Request received:', { 
      action, 
      redirectTo, 
      method: req.method,
      userAgent: req.headers.get('user-agent'),
      origin: req.headers.get('origin')
    });

    if (action === 'login') {
      // Validate redirect URL
      try {
        const redirectUrl = new URL(redirectTo);
        console.log('[STEAM-AUTH] Validated redirect URL:', redirectUrl.toString());
      } catch (error) {
        console.error('[STEAM-AUTH] Invalid redirect URL:', redirectTo);
        return new Response(JSON.stringify({ error: 'Invalid redirect URL' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create the proper callback URL
      const baseUrl = Deno.env.get('SUPABASE_URL') + '/functions/v1/steam-auth';
      const callbackUrl = `${baseUrl}?action=callback&redirect_to=${encodeURIComponent(redirectTo)}`;
      
      console.log('[STEAM-AUTH] Using callback URL:', callbackUrl);
      
      // Generate Steam OpenID URL
      const steamOpenIdUrl = new URL('https://steamcommunity.com/openid/login');
      
      const params = {
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': callbackUrl,
        'openid.realm': new URL(baseUrl).origin,
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
      };

      Object.entries(params).forEach(([key, value]) => {
        steamOpenIdUrl.searchParams.set(key, value);
      });

      console.log('[STEAM-AUTH] Redirecting to Steam OpenID:', steamOpenIdUrl.toString());
      return Response.redirect(steamOpenIdUrl.toString(), 302);
    }

    if (action === 'callback') {
      console.log('[STEAM-AUTH] Processing Steam callback');
      
      const finalRedirectUrl = url.searchParams.get('redirect_to') || 'https://5504134f-c31d-4d3f-804d-f210ad0f0546.lovableproject.com';
      
      // Get all OpenID parameters
      const openidParams = Object.fromEntries(url.searchParams.entries());
      console.log('[STEAM-AUTH] Steam callback params received:', Object.keys(openidParams));
      
      // Check if this is a successful Steam response
      if (!openidParams['openid.claimed_id'] || !openidParams['openid.identity']) {
        console.log('[STEAM-AUTH] No Steam ID found, redirecting with error');
        return Response.redirect(`${finalRedirectUrl}?error=steam_auth_failed&reason=no_steam_id`, 302);
      }
      
      // Extract Steam ID from claimed_id
      const steamId = openidParams['openid.claimed_id'].split('/').pop() || 
                     openidParams['openid.identity'].split('/').pop();
      
      if (!steamId || steamId.length < 10) {
        console.log('[STEAM-AUTH] Invalid Steam ID format:', steamId);
        return Response.redirect(`${finalRedirectUrl}?error=steam_auth_failed&reason=invalid_steam_id`, 302);
      }

      console.log('[STEAM-AUTH] Steam ID extracted:', steamId);

      // Verify with Steam
      try {
        const verifyParams = { ...openidParams, 'openid.mode': 'check_authentication' };
        const verifyFormData = new URLSearchParams();
        Object.entries(verifyParams).forEach(([key, value]) => {
          if (typeof value === 'string') {
            verifyFormData.append(key, value);
          }
        });

        console.log('[STEAM-AUTH] Verifying with Steam...');
        const verifyResponse = await fetch('https://steamcommunity.com/openid/login', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'PureSulfur-Steam-Auth/1.0'
          },
          body: verifyFormData.toString()
        });
        
        const verifyText = await verifyResponse.text();
        console.log('[STEAM-AUTH] Steam verification response:', verifyText);
        
        if (!verifyText.includes('is_valid:true')) {
          console.log('[STEAM-AUTH] Steam verification failed');
          return Response.redirect(`${finalRedirectUrl}?error=steam_auth_failed&reason=verification_failed`, 302);
        }
      } catch (verifyError) {
        console.error('[STEAM-AUTH] Steam verification error:', verifyError);
        return Response.redirect(`${finalRedirectUrl}?error=steam_auth_failed&reason=verification_error`, 302);
      }

      // Initialize Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[STEAM-AUTH] Missing Supabase configuration');
        return Response.redirect(`${finalRedirectUrl}?error=steam_auth_failed&reason=config_missing`, 302);
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get Steam user info from Steam API with priority on avatarfull
      let steamUserData = {
        steam_id: steamId,
        steam_username: `Player_${steamId}`,
        avatar_url: null
      };

      const steamApiKey = Deno.env.get('STEAM_API_KEY');
      if (steamApiKey) {
        try {
          console.log('[STEAM-AUTH] Fetching Steam user data with avatar...');
          const steamApiResponse = await fetch(
            `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`
          );
          
          if (steamApiResponse.ok) {
            const steamData = await steamApiResponse.json();
            
            if (steamData.response?.players?.[0]) {
              const player = steamData.response.players[0];
              // Priority: avatarfull (184x184) > avatarmedium (64x64) > avatar (32x32)
              const avatarUrl = player.avatarfull || player.avatarmedium || player.avatar || null;
              
              steamUserData = {
                steam_id: steamId,
                steam_username: player.personaname || `Player_${steamId}`,
                // Ensure HTTPS for avatar URL to prevent mixed content issues
                avatar_url: avatarUrl ? avatarUrl.replace('http://', 'https://') : null
              };
              // --- BEGIN: Fetch steam_level and owns_rust ---
              // Fetch Steam level
              let steamLevel = null;
              try {
                const levelRes = await fetch(
                  `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${steamApiKey}&steamid=${steamId}`
                );
                const levelData = await levelRes.json();
                steamLevel = levelData.response?.player_level ?? null;
              } catch (e) {
                console.log('[STEAM-AUTH] Failed to fetch Steam level:', e);
              }
              // Fetch owned games to check for Rust (appid 252490)
              let ownsRust = false;
              try {
                const gamesRes = await fetch(
                  `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamApiKey}&steamid=${steamId}&include_appinfo=false`
                );
                const gamesData = await gamesRes.json();
                 if(gamesData.response?.game_count > 0) {ownsRust = true;}
              } catch (e) {
                console.log('[STEAM-AUTH] Failed to fetch owned games:', e);
              }
              steamUserData.steam_level = steamLevel;
              steamUserData.owns_rust = ownsRust;
              // --- END: Fetch steam_level and owns_rust ---
              console.log('[STEAM-AUTH] Steam API data retrieved with avatar, level, owns_rust:', steamUserData);
            } else {
              console.log('[STEAM-AUTH] No player data in Steam API response');
            }
          } else {
            console.log('[STEAM-AUTH] Steam API request failed:', steamApiResponse.status, steamApiResponse.statusText);
          }
        } catch (apiError) {
          console.log('[STEAM-AUTH] Steam API error (non-critical):', apiError);
        }
      } else {
        console.log('[STEAM-AUTH] No Steam API key configured, using basic user data');
      }

      // Check for existing user by Steam ID
      const { data: existingUsers, error: userFetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('steam_id', steamId)
        .limit(1);
      
      if (userFetchError) {
        console.error('[STEAM-AUTH] Error fetching existing user:', userFetchError);
        return Response.redirect(`${finalRedirectUrl}?error=steam_auth_failed&reason=database_error`, 302);
      }

      let userId = null;

      if (existingUsers && existingUsers.length > 0) {
        userId = existingUsers[0].id;
        console.log('[STEAM-AUTH] Found existing user, updating avatar:', userId);
        // Always update Steam data including avatar_url, steam_level, owns_rust
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            steam_username: steamUserData.steam_username,
            avatar_url: steamUserData.avatar_url,
            steam_level: steamUserData.steam_level,
            owns_rust: steamUserData.owns_rust
          })
          .eq('id', userId);
        if (updateError) {
          console.error('[STEAM-AUTH] Error updating user profile:', updateError);
        } else {
          console.log('[STEAM-AUTH] Successfully updated user avatar, level, owns_rust:', steamUserData.avatar_url, steamUserData.steam_level, steamUserData.owns_rust);
        }
        // Optionally update user_metadata as well
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: steamUserData
        });
      } else {
        console.log('[STEAM-AUTH] Creating new user with avatar');
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: `${steamId}@steam.local`,
          user_metadata: steamUserData,
          email_confirm: true
        });
        if (authError) {
          console.error('[STEAM-AUTH] User creation failed:', authError);
          return Response.redirect(`${finalRedirectUrl}?error=steam_auth_failed&reason=user_creation_failed`, 302);
        }
        userId = authData.user.id;
        console.log('[STEAM-AUTH] Created new user:', userId);
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            steam_id: steamId,
            steam_username: steamUserData.steam_username,
            avatar_url: steamUserData.avatar_url,
            steam_level: steamUserData.steam_level,
            owns_rust: steamUserData.owns_rust,
            balance: 0.00,
            nickname: steamUserData.steam_username
          });
        if (profileError) {
          console.error('[STEAM-AUTH] Profile creation error:', profileError);
        } else {
          console.log('[STEAM-AUTH] Successfully created user with avatar, level, owns_rust:', steamUserData.avatar_url, steamUserData.steam_level, steamUserData.owns_rust);
        }
      }

      console.log('[STEAM-AUTH] Generating magic link for user:', userId);
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `${steamId}@steam.local`,
        options: {
          redirectTo: finalRedirectUrl
        }
      });

      if (sessionError || !sessionData.properties?.action_link) {
        console.error('[STEAM-AUTH] Session generation failed:', sessionError);
        return Response.redirect(`${finalRedirectUrl}?error=steam_auth_failed&reason=session_failed`, 302);
      }
      
      console.log('[STEAM-AUTH] Redirecting to auto-login for user:', userId);
      return Response.redirect(sessionData.properties.action_link, 302);
    }

    console.log('[STEAM-AUTH] Invalid action received:', action);
    return new Response(JSON.stringify({ error: 'Invalid action' }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[STEAM-AUTH] Unexpected error:', error);
    const redirectUrl = new URL(req.url).searchParams.get('redirect_to') || 'https://5504134f-c31d-4d3f-804d-f210ad0f0546.lovableproject.com';
    return Response.redirect(`${redirectUrl}?error=steam_auth_failed&reason=server_error`, 302);
  }
})
