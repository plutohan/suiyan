import { FC, ReactNode, useEffect, useState } from "react"
import { PriceContext } from "./PriceContext"

const SUI_COIN_TYPE =
	"0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI"
const SUIYAN_COIN_TYPE =
	"0xe0fbaffa16409259e431b3e1ff97bf6129641945b42e5e735c99aeda73a595ac::suiyan::SUIYAN"

type Props = {
	children: ReactNode
}

export const PriceProvider: FC<Props> = ({ children }) => {
	const [suiyanPerSui, setSuiyanPerSui] = useState<number | null>(null)
	const [isLoading, setIsLoading] = useState(true)

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
					const ratio = suiPrice / suiyanPrice
					setSuiyanPerSui(ratio)
				}
			} catch (error) {
				console.error("Failed to fetch prices:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchPrices()

		// Refresh price every 5 minutes
		const interval = setInterval(fetchPrices, 5 * 60 * 1000)
		return () => clearInterval(interval)
	}, [])

	return (
		<PriceContext.Provider value={{ suiyanPerSui, isLoading }}>
			{children}
		</PriceContext.Provider>
	)
}
