import { createContext, useContext } from "react"

type PriceContextType = {
	suiyanPerSui: number | null
	isLoading: boolean
}

export const PriceContext = createContext<PriceContextType>({
	suiyanPerSui: null,
	isLoading: true,
})

export const usePrice = () => useContext(PriceContext)
