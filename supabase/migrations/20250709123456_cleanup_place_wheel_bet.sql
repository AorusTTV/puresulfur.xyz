-- Remove all overloaded/duplicate versions of place_wheel_bet
DROP FUNCTION IF EXISTS public.place_wheel_bet(uuid, numeric, text, numeric);

-- Re-create the correct version (copy the latest/correct function here)
CREATE OR REPLACE FUNCTION public.place_wheel_bet(
    p_user_id UUID,
    p_bet_amount NUMERIC,
    p_bet_color TEXT,
    p_multiplier NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_game_id UUID;
    v_user_balance NUMERIC;
    v_potential_payout NUMERIC;
    v_bet_id UUID;
    v_game_status TEXT;
BEGIN
    -- Check if user is banned
    IF public.is_user_currently_banned(p_user_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Your account has been banned from the platform');
    END IF;

    -- Check user balance
    SELECT balance INTO v_user_balance 
    FROM public.profiles 
    WHERE id = p_user_id;

    IF v_user_balance IS NULL OR v_user_balance < p_bet_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
    END IF;

    -- Get or create active game
    SELECT public.get_or_create_active_wheel_game() INTO v_game_id;

    -- Check if game is still active (not spinning or completed)
    SELECT status INTO v_game_status 
    FROM public.wheel_games 
    WHERE id = v_game_id;

    IF v_game_status != 'active' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Game is not accepting bets');
    END IF;

    -- Calculate potential payout
    v_potential_payout := p_bet_amount * p_multiplier;

    -- Place the bet
    INSERT INTO public.wheel_bets (
        game_id, user_id, bet_amount, bet_color, multiplier, potential_payout
    )
    VALUES (
        v_game_id, p_user_id, p_bet_amount, p_bet_color, p_multiplier, v_potential_payout
    )
    RETURNING id INTO v_bet_id;

    -- Deduct from user balance instantly
    UPDATE public.profiles 
    SET balance = balance - p_bet_amount
    WHERE id = p_user_id;

    -- Update game total bets
    UPDATE public.wheel_games 
    SET total_bets = total_bets + p_bet_amount
    WHERE id = v_game_id;

    -- Add to user wagers for tracking and experience
    INSERT INTO public.user_wagers (user_id, amount, game_type, description)
    VALUES (p_user_id, p_bet_amount, 'wheel', 'Wheel of Fortune bet on ' || p_bet_color);

    -- Add experience for wagering (5 XP per $0.01 wagered)
    PERFORM public.add_experience(p_user_id, p_bet_amount);

    RETURN jsonb_build_object(
        'success', true,
        'bet_id', v_bet_id,
        'game_id', v_game_id,
        'remaining_balance', v_user_balance - p_bet_amount
    );
END;
$$;


DROP FUNCTION IF EXISTS create_crate_battle(uuid, numeric, integer, text, text, jsonb);
-- Create or replace the create_crate_battle function to expect p_crates as [{crate_id, quantity}]
CREATE OR REPLACE FUNCTION public.create_crate_battle(
    p_creator_id uuid,
    p_total_value numeric,
    p_player_count integer,
    p_game_mode text,
    p_team_mode text,
    p_crates jsonb
)
RETURNS TABLE (
    id uuid,
    creator_id uuid,
    total_value numeric,
    player_count integer,
    game_mode text,
    team_mode text,
    crates jsonb,
    status text,
    created_at timestamptz,
    started_at timestamptz,
    players jsonb
)
LANGUAGE plpgsql
AS $$
DECLARE
    temp_battle_id uuid;
BEGIN
    -- Insert the new battle and get its id
    INSERT INTO crate_battles (
        creator_id, total_value, player_count, game_mode, team_mode, crates, status, created_at
    )
    VALUES (
        p_creator_id, p_total_value, p_player_count, p_game_mode, p_team_mode, p_crates, 'waiting', NOW()
    )
    RETURNING id INTO temp_battle_id;

    -- Insert the creator as the first player
    INSERT INTO crate_battle_players (battle_id, user_id, slot_number)
    VALUES (temp_battle_id, p_creator_id, 1)
    ON CONFLICT DO NOTHING;

    -- Return the full battle row with players array
    RETURN QUERY
        SELECT
            cb.id,
            cb.creator_id,
            cb.total_value,
            cb.player_count,
            cb.game_mode,
            cb.team_mode,
            cb.crates,
            cb.status,
            cb.created_at,
            cb.started_at,
            (
                SELECT COALESCE(jsonb_agg(jsonb_build_object(
                    'user_id', p.user_id,
                    'slot_number', p.slot_number
                )), '[]'::jsonb)
                FROM crate_battle_players p
                WHERE p.battle_id = cb.id
            ) AS players
        FROM crate_battles cb
        WHERE cb.id = temp_battle_id;
END;
$$;

-- Example: How to unnest and select crate_id and quantity from the crates column
-- SELECT value->>'crate_id' AS crate_id, (value->>'quantity')::int AS quantity
-- FROM crate_battles, LATERAL jsonb_array_elements(crates) AS crate(value)
-- WHERE id = 'YOUR_BATTLE_ID';
