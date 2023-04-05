import styles from "../styles/InstructionsComponent.module.css";
import Router, { useRouter } from "next/router";

export default function InstructionsComponent() {
  const router = useRouter();
  return (
    <div className={styles.container}>
      <div >
        <header className={styles.header_container}>
          <h1>
            watch<span>-web3Hosted-events</span>
          </h1>
          <p>
            Get started by editing this page in <span>/pages/index.js</span>
          </p>
        </header>

        <div className="bg-sky-500/100">
          <a
            href={"/Auctions"}
          >
            <div className={styles.button}>
              {/* <img src="https://static.alchemyapi.io/images/cw3d/Icon%20Medium/lightning-square-contained-m.svg" width={"20px"} height={"20px"} /> */}
              <p>View Auctions</p>
            </div>
          </a>
          <a
            href={"/Minting"}
          >
            <div className={styles.button}>
              {/* <img src="https://static.alchemyapi.io/images/cw3d/Icon%20Medium/lightning-square-contained-m.svg" width={"20px"} height={"20px"} /> */}
              <p>Mint NFT tickets</p>
            </div>
          </a>
          <a
            href={"/BuyAndSell"}
          >
            <div className={styles.button}>
              {/* <img src="https://static.alchemyapi.io/images/cw3d/Icon%20Medium/lightning-square-contained-m.svg" width={"20px"} height={"20px"} /> */}
              <p>Buy and Sell</p>
            </div>
          </a>
          <a
            href={"/CreateEvent"}
          >
            <div className={styles.button}>
              {/* <img src="https://static.alchemyapi.io/images/cw3d/Icon%20Medium/lightning-square-contained-m.svg" width={"20px"} height={"20px"} /> */}
              <p>Create Event</p>
            </div>
          </a>
          <a
            href={"/MyTickets"}
          >
            <div className={styles.button}>
              <img
                src="https://static.alchemyapi.io/images/cw3d/Icon%20Large/file-eye-01-l.svg"
                width={"20px"}
                height={"20px"}
              />
              <p>View Your Tickets</p>
            </div>
          </a>
        </div>  
      </div>

      <div className={styles.footer}>
        <div className={styles.icons_container}>
          <hr />
        </div>
        <p>Encode Club</p>
      </div>
    </div>
  );
}
