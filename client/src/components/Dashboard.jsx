// Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Home from './Home';
import ChartPage from './ChartPage';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    useEffect(() => {
        // Fetch all transactions when the component mounts
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/getall');
                setTransactions(response.data);
                calculateBalance(response.data);
            } catch (err) {
                console.error('Error fetching transactions:', err);
                setError('Could not fetch transactions.'); // Set error state
            } finally {
                setLoading(false); // Set loading to false regardless of the outcome
            }
        };

        fetchTransactions();
    }, []);

    const calculateBalance = (transactions) => {
        const newBalance = transactions.reduce((acc, transaction) => {
            return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
        }, 0);
        setBalance(newBalance);
    };

    if (loading) {
        return <div>Loading...</div>; // Display loading message
    }

    if (error) {
        return <div>{error}</div>; // Display error message
    }

    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={<Home 
                        transactions={transactions} 
                        setTransactions={setTransactions} 
                        calculateBalance={calculateBalance} 
                    />} 
                />
                <Route 
                    path="/chart" 
                    element={<ChartPage transactions={transactions} />} 
                />
            </Routes>
        </Router>
    );
};

export default Dashboard;
