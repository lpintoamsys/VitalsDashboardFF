import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import medicalQuotes from "../data/medicalQuotes.json";

/**
 * QuoteDisplay Component
 * 
 * Displays a random medical quote that changes every 30 seconds.
 * If no quotes are available in the imported JSON, displays a default quote.
 * 
 * @returns {JSX.Element|null} A styled quote display or null if no quote is available
 */
const QuoteDisplay = ({ interval = 30000 }) => {
  const [quote, setQuote] = useState(null);
  
  useEffect(() => {
    // Default quote to use if medicalQuotes is empty or invalid
    const defaultQuote = {
      text: "The art of medicine consists of amusing the patient while nature cures the disease",
      author: "Voltaire"
    };
    
    const getRandomQuote = () => {
      // Check if medicalQuotes exists and has items
      if (!medicalQuotes || !Array.isArray(medicalQuotes) || medicalQuotes.length === 0) {
        return defaultQuote;
      }
      return medicalQuotes[Math.floor(Math.random() * medicalQuotes.length)];
    };

    setQuote(getRandomQuote());

    // Set up interval to change quote periodically
    const quoteInterval = setInterval(() => {
      setQuote(getRandomQuote());
    }, interval);

    // Clean up interval on component unmount
    return () => clearInterval(quoteInterval);
  }, [interval]);

  // Don't render anything if no quote is available (should not happen with default quote)
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

// PropTypes validation
QuoteDisplay.propTypes = {
  /**
   * Time interval in milliseconds between quote changes
   */
  interval: PropTypes.number
};

export default QuoteDisplay;
