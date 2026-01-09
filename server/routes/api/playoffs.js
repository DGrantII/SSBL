const multer = require('multer');
const fs = require('fs');

const { Router } = require('express');
const RankedTeam = require('../../models/RankedTeam');
const Playoff = require('../../models/Playoff');
const RankedPlayer = require('../../models/RankedPlayer');
const Team = require('../../models/Team');
//const Champions = require('../../models/Champions');
//const MVPs = require('../../models/MVPs');
const Seasons = require('../../models/Seasons');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'temporary/');
    },
    filename: function (req, file, callback) {
        let filename = 'Playoffs.pdf';
        callback(null, filename);
    }
});
const upload = multer({ storage: storage });

const router = Router();

router.get('/testing', async (req, res) => {
    const testing = await Playoff.findOne({ type: 'round1' });
    res.send(testing);
})
router.get('/testing2', async (req, res) => {
    const testing = await RankedTeam.findOne({}, 'logo');
    res.send(testing);
})

function checkArray(obj, arry) {
    for (let i = 0; i < arry.length; i++) {
        if (arry[i].name == obj.name) {
            return true;
        }
    }
    return false;
}

//function to get the most recent archive folder
function highestArchiveFolder() {
    let filenames = fs.readdirSync('./seasons');
    return filenames[(filenames.length) - 1];
}

//route to set round 1 of the playoffs
// it also increments the playoff appearance field
// for the teams
router.get('/round1', async (req, res) => {
    try {
        const teams = await RankedTeam.find({}, 'name logo');
        if (!teams || teams[0] == undefined) {
            throw new Error('No teams found');
        }
        const players = await RankedPlayer.find({}, 'name');
        if (!players || players[0] == undefined) {
            throw new Error('No players found');
        }

        const round1 = { type: 'round1', data: [] };
        let seed = 1;
        let index = 0;
        const playoffTeams = [];
        for (let count = 0; count < 16 /*number of teams in playoffs*/; count++) {
            round1.data[index] = { name: teams[count].name, seed: seed, logo: teams[count].logo };
            playoffTeams.push(teams[count].name);
            seed++;
            index++;
        }
        const mvps = { type: 'mvps', data: [] };
        for (let index = 0; index < 6 /*number of players as mvp*/; index++) {
            mvps.data[index] = players[index].name;
        }

        const round2 = { type: 'round2', data: [] };
        const semis = { type: 'semis', data: [] };
        const finals = { type: 'finals', data: [] };
        const champions = { type: 'champions', data: [] };
        const MVPwinners = { type: 'mvpWinners', data: [] };

        const checking = await Playoff.find();
        if (checking[0] != undefined) {
            const result = await Playoff.deleteMany();
        }
        Playoff.insertMany([round1, mvps, round2, semis, finals, champions, MVPwinners]).catch(error => { throw error; });

        //section to update team playoff appearances
        await Team.updateMany({ name: { $in: playoffTeams } }, { $inc: { playoffApps: 1 } }, {new: true});
        res.status(200).json({ message: 'success' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

//route to set the result of a playoff game
// it also creates archive data and updates
// finals fields for the teams
router.post('/results', upload.none(), async (req, res) => {
    try {
        const data = req.body;
        //{winner: 'Avalanche', loser: 'Brutes', round: 'round1'}

        if (data.round == 'champions' /* Champions' Battle winners */) {
            const query = await Playoff.find({ type: 'mvps' }, 'data');
            const array = query[0].data;
            if (data.winner == 'Elites') {
                const mvpWinners = [array[0], array[2], array[4]];
                Playoff.findOneAndUpdate({ type: 'mvpWinners' }, { data: mvpWinners }).catch(function (error) { throw error; });

                //adding mvp data to archives
                fs.readdir('./seasons', async (err, files) => {
                    if (err) {
                        throw new Error(`Error reading the archive directory: ${err}`);
                    }

                    // Old way to get the season number
                    //const folderNumbers = files
                    //    .map(file => parseInt(file))
                    //    .filter(number => !isNaN(number))
                    //    .sort((a, b) => b - a);

                    //const highestNumber = folderNumbers.length > 0 ? folderNumbers[0] : 0;

                    // New way to get the season number
                    const query = await Seasons.findOne({}, 'season').sort({ season: -1 }).exec();
                    const highestNumber = query.season;

                    let uploadObject = {
                        name: 'Elites',
                        players: mvpWinners,
                        logo: {
                            data: fs.readFileSync('./images/Elites.png'),
                            contentType: 'image/png'
                        }
                    }

                    // Old way
                    //const result = await MVPs.insertMany(uploadObject);

                    // New way
                    const result = await Seasons.findOneAndUpdate({ season: highestNumber }, { mvps: uploadObject });
                });

                res.status(200).json({ result: `${data.winner} win the Champions' Battle` });
            } else {
                const mvpWinners = [array[1], array[3], array[5]];
                Playoff.findOneAndUpdate({ type: 'mvpWinners' }, { data: mvpWinners }).catch(function (error) { throw error; });

                //adding mvp data to archives
                fs.readdir('./seasons', async (err, files) => {
                    if (err) {
                        throw new Error(`Error reading the archive directory: ${err}`);
                    }

                    // Old way
                    //const folderNumbers = files
                    //    .map(file => parseInt(file))
                    //    .filter(number => !isNaN(number))
                    //    .sort((a, b) => b - a);

                    //const highestNumber = folderNumbers.length > 0 ? folderNumbers[0] : 0;

                    // New way
                    const query = await Seasons.findOne({}, 'season').sort({ season: -1 }).exec();
                    const highestNumber = query.season;

                    let uploadObject = {
                        name: 'All-Stars',
                        players: mvpWinners,
                        logo: {
                            data: fs.readFileSync('./images/AllStars.png'),
                            contentType: 'image/png'
                        }
                    }

                    // Old way
                    //const result = await MVPs.insertMany(uploadObject);

                    // New way
                    const result = await Seasons.findOneAndUpdate({ season: highestNumber }, { mvps: uploadObject });
                });



                res.status(200).json({ result: `${data.winner} win the Champions' Battle` });
            }
        } else {
            const query = await Playoff.find({ type: data.round }, 'data');
            const teamArray = query[0].data;
            let winningTeam;
            let objL = teamArray.find(o => o.name === data.loser);
            if (objL === undefined) {
                throw new Error('Losing team not found in playoff round');
            }
            let check = false;
            for (team of teamArray) {
                if (team.name == data.winner) {
                    check = true;
                    winningTeam = team;
                    if (data.round == 'round1') {
                        const next = await Playoff.find({ type: 'round2' }, 'data');
                        const array = next[0].data;

                        //Checking if team was already added to next round
                        if (checkArray(winningTeam, array) == false) {
                            array.push(winningTeam);
                            Playoff.findOneAndUpdate({ type: 'round2' }, { data: array }).catch(function (error) { throw error; });
                            res.status(200).json({ result: `${data.winner} defeat ${data.loser} and are moving on to Round 2` });
                        } else {
                            throw new Error('Team(s) was already added to Round 2');
                        }
                        
                    }
                    if (data.round == 'round2') {
                        const next = await Playoff.find({ type: 'semis' }, 'data');
                        const array = next[0].data;

                        //Checking if team was already added to next round
                        if (checkArray(winningTeam, array) == false) {
                            array.push(winningTeam);
                            Playoff.findOneAndUpdate({ type: 'semis' }, { data: array }).catch(function (error) { throw error; });
                            res.status(200).json({ result: `${data.winner} defeat ${data.loser} and are moving on to the Semi-Finals` });
                        } else {
                            throw new Error('Team(s) was already added to the Semi-Finals');
                        }
                    }
                    if (data.round == 'semis') {
                        const next = await Playoff.find({ type: 'finals' }, 'data');
                        const array = next[0].data;

                        //Checking if team was already added to next round
                        if (checkArray(winningTeam, array) == false) {
                            array.push(winningTeam);
                            Playoff.findOneAndUpdate({ type: 'finals' }, { data: array }).catch(function (error) { throw error; });
                            Team.findOneAndUpdate({ name: winningTeam.name }, { $inc: { finalsApps: 1 } });
                            res.status(200).json({ result: `${data.winner} defeat ${data.loser} and are moving on to the Finals` });
                        } else {
                            throw new Error('Team(s) was already added to the Finals');
                        }
                    }
                    if (data.round == 'finals') {
                        const next = await Playoff.find({ type: 'champions' }, 'data');
                        const array = next[0].data;

                        //Checking if team was already added to next round
                        if (checkArray(winningTeam, array) == false) {
                            array.push(winningTeam);
                            Playoff.findOneAndUpdate({ type: 'champions' }, { data: array }).catch(function (error) { throw error; });
                            Team.findOneAndUpdate({ name: winningTeam.name }, { $inc: { championships: 1 } });

                            //adding champions to the archive
                            const championData = await Team.find({ name: data.winner }, 'players');
                            fs.readdir('./seasons', async (err, files) => {
                                if (err) {
                                    throw new Error(`Error reading the archive directory: ${err}`);
                                }
                                // Old way to get the season number
                                //const folderNumbers = files
                                //    .map(file => parseInt(file))
                                //    .filter(number => !isNaN(number))
                                //    .sort((a, b) => b - a);

                                //const highestNumber = folderNumbers.length > 0 ? folderNumbers[0] : 0;

                                // New way to get the season number
                                const query = await Seasons.findOne({}, 'season').sort({ season: -1 }).exec();
                                const highestNumber = query.season;

                                let uploadObject = {
                                    name: data.winner,
                                    seed: winningTeam.seed,
                                    players: championData[0].players,
                                    logo: {
                                        data: fs.readFileSync(`./images/${data.winner}.png`),
                                        contentType: 'image/png'
                                    }
                                }

                                // Old way
                                //const result = await Champions.insertMany(uploadObject);

                                // New way
                                const result = await Seasons.findOneAndUpdate({ season: highestNumber }, { champions: uploadObject });
                            });

                            res.status(200).json({ result: `${data.winner} defeat ${data.loser} and are the CHAMPIONS!` });
                        } else {
                            throw new Error('Champions were already decided');
                        }
                    }
                }
            }
            if (check == false) {
                throw new Error('Winning team not found in playoff round'); 
            }
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
    
});

//route to get names for round result page
router.get('/names', async (req, res) => {
    try {
        const query = await Playoff.find({ type: 'round1' }, 'data');
        if (!query || query[0] == undefined) {
            throw new Error('No teams found');
        }
        const teams = query[0].data;

        teams.sort((a, b) => {
            let fa = a.name.toLowerCase(),
                fb = b.name.toLowerCase();
            if (fa < fb) { return -1; }
            if (fa > fb) { return 1; }
            return 0;
        });

        const response = [];
        for (let team of teams) {
            response.push(team.name);
        }

        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//route to get data for bracket
router.get('/bracket', async (req, res) => {
    try {
        const playoffs = await Playoff.find();
        if (!playoffs || playoffs == []) {
            throw new Error('No playoff data found');
        }
        res.status(200).json(playoffs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

//route to clear playoff data
router.get('/clear', async (req, res) => {
    try {
        const checking = await Playoff.find();
        if (!checking || checking[0] == undefined) {
            res.status(200).json({ message: "success" });
        } else {
            const result = await Playoff.deleteMany({});
            res.status(200).json({ message: "success" });
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

//route to get the champions
router.get('/champions', async (req, res) => {
    try {
        const team = await Playoff.find({ type: 'champions' });
        if (team[0] == undefined) {
            res.status(200).json({ status: false, message: 'Championship has not been determined' });
        } else {
            const teamName = team[0].data[0].name;
            const players = await Team.find({ name: teamName }, 'players');
            res.status(200).json({ status: true, team: team[0].data[0].logo, players: players[0].players });
        }
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
})

//route to get names and logos for current game page
router.get('/current-game', async (req, res) => {
    try {
        const data = await Playoff.find({ type: 'round1' });
        if (data[0] == undefined) {
            res.status(200).json({ status: false, message: 'Round 1 has not been determined' });
        } else {
            const teams = data[0].data;
            teams.sort((a, b) => {
                let fa = a.name.toLowerCase(),
                    fb = b.name.toLowerCase();
                if (fa < fb) { return -1; }
                if (fa > fb) { return 1; }
                return 0;
            });
            res.status(200).json({ status: true, results: teams });
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/current-game/:home/:away', async (req, res) => {
    try {
        const home = req.params.home;
        const away = req.params.away;
        const data = await Playoff.find({ type: 'round1' });
        if (data[0] == undefined) {
            res.status(200).json({ status: false, message: 'Round 1 has not been determined' });
        } else {
            const teams = data[0].data;
            const sending = [];
            for (team of teams) {
                if (team.name == home || team.name == away) {
                    sending.push(team);
                }
            }
            res.send(sending);
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
})

//route to upload bracket pdf
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        // Old way
        //let number = highestArchiveFolder();
        //let error = '';
        //fs.copyFileSync('temporary/Playoffs.pdf', `seasons/${number}/Playoffs.pdf`);
        //fs.unlinkSync('temporary/Playoffs.pdf', (err) => {
        //    if (err) error = err;
        //});
        //if (error != '') {
        //    throw error
        //}

        // New way
        const query = await Seasons.findOne({}, 'season').sort({ season: -1 }).exec();
        const highestNumber = query.season;
        const uploadObject = {
            data: fs.readFileSync('temporary/Playoffs.pdf'),
            contentType: 'application/pdf'
        }
        let error = '';
        fs.unlinkSync('temporary/Playoffs.pdf', (err) => {
            if (err) error = err;
        });
        if (error != '') {
            throw error;
        }
        const result = await Seasons.findOneAndUpdate({ season: highestNumber }, { bracketResults: uploadObject });

        res.status(200).json({ message: 'Bracket saved successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    
});

module.exports = router;