import { FC } from "react"
import { HeroBanner } from "../components/shared/HeroBanner"

const HomeView: FC = () => {
	return (
		<div className="space-y-10 pt-8">
			<HeroBanner />
		</div>
	)
}

export default HomeView
