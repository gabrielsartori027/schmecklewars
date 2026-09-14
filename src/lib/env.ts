import "server-only";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), schema);

const optionalString = emptyToUndefined(z.string().optional());
const optionalUrl = emptyToUndefined(z.string().url().optional());
const optionalAddress = emptyToUndefined(
  z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "expected a 0x-prefixed 20-byte hex address")
    .optional(),
);
const optionalIso = emptyToUndefined(
  z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "expected an ISO-8601 timestamp")
    .optional(),
);

/**
 * Every variable is optional on purpose: the site must build and render honest empty
 * states with nothing configured. Routes check what they need at runtime.
 */
export const env = createEnv({
  server: {
    ANTHROPIC_API_KEY: optionalString,
    ANTHROPIC_MODEL: emptyToUndefined(z.string().default("claude-sonnet-5")),
    ANTHROPIC_WEB_SEARCH_MAX_USES: emptyToUndefined(
      z.coerce.number().int().min(1).max(5).default(2),
    ),
    UPSTASH_REDIS_REST_URL: optionalUrl,
    UPSTASH_REDIS_REST_TOKEN: optionalString,
    CRON_SECRET: optionalString,
    RPC_URL: optionalUrl,
    ETH_MAINNET_RPC_URL: optionalUrl,
    GENESIS_TS: optionalIso,
    EPOCH_DAYS: emptyToUndefined(z.coerce.number().int().min(1).max(90).default(14)),
    PUBLISHER_ADDRESS: optionalAddress,
    PUBLISHER_PRIVATE_KEY: optionalString,
    VERCEL_ENV: optionalString,
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {
    NEXT_PUBLIC_CHAIN_ID: emptyToUndefined(z.coerce.number().int().default(4663)),
    NEXT_PUBLIC_EXPLORER_URL: emptyToUndefined(
      z.string().url().default("https://robinhoodchain.blockscout.com"),
    ),
    NEXT_PUBLIC_STABLE_ADDRESS: optionalAddress,
    NEXT_PUBLIC_STABLE_SYMBOL: emptyToUndefined(z.string().default("USDG")),
    NEXT_PUBLIC_STABLE_DECIMALS: emptyToUndefined(
      z.coerce.number().int().min(0).max(18).default(6),
    ),
    NEXT_PUBLIC_TOKEN_CA: optionalAddress,
    NEXT_PUBLIC_TOKEN_SYMBOL: emptyToUndefined(z.string().default("$CHMCO")),
    NEXT_PUBLIC_TOKEN_NAME: emptyToUndefined(z.string().default("Schmeckle Coin")),
    NEXT_PUBLIC_LAUNCHPAD_URL: optionalUrl,
    NEXT_PUBLIC_LAUNCHPAD_NAME: emptyToUndefined(z.string().default("Pons")),
    NEXT_PUBLIC_SWAP_URL: optionalUrl,
    NEXT_PUBLIC_SITE_URL: emptyToUndefined(z.string().url().default("https://schmecklewars.com")),
    NEXT_PUBLIC_WAR_CHEST_ADDRESS: optionalAddress,
    NEXT_PUBLIC_CREATOR_WALLET: optionalAddress,
    NEXT_PUBLIC_OPS_ADDRESS: optionalAddress,
    NEXT_PUBLIC_RESERVE_ADDRESS: optionalAddress,
    NEXT_PUBLIC_SIMULATION: emptyToUndefined(
      z
        .string()
        .default("false")
        .transform((v) => v === "true"),
    ),
  },
  runtimeEnv: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
    ANTHROPIC_WEB_SEARCH_MAX_USES: process.env.ANTHROPIC_WEB_SEARCH_MAX_USES,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    CRON_SECRET: process.env.CRON_SECRET,
    RPC_URL: process.env.RPC_URL,
    ETH_MAINNET_RPC_URL: process.env.ETH_MAINNET_RPC_URL,
    GENESIS_TS: process.env.GENESIS_TS,
    EPOCH_DAYS: process.env.EPOCH_DAYS,
    PUBLISHER_ADDRESS: process.env.PUBLISHER_ADDRESS,
    PUBLISHER_PRIVATE_KEY: process.env.PUBLISHER_PRIVATE_KEY,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
    NEXT_PUBLIC_EXPLORER_URL: process.env.NEXT_PUBLIC_EXPLORER_URL,
    NEXT_PUBLIC_STABLE_ADDRESS: process.env.NEXT_PUBLIC_STABLE_ADDRESS,
    NEXT_PUBLIC_STABLE_SYMBOL: process.env.NEXT_PUBLIC_STABLE_SYMBOL,
    NEXT_PUBLIC_STABLE_DECIMALS: process.env.NEXT_PUBLIC_STABLE_DECIMALS,
    NEXT_PUBLIC_TOKEN_CA: process.env.NEXT_PUBLIC_TOKEN_CA,
    NEXT_PUBLIC_TOKEN_SYMBOL: process.env.NEXT_PUBLIC_TOKEN_SYMBOL,
    NEXT_PUBLIC_TOKEN_NAME: process.env.NEXT_PUBLIC_TOKEN_NAME,
    NEXT_PUBLIC_LAUNCHPAD_URL: process.env.NEXT_PUBLIC_LAUNCHPAD_URL,
    NEXT_PUBLIC_LAUNCHPAD_NAME: process.env.NEXT_PUBLIC_LAUNCHPAD_NAME,
    NEXT_PUBLIC_SWAP_URL: process.env.NEXT_PUBLIC_SWAP_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_WAR_CHEST_ADDRESS: process.env.NEXT_PUBLIC_WAR_CHEST_ADDRESS,
    NEXT_PUBLIC_CREATOR_WALLET: process.env.NEXT_PUBLIC_CREATOR_WALLET,
    NEXT_PUBLIC_OPS_ADDRESS: process.env.NEXT_PUBLIC_OPS_ADDRESS,
    NEXT_PUBLIC_RESERVE_ADDRESS: process.env.NEXT_PUBLIC_RESERVE_ADDRESS,
    NEXT_PUBLIC_SIMULATION: process.env.NEXT_PUBLIC_SIMULATION,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

// `simulationEnabled` and every NEXT_PUBLIC_* read for client code live in `@/lib/public-env`.
