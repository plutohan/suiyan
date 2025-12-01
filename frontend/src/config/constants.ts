// Contract Configuration
// Update these values after deploying your contract

// Your deployed suiyan_play lottery package ID
export const PACKAGE_ID =
	"0xa2303fe152f756c3b4d73b4d3226e193cb44b785ff20207c21b040f0dd3e0bcc"

// Suiyan Token Package ID (separate package)
export const SUIYAN_TOKEN_PACKAGE_ID =
	"0x145fbaf00fa5ffad7eeef2c3a0eac1a7dc45ced91c7552e4a964a1c1139adca9"

// Suiyan Token Configuration
export const SUIYAN_TOKEN_TYPE = `${SUIYAN_TOKEN_PACKAGE_ID}::suiyan::SUIYAN`
export const TREASURY_CAP_ID =
	"0x22490f97528c35ab3695b418b24b51e057041055cf0b7c70c4de30aa4409a99a"

// Sui Random object ID (standard on all networks)
export const RANDOM_OBJECT_ID = "0x8"

// LotteryConfig shared object ID (created at init)
export const LOTTERY_CONFIG_ID = "0x8281e9ecb3ca00c23f1051c4b167ab4af00a075f91b0b8dff5b02d28145acc06"

// Contract constants
export const SLOT_COUNT = 9

// Default values for prize and fee
export const DEFAULT_LOTTERY_PRIZE = 100_000_000_000_000 // 100,000 SUIYAN tokens (9 decimals)
export const DEFAULT_FEE = 15_000_000 // 0.015 SUI in MIST (for entry fee) - this is a fallback

// Helper function to convert MIST to SUI/SUIYAN (both use 9 decimals)
export const mistToSui = (mist: number): string => {
	return parseFloat((mist / 1_000_000_000).toFixed(9)).toString()
}

// Helper function to convert SUI/SUIYAN to MIST
export const suiToMist = (sui: number): number => {
	return Math.floor(sui * 1_000_000_000)
}
