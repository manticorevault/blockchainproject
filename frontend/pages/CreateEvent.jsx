import React, { useState } from "react";
import Navbar from "../components/navigation/Navbar";
import "../styles/Navbar.module.css";

const createEventForm = () => {

  const [eventName, setEventName] = useState("");  
  const [creatorName, setCreatorName] = useState("");
  const [creatorLastName, setCreatorLastName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [numberOfFreeTickets, setNumberOfFreeTickets] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(`Submitted event: Name ${eventName} and Owner Address ${ownerAddress}`)
  }

  return (
    <div>
      <Navbar />
      <h1>Create Event</h1>
      <form onSubmit={handleSubmit}>

        <label htmlFor="eventName">Event Name:</label>
        <input 
          id="eventName"
          type="text"
          value={eventName}
          onChange={(event) => setEventName(event.target.value)}
        />

        <label htmlFor="creatorName">
          Creator Name
        </label>
        <input 
          id="creatorName"
          type="text"
          value={creatorName}
          onChange={(event) => setCreatorName(event.target.value)}
        />  

        <label htmlFor="creatorLastName">Creator Last Name:</label>
        <input 
          id="creatorLastName"
          type="text"
          value={creatorLastName}
          onChange={(event) => setCreatorLastName(event.target.value)}
        />

        <label htmlFor="creatorEmail">Creator Email:</label>
        <input 
          id="creatorEmail"
          type="text"
          value={creatorEmail}
          onChange={(event) => setCreatorEmail(event.target.value)}
        />

        <label htmlFor="eventDate">Event Date:</label>
        <input 
          id="eventDate"
          type="text"
          value={eventDate}
          onChange={(event) => setEventDate(event.target.value)}
        />

        <label htmlFor="eventDate">Number of Free Tickets:</label>
        <input 
          id="numberOfFreeTickets"
          type="text"
          value={numberOfFreeTickets}
          onChange={(event) => setNumberOfFreeTickets(event.target.value)}
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default createEventForm;
