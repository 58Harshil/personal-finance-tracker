import React, { useState, useEffect } from 'react';
import './Home.css';
import axios from 'axios';

const Home = () => {
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('income');
    const [date, setDate] = useState(''); // New state for date
    const [signedInUser, setSignedInUser] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editTransactionId, setEditTransactionId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // New state for search term
    const [searchResult, setSearchResult] = useState(null); // New state for search result

    useEffect(() => {
        const storedUser = localStorage.getItem('signedInUser');
        setSignedInUser(storedUser);

        // Fetch all transactions when the component mounts
        axios.get('http://localhost:8000/api/getall')
            .then(response => {
                setTransactions(response.data);
                calculateBalance(response.data);
            })
            .catch(error => {
                console.error('Error fetching transactions:', error);
            });
    }, []);  // Empty dependency array ensures this runs only once

    const handleFormSubmit = (event) => {
        event.preventDefault();
        const transactionData = {
            description,
            amount: parseFloat(amount),
            type,
            date: new Date(date).toISOString(), // Convert to ISO format for consistency
        };
    
        if (editMode) {
            // Update transaction
            updateTransaction(editTransactionId, transactionData);
            setEditMode(false);
            setEditTransactionId(null);
        } else {
            // Add new transaction
            axios.post('http://localhost:8000/api/create', transactionData)
                .then(response => {
                    axios.get('http://localhost:8000/api/getall')
                        .then(response => {
                            setTransactions(response.data);
                            calculateBalance(response.data);
                        })
                        .catch(error => console.error('Error fetching transactions:', error));
                })
                .catch(error => console.error('Error adding transaction:', error));
        }
    
        // Clear form fields
        setDescription('');
        setAmount('');
        setType('income');
        setDate('');
    };

    const deleteTransaction = (id) => {
        axios.delete(`http://localhost:8000/api/delete/${id}`)
            .then(() => {
                const updatedTransactions = transactions.filter(transaction => transaction._id !== id);
                setTransactions(updatedTransactions);
                calculateBalance(updatedTransactions);
            })
            .catch(error => console.error('Error deleting transaction:', error));
    };

    const updateTransaction = (id, updatedTransaction) => {
        axios.put(`http://localhost:8000/api/update/${id}`, updatedTransaction)
            .then(response => {
                const updatedTransactions = transactions.map(transaction =>
                    transaction._id === id ? response.data : transaction
                );
                setTransactions(updatedTransactions);
                calculateBalance(updatedTransactions);
            })
            .catch(error => console.error('Error updating transaction:', error));
    };

    const startEditing = (transaction) => {
        setDescription(transaction.description);
        setAmount(transaction.amount);
        setType(transaction.type);
        setDate(new Date(transaction.date).toISOString().split('T')[0]); // Set the date for editing
        setEditTransactionId(transaction._id);
        setEditMode(true);
    };

    const calculateBalance = (transactions) => {
        const newBalance = transactions.reduce((acc, transaction) => {
            return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
        }, 0);
        setBalance(newBalance);
    };

    // Handle search for a specific transaction
    const handleSearch = () => {
        if (searchTerm) {
            const results = transactions.filter(
                transaction => transaction._id === searchTerm || transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResult(results.length > 0 ? results : null); // Set all found transactions or null
        }
    };

    return (
        <div className='home-main'>
            <h1>Personal Finance Tracker</h1>
            <div>
                <h2>Welcome, {signedInUser}</h2>
            </div>
            <div className="balance">
                <h2>Current Balance: ${balance}</h2>
            </div>
            <form onSubmit={handleFormSubmit}>
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <input
                    type="date"
                    placeholder="Date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <button type="submit">
                    {editMode ? 'Update Transaction' : 'Add Transaction'}
                </button>
            </form>

            {/* Search form */}
            <div className="search-section">
                <input
                    type="text"
                    placeholder="Search by ID or Description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            {/* Display the search result if found */}
            {searchResult && (
                <div className="search-result">
                    <h3>Search Results:</h3>
                    <ul>
                        {searchResult.map((result) => (
                            <li key={result._id}>
                                {result.description} - ${result.amount} ({result.type}) - {new Date(result.date).toLocaleDateString()}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <ul className="transaction-list">
                {transactions.map((transaction) => (
                    <li key={transaction._id}>
                        <span className={transaction.type}>
                            {transaction.description} - ${transaction.amount} ({transaction.type}) - {new Date(transaction.date).toLocaleDateString()}
                        </span>
                        <button onClick={() => deleteTransaction(transaction._id)}>Delete</button>
                        <button onClick={() => startEditing(transaction)}>Edit</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
