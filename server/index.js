//App modules
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

//Routes
const TeamRoutes = require('./routes/api/teams');
const InputRoute = require('./routes/api/input');
const PlayerRoutes = require('./routes/api/players');
const ScheduleRoutes = require('./routes/api/schedule');
const PlayoffRoutes = require('./routes/api/playoffs');
const OffseasonRoutes = require('./routes/api/offseason');
const ArchiveRoutes = require('./routes/api/archives');


const PORT = 3000;
//WITHOUT DOCKER
//const MONGO_URI = "mongodb://devinjr:kj_john14_6@homenas:28022/ssblDB?authSource=ssblDB";

//WITH DOCKER
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());// to allow cross origin requests
app.use(bodyParser.urlencoded({extended: true})); // to convert the request into JSON
app.use(morgan('dev'));

app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use('/seasons', express.static('seasons'));

//Connecting mongoose database
mongoose
    .connect(MONGO_URI)
    .then(() => {
        const db = mongoose.connection.db;
        console.log(`Mongoose database connected to ${db.databaseName}`);
    })
    .catch((err) => console.log(err))

//Using api routes
app.use('/api/teams', TeamRoutes);
app.use('/api/input', InputRoute);
app.use('/api/players', PlayerRoutes);
app.use('/api/schedule', ScheduleRoutes);
app.use('/api/playoffs', PlayoffRoutes);
app.use('/api/offseason', OffseasonRoutes);
app.use('/api/archives', ArchiveRoutes);

//Starting server
app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));