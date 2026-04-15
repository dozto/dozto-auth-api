/**
 * Supabase Provider — Auth adapter (pure auth capability)
 */

export {
	getUserByAccessToken,
	passwordSignIn,
	passwordSignUp,
	phonePasswordSignIn,
	phonePasswordSignUp,
	refreshSession,
	signOut,
	verifyEmailToken,
	verifyPhoneOtp,
} from "./supabase.auth.ts";
export { getSupabase, verifySupabaseConnection } from "./supabase.client.ts";
