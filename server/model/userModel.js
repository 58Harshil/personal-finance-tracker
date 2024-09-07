import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    description: {
        type: String,  
        required: true,
    },
    amount: {
        type: Number,  
        required: true,
    },
    type: {
        type: String,  
        required: true, 
        enum: ['income', 'expense'],  
    },
    date: {
        type: Date,
        default: Date.now, 
    }
});

export default mongoose.model("User", userSchema);
