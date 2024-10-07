import React, { useState, useEffect } from 'react';
import './Home.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ChartPage from './ChartPage'; // Import the ChartPage component

const Home = () => {
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('income');
    const [date, setDate] = useState('');
    const [signedInUser, setSignedInUser] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editTransactionId, setEditTransactionId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('signedInUser');
        setSignedInUser(storedUser);
        fetchTransactions(); // Call the function after setting the user
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/getall');
            setTransactions(response.data);
            if (response.data) {
                calculateBalance(response.data);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    useEffect(() => {
        fetchTransactions(); // Fetch transactions on component mount
    }, []);

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const transactionData = {
            description,
            amount: parseFloat(amount),
            type,
            date: new Date(date).toISOString(),
        };
    
        if (editMode) {
            await updateTransaction(editTransactionId, transactionData);
            setEditMode(false);
            setEditTransactionId(null);
        } else {
            // Add new transaction
            axios.post('http://localhost:8000/api/create', transactionData)
                .then(response => {
                    setTransactions([...transactions, response.data]);
                    calculateBalance([...transactions, response.data]);
                })
                .catch(error => console.error('Error adding transaction:', error));
        }
    
        // Clear form fields
        setDescription('');
        setAmount('');
        setType('income');
        setDate('');
    };

    const createTransaction = async (transactionData) => {
        try {
            const response = await axios.post('http://localhost:8000/api/create', transactionData);
            setTransactions([...transactions, response.data]);
            calculateBalance([...transactions, response.data]);
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    const updateTransaction = async (id, updatedTransaction) => {
        try {
            const response = await axios.put(`http://localhost:8000/api/update/${id}`, updatedTransaction);
            const updatedTransactions = transactions.map((transaction) =>
                transaction._id === id ? response.data : transaction
            );
            setTransactions(updatedTransactions);
            calculateBalance(updatedTransactions);
        } catch (error) {
            console.error('Error updating transaction:', error);
        }
    };

    const deleteTransaction = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/delete/${id}`);
            const updatedTransactions = transactions.filter((transaction) => transaction._id !== id);
            setTransactions(updatedTransactions);
            calculateBalance(updatedTransactions);
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const startEditing = (transaction) => {
        setDescription(transaction.description);
        setAmount(transaction.amount);
        setType(transaction.type);
        setDate(new Date(transaction.date).toISOString().split('T')[0]);
        setEditTransactionId(transaction._id);
        setEditMode(true);
    };

    const calculateBalance = (transactions) => {
        const newBalance = transactions.reduce((acc, transaction) => {
            return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
        }, 0);
        setBalance(newBalance);
    };

    const handleSearch = () => {
        if (searchTerm) {
            const results = transactions.filter(
                (transaction) => transaction._id === searchTerm || transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResult(results.length > 0 ? results : null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('signedInUser');
        navigate('/Sign-in');
    };

    return (
        <div className="home-main container mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-xl shadow-xl mb-10 text-center text-white">
                <h1 className="text-4xl font-extrabold italic tracking-wide">
                    Personal Finance Tracker
                </h1>
            </div>

            {/* User Info and Logout */}
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-semibold text-gray-700">
                    Welcome, {signedInUser}
                </h2>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-5 py-2 rounded-full shadow-lg hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105"
                >
                    Logout
                </button>
            </div>

            {/* Balance Section */}
            <div className="balance bg-white bg-opacity-60 backdrop-blur-xl p-6 rounded-2xl shadow-lg mb-10">
                <h2 className="text-3xl font-bold text-blue-900 mb-2">Current Balance</h2>
                <p className="text-2xl text-gray-800">${balance.toFixed(2)}</p>
            </div>

            {/* Transaction Form */}
            <form
                onSubmit={handleFormSubmit}
                className="bg-white p-8 rounded-xl shadow-lg mb-10 space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                    <input
                        type="date"
                        placeholder="Date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-600 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                    {editMode ? 'Update Transaction' : 'Add Transaction'}
                </button>
            </form>

            {/* Search Section */}
            <div className="search-section mb-10">
                <div className="flex items-center">
                    <input
                        type="text"
                        placeholder="Search by ID or Description"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 p-4 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-500 text-white px-6 py-4 rounded-r-full shadow-lg hover:bg-blue-600 transition transform hover:scale-105"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Search Result */}
            {searchResult && (
                <div className="search-result mb-10 bg-white bg-opacity-60 p-6 rounded-xl shadow-lg">
                    <h3 className="font-bold text-lg">Search Results:</h3>
                    <ul>
                        {searchResult.map((transaction) => (
                            <li key={transaction._id} className="flex justify-between border-b border-gray-300 py-2">
                                <span>{transaction.description} - ${transaction.amount.toFixed(2)}</span>
                                <div>
                                    <button
                                        onClick={() => startEditing(transaction)}
                                        className="text-blue-500 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteTransaction(transaction._id)}
                                        className="text-red-500 hover:underline ml-4"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Transaction List */}
            <div className="transaction-list">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Transaction History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transactions.map((transaction) => (
                        <div key={transaction._id} className="transaction-card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <h4 className="font-semibold">{transaction.description}</h4>
                            <p>${transaction.amount.toFixed(2)}</p>
                            <p className="text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    onClick={() => startEditing(transaction)}
                                    className="text-blue-500 hover:underline"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteTransaction(transaction._id)}
                                    className="text-red-500 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart Section */}
            <div className="mt-10">
                <ChartPage transactions={transactions} />
            </div>
        </div>
    );
};

export default Home;
