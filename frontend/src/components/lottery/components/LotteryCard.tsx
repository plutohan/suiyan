import { FC } from "react"
import { LotterySummary } from "../lotteryApi"
import { Trophy, Users, Zap } from "lucide-react"

type Props = {
	game: LotterySummary
	onSelect: (id: string) => void
}

const LotteryCard: FC<Props> = ({ game, onSelect }) => {
	const isActive = game.isActive
	const statusLabel = isActive ? "active" : "closed"

	const slots = game.slots.length ? game.slots : Array(9).fill(false)
	const participants = slots.filter((slot) => slot).length
	const availableSlots = slots.filter((slot) => !slot).length

	const getSlotStyle = (isTaken: boolean, index: number) => {
		const isWinning = !isActive && index === game.winningSlot
		if (isWinning) {
			return "bg-primary border-primary shadow-[0_0_15px_rgba(255,215,0,0.8)] z-10 scale-110"
		}
		if (isTaken) {
			return "bg-red-900/60 border-red-500/50"
		}
		return "bg-muted/20 border-white/10 hover:border-primary/50 hover:bg-primary/10"
	}

	return (
		<div
			className="group relative cursor-pointer transition-all duration-300 hover:-translate-y-2"
			onClick={() => onSelect(game.id)}
		>
			{/* Card Frame */}
			<div className="relative h-full bg-card border border-white/10 overflow-hidden transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(255,215,0,0.15)]">
				{/* Status Banner */}
				<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-primary/50 transition-all"></div>

				<div className="p-5 space-y-6">
					{/* Header */}
					<div className="flex justify-between items-start">
						<div>
							<div className="flex items-center gap-2 mb-1">
								<span
									className={`rounded-none border-0 px-2 py-0.5 text-[10px] tracking-widest uppercase font-bold ${
										statusLabel === "active"
											? "bg-green-500/20 text-green-400"
											: "bg-red-500/20 text-red-400"
									}`}
								>
									{statusLabel}
								</span>
								<span className="text-xs text-muted-foreground font-mono">
									ID: {game.id.slice(0, 6)}
								</span>
							</div>
							<h3 className="text-xl font-bold text-white tracking-wide group-hover:text-primary transition-colors" style={{ fontFamily: 'Bangers, system-ui' }}>
								Lottery #{game.id.slice(-4)}
							</h3>
						</div>

						<div className="text-right">
							<div className="text-xs text-muted-foreground uppercase tracking-wider">
								Prize Pool
							</div>
							<div className="text-xl font-bold text-primary drop-shadow-sm">
								{game.prize} SUIYAN
							</div>
						</div>
					</div>

					{/* Slots Grid */}
					<div className="grid grid-cols-3 gap-2 p-3 bg-black/40 rounded-sm border border-white/5">
						{slots.slice(0, 9).map((isTaken, index) => {
							const isWinning = !isActive && index === game.winningSlot
							return (
								<div
									key={index}
									className={`aspect-square rounded-sm border flex items-center justify-center transition-all duration-300 ${getSlotStyle(
										isTaken,
										index
									)}`}
								>
									{isWinning ? (
										<Trophy className="w-4 h-4 text-black animate-pulse" />
									) : (
										<span
											className={`text-xs font-mono ${
												isTaken ? "text-white/20" : "text-white/20"
											}`}
										>
											{index}
										</span>
									)}
								</div>
							)
						})}
					</div>

					{/* Footer Stats */}
					<div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
						<div className="flex items-center gap-3 text-sm text-gray-400">
							<div className="p-2 bg-secondary/10 rounded-sm text-secondary">
								<Users className="w-4 h-4" />
							</div>
							<div>
								<div className="text-white font-bold">{participants}/9</div>
								<div className="text-[10px] uppercase">Players</div>
							</div>
						</div>

						<div className="flex items-center gap-3 text-sm text-gray-400 justify-end">
							<div className="text-right">
								<div className="text-white font-bold">{game.fee} SUI</div>
								<div className="text-[10px] uppercase">Entry Fee</div>
							</div>
							<div className="p-2 bg-primary/10 rounded-sm text-primary">
								<Zap className="w-4 h-4" />
							</div>
						</div>
					</div>
				</div>

				{/* Corner Accents */}
				<div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
				<div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/30 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
			</div>
		</div>
	)
}

export default LotteryCard
