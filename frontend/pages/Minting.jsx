import React, { useState, useEffect } from "react";
import Web3 from "web3";
import Navbar from "../components/navigation/Navbar";
import "../styles/Navbar.module.css";

const CONTRACT_ABI = "123123123"
const CONTRACT_ADDRESS ="456456456"
const web3 = new Web3(Web3.givenProvider);

export default function Minting () {
    const [eventName, setEventName] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [tokenURI, setTokenURI] = useState('');
    const [price, setPrice] = useState(0);

    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    useEffect(() => {
        // Fetch the price of the tokenURI from the smart contract
        async function fetchPrice() {
            const _price = await contract.methods.tokenURIPrices(tokenURI).call();
            setPrice(_price);
        }

        fetchPrice();
    }, [contract, tokenURI]);

    const mintTicket = async () => {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.mintTicket(tokenURI).send({
            from: accounts[0],
            value: price
        });
    };

    const transferToken = async () => {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.transfer("RECIPIENT_ADDRESS", tokenId).send({
            from: accounts[0]
        });
    };

    return (
        <div>
          <label htmlFor="eventName">Event Name:</label>
          <input
            id="eventName"
            type="text"
            value={eventName}
            onChange={(event) => setEventName(event.target.value)}
          />
    
          <label htmlFor="tokenURI">Token URI:</label>
          <input
            id="tokenURI"
            type="text"
            value={tokenURI}
            onChange={(event) => setTokenURI(event.target.value)}
          />
    
          <label htmlFor="price">Price:</label>
          <input
            id="price"
            type="text"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            disabled
          />
    
          <button onClick={mintTicket}>Mint Ticket</button>
    
          <label htmlFor="tokenId">Token ID:</label>
          <input
            id="tokenId"
            type="text"
            value={tokenId}
            onChange={(event) => setTokenId(event.target.value)}
          />
    
          <button onClick={transferToken}>Transfer Token</button>
        </div>
      );
    };