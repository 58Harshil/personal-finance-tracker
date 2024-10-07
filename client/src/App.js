import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Home from './components/Home';
import ChartPage from './components/ChartPage'; // Import the ChartPage component
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/chart" // Add route for the ChartPage
          element={
            <PrivateRoute>
              <ChartPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
