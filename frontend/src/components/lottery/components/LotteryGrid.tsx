import { FC } from "react"
import { Trophy, Shield } from "lucide-react"

interface LotteryGridProps {
	slots: boolean[]
	isActive: boolean
	winningSlot: number
	selectedSlot: number | null
	onSlotSelect: (index: number) => void
}

export const LotteryGrid: FC<LotteryGridProps> = ({
	slots,
	isActive,
	winningSlot,
	selectedSlot,
	onSlotSelect,
}) => {
	const getSlotStyle = (isTaken: boolean, index: number) => {
		const isWinning = !isActive && index === winningSlot
		const isSelected = selectedSlot === index

		if (isWinning) {
			return "bg-primary border-primary shadow-[0_0_20px_rgba(255,215,0,0.6)] z-10 ring-2 ring-yellow-200 animate-pulse"
		}
		if (isTaken) {
			return "bg-red-900/60 border-red-500/50 cursor-not-allowed"
		}
		if (isSelected) {
			return "bg-secondary border-secondary shadow-[0_0_15px_rgba(0,240,255,0.5)] scale-105 z-10"
		}
		if (!isActive) {
			return "bg-black/40 border-white/10 cursor-not-allowed opacity-50"
		}
		return "bg-black/40 border-white/10 hover:border-primary/50 hover:bg-primary/10 cursor-pointer hover:scale-105"
	}

	return (
		<div className="grid grid-cols-3 gap-4 max-w-md w-full">
			{slots.map((isTaken, index) => {
				const isWinning = !isActive && index === winningSlot
				const isSelected = selectedSlot === index
				const isAvailable = isActive && !isTaken

				return (
					<button
						key={index}
						type="button"
						onClick={() => isAvailable ? onSlotSelect(index) : null}
						disabled={!isAvailable}
						className={`
							aspect-square rounded-sm border-2 flex items-center justify-center
							transition-all duration-200 relative overflow-hidden
							${getSlotStyle(isTaken, index)}
						`}
						title={`Slot ${index}${isTaken
							? " (Taken)"
							: !isActive
								? " (Lottery Ended)"
								: " (Available)"
							}${isWinning ? " - WINNER!" : ""}`}
					>
						{/* Tech lines overlay */}
						<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.1)_50%,transparent_55%)] bg-[length:200%_200%]"></div>

						{/* Slot content */}
						{isWinning ? (
							<Trophy className="w-12 h-12 text-black drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
						) : isTaken ? (
							<Shield className="w-8 h-8 text-red-400" />
						) : (
							<span className={`text-4xl font-mono ${isSelected ? 'text-black font-bold' : 'text-white/20'}`}>
								{index}
							</span>
						)}

						{/* Selected indicator */}
						{isSelected && (
							<div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
						)}

						{/* Winner glow effect */}
						{isWinning && (
							<div className="absolute inset-0 bg-yellow-400/20 blur-sm"></div>
						)}
					</button>
				)
			})}
		</div>
	)
}
