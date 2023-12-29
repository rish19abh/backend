// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3001;
const DATABASE = "mongodb+srv://manishkaswan88:kIJXWv3wuVQMynQc@cluster0.66hvwtu.mongodb.net/?retryWrites=true&w=majority";

app.use(bodyParser.json());
app.use(cors());

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});

mongoose.connect(DATABASE)
.then(() => {
    console.log("DB is connected");
})
.catch((err) => {
    console.log(err);
});

// Define MongoDB Schema and Model
const contactUsSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  confirmPassword: String
});

const ContactUs = mongoose.model('ContactUs', contactUsSchema);
const User = mongoose.model('User', userSchema);

// Express routes
app.post('/api/contactus', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const newContact = new ContactUs({ name, email, message });
    await newContact.save();

    res.status(201).json({ message: 'Contact details submitted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { username, email , password , confirmPassword} = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Check if the password anf confirm password are same or not 
    const isPassword = password === confirmPassword;
    if(!isPassword)
        res.status(401).json({ error: 'Password and ConfirmPassword are not same' });

    const newUser = new User({ username, email , password , confirmPassword });
    await newUser.save();

    res.status(201).json({ message: 'Signup successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email , password } = req.body;

        // Check if the username exists
        const user = await User.findOne({ email });

        if (!user) {
            res.status(401).json({ error: 'User not found. Please sign up.' });
            return;
        }

        // Check if the password is correct
        const isPasswordValid = password === user.password;

        if (isPasswordValid) {
            res.status(200).json({ message: 'User logged in successfully!' });
        } else {
            res.status(401).json({ error: 'Incorrect password. Please try again.' });
        }
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
