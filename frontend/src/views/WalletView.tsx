import { FC, useEffect, useState } from "react"
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { useNavigation } from "../providers/navigation/NavigationContext"
import { fetchAllLotteries, LotterySummary } from "../components/lottery/lotteryApi"
import { Trophy, Zap, Plus } from "lucide-react"

const WalletView: FC = () => {
	const account = useCurrentAccount()
	const client = useSuiClient()
	const { navigate } = useNavigation()
	const [createdGames, setCreatedGames] = useState<LotterySummary[]>([])
	const [wonGames, setWonGames] = useState<LotterySummary[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const loadGames = async () => {
			if (!account?.address) {
				setCreatedGames([])
				setWonGames([])
				setIsLoading(false)
				return
			}

			setIsLoading(true)
			try {
				const { data } = await fetchAllLotteries(client, 1, 1000)

				const created = data.filter(game => game.creator === account.address)
				const won = data.filter(game => game.winner === account.address)

				setCreatedGames(created)
				setWonGames(won)
			} catch (error) {
				console.error("Failed to load games:", error)
			}
			setIsLoading(false)
		}

		loadGames()
	}, [account?.address, client])

	if (!account?.address) {
		return (
			<div className="container mx-auto px-4 py-8 min-h-screen">
				<h1
					className="text-3xl font-bold text-white mb-8"
					style={{ fontFamily: "Bangers, system-ui" }}
				>
					My Games
				</h1>
				<div className="bg-card border border-white/10 p-8 rounded-sm text-center">
					<p className="text-muted-foreground">
						Please connect your wallet to view your games.
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="container mx-auto px-4 py-8 min-h-screen">
			<h1
				className="text-3xl font-bold text-white mb-8"
				style={{ fontFamily: "Bangers, system-ui" }}
			>
				My Games
			</h1>

			{isLoading ? (
				<div className="text-center py-12">
					<div className="animate-pulse text-primary text-xl font-mono">
						Loading...
					</div>
				</div>
			) : (
				<div className="space-y-8">
					{/* Games I Created */}
					<div>
						<div className="flex items-center gap-2 mb-4">
							<Plus className="w-5 h-5 text-primary" />
							<h2 className="text-xl font-bold text-white uppercase tracking-wider">
								Games I Created
							</h2>
							<span className="text-muted-foreground text-sm">
								({createdGames.length})
							</span>
						</div>
						{createdGames.length === 0 ? (
							<div className="bg-card border border-white/10 p-6 rounded-sm text-center">
								<p className="text-muted-foreground">
									You haven't created any games yet.
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{createdGames.map((game) => (
									<GameRow key={game.id} game={game} onClick={() => navigate(`/lottery/${game.id}`)} />
								))}
							</div>
						)}
					</div>

					{/* Games I Won */}
					<div>
						<div className="flex items-center gap-2 mb-4">
							<Trophy className="w-5 h-5 text-primary" />
							<h2 className="text-xl font-bold text-white uppercase tracking-wider">
								Games I Won
							</h2>
							<span className="text-muted-foreground text-sm">
								({wonGames.length})
							</span>
						</div>
						{wonGames.length === 0 ? (
							<div className="bg-card border border-white/10 p-6 rounded-sm text-center">
								<p className="text-muted-foreground">
									You haven't won any games yet. Keep playing!
								</p>
							</div>
						) : (
							<div className="space-y-3">
								{wonGames.map((game) => (
									<GameRow key={game.id} game={game} onClick={() => navigate(`/lottery/${game.id}`)} />
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

const GameRow: FC<{ game: LotterySummary; onClick: () => void }> = ({ game, onClick }) => {
	const isActive = game.isActive

	return (
		<div
			onClick={onClick}
			className="flex items-center justify-between bg-card border border-white/10 p-4 rounded-sm cursor-pointer hover:border-primary/50 hover:bg-card/80 transition-all"
		>
			<div className="flex items-center gap-4">
				<span
					className={`px-2 py-0.5 text-[10px] tracking-widest uppercase font-bold ${
						isActive
							? "bg-green-500/20 text-green-400"
							: "bg-red-500/20 text-red-400"
					}`}
				>
					{isActive ? "active" : "closed"}
				</span>
				<span className="text-xs text-muted-foreground font-mono">
					ID: {game.id.slice(0, 8)}...{game.id.slice(-4)}
				</span>
			</div>
			<div className="flex items-center gap-6">
				<div className="flex items-center gap-2 text-secondary">
					<Zap className="w-4 h-4" />
					<span className="font-bold">{game.fee} SUI</span>
				</div>
				<div className="text-primary font-bold">
					{game.prize} SUIYAN
				</div>
			</div>
		</div>
	)
}

export default WalletView
