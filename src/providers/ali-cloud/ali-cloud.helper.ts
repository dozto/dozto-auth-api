/**
 * HMAC-SHA1 signature helper for Ali-Cloud OpenAPI.
 * Uses Web Crypto API and works in Bun / Node / Edge runtimes.
 */
export const calculateHmacSha1 = async (
	key: string,
	message: string,
): Promise<string> => {
	const encoder = new TextEncoder();
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		encoder.encode(key),
		{ name: "HMAC", hash: "SHA-1" },
		false,
		["sign"],
	);

	const signature = await crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		encoder.encode(message),
	);

	const bytes = new Uint8Array(signature);
	let binary = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		const byte = bytes[i];
		if (byte !== undefined) {
			binary += String.fromCharCode(byte);
		}
	}
	return btoa(binary);
};
