import { createClient } from "npm:@supabase/supabase-js@2";
Deno.serve(async (req) => {
  const url = new URL(req.url);
  const accessToken = url.searchParams.get("access_token");
  console.log("accessToken", accessToken);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_ANON_KEY"),
    {
      global: {
        headers: {
          Authorization: accessToken || "",
        },
      },
    }
  );
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  console.log("s-user", user);
  try {
    const code = url.searchParams.get("code");
    if (!code) {
      return new Response("Code not found", {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
    console.log("code", code);
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: Deno.env.get("DISCORD_CLIENT_ID"),
        client_secret: Deno.env.get("DISCORD_CLIENT_SECRET"),
        grant_type: "authorization_code",
        code,
        redirect_uri: Deno.env.get("DISCORD_REDIRECT_URI"), //https://puresulfur.netlify.app/auth/discord/return
      }),
    });
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Failed to fetch token: ${errorText}`);
    }
    const tokenData = await tokenResponse.json();
    console.log("token", tokenData.access_token);
    const userGuildsResponse = await fetch(
      "https://discord.com/api/users/@me/guilds",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );
    if (!userGuildsResponse.ok) {
      const errorText = await userGuildsResponse.text();
      throw new Error(`Failed to fetch user guilds: ${errorText}`);
    }
    const userGuildsData = await userGuildsResponse.json();
    console.log("guilds", userGuildsData);
    const guildIdToCheck = "1380389221277110444";
    const guildExists = userGuildsData.find(
      (guild) => guild.id === guildIdToCheck
    );
    if (guildExists) {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          joined_discord: true,
        })
        .eq("id", user.id);
      console.log("guild exists");
      return new Response("Ok", {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } else {
      console.log("guild not exists");
      return new Response("Please join our server", {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
