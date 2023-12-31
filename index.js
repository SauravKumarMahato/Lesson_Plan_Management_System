if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express')
const app = express();
const path = require('path')
const mongoose = require('mongoose')

const route = require('./routes/route')

const dburl = 'mongodb://127.0.0.1:27017/lpms';
mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
    console.log("Database connected");
});



app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use('',route)

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})
