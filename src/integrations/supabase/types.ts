export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_messages: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          message: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          message: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          message?: string
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          total_earnings: number
          total_referral_value: number | null
          total_referrals: number
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          total_earnings?: number
          total_referral_value?: number | null
          total_referrals?: number
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          total_earnings?: number
          total_referral_value?: number | null
          total_referrals?: number
          user_id?: string
        }
        Relationships: []
      }
      affiliate_commissions: {
        Row: {
          commission_amount: number
          commission_rate: number
          created_at: string
          id: string
          paid_at: string | null
          referral_id: string
          status: string
          wager_amount: number
        }
        Insert: {
          commission_amount: number
          commission_rate: number
          created_at?: string
          id?: string
          paid_at?: string | null
          referral_id: string
          status?: string
          wager_amount: number
        }
        Update: {
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          referral_id?: string
          status?: string
          wager_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "affiliate_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_code_id: string
          commission_earned: number
          created_at: string
          id: string
          referred_user_id: string
          referrer_user_id: string
          status: string
        }
        Insert: {
          affiliate_code_id: string
          commission_earned?: number
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_user_id: string
          status?: string
        }
        Update: {
          affiliate_code_id?: string
          commission_earned?: number
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_user_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_code_id_fkey"
            columns: ["affiliate_code_id"]
            isOneToOne: false
            referencedRelation: "affiliate_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_crate_items: {
        Row: {
          crate_id: string
          created_at: string
          drop_chance: number
          id: string
          image_url: string | null
          name: string
          rarity: string
          updated_at: string
          value: number
        }
        Insert: {
          crate_id: string
          created_at?: string
          drop_chance?: number
          id?: string
          image_url?: string | null
          name: string
          rarity?: string
          updated_at?: string
          value?: number
        }
        Update: {
          crate_id?: string
          created_at?: string
          drop_chance?: number
          id?: string
          image_url?: string | null
          name?: string
          rarity?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_crate_items_crate_id_fkey"
            columns: ["crate_id"]
            isOneToOne: false
            referencedRelation: "battle_crates"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_crates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          max_value: number
          min_value: number
          name: string
          price: number
          rarity: string
          risk_level: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_value?: number
          min_value?: number
          name: string
          price?: number
          rarity?: string
          risk_level?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_value?: number
          min_value?: number
          name?: string
          price?: number
          rarity?: string
          risk_level?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_crates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_crates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_global_message: boolean
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_global_message?: boolean
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_global_message?: boolean
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_chat_messages_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chat_messages_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rate_limits: {
        Row: {
          created_at: string
          id: string
          message_count: number
          updated_at: string
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_count?: number
          updated_at?: string
          user_id: string
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_count?: number
          updated_at?: string
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      code_redemptions: {
        Row: {
          balance_received: number
          code_id: string
          id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          balance_received?: number
          code_id: string
          id?: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          balance_received?: number
          code_id?: string
          id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "promotional_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      coinflip_games: {
        Row: {
          completed_at: string | null
          created_at: string
          creator_bet_amount: number
          creator_entry_type: string
          creator_id: string
          creator_item_id: string | null
          creator_side: string
          id: string
          joiner_bet_amount: number | null
          joiner_entry_type: string | null
          joiner_id: string | null
          joiner_item_id: string | null
          joiner_side: string | null
          status: string
          total_value: number
          winner_id: string | null
          winning_side: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          creator_bet_amount: number
          creator_entry_type: string
          creator_id: string
          creator_item_id?: string | null
          creator_side: string
          id?: string
          joiner_bet_amount?: number | null
          joiner_entry_type?: string | null
          joiner_id?: string | null
          joiner_item_id?: string | null
          joiner_side?: string | null
          status?: string
          total_value?: number
          winner_id?: string | null
          winning_side?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          creator_bet_amount?: number
          creator_entry_type?: string
          creator_id?: string
          creator_item_id?: string | null
          creator_side?: string
          id?: string
          joiner_bet_amount?: number | null
          joiner_entry_type?: string | null
          joiner_id?: string | null
          joiner_item_id?: string | null
          joiner_side?: string | null
          status?: string
          total_value?: number
          winner_id?: string | null
          winning_side?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coinflip_games_creator_item_id_fkey"
            columns: ["creator_item_id"]
            isOneToOne: false
            referencedRelation: "user_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coinflip_games_joiner_item_id_fkey"
            columns: ["joiner_item_id"]
            isOneToOne: false
            referencedRelation: "user_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      crash_bets: {
        Row: {
          auto_cashout: number | null
          bet_amount: number
          cashed_out_at: string | null
          cashout_at: number | null
          created_at: string | null
          game_id: string
          id: string
          placed_at: string | null
          status: string
          user_id: string
          win_amount: number | null
        }
        Insert: {
          auto_cashout?: number | null
          bet_amount: number
          cashed_out_at?: string | null
          cashout_at?: number | null
          created_at?: string | null
          game_id: string
          id?: string
          placed_at?: string | null
          status?: string
          user_id: string
          win_amount?: number | null
        }
        Update: {
          auto_cashout?: number | null
          bet_amount?: number
          cashed_out_at?: string | null
          cashout_at?: number | null
          created_at?: string | null
          game_id?: string
          id?: string
          placed_at?: string | null
          status?: string
          user_id?: string
          win_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crash_bets_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "crash_games"
            referencedColumns: ["id"]
          },
        ]
      }
      crash_games: {
        Row: {
          client_seed: string | null
          crash_point: number | null
          crash_time: string | null
          created_at: string | null
          game_round: string
          hash: string
          id: string
          nonce: number
          server_seed: string
          start_time: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          client_seed?: string | null
          crash_point?: number | null
          crash_time?: string | null
          created_at?: string | null
          game_round: string
          hash: string
          id?: string
          nonce?: number
          server_seed: string
          start_time?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_seed?: string | null
          crash_point?: number | null
          crash_time?: string | null
          created_at?: string | null
          game_round?: string
          hash?: string
          id?: string
          nonce?: number
          server_seed?: string
          start_time?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      crate_battle_players: {
        Row: {
          battle_id: string
          bot_name: string | null
          id: string
          is_bot: boolean
          joined_at: string
          paid_amount: number
          slot_number: number
          team: string | null
          user_id: string | null
          winning_item: Json | null
        }
        Insert: {
          battle_id: string
          bot_name?: string | null
          id?: string
          is_bot?: boolean
          joined_at?: string
          paid_amount?: number
          slot_number: number
          team?: string | null
          user_id?: string | null
          winning_item?: Json | null
        }
        Update: {
          battle_id?: string
          bot_name?: string | null
          id?: string
          is_bot?: boolean
          joined_at?: string
          paid_amount?: number
          slot_number?: number
          team?: string | null
          user_id?: string | null
          winning_item?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "crate_battle_players_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "crate_battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crate_battle_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crate_battle_players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crate_battles: {
        Row: {
          completed_at: string | null
          crates: Json
          created_at: string
          creator_id: string
          game_mode: string
          id: string
          player_count: number
          started_at: string | null
          status: string
          team_mode: string
          total_value: number
          winner_id: string | null
          winning_items: Json | null
        }
        Insert: {
          completed_at?: string | null
          crates: Json
          created_at?: string
          creator_id: string
          game_mode?: string
          id?: string
          player_count: number
          started_at?: string | null
          status?: string
          team_mode?: string
          total_value?: number
          winner_id?: string | null
          winning_items?: Json | null
        }
        Update: {
          completed_at?: string | null
          crates?: Json
          created_at?: string
          creator_id?: string
          game_mode?: string
          id?: string
          player_count?: number
          started_at?: string | null
          status?: string
          team_mode?: string
          total_value?: number
          winner_id?: string | null
          winning_items?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "crate_battles_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crate_battles_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crate_battles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crate_battles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_case_openings: {
        Row: {
          case_type: string
          created_at: string | null
          date_gmt3: string
          id: string
          opened_at: string | null
          user_id: string
          won_item_value: number | null
        }
        Insert: {
          case_type?: string
          created_at?: string | null
          date_gmt3: string
          id?: string
          opened_at?: string | null
          user_id: string
          won_item_value?: number | null
        }
        Update: {
          case_type?: string
          created_at?: string | null
          date_gmt3?: string
          id?: string
          opened_at?: string | null
          user_id?: string
          won_item_value?: number | null
        }
        Relationships: []
      }
      dual_games: {
        Row: {
          battle_result: Json | null
          completed_at: string | null
          created_at: string
          creator_bet_amount: number
          creator_entry_type: string
          creator_id: string
          creator_item_id: string | null
          creator_side: string
          creator_weapon_id: string | null
          id: string
          joiner_bet_amount: number | null
          joiner_entry_type: string | null
          joiner_id: string | null
          joiner_item_id: string | null
          joiner_side: string | null
          joiner_weapon_id: string | null
          status: string
          total_value: number
          winner_id: string | null
        }
        Insert: {
          battle_result?: Json | null
          completed_at?: string | null
          created_at?: string
          creator_bet_amount: number
          creator_entry_type: string
          creator_id: string
          creator_item_id?: string | null
          creator_side?: string
          creator_weapon_id?: string | null
          id?: string
          joiner_bet_amount?: number | null
          joiner_entry_type?: string | null
          joiner_id?: string | null
          joiner_item_id?: string | null
          joiner_side?: string | null
          joiner_weapon_id?: string | null
          status?: string
          total_value?: number
          winner_id?: string | null
        }
        Update: {
          battle_result?: Json | null
          completed_at?: string | null
          created_at?: string
          creator_bet_amount?: number
          creator_entry_type?: string
          creator_id?: string
          creator_item_id?: string | null
          creator_side?: string
          creator_weapon_id?: string | null
          id?: string
          joiner_bet_amount?: number | null
          joiner_entry_type?: string | null
          joiner_id?: string | null
          joiner_item_id?: string | null
          joiner_side?: string | null
          joiner_weapon_id?: string | null
          status?: string
          total_value?: number
          winner_id?: string | null
        }
        Relationships: []
      }
      dual_weapons: {
        Row: {
          accuracy: number
          created_at: string
          damage: number
          fire_rate: number
          id: string
          image_url: string
          name: string
          rarity: string
          weapon_type: string
        }
        Insert: {
          accuracy: number
          created_at?: string
          damage: number
          fire_rate: number
          id?: string
          image_url: string
          name: string
          rarity?: string
          weapon_type?: string
        }
        Update: {
          accuracy?: number
          created_at?: string
          damage?: number
          fire_rate?: number
          id?: string
          image_url?: string
          name?: string
          rarity?: string
          weapon_type?: string
        }
        Relationships: []
      }
      game_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          max_entry: number
          min_entry: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          image_url?: string | null
          is_active?: boolean
          max_entry?: number
          min_entry?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_entry?: number
          min_entry?: number
          name?: string
        }
        Relationships: []
      }
      jackpot_entries: {
        Row: {
          created_at: string
          entry_type: string
          game_id: string
          id: string
          item_id: string | null
          ticket_end: number
          ticket_start: number
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          entry_type: string
          game_id: string
          id?: string
          item_id?: string | null
          ticket_end: number
          ticket_start: number
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          entry_type?: string
          game_id?: string
          id?: string
          item_id?: string | null
          ticket_end?: number
          ticket_start?: number
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "jackpot_entries_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "jackpot_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jackpot_entries_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      jackpot_games: {
        Row: {
          completed_at: string | null
          created_at: string
          house_fee: number | null
          id: string
          status: string
          total_value: number
          winner_id: string | null
          winner_prize: number | null
          winning_ticket: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          house_fee?: number | null
          id?: string
          status?: string
          total_value?: number
          winner_id?: string | null
          winner_prize?: number | null
          winning_ticket?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          house_fee?: number | null
          id?: string
          status?: string
          total_value?: number
          winner_id?: string | null
          winner_prize?: number | null
          winning_ticket?: number | null
        }
        Relationships: []
      }
      leaderboard_periods: {
        Row: {
          completed_at: string | null
          created_at: string
          end_date: string
          id: string
          start_date: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          end_date: string
          id?: string
          start_date: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: string
        }
        Relationships: []
      }
      leaderboard_prizes: {
        Row: {
          created_at: string
          id: string
          prize_amount: number
          rank: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          prize_amount?: number
          rank: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          prize_amount?: number
          rank?: number
          updated_at?: string
        }
        Relationships: []
      }
      level_gift_claims: {
        Row: {
          claimed_at: string
          gift_id: string
          id: string
          item_id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          gift_id: string
          id?: string
          item_id: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          gift_id?: string
          id?: string
          item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "level_gift_claims_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "level_up_gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "level_gift_claims_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "level_gift_items"
            referencedColumns: ["id"]
          },
        ]
      }
      level_gift_items: {
        Row: {
          created_at: string
          id: string
          image_url: string
          name: string
          price: number
          probability: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          name: string
          price: number
          probability: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          price?: number
          probability?: number
        }
        Relationships: []
      }
      level_up_gifts: {
        Row: {
          claimed: boolean | null
          created_at: string
          id: string
          level: number
          sulfur_amount: number
          user_id: string
        }
        Insert: {
          claimed?: boolean | null
          created_at?: string
          id?: string
          level: number
          sulfur_amount: number
          user_id: string
        }
        Update: {
          claimed?: boolean | null
          created_at?: string
          id?: string
          level?: number
          sulfur_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      level_xp_requirements: {
        Row: {
          level: number
          required_exp: number
        }
        Insert: {
          level: number
          required_exp: number
        }
        Update: {
          level?: number
          required_exp?: number
        }
        Relationships: []
      }
      minefield_bets: {
        Row: {
          bet_amount: number
          cells_revealed: number
          completed_at: string | null
          created_at: string
          game_seed: string
          game_status: string
          id: string
          mine_count: number
          mine_positions: number[]
          multiplier: number
          revealed_positions: number[]
          user_id: string
          win_amount: number
        }
        Insert: {
          bet_amount: number
          cells_revealed?: number
          completed_at?: string | null
          created_at?: string
          game_seed: string
          game_status?: string
          id?: string
          mine_count: number
          mine_positions: number[]
          multiplier?: number
          revealed_positions?: number[]
          user_id: string
          win_amount?: number
        }
        Update: {
          bet_amount?: number
          cells_revealed?: number
          completed_at?: string | null
          created_at?: string
          game_seed?: string
          game_status?: string
          id?: string
          mine_count?: number
          mine_positions?: number[]
          multiplier?: number
          revealed_positions?: number[]
          user_id?: string
          win_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "minefield_bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "minefield_bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_providers: {
        Row: {
          configuration: Json | null
          created_at: string
          display_name: string
          id: string
          is_enabled: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          display_name: string
          id?: string
          is_enabled?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          display_name?: string
          id?: string
          is_enabled?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          provider: string
          provider_payment_id: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          provider_payment_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          provider_payment_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      plinko_bets: {
        Row: {
          bet_amount: number
          created_at: string
          game_mode: string
          id: string
          multiplier: number
          slot_index: number
          user_id: string
          win_amount: number
        }
        Insert: {
          bet_amount: number
          created_at?: string
          game_mode?: string
          id?: string
          multiplier: number
          slot_index: number
          user_id: string
          win_amount?: number
        }
        Update: {
          bet_amount?: number
          created_at?: string
          game_mode?: string
          id?: string
          multiplier?: number
          slot_index?: number
          user_id?: string
          win_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "plinko_bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plinko_bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      private_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      prize_distributions: {
        Row: {
          distributed_at: string
          id: string
          period_id: string
          prize_amount: number
          rank: number
          user_id: string
        }
        Insert: {
          distributed_at?: string
          id?: string
          period_id: string
          prize_amount: number
          rank: number
          user_id: string
        }
        Update: {
          distributed_at?: string
          id?: string
          period_id?: string
          prize_amount?: number
          rank?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prize_distributions_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prize_distributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prize_distributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          affiliate_code_changed_at: string | null
          affiliate_code_used: string | null
          age_verified: boolean | null
          api_key: string | null
          avatar_url: string | null
          balance: number | null
          birth_date: string | null
          created_at: string | null
          experience: number | null
          id: string
          is_banned: boolean | null
          joined_discord: boolean | null
          jurisdiction_confirmed: boolean | null
          leaderboard_disabled: boolean | null
          level: number | null
          nickname: string | null
          owns_rust: boolean | null
          referred_by: string | null
          steam_id: string | null
          steam_level: number | null
          steam_trade_url: string | null
          steam_username: string | null
          terms_accepted_at: string | null
          total_wagered: number | null
          updated_at: string | null
        }
        Insert: {
          affiliate_code_changed_at?: string | null
          affiliate_code_used?: string | null
          age_verified?: boolean | null
          api_key?: string | null
          avatar_url?: string | null
          balance?: number | null
          birth_date?: string | null
          created_at?: string | null
          experience?: number | null
          id: string
          is_banned?: boolean | null
          joined_discord?: boolean | null
          jurisdiction_confirmed?: boolean | null
          leaderboard_disabled?: boolean | null
          level?: number | null
          nickname?: string | null
          owns_rust?: boolean | null
          referred_by?: string | null
          steam_id?: string | null
          steam_level?: number | null
          steam_trade_url?: string | null
          steam_username?: string | null
          terms_accepted_at?: string | null
          total_wagered?: number | null
          updated_at?: string | null
        }
        Update: {
          affiliate_code_changed_at?: string | null
          affiliate_code_used?: string | null
          age_verified?: boolean | null
          api_key?: string | null
          avatar_url?: string | null
          balance?: number | null
          birth_date?: string | null
          created_at?: string | null
          experience?: number | null
          id?: string
          is_banned?: boolean | null
          joined_discord?: boolean | null
          jurisdiction_confirmed?: boolean | null
          leaderboard_disabled?: boolean | null
          level?: number | null
          nickname?: string | null
          owns_rust?: boolean | null
          referred_by?: string | null
          steam_id?: string | null
          steam_level?: number | null
          steam_trade_url?: string | null
          steam_username?: string | null
          terms_accepted_at?: string | null
          total_wagered?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promotional_codes: {
        Row: {
          balance_amount: number
          code: string
          created_at: string
          created_by: string
          current_uses: number
          expires_at: string
          id: string
          is_active: boolean
          max_uses: number
          updated_at: string
        }
        Insert: {
          balance_amount?: number
          code: string
          created_at?: string
          created_by: string
          current_uses?: number
          expires_at: string
          id?: string
          is_active?: boolean
          max_uses?: number
          updated_at?: string
        }
        Update: {
          balance_amount?: number
          code?: string
          created_at?: string
          created_by?: string
          current_uses?: number
          expires_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number
          updated_at?: string
        }
        Relationships: []
      }
      steam_bot_inventory: {
        Row: {
          balance_price: number | null
          bot_id: string
          created_at: string
          deposit_value: number | null
          deposited_at: string | null
          exterior: string | null
          icon_url: string | null
          id: string
          last_synced: string
          market_hash_name: string
          market_price_usd: number | null
          marketable: boolean
          name: string | null
          price_last_updated: string | null
          rarity_color: string | null
          status: string | null
          steam_item_id: string
          tradable: boolean
        }
        Insert: {
          balance_price?: number | null
          bot_id: string
          created_at?: string
          deposit_value?: number | null
          deposited_at?: string | null
          exterior?: string | null
          icon_url?: string | null
          id?: string
          last_synced?: string
          market_hash_name: string
          market_price_usd?: number | null
          marketable?: boolean
          name?: string | null
          price_last_updated?: string | null
          rarity_color?: string | null
          status?: string | null
          steam_item_id: string
          tradable?: boolean
        }
        Update: {
          balance_price?: number | null
          bot_id?: string
          created_at?: string
          deposit_value?: number | null
          deposited_at?: string | null
          exterior?: string | null
          icon_url?: string | null
          id?: string
          last_synced?: string
          market_hash_name?: string
          market_price_usd?: number | null
          marketable?: boolean
          name?: string | null
          price_last_updated?: string | null
          rarity_color?: string | null
          status?: string | null
          steam_item_id?: string
          tradable?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "steam_bot_inventory_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "steam_bots"
            referencedColumns: ["id"]
          },
        ]
      }
      steam_bots: {
        Row: {
          api_key: string
          api_key_encrypted: string | null
          avatar_url: string | null
          created_at: string
          id: string
          identity_secret_encrypted: string | null
          is_active: boolean
          is_logged_in: boolean | null
          label: string
          last_login_attempt: string | null
          last_status: string
          last_sync: string | null
          password_encrypted: string | null
          session_cookie: string | null
          shared_secret_encrypted: string | null
          steam_id: string
          steam_login: string | null
          steam_username: string
          trade_url: string
          updated_at: string
        }
        Insert: {
          api_key: string
          api_key_encrypted?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          identity_secret_encrypted?: string | null
          is_active?: boolean
          is_logged_in?: boolean | null
          label?: string
          last_login_attempt?: string | null
          last_status?: string
          last_sync?: string | null
          password_encrypted?: string | null
          session_cookie?: string | null
          shared_secret_encrypted?: string | null
          steam_id: string
          steam_login?: string | null
          steam_username: string
          trade_url: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          api_key_encrypted?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          identity_secret_encrypted?: string | null
          is_active?: boolean
          is_logged_in?: boolean | null
          label?: string
          last_login_attempt?: string | null
          last_status?: string
          last_sync?: string | null
          password_encrypted?: string | null
          session_cookie?: string | null
          shared_secret_encrypted?: string | null
          steam_id?: string
          steam_login?: string | null
          steam_username?: string
          trade_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      steam_deposits: {
        Row: {
          completed_at: string | null
          created_at: string | null
          deposit_value: number
          id: string
          market_hash_name: string
          market_price: number
          notes: string | null
          quantity: number
          status: string
          steam_item_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          deposit_value: number
          id?: string
          market_hash_name: string
          market_price: number
          notes?: string | null
          quantity?: number
          status?: string
          steam_item_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          deposit_value?: number
          id?: string
          market_hash_name?: string
          market_price?: number
          notes?: string | null
          quantity?: number
          status?: string
          steam_item_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "steam_deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "steam_deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      steam_trade_offers: {
        Row: {
          accepted_at: string | null
          bot_id: string | null
          confirmation_method: string | null
          created_at: string | null
          credits_offered: number | null
          declined_at: string | null
          direction: string
          expires_at: string | null
          id: string
          items_to_give: Json | null
          items_to_receive: Json | null
          status: string | null
          steam_status: number | null
          steam_trade_id: string | null
          trade_offer_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          bot_id?: string | null
          confirmation_method?: string | null
          created_at?: string | null
          credits_offered?: number | null
          declined_at?: string | null
          direction: string
          expires_at?: string | null
          id?: string
          items_to_give?: Json | null
          items_to_receive?: Json | null
          status?: string | null
          steam_status?: number | null
          steam_trade_id?: string | null
          trade_offer_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          bot_id?: string | null
          confirmation_method?: string | null
          created_at?: string | null
          credits_offered?: number | null
          declined_at?: string | null
          direction?: string
          expires_at?: string | null
          id?: string
          items_to_give?: Json | null
          items_to_receive?: Json | null
          status?: string | null
          steam_status?: number | null
          steam_trade_id?: string | null
          trade_offer_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "steam_trade_offers_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "steam_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "steam_trade_offers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "steam_trade_offers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      steam_trades: {
        Row: {
          bot_id: string
          completed_at: string | null
          created_at: string
          id: string
          items: Json
          status: string
          total_value: number
          trade_id: string | null
          trade_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bot_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          items: Json
          status?: string
          total_value?: number
          trade_id?: string | null
          trade_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bot_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          items?: Json
          status?: string
          total_value?: number
          trade_id?: string | null
          trade_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "steam_trades_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "steam_bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "steam_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "steam_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_items: {
        Row: {
          bot_inventory_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          in_stock: number | null
          is_bot_item: boolean | null
          name: string
          price: number
          rarity: string
          updated_at: string | null
        }
        Insert: {
          bot_inventory_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: number | null
          is_bot_item?: boolean | null
          name: string
          price: number
          rarity: string
          updated_at?: string | null
        }
        Update: {
          bot_inventory_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: number | null
          is_bot_item?: boolean | null
          name?: string
          price?: number
          rarity?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_items_bot_inventory_id_fkey"
            columns: ["bot_inventory_id"]
            isOneToOne: false
            referencedRelation: "steam_bot_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      store_items_backup: {
        Row: {
          bot_inventory_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          image_url: string | null
          in_stock: number | null
          is_bot_item: boolean | null
          name: string | null
          price: number | null
          rarity: string | null
          updated_at: string | null
        }
        Insert: {
          bot_inventory_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          in_stock?: number | null
          is_bot_item?: boolean | null
          name?: string | null
          price?: number | null
          rarity?: string | null
          updated_at?: string | null
        }
        Update: {
          bot_inventory_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          in_stock?: number | null
          is_bot_item?: boolean | null
          name?: string | null
          price?: number | null
          rarity?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tips: {
        Row: {
          amount: number
          created_at: string
          id: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      user_bans: {
        Row: {
          banned_at: string
          banned_by: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_at?: string
          banned_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_at?: string
          banned_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inventory: {
        Row: {
          exterior: string | null
          icon_url: string | null
          id: string
          item_id: string
          market_hash_name: string | null
          purchased_at: string | null
          quantity: number | null
          rarity_color: string | null
          steam_item_id: string | null
          tradable: boolean | null
          user_id: string
        }
        Insert: {
          exterior?: string | null
          icon_url?: string | null
          id?: string
          item_id: string
          market_hash_name?: string | null
          purchased_at?: string | null
          quantity?: number | null
          rarity_color?: string | null
          steam_item_id?: string | null
          tradable?: boolean | null
          user_id: string
        }
        Update: {
          exterior?: string | null
          icon_url?: string | null
          id?: string
          item_id?: string
          market_hash_name?: string | null
          purchased_at?: string | null
          quantity?: number | null
          rarity_color?: string | null
          steam_item_id?: string | null
          tradable?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "store_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_login_history: {
        Row: {
          device_info: string | null
          flagged_at: string | null
          flagged_reason: string | null
          id: string
          ip_address: unknown | null
          is_flagged: boolean
          location: string | null
          login_at: string
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          device_info?: string | null
          flagged_at?: string | null
          flagged_reason?: string | null
          id?: string
          ip_address?: unknown | null
          is_flagged?: boolean
          location?: string | null
          login_at?: string
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          device_info?: string | null
          flagged_at?: string | null
          flagged_reason?: string | null
          id?: string
          ip_address?: unknown | null
          is_flagged?: boolean
          location?: string | null
          login_at?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_login_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_login_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mutes: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          muted_at: string
          muted_by: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          muted_at?: string
          muted_by: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          muted_at?: string
          muted_by?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          sound_chat_ping: boolean
          sound_general: boolean
          sound_jackpot_win: boolean
          sound_new_trade: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sound_chat_ping?: boolean
          sound_general?: boolean
          sound_jackpot_win?: boolean
          sound_new_trade?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sound_chat_ping?: boolean
          sound_general?: boolean
          sound_jackpot_win?: boolean
          sound_new_trade?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_social_accounts: {
        Row: {
          avatar_url: string | null
          connected_at: string
          id: string
          is_active: boolean
          platform: string
          platform_user_id: string
          platform_username: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          connected_at?: string
          id?: string
          is_active?: boolean
          platform: string
          platform_user_id: string
          platform_username?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          connected_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          platform_user_id?: string
          platform_username?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_social_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_social_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wagers: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          game_type: string | null
          id: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          game_type?: string | null
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          game_type?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      wheel_bets: {
        Row: {
          actual_payout: number | null
          bet_amount: number
          bet_color: string
          created_at: string | null
          game_id: string
          id: string
          is_winner: boolean | null
          multiplier: number
          potential_payout: number
          user_id: string
        }
        Insert: {
          actual_payout?: number | null
          bet_amount: number
          bet_color: string
          created_at?: string | null
          game_id: string
          id?: string
          is_winner?: boolean | null
          multiplier: number
          potential_payout: number
          user_id: string
        }
        Update: {
          actual_payout?: number | null
          bet_amount?: number
          bet_color?: string
          created_at?: string | null
          game_id?: string
          id?: string
          is_winner?: boolean | null
          multiplier?: number
          potential_payout?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_wheel_bets_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_wheel_bets_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wheel_bets_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "wheel_games"
            referencedColumns: ["id"]
          },
        ]
      }
      wheel_games: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          end_time: string | null
          game_round: string
          id: string
          spin_time: string | null
          start_time: string | null
          status: string
          total_bets: number | null
          winning_color: string | null
          winning_index: number | null
          winning_number: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          game_round: string
          id?: string
          spin_time?: string | null
          start_time?: string | null
          status?: string
          total_bets?: number | null
          winning_color?: string | null
          winning_index?: number | null
          winning_number?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          game_round?: string
          id?: string
          spin_time?: string | null
          start_time?: string | null
          status?: string
          total_bets?: number | null
          winning_color?: string | null
          winning_index?: number | null
          winning_number?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      chat_messages_view: {
        Row: {
          created_at: string | null
          id: string | null
          is_global_message: boolean | null
          message: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_global_message?: boolean | null
          message?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_global_message?: boolean | null
          message?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_chat_messages_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chat_messages_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_view: {
        Row: {
          avatar_url: string | null
          id: string | null
          level: number | null
          player_name: string | null
          rank: number | null
          steam_id: string | null
          total_wagered: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_bot_to_battle_slot: {
        Args: {
          p_battle_id: string
          p_slot_number: number
          p_requester_id: string
        }
        Returns: Json
      }
      add_experience: {
        Args: { user_id: string; amount_wagered: number }
        Returns: undefined
      }
      add_jackpot_entry: {
        Args: {
          p_user_id: string
          p_entry_type: string
          p_value: number
          p_item_id?: string
        }
        Returns: Json
      }
      apply_affiliate_code: {
        Args: { p_user_id: string; p_code: string }
        Returns: Json
      }
      are_store_withdrawals_enabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ban_user: {
        Args: {
          p_user_id: string
          p_banned_by: string
          p_reason?: string
          p_expires_at?: string
        }
        Returns: Json
      }
      calculate_level_from_exp: {
        Args: { exp: number }
        Returns: number
      }
      cash_out_crash_bet: {
        Args: { p_bet_id: string; p_multiplier: number }
        Returns: Json
      }
      cashout_minefield_game: {
        Args: { p_game_id: string; p_user_id: string }
        Returns: Json
      }
      change_affiliate_code: {
        Args: { p_user_id: string; p_new_code: string }
        Returns: Json
      }
      check_chat_rate_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_all_chat_messages: {
        Args: { p_admin_id: string }
        Returns: Json
      }
      complete_wheel_game: {
        Args: {
          p_game_id: string
          p_winning_number: number
          p_winning_color: string
        }
        Returns: Json
      }
      create_affiliate_code: {
        Args:
          | { p_user_id: string }
          | { p_user_id: string; p_custom_code?: string }
        Returns: Json
      }
      create_coinflip_game: {
        Args: {
          p_user_id: string
          p_side: string
          p_bet_amount: number
          p_entry_type: string
          p_item_id?: string
        }
        Returns: Json
      }
      create_crate_battle: {
        Args: {
          p_creator_id: string
          p_total_value: number
          p_player_count: number
          p_game_mode: string
          p_team_mode: string
          p_crates: Json
        }
        Returns: string
      }
      create_dual_game: {
        Args:
          | {
              p_creator_id: string
              p_side: string
              p_bet_amount: number
              p_entry_type: string
              p_item_id?: string
            }
          | {
              p_creator_id: string
              p_weapon_id: string
              p_bet_amount: number
              p_entry_type: string
              p_item_id?: string
            }
        Returns: Json
      }
      create_steam_trade: {
        Args: {
          p_user_id: string
          p_trade_type: string
          p_items: Json
          p_total_value: number
        }
        Returns: Json
      }
      create_trade_offer: {
        Args: {
          p_bot_id: string
          p_user_id: string
          p_items_to_give: Json
          p_items_to_receive: Json
          p_credits_offered: number
        }
        Returns: Json
      }
      deduct_balance: {
        Args: { user_id: string; amount: number }
        Returns: Json
      }
      delete_chat_message: {
        Args: { p_message_id: string; p_deleted_by: string }
        Returns: Json
      }
      delete_user_account: {
        Args: { p_user_id: string; p_admin_id: string }
        Returns: Json
      }
      delete_user_affiliate_code: {
        Args: { p_user_id: string; p_admin_id: string }
        Returns: Json
      }
      distribute_monthly_prizes: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      fetch_steam_inventory_for_user: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          steam_item_id: string
          market_hash_name: string
          icon_url: string
          tradable: boolean
          marketable: boolean
          exterior: string
          rarity_color: string
          bot_id: string
          last_synced: string
          status: string
          deposit_value: number
        }[]
      }
      flag_login_attempt: {
        Args: { p_login_id: string; p_reason: string }
        Returns: Json
      }
      generate_affiliate_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_crash_point: {
        Args: { server_seed: string; client_seed: string; nonce: number }
        Returns: number
      }
      get_commission_rate: {
        Args: { p_total_referral_value: number } | { p_total_referrals: number }
        Returns: number
      }
      get_crate_with_items: {
        Args: { crate_id: string }
        Returns: Json
      }
      get_current_month_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          player_name: string
          avatar_url: string
          steam_id: string
          total_wagered: number
          level: number
          rank: number
        }[]
      }
      get_days_until_reset: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_exp_required_for_level: {
        Args: { target_level: number }
        Returns: number
      }
      get_game_settings: {
        Args: { p_game_type: string }
        Returns: {
          fee_percentage: number
          min_entry: number
          max_entry: number
          is_active: boolean
        }[]
      }
      get_or_create_active_crash_game: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_or_create_active_jackpot: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_or_create_active_wheel_game: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_or_create_current_period: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_sulfur_reward_for_level: {
        Args: { level: number }
        Returns: number
      }
      get_wheel_game_state: {
        Args: { p_game_id: string }
        Returns: Json
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_user_banned: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_user_currently_banned: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_user_currently_muted: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      join_coinflip_game: {
        Args:
          | {
              p_game_id: string
              p_user_id: string
              p_entry_type: string
              p_item_id?: string
            }
          | {
              p_game_id: string
              p_user_id: string
              p_entry_type: string
              p_item_id?: string
              p_is_bot?: boolean
            }
        Returns: Json
      }
      join_crate_battle: {
        Args: { p_battle_id: string; p_user_id: string }
        Returns: Json
      }
      join_dual_game: {
        Args:
          | {
              p_game_id: string
              p_user_id: string
              p_side: string
              p_entry_type: string
              p_item_id?: string
              p_is_bot?: boolean
            }
          | {
              p_game_id: string
              p_user_id: string
              p_weapon_id: string
              p_entry_type: string
              p_item_id?: string
              p_is_bot?: boolean
            }
        Returns: Json
      }
      logout_all_devices: {
        Args: { p_user_id: string }
        Returns: Json
      }
      mute_user: {
        Args: {
          p_user_id: string
          p_muted_by: string
          p_duration_minutes: number
          p_reason?: string
        }
        Returns: Json
      }
      pay_affiliate_commissions: {
        Args: { p_referrer_id: string }
        Returns: Json
      }
      place_crash_bet: {
        Args: {
          p_game_id: string
          p_bet_amount: number
          p_auto_cashout?: number
        }
        Returns: Json
      }
      place_plinko_bet: {
        Args: { p_user_id: string; p_bet_amount: number; p_multiplier: number }
        Returns: Json
      }
      place_wheel_bet: {
        Args: {
          p_user_id: string
          p_bet_amount: number
          p_bet_color: string
          p_multiplier: number
        }
        Returns: Json
      }
      process_expired_wheel_games: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      purchase_inventory_item: {
        Args: {
          p_user_id: string
          p_inventory_item_id: string
          p_item_price: number
        }
        Returns: Json
      }
      redeem_promotional_code: {
        Args: { p_code: string }
        Returns: Json
      }
      reset_monthly_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      reveal_minefield_cell: {
        Args: { p_game_id: string; p_user_id: string; p_cell_position: number }
        Returns: Json
      }
      select_random_gift_item: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      send_chat_message: {
        Args: { p_message: string; p_is_global?: boolean }
        Returns: Json
      }
      send_tip: {
        Args: { p_recipient_id: string; p_amount: number }
        Returns: Json
      }
      start_minefield_game: {
        Args: { p_user_id: string; p_bet_amount: number; p_mine_count: number }
        Returns: Json
      }
      start_wheel_spin: {
        Args: { p_game_id: string }
        Returns: Json
      }
      sync_bot_inventory_to_store: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      toggle_leaderboard_participation: {
        Args: { p_user_id: string; p_disabled: boolean }
        Returns: Json
      }
      transfer_balance: {
        Args: { from_user_id: string; to_user_id: string; amount: number }
        Returns: undefined
      }
      unban_user: {
        Args: { p_user_id: string }
        Returns: Json
      }
      unmute_user: {
        Args: { p_user_id: string }
        Returns: Json
      }
      update_affiliate_code: {
        Args: { p_user_id: string; p_new_code: string }
        Returns: Json
      }
      update_inventory_pricing: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
