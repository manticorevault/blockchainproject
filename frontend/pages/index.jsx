import React from "react";
import styles from "../styles/Home.module.css";
import InstructionsComponent from "../components/InstructionsComponent";
import Navbar from "../components/navigation/Navbar";


export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen mb-12 bg-fixed bg-center bg-cover hero-img">
      <div className="absolute top-0 left-0 right-0 bottom-0 z-10">
        <div className="bg-black opacity-70 w-full h-full">
          
        </div>
      </div>
      <div className="absolute top-0 left-0 right-0 bottom-0 z-20">
        <main className={styles.main}>
          <Navbar />
          <InstructionsComponent></InstructionsComponent>
        </main>
      </div>
    </div>

  );
}
