import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const DiscordReturn: React.FC = () => {
  useEffect(() => {
    const connectWithDiscord = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const redirectUrl = `${window.location.origin}/auth/discord/return`;

      console.log("DiscordReturn code:", code);

      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (accessToken) {
        await fetch(
          "https://sckkxdmwzxayefwvcgic.supabase.co/functions/v1/discort-connect?code=" + //todo move to .env
            code +
            "&access_token=Bearer " +
            accessToken +
            "&redirect_url=" +
            redirectUrl,
          {}
        );
      }
    };

    connectWithDiscord();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      {
        <Button
          className="flex items-center justify-center mx-auto mb-8 w-full max-w-80 h-14 px-8 py-0 text-xl font-bold tracking-wide bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          title="test"
          onClick={() => (window.location.href = "/")}
        >
          RETURN HOME
        </Button>
      }
    </div>
  );
};

export default DiscordReturn;
