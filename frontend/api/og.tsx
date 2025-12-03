import { ImageResponse } from "@vercel/og"

export const config = {
	runtime: "edge",
}

// Fonts will be loaded from Google Fonts
const COLORS = {
	background: "#050508",
	primary: "#FFD700", // Gold
	secondary: "#00F0FF", // Cyan
	accent: "#FF4D00", // Fiery Orange
	text: "#ffffff",
	muted: "#8a92b8",
}

export default async function handler(request: Request) {
	const { searchParams } = new URL(request.url)

	// Get dynamic params
	const title = searchParams.get("title") || "suiyan.fun"
	const prize = searchParams.get("prize") || "100,000"
	const fee = searchParams.get("fee") || "0.05"
	const slots = searchParams.get("slots") || "9"
	const type = searchParams.get("type") || "default" // default, win, lottery

	// Load fonts
	const [bangersFont, chakraFont] = await Promise.all([
		fetch(
			"https://fonts.gstatic.com/s/bangers/v24/FeVQS0BTqb0h60ACH55Q2J5hm24.ttf"
		).then((res) => res.arrayBuffer()),
		fetch(
			"https://fonts.gstatic.com/s/chakrapetch/v11/cIf6MapPsJ8ezJRAkibbJvfBbIq1qKMYlw.ttf"
		).then((res) => res.arrayBuffer()),
	])

	// Background image URL (your og-image.png as base)
	const bgImageUrl = new URL("/og-bg.png", request.url).toString()

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					position: "relative",
					fontFamily: "Chakra Petch",
				}}
			>
				{/* Background Image */}
				<img
					src={bgImageUrl}
					style={{
						position: "absolute",
						width: "100%",
						height: "100%",
						objectFit: "cover",
					}}
				/>

				{/* Gradient Overlay for text readability */}
				<div
					style={{
						position: "absolute",
						width: "100%",
						height: "100%",
						background:
							"linear-gradient(90deg, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.7) 50%, rgba(5,5,8,0.3) 100%)",
						display: "flex",
					}}
				/>

				{/* Content */}
				<div
					style={{
						position: "relative",
						width: "100%",
						height: "100%",
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						padding: "60px",
					}}
				>
					{/* Logo / Title */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							marginBottom: "20px",
						}}
					>
						<span
							style={{
								fontFamily: "Bangers",
								fontSize: "72px",
								color: COLORS.primary,
								letterSpacing: "0.05em",
								textShadow: `0 0 30px ${COLORS.primary}80`,
							}}
						>
							SUIYAN.FUN
						</span>
					</div>

					{/* Tagline */}
					<div
						style={{
							fontSize: "32px",
							color: COLORS.text,
							marginBottom: "40px",
							display: "flex",
						}}
					>
						On-Chain Lottery on Sui
					</div>

					{/* Prize Info */}
					{type !== "default" && (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "16px",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "baseline",
									gap: "12px",
								}}
							>
								<span
									style={{
										fontSize: "24px",
										color: COLORS.muted,
									}}
								>
									Prize Pool:
								</span>
								<span
									style={{
										fontFamily: "Bangers",
										fontSize: "56px",
										color: COLORS.primary,
										textShadow: `0 0 20px ${COLORS.primary}60`,
									}}
								>
									{prize} $SUIYAN
								</span>
							</div>

							<div
								style={{
									display: "flex",
									gap: "40px",
								}}
							>
								<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
									<span style={{ fontSize: "20px", color: COLORS.muted }}>
										Entry:
									</span>
									<span
										style={{
											fontSize: "28px",
											color: COLORS.secondary,
											fontWeight: "bold",
										}}
									>
										{fee} SUI
									</span>
								</div>

								<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
									<span style={{ fontSize: "20px", color: COLORS.muted }}>
										Win Chance:
									</span>
									<span
										style={{
											fontSize: "28px",
											color: COLORS.accent,
											fontWeight: "bold",
										}}
									>
										1/{slots} ({Math.round((1 / parseInt(slots)) * 100)}%)
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Default tagline for homepage */}
					{type === "default" && (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "20px",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "16px",
								}}
							>
								<span
									style={{
										fontFamily: "Bangers",
										fontSize: "48px",
										background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
										backgroundClip: "text",
										color: "transparent",
									}}
								>
									PICK YOUR SLOT. WIN BIG!
								</span>
							</div>

							<div
								style={{
									display: "flex",
									gap: "32px",
									fontSize: "24px",
								}}
							>
								<span style={{ color: COLORS.primary }}>
									Up to 1M $SUIYAN Prizes
								</span>
								<span style={{ color: COLORS.secondary }}>Entry from 0.05 SUI</span>
								<span style={{ color: COLORS.accent }}>Win Odds: 1/9 (11%)</span>
							</div>
						</div>
					)}

					{/* Winner Badge */}
					{type === "win" && (
						<div
							style={{
								marginTop: "30px",
								display: "flex",
								alignItems: "center",
								gap: "16px",
								padding: "16px 32px",
								background: `linear-gradient(135deg, ${COLORS.primary}30 0%, ${COLORS.accent}30 100%)`,
								borderRadius: "16px",
								border: `2px solid ${COLORS.primary}`,
							}}
						>
							<span style={{ fontSize: "40px" }}>🏆</span>
							<span
								style={{
									fontFamily: "Bangers",
									fontSize: "36px",
									color: COLORS.primary,
								}}
							>
								{title}
							</span>
						</div>
					)}
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: "Bangers",
					data: bangersFont,
					style: "normal",
				},
				{
					name: "Chakra Petch",
					data: chakraFont,
					style: "normal",
				},
			],
		}
	)
}
