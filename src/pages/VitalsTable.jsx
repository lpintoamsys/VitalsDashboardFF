import React, { useState, useEffect } from 'react';
import QuoteDisplay from '../components/QuoteDisplay';

const VitalsTable = ({ vitals }) => {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [cumulativeSteps, setCumulativeSteps] = useState({});
    const [lastUpdated, setLastUpdated] = useState({});

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Process steps to make them accumulate realistically per user
    useEffect(() => {
        if (!Array.isArray(vitals) || vitals.length === 0) return;

        const userStepMap = { ...cumulativeSteps };
        const lastUpdateMap = { ...lastUpdated };
        const currentTime = new Date();

        // Get the current time as hours in the day (0-24)
        const currentHour = currentTime.getHours();

        // Process each vital record to maintain continuity in step counts
        vitals.forEach(vital => {
            if (!vital) return;

            const userKey = `${vital.firstName}-${vital.lastName}`;
            const vitalTime = new Date(vital.timestamp);

            // If this is a new user or first record of the day
            if (!userStepMap[userKey]) {
                // Base steps on time of day - morning has fewer steps than afternoon
                // Average person takes ~500 steps per hour during waking hours
                const baseSteps = Math.min(
                    // Start with very low steps (0-400) in early morning
                    Math.max(0, currentHour - 6) * 200 + Math.floor(Math.random() * 400),
                    // Cap initial steps at 2000 to avoid too high values
                    2000
                );

                userStepMap[userKey] = baseSteps;
                lastUpdateMap[userKey] = vitalTime;
                vital.stepsTaken = baseSteps;
            } else {
                // For existing users, calculate a realistic increment based on time elapsed
                const lastUpdate = lastUpdateMap[userKey];
                const minutesElapsed = lastUpdate ? (vitalTime - lastUpdate) / (1000 * 60) : 1;

                // Only add steps if a reasonable time has passed
                if (minutesElapsed >= 0.25) { // At least 15 seconds between updates
                    // Calculate steps: 60-100 steps per minute on average
                    const stepsPerMinute = Math.floor(Math.random() * 40) + 60;
                    const incrementSteps = Math.floor(stepsPerMinute * Math.min(minutesElapsed, 3)); // Cap at 3 minutes worth

                    userStepMap[userKey] = Math.min(userStepMap[userKey] + incrementSteps, 20000); // Daily max of 20k
                    lastUpdateMap[userKey] = vitalTime;
                }

                // Update the vital object with our accumulated step count
                vital.stepsTaken = userStepMap[userKey];
            }
        });

        setCumulativeSteps(userStepMap);
        setLastUpdated(lastUpdateMap);
    }, [vitals]);

    const formatCurrentDateTime = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getFitnessLevelColor = (level) => {
        const colors = {
            'Athlete': 'text-emerald-600 bg-emerald-50',
            'Excellent': 'text-green-600 bg-green-50',
            'Good': 'text-blue-600 bg-blue-50',
            'Above Average': 'text-cyan-600 bg-cyan-50',
            'Average': 'text-yellow-600 bg-yellow-50',
            'Below Average': 'text-orange-600 bg-orange-50',
            'Poor': 'text-red-600 bg-red-50'
        };
        return colors[level] || 'text-gray-600 bg-gray-50';
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        };
    };

    const formatStepDisplay = (steps) => {
        // Format steps with thousand separators for better readability
        return steps.toLocaleString();
    };

    // Format step count with activity indicator
    const getStepActivityStatus = (steps) => {
        if (steps < 2000) return { status: 'Sedentary', color: 'text-red-600' };
        if (steps < 5000) return { status: 'Lightly Active', color: 'text-orange-500' };
        if (steps < 8000) return { status: 'Moderately Active', color: 'text-yellow-500' };
        if (steps < 12000) return { status: 'Active', color: 'text-green-500' };
        return { status: 'Very Active', color: 'text-emerald-600' };
    };

    // Calculate step progress as percentage of daily goal (10,000 steps)
    const getStepProgress = (steps) => {
        const percentage = Math.min(Math.round((steps / 10000) * 100), 100);
        return percentage;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="w-full px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img src="/healthcare.png" alt="Pulse Care Logo" className="h-10 w-auto" />
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">PulseCare Health</h1>
                                <QuoteDisplay />
                                <p className="text-xl text-gray-500"></p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-base font-medium text-gray-900">
                                {formatCurrentDateTime(currentDateTime)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4">
                <div className="max-w-[100%] mx-auto">
                        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                                <h2 className="text-xl font-semibold text-white">Real-time Patient Monitoring Dashboard</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <div className="inline-block min-w-full align-middle">
                                    <div className="overflow-hidden">
                                        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 230px)' }}>
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50 sticky top-0 z-10">
                                                    <tr>
                                                        {['Timestamp', 'First Name', 'Last Name', 'Age', 'Heart Rate', 'Blood Pressure', 'Steps Taken', 'Fitness Level', 'Notes']
                                                            .map((header, index) => (
                                                                <th key={index}
                                                                    className={`px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 whitespace-nowrap ${header === 'Notes' ? 'min-w-[300px]' : ''}`}
                                                                    style={{ position: 'sticky', top: 0 }}>
                                                                    {header}
                                                                </th>
                                                            ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-100">
                                                    {Array.isArray(vitals) && vitals.map((vital, index) => {
                                                        if (!vital || !vital.timestamp) return null;

                                                        const timestamp = formatTimestamp(vital.timestamp);
                                                        const stepActivity = getStepActivityStatus(vital.stepsTaken);
                                                        const stepProgress = getStepProgress(vital.stepsTaken);

                                                        return (
                                                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900">{timestamp.date}</div>
                                                                    <div className="text-sm text-gray-500">{timestamp.time}</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vital.firstName}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vital.lastName}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vital.age}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900">{vital.heartRate}</div>
                                                                    <div className="text-sm text-gray-500">BPM</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900">{vital.bloodPressure}</div>
                                                                    <div className="text-sm text-gray-500">BP</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900">{formatStepDisplay(vital.stepsTaken)}</div>
                                                                    <div className={`text-sm ${stepActivity.color}`}>{stepActivity.status}</div>

                                                                    {/* Progress bar */}
                                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                                                                        <div
                                                                            className={`h-1.5 rounded-full ${stepActivity.color.replace('text-', 'bg-')}`}
                                                                            style={{ width: `${stepProgress}%` }}>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                                        {stepProgress}% of daily goal
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-md font-medium ${getFitnessLevelColor(vital.fitnessLevel)}`}>
                                                                        {vital.fitnessLevel}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-500 min-w-[300px]">
                                                                    <div className="break-words">
                                                                        {vital.notes}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default VitalsTable;