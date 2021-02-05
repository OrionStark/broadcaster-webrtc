const express = require('express');
const multer = require('multer');
const uploads = multer({ dest: 'uploads/' });
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// app.use(express.static("./dist"))
// app.all("*", (req, res) => {
//         res.sendFile(__dirname + "/dist/index.html")
// })

app.post('/upload', uploads.single('video'), (req, res) => {
        res.send('Testing');
})

app.listen(4000, () => {
        console.log('Server is running')
})
