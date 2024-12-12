const express = require('express');
const cors = require('cors');

const app = express();

const port = process.env.PORT || 3000;


// Middleware
app.use(express.json());
app.use(cors());


// Routes

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})