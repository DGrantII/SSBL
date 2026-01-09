const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'temporary/');
    },
    filename: function (req, file, callback) {
        let filename = '';
        if (req.body.teamName != undefined) {
            filename = req.body.teamName + '.png';
        } else if (req.body.newName != undefined) {
            filename = req.body.newName + '.png';
        } else {
            filename = 'temporary.png';
        }
        callback(null, filename);
    }
});
const upload = multer({storage: storage});

const { Router } = require('express');
const Team = require('../../models/Team');
const Player = require('../../models/Player');
const RankedTeam = require('../../models/RankedTeam');
const Schedule = require('../../models/Schedule');
const Archive = require('../../models/Archive');

const router = Router();

//Routes to get teams for current game
router.get('/current-game', async (req, res) => {
    try {
        const teams = await Team.find({}, 'name wins losses logo location');
        if (!teams) {
            throw new Error('No teams found');
        }
        teams.sort((a, b) => {
            let fa = a.name.toLowerCase(),
                fb = b.name.toLowerCase();
            if (fa < fb) { return -1; }
            if (fa > fb) { return 1; }
            return 0;
        });
        res.status(200).json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get('/current-game/:home/:away', async (req, res) => {
    try {
        const home = req.params.home;
        const away = req.params.away;
        const teams = [];
        const homeTeam = await Team.findOne({ name: home }, 'name wins losses logo location').exec();
        const awayTeam = await Team.findOne({ name: away }, 'name wins losses logo location').exec();
        if (!homeTeam || !awayTeam) {
            throw new Error('Team(s) not found');
        }
        teams.push(homeTeam);
        teams.push(awayTeam);
        res.status(200).json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

//Route for getting logos for home screen
router.get('/logos', async (req, res) => {
    try {
        const teams = await Team.find({}, 'name logo width');
        if (!teams) {
            throw new Error('No teams found');
        }
        res.status(200).json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Route for ranked teams
router.get('/rank', async (req, res) => {
    try {
        const teams = await RankedTeam.find({}, 'name wins losses change changeIcon');
        if (!teams) {
            throw new Error('No teams found');
        }
        
        res.status(200).json(teams);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Route for ranking the teams (using the ranked teams collection)
router.get('/ranking', async (req, res) => {
    try {
        const teams = await Team.find({}, 'name wins losses kos damage logo');
        if (!teams || teams == []) {
            throw new Error('No teams found');
        }
        teams.sort((a, b) => {
            if (a.wins == b.wins) {
                if (a.kos == b.kos) {
                    if (a.damage < b.damage) { return 1; }
                    if (a.damage > b.damage) { return -1; }
                }
                if (a.kos < b.kos) { return 1; }
                if (a.kos > b.kos) { return -1; }
            }
            if (a.wins < b.wins) { return 1; }
            if (a.wins > b.wins) { return -1; }
        });

        //section for tracking the change in position
        const result = await RankedTeam.find({}, 'name');
        const ranked = [];
        for (let index = 0; index < teams.length; index++) {
            ranked[index] = {
                name: teams[index].name,
                wins: teams[index].wins,
                losses: teams[index].losses,
                kos: teams[index].kos,
                damage: teams[index].damage,
                logo: teams[index].logo,
            }

            const oldPOS = result.findIndex(obj => obj.name == teams[index].name);
            if (oldPOS == -1) {
                ranked[index].change = 0;
                ranked[index].changeIcon = 'http://localhost:3000/images/BlueB.png';
            } else {
                let change = oldPOS - index;
                if (change < 0) {
                    ranked[index].change = Math.abs(change);
                    ranked[index].changeIcon = 'http://localhost:3000/images/RedT.png';
                } else if (change > 0) {
                    ranked[index].change = change;
                    ranked[index].changeIcon = 'http://localhost:3000/images/GreenT.png';
                } else {
                    ranked[index].change = change;
                    ranked[index].changeIcon = 'http://localhost:3000/images/BlueB.png';
                }
            }
        }

        RankedTeam.collection.drop();
        RankedTeam.createCollection();
        RankedTeam.insertMany(ranked).then(function () {
            console.log("Data successfully ranked");
        }).catch(function (error) { throw error; });

        res.status(200).json({ message: "Data successfully ranked" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

//Route for top teams
router.get('/top-teams', async (req, res) => {
    try {
        const teams = await RankedTeam.find({}, 'name wins losses');
        if (!teams) {
            throw new Error('No teams found');
        }
        
        const topTeams = [];
        for (let i = 0; i < 6; i++) {
            topTeams[i] = teams[i];
        }
        res.status(200).json(topTeams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Route to modify team stats
router.post('/modify', upload.single('logo'), async (req, res) => {
    try {
        if (!req.body.modifyType) {
            throw 400;
        } else {

            //condition to change the location for a team
            if (req.body.modifyType == 'location') {
                const result = await Team.findOneAndUpdate({ name: req.body.teamName }, { location: req.body.location }, { new: true });
                if (!result) {
                    throw 404;
                }
                res.status(200).json({ message: `The location for the ${result.name} is now ${result.location}` });
            }

            //condition to modify the record for a team
            else if (req.body.modifyType == 'record') {

                //condition to replace the record for a team
                if (req.body.valueType == 'replace') {
                    const result = await Team.findOneAndUpdate({ name: req.body.teamName }, { wins: req.body.wins, losses: req.body.losses }, { new: true });
                    if (!result) {
                        throw 404;
                    }
                    res.status(200).json({ message: `The record for the ${result.name} is now (${result.wins} - ${result.losses})` });
                }

                //condition to increment/decrement record for a team
                else if (req.body.valueType == 'modulate') {

                    const filter = { name: req.body.teamName };
                    const query = { $inc: {} };
                    if (req.body.winType == 'increase') {
                        query.$inc.wins = req.body.wValue;
                    } else {
                        query.$inc.wins = -req.body.wValue;
                    }
                    if (req.body.lossType == 'increase') {
                        query.$inc.losses = req.body.lValue;
                    } else {
                        query.$inc.losses = -req.body.lValue;
                    }
                    const result = await Team.findOneAndUpdate(filter, query, { new: true });
                    if (!result) {
                        throw 404;
                    }
                    res.status(200).json({ message: `The record for the ${result.name} is now (${result.wins} - ${result.losses})` });
                }
            }

            //condition to change the name of the team
            else if (req.body.modifyType == 'name') {

                //changing name in Teams table
                let pathString = `http://localhost:3000/images/${req.body.newName}.png`;
                const result = await Team.findOneAndUpdate({ name: req.body.oldName }, { name: req.body.newName, logo: pathString }, { new: true });
                if (!result) {
                    throw 404;
                }
                
                //changing name in RankedTeams
                const ranked = await RankedTeam.findOneAndUpdate({ name: req.body.oldName }, { name: req.body.newName });

                //changing name in Schedule table
                //iterating over each record
                const schedule = await Schedule.find();
                for (let i = 0; i < schedule.length; i++) {
                    const tempArry = schedule[i].games;

                    //iterating over each game array
                    for (let j = 0; j < tempArry.length; j++) {

                        let index = tempArry[j].indexOf(req.body.oldName);
                        if (index != -1) {
                            tempArry[j][index] = req.body.newName;
                            break;
                        }
                    }
                    schedule[i].games = tempArry;
                }
                Schedule.collection.drop();
                Schedule.createCollection();
                const updateSchedule = await Schedule.insertMany(schedule);

                //No longer necessary?
                ////changing logo file name
                //let error = "";
                //fs.renameSync(`images/${req.body.oldName}.png`, `images/${req.body.newName}.png`, function (err) {
                //    if (err) error = err;
                //});
                //if (error != "") {
                //    throw error;
                //}

                res.status(200).json({ message: `The ${req.body.oldName} has been changed to the ${result.name}` });
            }

            //condition to modify the logo of the team
            else if (req.body.modifyType == 'logo') {

                //condition to replace the logo for the same team
                if (req.body.logoType == 'update') {

                    //updating proportions in database and image
                    let fileString = req.body.teamName + ".png";
                    const metadata = await sharp(req.file.path).metadata();
                    let ratio = metadata.height / 200; //200 is the constant height
                    let width = Math.round(metadata.width / ratio);
                    //--
                    let imageObject = {
                        data: fs.readFileSync(`temporary/${fileString}`),
                        contentType: 'image/png'
                    }
                    //--
                    const result = await Team.findOneAndUpdate({ name: req.body.teamName }, { width: width, logo: imageObject }, { new: true });
                    if (!result) {
                        throw 401;
                    }

                    let error = "";
                    fs.unlinkSync(`temporary/${fileString}`, function (err) {
                        if (err) error = err;
                    })
                    if (error != "") {
                        throw error;
                    }

                    //No longer necessary?
                    ////updating image
                    //let fileString = req.body.teamName + ".png";
                    //let error = "";
                    //fs.unlinkSync(`images/${fileString}`, function (err) {
                    //    if (err) error = err;
                    //});
                    //fs.copyFileSync(`temporary/${fileString}`, `images/${fileString}`);
                    //fs.unlinkSync(`temporary/${fileString}`, function (err) {
                    //    if (err) error = err;
                    //})
                    //if (error != "") {
                    //    throw error;
                    //}

                    res.status(200).json({ message: `The logo for the ${req.body.teamName} has been updated` });
                }

                //condition to change the logo for a new team
                else if (req.body.logoType == 'change') {
                    let error = "";

                    //getting file metadata
                    const metadata = await sharp(req.file.path).metadata();
                    let ratio = metadata.height / 200; //200 is the constant height
                    let width = Math.round(metadata.width / ratio);

                    //getting filepaths
                    let newFileName = req.body.newName + '.png';

                    //No longer necessary
                    ////moving image files to their positions
                    //fs.copyFileSync(`images/${oldFileName}`, `temporary/${oldFileName}`);
                    //fs.unlinkSync(`images/${oldFileName}`, function (err) {
                    //    if (err) error = err;
                    //})
                    //fs.copyFileSync(`temporary/${newFileName}`, `images/${newFileName}`);
                    //fs.unlinkSync(`temporary/${newFileName}`, function (err) {
                    //    if (err) error = err;
                    //});
                    //if (error != "") {
                    //    throw error;
                    //}

                    //saving old team to archive collection
                    const oldTeam = await Team.find({ name: req.body.oldName }, 'name logo location debut playoffApps finalsApps championships');
                    const myObject = {
                        name: oldTeam[0].name,
                        logo: oldTeam[0].logo,
                        location: oldTeam[0].location,
                        debut: oldTeam[0].debut,
                        lastSeason: (req.body.seasonDebut - 1),
                        playoffApps: oldTeam[0].playoffApps,
                        finalsApps: oldTeam[0].finalsApps,
                        championships: oldTeam[0].championships
                    }
                    Archive.insertMany(myObject);

                    //changing the team name, logo, width, and history data in database
                    const result = await Team.findOneAndUpdate({ name: req.body.oldName }, {
                        name: req.body.newName,
                        logo: fs.readFileSync(`temporary/${newFileName}`),
                        width: width,
                        debut: req.body.seasonDebut,
                        playoffApps: 0,
                        finalsApps: 0,
                        championships: 0
                    }, { new: true });
                    if (!result) {
                        throw 404;
                    }
                    fs.unlinkSync(`temporary/${newFileName}`);

                    //changing name in rankedTeams
                    const ranked = await RankedTeam.findOneAndUpdate({ name: req.body.oldName }, { name: req.body.newName });

                    //changing name in schedule table
                    //iterating over each record
                    const schedule = await Schedule.find();
                    for (let i = 0; i < schedule.length; i++) {
                        const temporary = schedule[i].games;

                        //iterating over each game array
                        for (let j = 0; j < temporary.length; j++) {

                            let index = temporary[j].indexOf(req.body.oldName);
                            if (index != -1) {
                                temporary[j][index] = req.body.newName;
                                break;
                            }
                        }
                        schedule[i].games = temporary;
                    }
                    Schedule.collection.drop();
                    Schedule.createCollection();
                    const updateSchedule = await Schedule.insertMany(schedule);

                    res.status(200).json({ message: `The ${req.body.oldName} has been changed to the ${req.body.newName} and the logos are updated` });
                }
            }
        }
    } catch (err) {
        switch (err) {
            case 400:
                res.status(400).json({ message: "The form is missing information/bad request" });
                break;
            case 404:
                res.status(404).json({ message: "Team was not found" });
                break;
            default:
                console.log(err);
                res.status(500).json({ message: err.message });
        }
    }
});

//Route to get all team's names and standings
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find({}, 'name wins losses');
        if (!teams) {
            throw new Error('No teams found');
        }
        teams.sort((a, b) => {
            let fa = a.name.toLowerCase(),
                fb = b.name.toLowerCase();
            if (fa < fb) { return -1; }
            if (fa > fb) { return 1; }
            return 0;
        });
        res.status(200).json(teams);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Route to get specific team info
router.get('/:name', async (req, res) => {
    const { name } = req.params;
    const response = [];
    try {
        const team = await Team.find({ name: name });
        if (!team) {
            throw new Error('Team not found');
        }
        const players = await Player.find({ $or: [{ name: team[0].players[0] }, { name: team[0].players[1] }, { name: team[0].players[2] }] });
        response[0] = team[0];
        response[1] = players;
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ message: err.messaage });
    }
});

module.exports = router;