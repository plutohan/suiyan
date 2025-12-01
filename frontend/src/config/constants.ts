// Contract Configuration
// Update these values after deploying your contract

// Your deployed suiyan_play lottery package ID
export const PACKAGE_ID =
	"0xd914d5a014cfc10057781da23adadb608e3b08fac2cc39fcaaa9c1e5922661a1"

// Suiyan Token Package ID (separate package)
export const SUIYAN_TOKEN_PACKAGE_ID =
	"0xe0fbaffa16409259e431b3e1ff97bf6129641945b42e5e735c99aeda73a595ac"

// Suiyan Token Configuration
export const SUIYAN_TOKEN_TYPE = `${SUIYAN_TOKEN_PACKAGE_ID}::suiyan::SUIYAN`
export const TREASURY_CAP_ID =
	"0x22490f97528c35ab3695b418b24b51e057041055cf0b7c70c4de30aa4409a99a"

// Sui Random object ID (standard on all networks)
export const RANDOM_OBJECT_ID = "0x8"

// LotteryConfig shared object ID (created at init)
export const LOTTERY_CONFIG_ID = "0x0be135e780e8b8c930a02ccfe0a8dd8dade2c5cd7a353b491f133d7207c29ecb"

// Contract constants
export const SLOT_COUNT = 9

// Decimal constants
export const SUI_DECIMALS = 9
export const SUIYAN_DECIMALS = 6

// Default values for prize and fee
export const DEFAULT_LOTTERY_PRIZE = 100_000_000_000 // 100,000 SUIYAN tokens (6 decimals)
export const DEFAULT_FEE = 15_000_000 // 0.015 SUI in MIST (for entry fee) - this is a fallback

// Helper function to convert MIST to SUI (9 decimals)
export const mistToSui = (mist: number): string => {
	return parseFloat((mist / 1_000_000_000).toFixed(9)).toString()
}

// Helper function to convert raw SUIYAN to display value (6 decimals)
export const rawToSuiyan = (raw: number): string => {
	return parseFloat((raw / 1_000_000).toFixed(6)).toString()
}

// Format SUI balance (up to 4 decimals)
export const formatSuiBalance = (mist: number): string => {
	const value = mist / 1_000_000_000
	return parseFloat(value.toFixed(4)).toString()
}

// Format SUIYAN balance (use k/M notation)
// Note: SUIYAN has 6 decimals, not 9 like SUI
export const formatSuiyanBalance = (raw: number): string => {
	const value = raw / 1_000_000 // SUIYAN has 6 decimals
	if (value >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(1)}M`
	} else if (value >= 1_000) {
		return `${(value / 1_000).toFixed(1)}k`
	}
	return parseFloat(value.toFixed(2)).toString()
}

// Helper function to convert SUI to MIST (9 decimals)
export const suiToMist = (sui: number): number => {
	return Math.floor(sui * 1_000_000_000)
}

// Helper function to convert SUIYAN display value to raw (6 decimals)
export const suiyanToRaw = (suiyan: number): number => {
	return Math.floor(suiyan * 1_000_000)
}
