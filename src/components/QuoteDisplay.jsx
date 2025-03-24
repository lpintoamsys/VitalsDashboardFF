import React, { useState, useEffect } from "react";
import medicalQuotes from "../data/medicalQuotes.json";

const QuoteDisplay = () => {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const getRandomQuote = () =>
      medicalQuotes[Math.floor(Math.random() * medicalQuotes.length)];

    setQuote(getRandomQuote());

    const interval = setInterval(() => {
      setQuote(getRandomQuote());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!quote) return null;

  return (
    <div className="bg-gray-100 p-3 my-3 rounded-lg text-center max-w-full mx-auto shadow-sm">
      <p className="text-lime-600 font-bold text-lg">
        <span className="text-blue-500">"</span>
        {quote.text}
        <span className="text-blue-500">"</span> —{" "}
        <span className="text-blue-500">{quote.author}</span>
      </p>
    </div>
  );
};

export default QuoteDisplay;
