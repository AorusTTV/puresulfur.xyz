import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DiscordReturn: React.FC = () => {
  useEffect(() => {
    const connectWithDiscord = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      console.log("DiscordReturn code:", code);

      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (accessToken) {
        await fetch(
          "https://sckkxdmwzxayefwvcgic.supabase.co/functions/v1/discort-connect?code=" + //todo move to .env
            code +
            "&access_token=Bearer " +
            accessToken,
          {}
        );
      }
    };

    connectWithDiscord();
  }, []);

  return <div>{}</div>;
};

export default DiscordReturn;
