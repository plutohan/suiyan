import { FC, useState } from "react"
import {
	useSignAndExecuteTransaction,
	useCurrentAccount,
	useSuiClientQuery,
	ConnectButton,
} from "@mysten/dapp-kit"
import { Wallet } from "lucide-react"
import { Transaction } from "@mysten/sui/transactions"
import {
	PACKAGE_ID,
	DEFAULT_LOTTERY_PRIZE,
	rawToSuiyan,
	suiToMist,
	suiyanToRaw,
	SUIYAN_TOKEN_TYPE,
} from "../../../config/constants"
import { usePrice } from "../../../providers/price/PriceContext"

interface LotteryCreationProps {
	isLoading: boolean
	onLoadingChange: (loading: boolean) => void
	onStatusChange: (status: string) => void
	onLotteryCreated: () => void
}

export const LotteryCreation: FC<LotteryCreationProps> = ({
	isLoading,
	onLoadingChange,
	onStatusChange,
	onLotteryCreated,
}) => {
	const { mutate: signAndExecute } = useSignAndExecuteTransaction()
	const currentAccount = useCurrentAccount()
	const { suiyanPerSui } = usePrice()

	// State for prize and probability inputs
	const [prizeInTokens, setPrizeInTokens] = useState<string>(
		rawToSuiyan(DEFAULT_LOTTERY_PRIZE)
	)
	const [multiplier, setMultiplier] = useState<string>("8")
	const [localStatus, setLocalStatus] = useState<string>("")
	const [showConnectWallet, setShowConnectWallet] = useState(false)

	// Calculate fee based on prize and multiplier
	// Fee = Prize value in SUI / Multiplier
	const prizeValueInSui = suiyanPerSui
		? (parseFloat(prizeInTokens) || 0) / suiyanPerSui
		: 0
	const calculatedFee = prizeValueInSui / (parseFloat(multiplier) || 1)

	// Calculate creator profit: (9 slots × fee) - prize value
	const totalFeesCollected = calculatedFee * 9
	const creatorProfit = totalFeesCollected - prizeValueInSui

	// Query SUIYAN coins
	const { data: suiyanCoins } = useSuiClientQuery(
		"getCoins",
		{
			owner: currentAccount?.address || "",
			coinType: SUIYAN_TOKEN_TYPE,
		},
		{
			enabled: !!currentAccount,
		}
	)

	// Calculate total SUIYAN balance (SUIYAN has 6 decimals)
	const totalSuiyanBalance = suiyanCoins
		? Number(suiyanCoins.data.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0))) / 1_000_000
		: 0
	const hasInsufficientBalance = (parseFloat(prizeInTokens) || 0) > totalSuiyanBalance

	const handleCreateLottery = async () => {
		if (isLoading) return

		// Check if wallet is connected
		if (!currentAccount) {
			setShowConnectWallet(true)
			return
		}

		// Convert to base units (6 decimals for SUIYAN, 9 decimals for SUI)
		const prizeAmount = suiyanToRaw(parseFloat(prizeInTokens) || 0)
		const feeInMist = suiToMist(calculatedFee)

		// Validate inputs
		if (prizeAmount <= 0) {
			onStatusChange("Prize amount must be greater than 0")
			return
		}
		if (feeInMist <= 0) {
			onStatusChange("Fee must be greater than 0")
			return
		}

		// Check if user has SUIYAN tokens
		if (!suiyanCoins || suiyanCoins.data.length === 0) {
			onStatusChange(
				"You don't have any SUIYAN tokens. Please get some tokens first."
			)
			return
		}

		// Calculate total balance
		const totalBalance = suiyanCoins.data.reduce(
			(sum, coin) => sum + BigInt(coin.balance),
			BigInt(0)
		)
		if (totalBalance < BigInt(prizeAmount)) {
			onStatusChange(
				`Insufficient SUIYAN balance. You have ${rawToSuiyan(
					Number(totalBalance)
				)} but need ${rawToSuiyan(prizeAmount)}`
			)
			return
		}

		onLoadingChange(true)
		onStatusChange("Creating lottery with your SUIYAN tokens...")
		setLocalStatus("Creating lottery with your SUIYAN tokens...")

		try {
			const tx = new Transaction()

			// Get the first SUIYAN coin (or merge if needed)
			const [firstCoin, ...otherCoins] = suiyanCoins.data.map(
				(coin) => coin.coinObjectId
			)

			// If we have multiple coins, merge them first
			if (otherCoins.length > 0) {
				tx.mergeCoins(
					tx.object(firstCoin),
					otherCoins.map((id) => tx.object(id))
				)
			}

			// Split the exact amount needed for the prize
			const [prize_coin] = tx.splitCoins(tx.object(firstCoin), [
				tx.pure.u64(prizeAmount),
			])

			// Create lottery with your tokens
			tx.moveCall({
				target: `${PACKAGE_ID}::lottery::create_lottery`,
				arguments: [prize_coin, tx.pure.u64(feeInMist)],
			})

			signAndExecute(
				{
					transaction: tx,
				},
				{
					onSuccess: (result) => {
						console.log("Transaction successful:", result)
						const message = `Lottery created successfully! Digest: ${result.digest}`
						onStatusChange(message)
						setLocalStatus(message)
						onLoadingChange(false)
						// Refresh lottery list after creating
						setTimeout(() => onLotteryCreated(), 2000)
					},
					onError: (error) => {
						console.error("Transaction failed:", error)
						const message = `Error: ${error.message}`
						onStatusChange(message)
						setLocalStatus(message)
						onLoadingChange(false)
					},
				}
			)
		} catch (error: any) {
			console.error("Error creating lottery:", error)
			const message = `Error: ${error.message}`
			onStatusChange(message)
			setLocalStatus(message)
			onLoadingChange(false)
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h3
					className="text-2xl font-bold text-white mb-2"
					style={{ fontFamily: "Bangers, system-ui" }}
				>
					Create New Lottery
				</h3>
				<p className="text-sm text-muted-foreground">
					Create a 3x3 lottery with 9 slots. Configure the prize pool
					and entry fee below.
				</p>
			</div>

			{/* Balance & Price Info */}
			<div className="bg-black/40 border border-white/10 p-4 rounded-sm space-y-2">
				<div className="flex justify-between items-center">
					<span className="text-sm text-muted-foreground">
						Your SUIYAN Balance:
					</span>
					<span className="text-primary font-bold font-mono">
						{suiyanCoins
							? rawToSuiyan(
									Number(
										suiyanCoins.data.reduce(
											(sum, coin) =>
												sum + BigInt(coin.balance),
											BigInt(0)
										)
									)
							  )
							: "0"}{" "}
						$SUIYAN
					</span>
				</div>
				{suiyanPerSui !== null && (
					<div className="flex justify-between items-center">
						<span className="text-sm text-muted-foreground">
							Current Rate:
						</span>
						<span className="text-secondary font-bold font-mono">
							1 $SUI ={" "}
							{suiyanPerSui >= 1000000
								? `${(suiyanPerSui / 1000000).toFixed(2)}M`
								: suiyanPerSui >= 1000
								? `${(suiyanPerSui / 1000).toFixed(1)}K`
								: suiyanPerSui.toFixed(0)}{" "}
							$SUIYAN
						</span>
					</div>
				)}
			</div>

			{/* Prize Amount Input */}
			<div>
				<label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">
					Prize ($SUIYAN)
				</label>
				<input
					type="number"
					value={prizeInTokens}
					onChange={(e) => setPrizeInTokens(e.target.value)}
					step="0.01"
					min="0"
					placeholder="Enter prize amount"
					className="w-full px-4 py-3 border border-white/10 bg-black/40 text-white rounded-sm focus:outline-none focus:border-primary/50 font-mono"
				/>
				{/* Prize Percentage Buttons */}
				<div className="flex gap-2 mt-2">
					{[
						{ label: "10%", value: 0.1 },
						{ label: "25%", value: 0.25 },
						{ label: "50%", value: 0.5 },
						{ label: "MAX", value: 1 },
					].map((preset) => (
						<button
							key={preset.label}
							type="button"
							onClick={() => {
								const amount = totalSuiyanBalance * preset.value
								setPrizeInTokens(amount.toFixed(2))
							}}
							disabled={totalSuiyanBalance <= 0}
							className="flex-1 py-1.5 text-xs font-bold uppercase tracking-wider border border-white/10 bg-black/40 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{preset.label}
						</button>
					))}
				</div>
				<p className="text-xs text-muted-foreground mt-2 flex justify-between">
					<span>Winner receives this amount in $SUIYAN tokens</span>
					<span className="text-secondary font-mono">
						≈ {suiyanPerSui !== null ? prizeValueInSui.toFixed(4) : "..."} $SUI
					</span>
				</p>
			</div>

			{/* Return Multiplier Input */}
			<div>
				<label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">
					Return Multiplier
				</label>
				<div className="relative">
					<input
						type="number"
						value={multiplier}
						onChange={(e) => setMultiplier(e.target.value)}
						step="1"
						min="2"
						max="100"
						placeholder="e.g., 7"
						className="w-full px-4 py-3 pr-10 border border-white/10 bg-black/40 text-white rounded-sm focus:outline-none focus:border-primary/50 font-mono"
					/>
					<span className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-bold">
						×
					</span>
				</div>
				<p className="text-xs text-muted-foreground mt-2">
					The lower below 9×, the more the creator profits.
				</p>
				{parseFloat(multiplier) >= 9 && (
					<p className="text-xs text-yellow-400 mt-1">
						Warning: At 9× or higher, creator may not profit.
					</p>
				)}
			</div>

			{/* Calculated Fee Display */}
			<div className="bg-black/40 border border-white/10 p-4 rounded-sm space-y-2">
				<div className="flex justify-between items-center">
					<span className="text-sm text-muted-foreground">
						Entry Fee per Slot:
					</span>
					<span className="text-secondary font-bold font-mono">
						{suiyanPerSui !== null ? calculatedFee.toFixed(4) : "..."} SUI
					</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-sm text-muted-foreground">
						Prize Value:
					</span>
					<span className="text-primary font-bold font-mono">
						~{suiyanPerSui !== null ? prizeValueInSui.toFixed(2) : "..."} SUI
					</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-sm text-muted-foreground">
						Total Fees (9 slots):
					</span>
					<span className="text-secondary font-bold font-mono">
						{suiyanPerSui !== null ? totalFeesCollected.toFixed(4) : "..."} SUI
					</span>
				</div>
				<div className="flex justify-between items-center pt-2 border-t border-white/10">
					<span className="text-sm font-bold text-white">
						Estimated Profit:
					</span>
					<span className={`font-bold font-mono ${creatorProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
						{suiyanPerSui !== null ? (creatorProfit >= 0 ? "+" : "") + creatorProfit.toFixed(4) : "..."} SUI
					</span>
				</div>
			</div>

			<button
				onClick={handleCreateLottery}
				disabled={isLoading || hasInsufficientBalance}
				className="w-full h-14 bg-gradient-to-r from-primary to-orange-500 text-black font-bold text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? "Processing..." : hasInsufficientBalance ? "INSUFFICIENT BALANCE" : "CREATE LOTTERY"}
			</button>
			{localStatus && (
				<p className="mt-3 text-xs text-muted-foreground font-mono">
					{localStatus}
				</p>
			)}

			{/* Connect Wallet Modal */}
			{showConnectWallet && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-slide-up"
					role="dialog"
					aria-modal="true"
					aria-label="Connect wallet"
					onClick={() => setShowConnectWallet(false)}
				>
					<div
						className="bg-card border border-primary/30 shadow-2xl max-w-md w-full p-8 space-y-6 rounded-sm"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="text-center">
							<div className="text-5xl mb-3">
								<Wallet className="w-16 h-16 text-primary mx-auto" />
							</div>
							<h3
								className="text-2xl font-bold text-white uppercase tracking-wider"
								style={{ fontFamily: "Bangers, system-ui" }}
							>
								Connect Wallet
							</h3>
							<p className="text-muted-foreground mt-2">
								Please connect your wallet to create a lottery
							</p>
						</div>
						<div className="flex justify-center">
							<ConnectButton />
						</div>
						<button
							type="button"
							onClick={() => setShowConnectWallet(false)}
							className="w-full px-6 py-3 border border-white/10 font-bold uppercase tracking-wider hover:bg-white/5 transition-all bg-transparent text-white"
						>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
