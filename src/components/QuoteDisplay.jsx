import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import medicalQuotes from "../data/medicalQuotes.json";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      key={quote.text}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
    <div className="bg-gradient-to-r from-teal-400 to-blue-500 p-4 my-4 rounded-xl text-center max-w-md mx-auto shadow-xl transform transition duration-500 hover:scale-105 opacity-100 transition-opacity duration-700">
      <p className="font-serif text-white text-lg font-medium">
        <span className="text-white opacity-80">"</span>
        {quote.text}
        <span className="text-white opacity-80">"</span> —{" "}
        <span className="font-bold italic">{quote.author}</span>
      </p>
      </div>
    </motion.div>
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
