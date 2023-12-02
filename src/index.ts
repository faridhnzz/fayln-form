import { Env, Hono } from "hono";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { logger } from "hono/logger";

import corsOptions from "./utils/cors";
import { turnstile } from "./utils/captcha";
import discordWebhook from "./utils/discordWebhook";
import { pastelColor, gravatar } from "./utils";

type Bindings = {
  TURNSTILE_SECRET_KEY: string;
  DISCORD_WEBHOOK_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("*", logger());
app.use("*", cors(corsOptions));
app.use("*", etag({ weak: true }));

/** Route */
app.get("/", (c) => c.redirect("https://fayln.com", 307));
app.post("/api/submit-contact", async (c) => {
  const bodyParse = Object.keys(await c.req.parseBody({ all: true }))[0];
  const body = JSON.parse(bodyParse);
  const query = c.req.query();

  // Validate token & body
  if (!query?.token) {
    return c.json({ message: "Token doesnt exist." }, 400);
  }

  if (!body?.name || !body?.email || !body?.message) {
    return c.json({ message: "Invalid body." }, 400);
  }

  // Verify Captcha
  const captchaVerify = await turnstile({
    token: query?.token,
    secretKey: c.env.TURNSTILE_SECRET_KEY,
  });

  if (!captchaVerify) {
    return c.json({ message: "Invalid verify captcha." }, 400);
  }

  // Send to Discord Webhook
  const color = await pastelColor();
  const payload: any = {
    content: `<@272725891639934986> - Ada pesan ndess dari seseorang.`,
    embeds: [
      {
        title: "[**Contact Form Submitted**]",
        description: "A new message from someone.",
        type: "rich",
        color,
        fields: [
          { name: "Name", value: `\`\`\`${body?.name}\`\`\`` },
          {
            name: "Email",
            value: `\`\`\`${body?.email}\`\`\``,
            inline: true,
          },
          {
            name: "Discord",
            value: `\`\`\`${body?.discord || "null"}\`\`\``,
            inline: true,
          },
        ],
      },
      {
        title: "Message:",
        color,
        description: body.message,
        timestamp: new Date(),
        footer: {
          text: body.name,
          icon_url: await gravatar(body?.email),
        },
      },
    ],
  };

  const discord = await discordWebhook(c.env.DISCORD_WEBHOOK_URL, payload);
  if (discord?.status === 200 || discord?.status === 204) {
    return c.json({ message: "Success." });
  }
  if (discord?.status === 429) {
    const data: any = await discord.json();
    const waitUntil = data["retry_after"];
    setTimeout(
      () => discordWebhook(c.env.DISCORD_WEBHOOK_URL, payload),
      waitUntil
    );
  } else {
    return c.json(
      { message: "An error ocurred while sending the message." },
      500
    );
  }
});

// Let's go!
export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};
