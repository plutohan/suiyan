import React, { useState } from "react"
import { useNavigation } from "../../providers/navigation/NavigationContext"
import { ConnectButton, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit"
import { SUIYAN_TOKEN_TYPE, mistToSui } from "../../config/constants"

const NavBar: React.FC = () => {
	const { currentPage, navigate } = useNavigation()
	const [showHowTo, setShowHowTo] = useState(false)
	const [showMobileMenu, setShowMobileMenu] = useState(false)
	const currentAccount = useCurrentAccount()

	// Fetch SUI balance
	const { data: suiBalance } = useSuiClientQuery(
		"getBalance",
		{
			owner: currentAccount?.address || "",
			coinType: "0x2::sui::SUI",
		},
		{
			enabled: !!currentAccount,
		}
	)

	// Fetch SUIYAN token balance
	const { data: suiyanBalance } = useSuiClientQuery(
		"getBalance",
		{
			owner: currentAccount?.address || "",
			coinType: SUIYAN_TOKEN_TYPE,
		},
		{
			enabled: !!currentAccount,
		}
	)

	return (
		<header className="sticky top-0 z-50 w-full border-b border-primary/30 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 h-20 flex items-center justify-between">
				<div className="flex items-center gap-6">
					{/* Logo */}
					<div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
						<div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-110">
							<div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse"></div>
							<img
								src="/apple-touch-icon.png"
								alt="Suiyan"
								className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"
							/>
						</div>
						<span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] pr-1" style={{ fontFamily: 'Bangers, system-ui', letterSpacing: '0.05em' }}>
							SUIYAN PLAY
						</span>
					</div>

					{/* Desktop Nav */}
					<nav className="hidden md:flex items-center gap-1 ml-8">
						<NavButton
							label="Lottery"
							active={currentPage === "/lottery" || currentPage.startsWith("/lottery/")}
							onClick={() => navigate("/lottery")}
						/>
						<NavButton
							label="Wallet"
							active={currentPage === "/wallet"}
							onClick={() => navigate("/wallet")}
						/>
					</nav>
				</div>

				<div className="flex items-center gap-4">
					{/* Balance Display */}
					{currentAccount && (
						<div className="hidden md:flex items-center gap-3 px-4 py-2 bg-card/50 border border-primary/20 rounded">
							<div className="flex flex-col text-xs">
								<div className="flex items-center gap-2">
									<span className="font-bold text-primary uppercase tracking-wider">SUIYAN:</span>
									<span className="font-mono text-foreground font-semibold">
										{suiyanBalance ? mistToSui(parseInt(suiyanBalance.totalBalance)) : "0"}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="font-bold text-secondary uppercase tracking-wider">SUI:</span>
									<span className="font-mono text-foreground font-semibold">
										{suiBalance ? mistToSui(parseInt(suiBalance.totalBalance)) : "0"}
									</span>
								</div>
							</div>
						</div>
					)}

					<button
						onClick={() => setShowHowTo(true)}
						className="hidden md:flex px-4 py-2 rounded font-bold text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-all uppercase tracking-wide"
					>
						❓ How To Play
					</button>

					<div className="hidden md:block">
						<ConnectButton />
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setShowMobileMenu(!showMobileMenu)}
						className="md:hidden p-2 text-muted-foreground hover:text-white transition-colors"
						aria-label="Toggle menu"
					>
						{showMobileMenu ? (
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						) : (
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						)}
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{showMobileMenu && (
				<div className="md:hidden border-t border-primary/20 bg-background/95 backdrop-blur-xl">
					<div className="container mx-auto px-4 py-4 space-y-4">
						{/* Mobile Nav Links */}
						<nav className="flex flex-col gap-2">
							<button
								onClick={() => { navigate("/lottery"); setShowMobileMenu(false); }}
								className={`text-left px-4 py-3 font-bold uppercase tracking-wide transition-all ${
									currentPage === "/lottery" || currentPage.startsWith("/lottery/")
										? "text-primary bg-primary/10 border-l-2 border-primary"
										: "text-muted-foreground hover:text-white hover:bg-white/5"
								}`}
							>
								Lottery
							</button>
							<button
								onClick={() => { navigate("/wallet"); setShowMobileMenu(false); }}
								className={`text-left px-4 py-3 font-bold uppercase tracking-wide transition-all ${
									currentPage === "/wallet"
										? "text-primary bg-primary/10 border-l-2 border-primary"
										: "text-muted-foreground hover:text-white hover:bg-white/5"
								}`}
							>
								Wallet
							</button>
							<button
								onClick={() => { setShowHowTo(true); setShowMobileMenu(false); }}
								className="text-left px-4 py-3 font-bold uppercase tracking-wide text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-all"
							>
								How To Play
							</button>
						</nav>

						{/* Mobile Balance Display */}
						{currentAccount && (
							<div className="flex items-center gap-3 px-4 py-3 bg-card/50 border border-primary/20 rounded">
								<div className="flex flex-col text-sm">
									<div className="flex items-center gap-2">
										<span className="font-bold text-primary uppercase tracking-wider">SUIYAN:</span>
										<span className="font-mono text-foreground font-semibold">
											{suiyanBalance ? mistToSui(parseInt(suiyanBalance.totalBalance)) : "0"}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="font-bold text-secondary uppercase tracking-wider">SUI:</span>
										<span className="font-mono text-foreground font-semibold">
											{suiBalance ? mistToSui(parseInt(suiBalance.totalBalance)) : "0"}
										</span>
									</div>
								</div>
							</div>
						)}

						{/* Mobile Connect Button */}
						<div className="px-4">
							<ConnectButton />
						</div>
					</div>
				</div>
			)}

			{/* Decorative Bottom Line */}
			<div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

			{/* How To Play Modal */}
			{showHowTo && (
				<div
					className="fixed inset-0 h-screen z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-slide-up"
					role="dialog"
					aria-modal="true"
					aria-label="How to play"
					onClick={() => setShowHowTo(false)}
				>
					<div
						className="bg-card border border-primary/30 shadow-2xl max-w-2xl w-full p-8 space-y-6 animate-slide-up rounded-sm"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between">
							<h3
								className="text-3xl font-bold text-white uppercase tracking-wider"
								style={{ fontFamily: "Bangers, system-ui" }}
							>
								How To Play
							</h3>
							<button
								onClick={() => setShowHowTo(false)}
								aria-label="Close how to play modal"
								className="text-3xl text-muted-foreground hover:text-white transition-colors"
							>
								✕
							</button>
						</div>

						<h4 className="text-lg font-bold text-secondary uppercase tracking-wider">For Players</h4>
						<ol className="list-decimal list-inside space-y-4 text-base text-gray-300">
							<li className="pl-2">
								<strong className="text-primary uppercase">Connect Wallet:</strong> Use
								the button on the top right to connect your Sui wallet.
							</li>
							<li className="pl-2">
								<strong className="text-primary uppercase">Choose Lottery:</strong> Pick
								a lottery from the home grid and click a card to open its 3x3 board.
							</li>
							<li className="pl-2">
								<strong className="text-primary uppercase">Pick Slot:</strong> Select
								an available slot on the board and confirm to submit your pick
								transaction. Entry fee is paid in SUI.
							</li>
							<li className="pl-2">
								<strong className="text-primary uppercase">Win & Claim:</strong> If you
								win, collect your prize in SUIYAN tokens!
							</li>
						</ol>

						<h4 className="text-lg font-bold text-secondary uppercase tracking-wider pt-4 border-t border-white/10">For Creators</h4>
						<ol className="list-decimal list-inside space-y-4 text-base text-gray-300">
							<li className="pl-2">
								<strong className="text-primary uppercase">Create Lottery:</strong> Set
								your SUIYAN prize pool and choose a return multiplier.
							</li>
							<li className="pl-2">
								<strong className="text-primary uppercase">Set Multiplier:</strong> Lower
								multiplier = higher entry fee = more profit. Below 9x means you profit!
							</li>
							<li className="pl-2">
								<strong className="text-primary uppercase">Collect Fees:</strong> Once
								all 9 slots are filled, collect your SUI entry fees from the lottery.
							</li>
						</ol>

						<div className="flex justify-end pt-4 border-t border-white/10">
							<button
								onClick={() => setShowHowTo(false)}
								className="px-8 py-3 bg-gradient-to-r from-primary to-orange-500 text-black font-bold uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)] border-b-4 border-orange-700 active:border-b-0 active:translate-y-1"
							>
								Got it!
							</button>
						</div>
					</div>
				</div>
			)}
		</header>
	)
}

function NavButton({ label, active = false, onClick }: { label: string, active?: boolean, onClick?: () => void }) {
	return (
		<button
			onClick={onClick}
			className={`
				relative h-10 px-4 gap-2 font-bold tracking-wide uppercase text-sm
				${active
					? 'text-primary bg-primary/10 border-b-2 border-primary'
					: 'text-muted-foreground hover:text-foreground hover:bg-white/5'
				}
				transition-all duration-200
			`}
		>
			{label}
			{active && (
				<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_rgba(255,215,0,0.8)]"></div>
			)}
		</button>
	)
}

export default NavBar
