import { FC, useState, useEffect } from "react"
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
	DEFAULT_FEE,
	mistToSui,
	suiToMist,
	SUIYAN_TOKEN_TYPE,
} from "../../../config/constants"

const SUI_COIN_TYPE = "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"
const SUIYAN_COIN_TYPE = "0xe0fbaffa16409259e431b3e1ff97bf6129641945b42e5e735c99aeda73a595ac::suiyan::SUIYAN"

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

	// State for prize and fee inputs
	const [prizeInTokens, setPrizeInTokens] = useState<string>(
		mistToSui(DEFAULT_LOTTERY_PRIZE)
	)
	const [feeInSui, setFeeInSui] = useState<string>(mistToSui(DEFAULT_FEE))
	const [localStatus, setLocalStatus] = useState<string>("")
	const [showConnectWallet, setShowConnectWallet] = useState(false)
	const [suiyanPerSui, setSuiyanPerSui] = useState<number | null>(null)

	// Fetch SUIYAN/SUI price ratio
	useEffect(() => {
		const fetchPrices = async () => {
			try {
				const [suiRes, suiyanRes] = await Promise.all([
					fetch("https://aftermath.finance/api/price-info", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ coins: [SUI_COIN_TYPE] }),
					}),
					fetch("https://aftermath.finance/api/price-info", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ coins: [SUIYAN_COIN_TYPE] }),
					}),
				])

				const suiData = await suiRes.json()
				const suiyanData = await suiyanRes.json()

				const suiPrice = suiData[SUI_COIN_TYPE]?.price
				const suiyanPrice = suiyanData[SUIYAN_COIN_TYPE]?.price

				if (suiPrice && suiyanPrice) {
					setSuiyanPerSui(suiPrice / suiyanPrice)
				}
			} catch (error) {
				console.error("Failed to fetch prices:", error)
			}
		}

		fetchPrices()
	}, [])

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

	const handleCreateLottery = async () => {
		if (isLoading) return

		// Check if wallet is connected
		if (!currentAccount) {
			setShowConnectWallet(true)
			return
		}

		// Convert to base units (9 decimals for both SUIYAN tokens and SUI)
		const prizeAmount = suiToMist(parseFloat(prizeInTokens) || 0)
		const feeInMist = suiToMist(parseFloat(feeInSui) || 0)

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
				`Insufficient SUIYAN balance. You have ${mistToSui(
					Number(totalBalance)
				)} but need ${mistToSui(prizeAmount)}`
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
					Create a 3x3 lottery with 9 slots. Configure the prize pool and entry
					fee below.
				</p>
			</div>

			{/* Balance & Price Info */}
			<div className="bg-black/40 border border-white/10 p-4 rounded-sm space-y-2">
				<div className="flex justify-between items-center">
					<span className="text-sm text-muted-foreground">Your SUIYAN Balance:</span>
					<span className="text-primary font-bold font-mono">
						{suiyanCoins
							? mistToSui(Number(suiyanCoins.data.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0))))
							: "0"} SUIYAN
					</span>
				</div>
				{suiyanPerSui !== null && (
					<div className="flex justify-between items-center">
						<span className="text-sm text-muted-foreground">Current Rate:</span>
						<span className="text-secondary font-bold font-mono">
							1 SUI = {suiyanPerSui >= 1000000
								? `${(suiyanPerSui / 1000000).toFixed(2)}M`
								: suiyanPerSui >= 1000
								? `${(suiyanPerSui / 1000).toFixed(1)}K`
								: suiyanPerSui.toFixed(0)} SUIYAN
						</span>
					</div>
				)}
			</div>

			{/* Prize Amount Input */}
			<div>
				<label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">
					Prize Pool (SUIYAN Tokens)
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
				<p className="text-xs text-muted-foreground mt-2">
					Winner receives this amount in SUIYAN tokens
				</p>
			</div>

			{/* Fee Input */}
			<div>
				<label className="block text-sm font-bold text-white mb-2 uppercase tracking-wider">
					Entry Fee per Slot (SUI)
				</label>
				<input
					type="number"
					value={feeInSui}
					onChange={(e) => setFeeInSui(e.target.value)}
					step="0.001"
					min="0"
					placeholder="Enter fee amount"
					className="w-full px-4 py-3 border border-white/10 bg-black/40 text-white rounded-sm focus:outline-none focus:border-primary/50 font-mono"
				/>
				<p className="text-xs text-muted-foreground mt-2">
					Players pay this amount to pick a slot
				</p>
			</div>

			<button
				onClick={handleCreateLottery}
				disabled={isLoading}
				className="w-full h-14 bg-gradient-to-r from-primary to-orange-500 text-black font-bold text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isLoading ? "Processing..." : "CREATE LOTTERY"}
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
