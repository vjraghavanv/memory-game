import React, { useState, useEffect } from "react";

const API_BASE_URL = "https://j09zmmpra4.execute-api.us-east-1.amazonaws.com/dev"; // Replace with your actual API base URL

function App() {
  // State variables
  const [cards, setCards] = useState([]);  // Initialize cards as an empty array
  const [flippedCards, setFlippedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const [error, setError] = useState(null); // Track API errors

  // Fetch the cards when the component mounts
  useEffect(() => {
    fetchCards();
  }, []);

  // Set up the timer countdown when the component mounts
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => Math.max(0, prevTime - 1));
    }, 1000);
    return () => clearInterval(timer); // Clean up on unmount
  }, []);

  // Function to fetch cards from the backend API
  const fetchCards = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-cards`);
      const data = await response.json();
      if (data.cards) {
        setCards(data.cards); // Set the fetched cards to state
      } else {
        setError("No cards data received");
      }
    } catch (error) {
      setError("Error fetching cards");
      console.error("Error fetching cards:", error);
    }
  };

  // Function to handle card clicks
  const handleCardClick = (clickedCard) => {
    // Prevent more than two cards from being flipped at once
    if (flippedCards.length === 2) return;

    setFlippedCards((prevFlipped) => [...prevFlipped, clickedCard]);

    // Check if two cards are flipped
    if (flippedCards.length === 1) {
      const [firstCard] = flippedCards;
      if (firstCard.id === clickedCard.id) {
        setScore((prevScore) => prevScore + 10); // Increment score on match
      } else {
        // Reset flipped cards if they don't match
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  // Function to handle the hint button
  const handleHint = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_state: cards }),
      });
      const data = await response.json();
      alert(data.hint); // Show hint in an alert box
    } catch (error) {
      console.error("Error fetching hint:", error);
    }
  };

  // If cards data is not yet loaded or an error occurred, display loading or error message
  if (error) {
    return <div className="App"><h1>Error: {error}</h1></div>;
  }

  if (!cards.length) {
    return <div className="App"><h1>Loading cards...</h1></div>;
  }

  return (
    <div className="App">
      <h1>Memory Card Game</h1>
      <p>
        Time Remaining: {time}s | Score: {score}
      </p>
      <button onClick={handleHint}>Get Hint</button>
      <div className="card-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`card ${flippedCards.includes(card) ? "flipped" : ""}`}
            onClick={() => handleCardClick(card)}
          >
            {flippedCards.includes(card) ? (
              <img src={card.image_url} alt={card.name} />
            ) : (
              "❓"
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
