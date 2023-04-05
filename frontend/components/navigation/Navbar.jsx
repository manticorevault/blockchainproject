import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../../styles/Navbar.module.css";
import Link from 'next/link'
export default function Navbar() {
	return (
		<nav className={styles.navbar}>
		
			<a href="/">
				<img className={styles.alchemy_logo} src="/cw3d-logo.png"></img>
			</a>
			
			<div>
				<Link href="/MyTickets" className="navitems" >My Tickets</Link>
				<Link href="/Auctions"className="navitems">Auctions</Link>
				<Link href="/BuyAndSell" className="navitems">Buy and Sell</Link>
				<Link href="/CreateEvent" className="navitems">Create Event</Link>
			</div>
			<ConnectButton></ConnectButton>

		</nav>
	);
}
