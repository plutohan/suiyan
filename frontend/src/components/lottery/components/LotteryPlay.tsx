import { FC, useState } from "react"
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import {
	PACKAGE_ID,
	RANDOM_OBJECT_ID,
	mistToSui,
} from "../../../config/constants"
import { AlertTriangle } from "lucide-react"

interface LotteryData {
	slots: boolean[]
	isActive: boolean
	winningSlot: number
	creator: string
	winner: string | null
	prize: number
	remainingFee: number
	prizeClaimed: boolean
	fee: number  // Fee per slot for this lottery
}

interface LotteryPlayProps {
	lotteryObjectId: string
	lotteryData: LotteryData | null
	slotIndex: number | null
	currentAccountAddress: string | undefined
	isLoading: boolean
	onLoadingChange: (loading: boolean) => void
	onStatusChange: (status: string) => void
	onLotteryUpdate: () => void
}

export const LotteryPlay: FC<LotteryPlayProps> = ({
	lotteryObjectId,
	lotteryData,
	slotIndex,
	currentAccountAddress,
	isLoading,
	onLoadingChange,
	onStatusChange,
	onLotteryUpdate: _onLotteryUpdate,
}) => {
	const { mutate: signAndExecute } = useSignAndExecuteTransaction()
	const [showConfirmModal, setShowConfirmModal] = useState(false)

	const handlePickSlotClick = () => {
		if (!lotteryObjectId || isLoading || slotIndex === null || !lotteryData) return
		setShowConfirmModal(true)
	}

	const handleConfirmPickSlot = async () => {
		setShowConfirmModal(false)
		handlePickSlot()
	}

	const handlePickSlot = async () => {
		if (!lotteryObjectId || isLoading || slotIndex === null || !lotteryData)
			return

		onLoadingChange(true)
		onStatusChange("Picking slot...")

		try {
			const tx = new Transaction()

			const [coin] = tx.splitCoins(tx.gas, [lotteryData.fee])

			tx.moveCall({
				target: `${PACKAGE_ID}::lottery::pick_slot`,
				arguments: [
					tx.pure.u64(slotIndex),
					tx.object(lotteryObjectId),
					tx.object(RANDOM_OBJECT_ID),
					coin,
				],
			})

			signAndExecute(
				{
					transaction: tx,
				},
				{
					onSuccess: async (result) => {
						console.log("Transaction successful:", result)
						onStatusChange(
							`Slot picked successfully! Digest: ${result.digest}`
						)

						// Reload page to refresh balances
						setTimeout(() => window.location.reload(), 1000)
					},
					onError: (error) => {
						console.error("Transaction failed:", error)
						onStatusChange(`Error: ${error.message}`)
						onLoadingChange(false)
					},
				}
			)
		} catch (error: any) {
			console.error("Error picking slot:", error)
			onStatusChange(`Error: ${error.message}`)
			onLoadingChange(false)
		}
	}

	const handleCollectFee = async () => {
		if (!lotteryObjectId || isLoading) return

		onLoadingChange(true)
		onStatusChange("Collecting fees...")

		try {
			const tx = new Transaction()

			tx.moveCall({
				target: `${PACKAGE_ID}::lottery::collect_fee`,
				arguments: [tx.object(lotteryObjectId)],
			})

			signAndExecute(
				{
					transaction: tx,
				},
				{
					onSuccess: async (result) => {
						console.log("Transaction successful:", result)
						onStatusChange(
							`Fees collected successfully! Digest: ${result.digest}`
						)
						setTimeout(() => window.location.reload(), 1000)
					},
					onError: (error) => {
						console.error("Transaction failed:", error)
						onStatusChange(`Error: ${error.message}`)
						onLoadingChange(false)
					},
				}
			)
		} catch (error: any) {
			console.error("Error collecting fees:", error)
			onStatusChange(`Error: ${error.message}`)
			onLoadingChange(false)
		}
	}

	const handleCollectPrize = async () => {
		if (!lotteryObjectId || isLoading) return

		onLoadingChange(true)
		onStatusChange("Collecting prize...")

		try {
			const tx = new Transaction()

			tx.moveCall({
				target: `${PACKAGE_ID}::lottery::collect_prize`,
				arguments: [tx.object(lotteryObjectId)],
			})

			signAndExecute(
				{
					transaction: tx,
				},
				{
					onSuccess: async (result) => {
						console.log("Transaction successful:", result)
						onStatusChange(
							`Prize collected successfully! Digest: ${result.digest}`
						)
						setTimeout(() => window.location.reload(), 1000)
					},
					onError: (error) => {
						console.error("Transaction failed:", error)
						onStatusChange(`Error: ${error.message}`)
						onLoadingChange(false)
					},
				}
			)
		} catch (error: any) {
			console.error("Error collecting prize:", error)
			onStatusChange(`Error: ${error.message}`)
			onLoadingChange(false)
		}
	}

	const isCreator =
		currentAccountAddress &&
		lotteryData &&
		currentAccountAddress === lotteryData.creator
	const isWinner =
		currentAccountAddress &&
		lotteryData &&
		lotteryData.winner &&
		currentAccountAddress === lotteryData.winner
	const canCollectFee =
		isCreator && lotteryData && lotteryData.remainingFee > 0
	const canCollectPrize = isWinner && lotteryData && lotteryData.prize > 0

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
			<h3 className="text-xl font-semibold mb-4">Play Lottery</h3>
			<div className="flex flex-col gap-4">
				{lotteryData && (
					<div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
						<div className="grid grid-cols-2 gap-2 text-sm">
							<div>
								<span className="font-semibold">Prize:</span>{" "}
								{mistToSui(lotteryData.prize)} SUIYAN
								{lotteryData.prize === 0 && (
									<span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
										(Collected ✓)
									</span>
								)}
							</div>
							<div>
								<span className="font-semibold">Entry Fee:</span>{" "}
								{mistToSui(lotteryData.fee)} SUI
							</div>
							<div>
								<span className="font-semibold">Fees Collected:</span>{" "}
								{mistToSui(lotteryData.remainingFee)} SUI
								{lotteryData.remainingFee === 0 && lotteryData.winner && (
									<span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
										(Collected ✓)
									</span>
								)}
							</div>
							<div>
								<span className="font-semibold">Status:</span>{" "}
								{lotteryData.isActive ? (
									<span className="text-green-600 dark:text-green-400">
										Active
									</span>
								) : (
									<span className="text-red-600 dark:text-red-400">
										Ended
									</span>
								)}
							</div>
						</div>
					</div>
				)}

				<button
					onClick={handlePickSlotClick}
					disabled={
						isLoading ||
						!lotteryObjectId ||
						!lotteryData ||
						!lotteryData.isActive ||
						slotIndex === null ||
						(slotIndex !== null && lotteryData.slots[slotIndex])
					}
					className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
					title={
						!lotteryData
							? "Select a lottery first"
							: !lotteryData.isActive
							? "This lottery has ended"
							: slotIndex === null
							? "Select a slot from the grid"
							: slotIndex !== null && lotteryData.slots[slotIndex]
							? "This slot is already taken"
							: "Click to pick this slot"
					}
				>
					{isLoading
						? "Processing..."
						: !lotteryData
						? "Pick Slot"
						: !lotteryData.isActive
						? "Lottery Ended"
						: slotIndex === null
						? "Pick Slot (Select from Grid)"
						: lotteryData.slots[slotIndex]
						? "Slot Taken"
						: `Pick Slot ${slotIndex} (Pay ${mistToSui(lotteryData.fee)} SUI)`}
				</button>

				{/* Confirmation Modal */}
				{showConfirmModal && lotteryData && slotIndex !== null && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
						onClick={() => setShowConfirmModal(false)}
					>
						<div
							className="bg-card border border-primary/30 shadow-2xl max-w-md w-full p-6 space-y-4 rounded-sm"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary/20 rounded-sm">
									<AlertTriangle className="w-6 h-6 text-primary" />
								</div>
								<h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Bangers, system-ui' }}>
									Confirm Selection
								</h3>
							</div>

							<div className="space-y-3 bg-black/30 p-4 rounded-sm border border-white/10">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Slot Number</span>
									<span className="text-white font-bold">{slotIndex}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Entry Fee</span>
									<span className="text-primary font-bold">{mistToSui(lotteryData.fee)} SUI</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Prize Pool</span>
									<span className="text-secondary font-bold">{mistToSui(lotteryData.prize)} SUIYAN</span>
								</div>
							</div>

							<p className="text-sm text-muted-foreground">
								You are about to pick slot {slotIndex}. This action cannot be undone and will deduct {mistToSui(lotteryData.fee)} SUI from your wallet.
							</p>

							<div className="flex gap-3 pt-2">
								<button
									onClick={() => setShowConfirmModal(false)}
									className="flex-1 px-4 py-3 bg-transparent border border-white/20 text-white font-bold uppercase tracking-wider hover:bg-white/5 transition-all"
								>
									Cancel
								</button>
								<button
									onClick={handleConfirmPickSlot}
									className="flex-1 px-4 py-3 bg-primary text-black font-bold uppercase tracking-wider hover:bg-yellow-400 transition-all"
								>
									Confirm
								</button>
							</div>
						</div>
					</div>
				)}

				<div className="flex gap-3">
					<button
						onClick={handleCollectFee}
						disabled={isLoading || !canCollectFee}
						className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
						title={
							!isCreator
								? "Only creator can collect fees"
								: !lotteryData?.remainingFee
								? "No fees to collect"
								: "Collect accumulated fees"
						}
					>
						{isLoading
							? "Processing..."
							: canCollectFee
							? `Collect Fee (${mistToSui(lotteryData!.remainingFee)} SUI)`
							: isCreator &&
							  lotteryData?.remainingFee === 0 &&
							  lotteryData?.winner
							? "Fees Collected ✓"
							: "Collect Fee"}
					</button>

					<button
						onClick={handleCollectPrize}
						disabled={isLoading || !canCollectPrize}
						className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
						title={
							!isWinner
								? "Only winner can collect prize"
								: !lotteryData?.prize
								? "Prize already collected"
								: "Collect your prize!"
						}
					>
						{isLoading
							? "Processing..."
							: canCollectPrize
							? `Collect Prize (${mistToSui(lotteryData!.prize)} SUIYAN)`
							: isWinner && lotteryData?.prize === 0
							? "Prize Collected ✓"
							: "Collect Prize"}
					</button>
				</div>
			</div>
		</div>
	)
}
