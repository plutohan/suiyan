import { Zap, Grid3X3, Trophy, Coins } from "lucide-react"

export function HeroBanner() {
	return (
		<div className="relative w-full mb-12 group">
			{/* Main Container with Tech Borders */}
			<div className="relative overflow-hidden rounded-none border-y-2 border-primary/20 bg-[#050508]">
				{/* Video Background - positioned on the right */}
				<video
					autoPlay
					loop
					muted
					playsInline
					poster="/apple-touch-icon.png"
					className="absolute top-0 right-0 h-full w-auto max-w-none"
					style={{ minHeight: '100%', transform: 'translate(360px, 0px)' }}
					src="/suiyan-hd-loop.mp4"
				/>

				{/* Dark overlay for readability - stronger on left, transparent on right */}
				<div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/60 to-transparent z-[1]"></div>

				{/* Grid overlay */}
				<div className="absolute inset-0 bg-[linear-gradient(rgba(255,215,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,215,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,white,transparent)] z-[2]"></div>

				<div className="relative z-10 p-8 md:p-16">
					{/* Content */}
					<div className="space-y-6 max-w-2xl">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-secondary/10 border border-secondary/40 text-secondary font-mono text-xs tracking-widest uppercase">
							<Zap className="w-3 h-3" />
							On-Chain Lottery on Sui
						</div>

						<h1
							className="text-4xl md:text-6xl font-normal text-white leading-[0.95] drop-shadow-xl"
							style={{ fontFamily: "Bangers, system-ui" }}
						>
							Pick a Slot, <br />
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-orange-500 drop-shadow-[0_0_25px_rgba(255,215,0,0.6)]">
								Win SUIYAN Tokens
							</span>
						</h1>

						<p className="text-base md:text-lg text-gray-400 max-w-lg font-light tracking-wide border-l-2 border-primary/30 pl-4">
							A simple 3x3 lottery game. Each lottery has 9 slots - pick one, and if you're lucky, win the entire prize pool in SUIYAN tokens!
						</p>

						{/* How It Works */}
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
							<div className="flex items-start gap-3 p-3 bg-card/50 border border-white/5 rounded-sm">
								<div className="p-2 bg-primary/10 rounded-sm text-primary shrink-0">
									<Grid3X3 className="w-5 h-5" />
								</div>
								<div>
									<div className="text-sm font-bold text-white">Pick a Slot</div>
									<div className="text-xs text-muted-foreground">Choose 1 of 9 slots</div>
								</div>
							</div>
							<div className="flex items-start gap-3 p-3 bg-card/50 border border-white/5 rounded-sm">
								<div className="p-2 bg-secondary/10 rounded-sm text-secondary shrink-0">
									<Coins className="w-5 h-5" />
								</div>
								<div>
									<div className="text-sm font-bold text-white">Pay Entry Fee</div>
									<div className="text-xs text-muted-foreground">Small fee in SUI</div>
								</div>
							</div>
							<div className="flex items-start gap-3 p-3 bg-card/50 border border-white/5 rounded-sm">
								<div className="p-2 bg-accent/10 rounded-sm text-accent shrink-0">
									<Trophy className="w-5 h-5" />
								</div>
								<div>
									<div className="text-sm font-bold text-white">Win Prize</div>
									<div className="text-xs text-muted-foreground">Get SUIYAN tokens</div>
								</div>
							</div>
						</div>

						{/* Buy Button */}
						<div className="pt-4">
							<a
								href="https://aftermath.finance/trade?from=SUI&to=SUIYAN"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 h-12 px-6 bg-primary text-black hover:bg-yellow-400 font-bold text-base uppercase tracking-wider transition-all hover:scale-105"
							>
								<Coins className="w-5 h-5" />
								Buy $SUIYAN
							</a>
						</div>

						{/* Key Info */}
						<div className="flex flex-wrap gap-4 pt-4 border-t border-white/10 text-sm">
							<div className="flex items-center gap-2 text-muted-foreground">
								<span className="w-2 h-2 bg-green-500 rounded-full"></span>
								Random winner selection on-chain
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<span className="w-2 h-2 bg-primary rounded-full"></span>
								Instant payouts
							</div>
							<div className="flex items-center gap-2 text-muted-foreground">
								<span className="w-2 h-2 bg-secondary rounded-full"></span>
								Create your own lottery
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
