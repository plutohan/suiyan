import { FC, useEffect, useMemo, useState } from "react"
import { useNavigation } from "../../../providers/navigation/NavigationContext"
import { LotteryGrid } from "./LotteryGrid"
import { LotterySummary, fetchLotteryDetail } from "../lotteryApi"
import {
	ConnectButton,
	useCurrentAccount,
	useSignAndExecuteTransaction,
	useSuiClient,
} from "@mysten/dapp-kit"
import {
	mistToSui,
	PACKAGE_ID,
	RANDOM_OBJECT_ID,
} from "../../../config/constants"
import { Transaction } from "@mysten/sui/transactions"
import { ArrowLeft, Users, Zap, Trophy, Crosshair, Wallet } from "lucide-react"

type Props = {
	gameId: string
}

const LotteryDetailPage: FC<Props> = ({ gameId }) => {
	const { navigate } = useNavigation()
	const suiClient = useSuiClient()
	const currentAccount = useCurrentAccount()
	const { mutate: signAndExecute } = useSignAndExecuteTransaction()
	const [lottery, setLottery] = useState<LotterySummary | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
	const [showConfirm, setShowConfirm] = useState(false)
	const [showConnectWallet, setShowConnectWallet] = useState(false)
	const [statusMessage, setStatusMessage] = useState<string>("")

	useEffect(() => {
		setSelectedSlot(null)
		window.scrollTo(0, 0)
	}, [gameId])

	useEffect(() => {
		let isMounted = true
		const load = async () => {
			setIsLoading(true)
			const detail = await fetchLotteryDetail(suiClient, gameId)
			if (!isMounted) return
			setLottery(detail)
			setIsLoading(false)
			setStatusMessage("")
		}
		load()
		return () => {
			isMounted = false
		}
	}, [gameId, suiClient])

	const handleSlotSelect = (slot: number) => {
		if (!lottery) return
		setSelectedSlot(slot)
	}

	const handlePickSlot = async () => {
		if (!lottery || selectedSlot === null || !lottery.isActive) return
		if (!currentAccount) {
			setStatusMessage("지갑을 연결해주세요.")
			return
		}
		setIsSubmitting(true)
		setStatusMessage("Picking slot...")

		try {
			const tx = new Transaction()
			const [coin] = tx.splitCoins(tx.gas, [lottery.feeMist])

			tx.moveCall({
				target: `${PACKAGE_ID}::lottery::pick_slot`,
				arguments: [
					tx.pure.u64(selectedSlot),
					tx.object(lottery.id),
					tx.object(RANDOM_OBJECT_ID),
					coin,
				],
			})

			signAndExecute(
				{ transaction: tx },
				{
					onSuccess: async (result) => {
						setStatusMessage(
							`Slot picked! Digest: ${result.digest}`
						)

						setShowConfirm(false)
						setIsSubmitting(false)
						setTimeout(() => {
							window.location.reload()
						}, 1000)
					},
					onError: (error) => {
						setStatusMessage(`Error: ${error.message}`)
						setIsSubmitting(false)
					},
				}
			)
		} catch (error: any) {
			setStatusMessage(`Error: ${error.message}`)
			setIsSubmitting(false)
		}
	}

	const availableSlots = useMemo(
		() => (lottery ? lottery.slots.filter((s) => !s).length : 0),
		[lottery]
	)

	const isCreator =
		currentAccount?.address && lottery?.creator
			? currentAccount.address === lottery.creator
			: false
	const isWinner =
		currentAccount?.address && lottery?.winner
			? currentAccount.address === lottery.winner
			: false
	const canCollectFee =
		isCreator && lottery?.remainingFeeMist && lottery.remainingFeeMist > 0
	const canCollectPrize =
		isWinner &&
		lottery?.prizeMist &&
		lottery.prizeMist > 0 &&
		!lottery.prizeClaimed

	const handleCollectFee = async () => {
		if (!lottery || !isCreator) return
		setIsSubmitting(true)
		setStatusMessage("Collecting fees...")
		try {
			const tx = new Transaction()
			tx.moveCall({
				target: `${PACKAGE_ID}::lottery::collect_fee`,
				arguments: [tx.object(lottery.id)],
			})
			signAndExecute(
				{ transaction: tx },
				{
					onSuccess: async (result) => {
						setStatusMessage(
							`Fees collected! Digest: ${result.digest}`
						)
						setIsSubmitting(false)
						setTimeout(() => {
							window.location.reload()
						}, 1000)
					},
					onError: (error) => {
						setStatusMessage(`Error: ${error.message}`)
						setIsSubmitting(false)
					},
				}
			)
		} catch (error: any) {
			setStatusMessage(`Error: ${error.message}`)
			setIsSubmitting(false)
		}
	}

	const handleCollectPrize = async () => {
		if (!lottery || !isWinner) return
		setIsSubmitting(true)
		setStatusMessage("Collecting prize...")
		try {
			const tx = new Transaction()
			tx.moveCall({
				target: `${PACKAGE_ID}::lottery::collect_prize`,
				arguments: [tx.object(lottery.id)],
			})
			signAndExecute(
				{ transaction: tx },
				{
					onSuccess: async (result) => {
						setStatusMessage(
							`Prize collected! Digest: ${result.digest}`
						)
						setIsSubmitting(false)
						setTimeout(() => {
							window.location.reload()
						}, 1000)
					},
					onError: (error) => {
						setStatusMessage(`Error: ${error.message}`)
						setIsSubmitting(false)
					},
				}
			)
		} catch (error: any) {
			setStatusMessage(`Error: ${error.message}`)
			setIsSubmitting(false)
		}
	}

	if (!lottery && !isLoading) {
		return (
			<div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
				<button
					type="button"
					onClick={() => navigate("/lottery")}
					className="gap-2 text-muted-foreground hover:text-white hover:bg-white/5 font-mono uppercase tracking-wider px-4 py-2 inline-flex items-center w-fit"
					aria-label="Back to lottery list"
				>
					<ArrowLeft className="w-4 h-4" />
					Back
				</button>
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<p className="text-xl font-semibold text-white mb-2">
							Lottery not found
						</p>
						<p className="text-sm text-muted-foreground">
							This lottery does not exist
						</p>
					</div>
				</div>
			</div>
		)
	}

	const isActive = lottery?.isActive ?? false

	return (
		<div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
			{/* Top Bar */}
			<div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
				<button
					type="button"
					onClick={() => navigate("/lottery")}
					className="gap-2 text-muted-foreground hover:text-white hover:bg-white/5 font-mono uppercase tracking-wider px-4 py-2 inline-flex items-center bg-transparent border-0"
				>
					<ArrowLeft className="w-4 h-4" />
					Back
				</button>

				<div className="flex items-center gap-4">
					<div className="text-right hidden md:block">
						<div className="text-xs text-muted-foreground uppercase tracking-widest">
							Lottery ID
						</div>
						<div className="text-lg font-bold text-white font-mono tracking-wide">
							{gameId.slice(0, 8)}...{gameId.slice(-6)}
						</div>
					</div>
					<span
						className={`h-10 px-4 border rounded-none font-mono inline-flex items-center ${
							isActive
								? "border-green-500/50 text-green-400 bg-green-900/20"
								: "border-red-500/50 text-red-400 bg-red-900/20"
						}`}
					>
						STATUS: {isActive ? "ACTIVE" : "ENDED"}
					</span>
				</div>
			</div>

			{isLoading && (
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-pulse text-primary text-xl font-mono">
							Loading...
						</div>
					</div>
				</div>
			)}

			{lottery && (
				<div className="grid lg:grid-cols-12 gap-8 flex-1">
					{/* Left Column: The Grid (Tactical Map) */}
					<div className="lg:col-span-7 flex flex-col">
						<div className="flex-1 bg-card/30 border border-white/10 p-1 relative overflow-hidden group">
							{/* Decorative corners */}
							<div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50"></div>
							<div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50"></div>
							<div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50"></div>
							<div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50"></div>

							<div className="h-full p-8 flex flex-col items-center justify-center">
								<h2
									className="text-2xl font-bold text-white mb-8 flex items-center gap-2"
									style={{ fontFamily: "Bangers, system-ui" }}
								>
									<Crosshair className="w-6 h-6 text-primary" />
									Pick Your Slot
								</h2>

								<LotteryGrid
									slots={lottery.slots}
									isActive={isActive}
									winningSlot={lottery.winningSlot}
									selectedSlot={selectedSlot}
									onSlotSelect={handleSlotSelect}
								/>

								{/* Grid Legend */}
								<div className="flex gap-6 mt-12 text-xs font-mono uppercase tracking-wider text-muted-foreground">
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 border border-white/20 bg-black/50"></div>{" "}
										Available
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-secondary"></div>{" "}
										Selected
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-red-900/50 border border-red-500/50"></div>{" "}
										Taken
									</div>
									<div className="flex items-center gap-2">
										<div className="w-3 h-3 bg-primary animate-pulse"></div>{" "}
										Winner
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column: Intel & Actions */}
					<div className="lg:col-span-5 space-y-6">
						{/* Prize Card */}
						<div className="relative bg-gradient-to-b from-purple-900/20 to-black border border-primary/20 p-6 rounded-sm overflow-hidden">
							<div className="absolute top-0 right-0 p-4 opacity-20">
								<img
									src="/apple-touch-icon.png"
									className="w-64 h-64 object-contain [mask-image:linear-gradient(to_bottom,black,transparent)]"
									alt=""
								/>
							</div>

							<div className="relative z-10">
								<div className="inline-block px-2 py-1 bg-primary text-black font-bold text-xs uppercase skew-x-[-10deg] mb-4">
									Top Prize
								</div>
								<h3
									className="text-4xl font-bold text-white mb-1"
									style={{ fontFamily: "Bangers, system-ui" }}
								>
									{lottery.prize} SUIYAN
								</h3>
								<p className="text-secondary font-mono text-sm tracking-wide mb-6">
									ESTIMATED JACKPOT
								</p>

								<div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
									<div className="space-y-1">
										<div className="text-xs text-muted-foreground uppercase">
											Entry Fee
										</div>
										<div className="text-xl font-bold text-white flex items-center gap-1">
											<Zap className="w-4 h-4 text-primary" />{" "}
											{lottery.fee}
										</div>
									</div>
									<div className="space-y-1">
										<div className="text-xs text-muted-foreground uppercase">
											Slots Filled
										</div>
										<div className="text-xl font-bold text-white flex items-center gap-1">
											<Users className="w-4 h-4 text-secondary" />{" "}
											{
												lottery.slots.filter((s) => s)
													.length
											}{" "}
											/ {lottery.slotCount}
										</div>
									</div>
									{isActive && availableSlots > 0 && (
									<div className="space-y-1">
										<div className="text-xs text-muted-foreground uppercase">
											Win Odds
										</div>
										<div className="text-xl font-bold text-green-400 flex items-center gap-1">
											1/{availableSlots} ({(100 / availableSlots).toFixed(1)}%)
										</div>
									</div>
								)}
									<div className="space-y-1">
										<div className="text-xs text-muted-foreground uppercase">
											Creator Fee
										</div>
										<div className="text-xl font-bold text-white flex items-center gap-1">
											{lottery.remainingFee}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Action Panel */}
						<div className="bg-card border border-white/10 p-6 rounded-sm">
							<h4
								className="text-lg font-bold text-white mb-4 uppercase tracking-wider"
								style={{ fontFamily: "Bangers, system-ui" }}
							>
								Actions
							</h4>

							<div className="space-y-4">
								{selectedSlot !== null && (
									<div className="flex justify-between items-center text-sm">
										<span className="text-muted-foreground">
											Selected Slot:
										</span>
										<span className="text-white font-bold font-mono">
											{selectedSlot}
										</span>
									</div>
								)}
								<div className="flex justify-between items-center text-sm">
									<span className="text-muted-foreground">
										Entry Fee:
									</span>
									<span className="text-primary font-bold font-mono">
										{lottery.fee} SUI
									</span>
								</div>

								<button
									onClick={() => {
										if (selectedSlot === null || !isActive || lottery.slots[selectedSlot]) return
										if (!currentAccount) {
											setShowConnectWallet(true)
											return
										}
										setShowConfirm(true)
									}}
									disabled={
										!isActive ||
										selectedSlot === null ||
										lottery.slots[selectedSlot] ||
										isSubmitting
									}
									className="w-full h-14 bg-gradient-to-r from-primary to-orange-500 text-black font-bold text-xl uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{!isActive
										? "LOTTERY ENDED"
										: selectedSlot === null
										? "SELECT SLOT"
										: lottery.slots[selectedSlot]
										? "SLOT TAKEN"
										: "PICK SLOT"}
								</button>

								{/* Collect Buttons */}
								{(canCollectFee || canCollectPrize) && (
									<div className="pt-4 border-t border-white/10 space-y-3">
										{canCollectFee && (
											<button
												onClick={handleCollectFee}
												disabled={isSubmitting}
												className="w-full h-12 bg-secondary text-black font-bold uppercase tracking-wider hover:bg-cyan-400 transition-all disabled:opacity-50"
											>
												COLLECT FEE (
												{lottery.remainingFee} SUI)
											</button>
										)}
										{canCollectPrize && (
											<button
												onClick={handleCollectPrize}
												disabled={isSubmitting}
												className="w-full h-12 bg-primary text-black font-bold uppercase tracking-wider hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
											>
												<Trophy className="w-5 h-5" />
												COLLECT PRIZE ({
													lottery.prize
												}{" "}
												SUIYAN)
											</button>
										)}
									</div>
								)}
							</div>
						</div>

						{statusMessage && (
							<div className="bg-card/50 border border-primary/20 p-4 rounded-sm">
								<p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
									{statusMessage}
								</p>
							</div>
						)}
					</div>
				</div>
			)}
			{showConfirm && lottery && selectedSlot !== null && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-slide-up"
					role="dialog"
					aria-modal="true"
					aria-label="Confirm pick slot"
					onClick={() => !isSubmitting && setShowConfirm(false)}
				>
					<div
						className="bg-card border border-primary/30 shadow-2xl max-w-md w-full p-8 space-y-6 rounded-sm"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="text-center">
							<div className="text-5xl mb-3">
								<Crosshair className="w-16 h-16 text-primary mx-auto animate-pulse" />
							</div>
							<h3
								className="text-2xl font-bold text-white uppercase tracking-wider"
								style={{ fontFamily: "Bangers, system-ui" }}
							>
								Confirm Selection
							</h3>
						</div>
						<div className="bg-black/40 border border-white/10 p-4 rounded-sm">
							<div className="flex justify-between items-center">
								<span className="text-muted-foreground text-sm uppercase">
									Slot:
								</span>
								<span className="text-white font-bold font-mono text-xl">
									{selectedSlot}
								</span>
							</div>
							<div className="flex justify-between items-center mt-2">
								<span className="text-muted-foreground text-sm uppercase">
									Entry Fee:
								</span>
								<span className="text-primary font-bold font-mono text-xl">
									{mistToSui(lottery.feeMist)} SUI
								</span>
							</div>
						</div>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setShowConfirm(false)}
								className="flex-1 px-6 py-3 border border-white/10 font-bold uppercase tracking-wider hover:bg-white/5 transition-all bg-transparent text-white"
								disabled={isSubmitting}
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handlePickSlot}
								disabled={isSubmitting}
								className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-black font-bold uppercase tracking-wider hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] disabled:opacity-60 disabled:scale-100"
							>
								{isSubmitting ? "Processing..." : "CONFIRM"}
							</button>
						</div>
					</div>
				</div>
			)}
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
								Please connect your wallet to pick a slot
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

export default LotteryDetailPage
