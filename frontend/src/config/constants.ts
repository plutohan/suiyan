// Contract Configuration
// Update these values after deploying your contract

// Your deployed suiyan_play lottery package ID
export const PACKAGE_ID =
	"0xc63e38207267469fa9a4ee0e3104292eafe33a49a9874da2714b093150c86aa8"

// Suiyan Token Package ID (separate package)
export const SUIYAN_TOKEN_PACKAGE_ID =
	"0x145fbaf00fa5ffad7eeef2c3a0eac1a7dc45ced91c7552e4a964a1c1139adca9"

// Suiyan Token Configuration
export const SUIYAN_TOKEN_TYPE = `${SUIYAN_TOKEN_PACKAGE_ID}::suiyan::SUIYAN`
export const TREASURY_CAP_ID =
	"0x22490f97528c35ab3695b418b24b51e057041055cf0b7c70c4de30aa4409a99a"

// Sui Random object ID (standard on all networks)
export const RANDOM_OBJECT_ID = "0x8"

// Contract constants
export const SLOT_COUNT = 9

// Default values for prize and fee
export const DEFAULT_LOTTERY_PRIZE = 100_000_000 // 0.1 SUIYAN tokens (9 decimals)
export const DEFAULT_FEE = 15_000_000 // 0.015 SUI in MIST (for entry fee)

// Helper function to convert MIST to SUI/SUIYAN (both use 9 decimals)
export const mistToSui = (mist: number): string => {
	return parseFloat((mist / 1_000_000_000).toFixed(9)).toString()
}

// Helper function to convert SUI/SUIYAN to MIST
export const suiToMist = (sui: number): number => {
	return Math.floor(sui * 1_000_000_000)
}
