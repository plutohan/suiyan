import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { useNavigation } from "../../../providers/navigation/NavigationContext"
import LotteryCard from "./LotteryCard"
import Pagination from "./Pagination"
import { LotterySummary, fetchAllLotteries } from "../lotteryApi"
import { useSuiClient } from "@mysten/dapp-kit"
import { LotteryCreation } from "./LotteryCreation"
import { HeroBanner } from "../../shared/HeroBanner"
import { Plus, Gamepad2 } from "lucide-react"

const PAGE_SIZE = 12
type FilterMode = "latest" | "active" | "prize"

const LotteryGridList: FC = () => {
	const { navigate } = useNavigation()
	const suiClient = useSuiClient()
	const [games, setGames] = useState<LotterySummary[]>([])
	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [isLoading, setIsLoading] = useState(false)
	const [filterMode, setFilterMode] = useState<FilterMode>("latest")
	const [showCreateModal, setShowCreateModal] = useState(false)

	const loadPage = useCallback(
		async (targetPage: number) => {
			setIsLoading(true)
			const response = await fetchAllLotteries(suiClient, targetPage, PAGE_SIZE)
			setGames(response.data)
			setTotal(response.total)
			setIsLoading(false)
		},
		[suiClient]
	)

	const handleCreateClick = () => {
		setShowCreateModal(true)
	}

	useEffect(() => {
		loadPage(page)
	}, [page, loadPage])

	const handleSelect = (gameId: string) => {
		navigate(`/lottery/${gameId}`)
	}

	const displayedGames = useMemo(() => {
		const sorted = games.slice().sort((a, b) => {
			if (filterMode === "prize") {
				return (b.prizeValue || 0) - (a.prizeValue || 0)
			}
			if (filterMode === "active") {
				if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
				return (b.createdAtMs || 0) - (a.createdAtMs || 0)
			}
			// default: active first, newest first
			if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
			return (b.createdAtMs || 0) - (a.createdAtMs || 0)
		})

		if (filterMode === "active") {
			return sorted.filter((game) => game.isActive)
		}
		return sorted
	}, [filterMode, games])

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Hero Banner */}
			<HeroBanner />

			{/* Control Panel Bar */}
			<div className="flex flex-col gap-6 mb-8 border-b border-white/10 pb-8">
				<div className="flex flex-col md:flex-row justify-between items-end gap-4">
					<div>
						<div className="flex items-center gap-3 mb-2">
							<div className="p-2 bg-primary/10 rounded-sm">
								<Gamepad2 className="w-6 h-6 text-primary" />
							</div>
							<h2
								className="text-3xl font-bold text-white"
								style={{ fontFamily: "Bangers, system-ui" }}
							>
								Active Lotteries
							</h2>
						</div>
						<p className="text-muted-foreground font-mono text-sm">
							Browse available lotteries and join to win.
						</p>
					</div>

					<div className="flex items-center gap-3 bg-card/50 p-2 rounded-lg border border-white/5">
						<span className="bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-none px-3 py-1 font-mono text-xs">
							{displayedGames.length} Found
						</span>
						<span className="border border-white/10 rounded-none px-3 py-1 font-mono text-xs text-muted-foreground bg-transparent">
							SYNCED
						</span>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 justify-between bg-card/30 p-4 rounded-sm border border-white/5 backdrop-blur-sm">
					<div className="flex items-center gap-4">
						<span className="text-sm font-bold text-primary uppercase tracking-wider">
							Filters:
						</span>
						<div className="flex gap-2">
							<button
								onClick={() => setFilterMode("latest")}
								className={`h-8 px-3 border text-xs font-mono uppercase tracking-wider ${
									filterMode === "latest"
										? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
										: "border-white/10 bg-transparent hover:bg-white/5 text-muted-foreground"
								}`}
							>
								ALL
							</button>
							<button
								onClick={() => setFilterMode("active")}
								className={`h-8 px-3 border text-xs font-mono uppercase tracking-wider ${
									filterMode === "active"
										? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
										: "border-white/10 bg-transparent hover:bg-white/5 text-muted-foreground"
								}`}
							>
								ACTIVE
							</button>
							<button
								onClick={() => setFilterMode("prize")}
								className={`h-8 px-3 border text-xs font-mono uppercase tracking-wider ${
									filterMode === "prize"
										? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
										: "border-white/10 bg-transparent hover:bg-white/5 text-muted-foreground"
								}`}
							>
								HIGH STAKES
							</button>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<button
							onClick={() => loadPage(page)}
							disabled={isLoading}
							className="h-9 px-4 bg-transparent border border-white/10 text-xs font-mono uppercase tracking-wider hover:bg-white/5 disabled:opacity-50"
						>
							{isLoading ? "..." : "REFRESH"}
						</button>

						<button
							onClick={handleCreateClick}
							className="h-9 px-4 bg-secondary text-black hover:bg-cyan-400 font-bold text-xs skew-x-[-10deg] uppercase tracking-wider"
						>
							<span className="skew-x-[10deg] flex items-center gap-2">
								<Plus className="w-4 h-4" />
								CREATE
							</span>
						</button>
					</div>
				</div>
			</div>

			{/* Grid */}
			<div
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
				role="grid"
				aria-live="polite"
			>
				{isLoading &&
					Array.from({ length: PAGE_SIZE }).map((_, index) => (
						<div
							key={index}
							className="animate-pulse bg-card/30 border border-white/10 aspect-square"
							role="presentation"
						/>
					))}
				{!isLoading &&
					displayedGames.map((game) => (
						<div role="gridcell" key={game.id}>
							<LotteryCard game={game} onSelect={handleSelect} />
						</div>
					))}
				{!isLoading && displayedGames.length === 0 && (
					<div className="col-span-full text-center py-16">
						<p className="text-xl font-semibold text-white mb-2">
							No lotteries available
						</p>
						<p className="text-sm text-muted-foreground">
							Be the first to create one!
						</p>
					</div>
				)}
			</div>

			{/* Pagination */}
			<Pagination
				page={page}
				pageSize={PAGE_SIZE}
				total={total}
				onPageChange={setPage}
			/>

			{/* Create Modal */}
			{showCreateModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-slide-up"
					role="dialog"
					aria-modal="true"
					aria-label="Create new lottery"
					onClick={() => setShowCreateModal(false)}
				>
					<div
						className="bg-card border border-primary/30 shadow-2xl max-w-lg w-full p-8 relative rounded-sm"
						onClick={(e) => e.stopPropagation()}
					>
						<button
							type="button"
							onClick={() => setShowCreateModal(false)}
							className="absolute top-4 right-4 text-2xl text-muted-foreground hover:text-white transition-colors"
							aria-label="Close create lottery modal"
						>
							✕
						</button>
						<div id="create-lottery-section">
							<LotteryCreation
								isLoading={isLoading}
								onLoadingChange={setIsLoading}
								onStatusChange={() => {}}
								onLotteryCreated={() => {
									setShowCreateModal(false)
									loadPage(page)
								}}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default LotteryGridList
