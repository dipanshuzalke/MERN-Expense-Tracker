const express = require('express');
const path = require('path');  // To handle file paths
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

// Middleware to parse JSON and handle form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Load users from JSON file
const loadUsers = () => {
    const data = fs.readFileSync('users.json');
    return JSON.parse(data);
};

// Save users to JSON file
const saveUsers = (users) => {
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
};

// Serve the index.html file
app.get("/index", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Serve index.html from the public folder
});

app.get("/signin", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login3.html'));  // Serve index.html from the public folder
});

// Sign-up route
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    let users = loadUsers();

    // Check if user already exists
    if (users.some(user => user.email === email)) {
        return res.status(400).send('User already exists.');
    }

    // Add new user
    users.push({ name, email, password });
    saveUsers(users);

    res.status(201).send('User registered successfully.');
});

// // Sign-in route
// app.post('/signin', (req, res) => {
//     const { email, password } = req.body;
//     let users = loadUsers();

//     // Check if user exists and password matches
//     const user = users.find(user => user.email === email && user.password === password);
//     if (user) {
//         return res.status(200).send(`Welcome back, ${user.name}!`);
//     }

//     res.status(401).send('Invalid email or password.');
// });

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check user credentials (this is just an example, use real authentication)
    if (email === "test@example.com" && password === "password123") {
        // Redirect user to index.html after successful login
        return res.redirect('/index.html');
    } else {
        req.flash('error', 'Invalid credentials');
        return res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    // If you're using session middleware
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/'); // If there's an error, redirect to homepage
        }

        // Redirect to login after logout
        res.clearCookie('sessionId'); // Clear any session cookies if needed
        res.redirect('/login'); // Assuming 'login' is the login route
    });
});




// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
