/**
 * Supabase Provider — Auth adapter (pure auth capability)
 */

export {
	passwordSignIn,
	passwordSignUp,
	phonePasswordSignIn,
	phonePasswordSignUp,
	verifyEmailToken,
	verifyPhoneOtp,
} from "./supabase.auth.ts";
export { getSupabase, verifySupabaseConnection } from "./supabase.client.ts";
