const multer = require('multer');
const upload = multer();
const fs = require('fs');

const { Router } = require('express');
const Offseason = require('../../models/Offseason');
const Player = require('../../models/Player');
const Team = require('../../models/Team');
const RankedTeam = require('../../models/RankedTeam');
const RankedPlayer = require('../../models/RankedPlayer');
const Schedule = require('../../models/Schedule');
const Template = require('../../models/Template');
const Seasons = require('../../models/Seasons');

const router = Router();
const { jsPDF } = require('jspdf');

//function to get the most recent archive folder
function highestArchiveFolder() {
    let filenames = fs.readdirSync('./seasons');
    return filenames[(filenames.length) - 1];
}

//function to create schedule pdf
async function schedulePDF(/*folderName*/) {
    const data = await Schedule.find();
    let x = 20;
    let y = 30;
    let index = 0;

    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });
    doc.setFontSize(14);
    for (let week of data) {
        if ((week.week % 6) == 1 && week.week != 1) {
            doc.addPage();
            y = 10;
            doc.text('\n', 20, y);
            y += 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`Week ${week.week}:`, x, y);
        y += 20;
        for (let game of week.games) {
            if ((index % 3) == 0 && index != 0) {
                x = 20;
                y += 20;
            }
            doc.setFont('helvetica', 'normal');
            if (game[2] == 'H') {
                doc.text(game[0], x, y);
                x += 75;
                doc.text('@', x, y);
                x += 20;
                doc.setFillColor(173, 255, 47);
                doc.rect(x, (y - 12), 75, 15, 'F');
                doc.text(game[1], x, y);
                x += 105;
            } else if (game[2] == 'A') {
                doc.setFillColor(173, 255, 47);
                doc.rect(x, (y - 12), 75, 15, 'F');
                doc.text(game[0], x, y);
                x += 75;
                doc.text('@', x, y);
                x += 20;
                doc.text(game[1], x, y);
                x += 105;
            } else {
                doc.text(game[0], x, y);
                x += 75;
                doc.text('@', x, y);
                x += 20;
                doc.text(game[1], x, y);
                x += 105;
            }
            index++;
        }
        index = 0;
        x = 20;
        y += 40;
    }
    // Old way
    //doc.save(`./seasons/${folderName}/Schedule.pdf`);

    // New way
    return Buffer.from(doc.output('arraybuffer'));
}

//function to create teams pdf
async function teamPDF(/*folderName*/) {
    const teams = await RankedTeam.find();
    const doc = jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4'
    });
    let y = 30;
    teams.forEach((team, index) => {
        if ((index % 30) == 0 && index != 0) {
            doc.addPage();
            y = 10;
            doc.text('\n', 20, y);
            y += 20;
        }
        doc.text(`${index + 1}) ${team.name}: (${team.wins} - ${team.losses})`, 20, y);
        y += 20;
    });

    // Old way
    //doc.save(`./seasons/${folderName}/Results.pdf`);

    // New way
    return Buffer.from(doc.output('arraybuffer'));
}

//function to create player pdf
async function playerPDF(/*folderName*/) {
    const players = await RankedPlayer.find();
    const doc = jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4'
    });
    let y = 30;
    players.forEach((player, index) => {
        if ((index % 30) == 0 && index != 0) {
            doc.addPage();
            y = 10;
            doc.text('\n', 20, y);
            y += 20;
        }
        doc.text(`${index + 1}) ${player.name}: ${player.kos}, ${player.damage}%`, 20, y);
        y += 20;
    });

    // Old way
    //doc.save(`./seasons/${folderName}/Players.pdf`);

    // New way
    return Buffer.from(doc.output('arraybuffer'));
}

router.get('/clear', async (req, res) => {
    Offseason.findOneAndUpdate({ type: 'free-agents' }, { data: ["Zelda", "Inkling", "Pokemon Trainer"] }).catch(error => { throw error; });
    //res.status(200).json({ message: "Let's see..." });
    const mvps = await Offseason.findOneAndUpdate({ type: 'mvps' }, { data: [] }, { returnDocument: 'after' });
    const trading = await Offseason.findOneAndUpdate({ type: 'trading' }, { data: [] }, { returnDocument: 'after' });
    const available = await Offseason.findOneAndUpdate({ type: 'available' }, { data: [] }, { returnDocument: 'after' });
    if ((mvps.data === undefined || mvps.data.length == 0) &&
        (trading.data === undefined || trading.data.length == 0) &&
        (available.data === undefined || available.data.length == 0)) {
        res.status(200).json({ message: "Offseason data successfully cleared" });
    } else {
        throw new Error("Something went wrong");
    }
});

//route to get player names for input fields
router.get('/names', async (req, res) => {
    try {
        //checking if offseason trading has already been set
        const MVPdata = await Offseason.find({ type: 'mvps' }, 'data');
        if (MVPdata[0].data[0] == undefined) {
            const players = await Player.find({}, 'name');
            if (players[0] == undefined) {
                throw new Error('No players found');
            }

            players.sort((a, b) => {
                let fa = a.name.toLowerCase(),
                    fb = b.name.toLowerCase();
                if (fa < fb) { return -1; }
                if (fa > fb) { return 1; }
                return 0;
            });

            const playerArray = [];
            for (let player of players) {
                playerArray.push(player.name);
            }

            res.status(200).json({ status: 'ready', data: playerArray });
        } else {
            res.status(200).json({ status: 'complete' });
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
    
});

//route to clear offseason data except for type:"free-agents"
// it also resets Player and Team collections, sets and
// creates a new schedule, saves schedule, ranked player and team
// to pdfs, and creates a new season directory
router.get('/reset', async (req, res) => {
    try {
        // Old way
        ////saving data to pdf
        //let currentArchiveFolder = highestArchiveFolder();
        //schedulePDF(currentArchiveFolder);
        //playerPDF(currentArchiveFolder);
        //teamPDF(currentArchiveFolder);

        // New way
        const query = await Seasons.findOne({}, 'season').sort({ season: -1 }).exec();
        let topNumber = query.season;
        const TR = {
            data: await teamPDF(),
            contentType: 'application/pdf'
        }
        const PR = {
            data: await playerPDF(),
            contentType: 'application/pdf'
        }
        const SR = {
            data: await schedulePDF(),
            contentType: 'application/pdf'
        }
        const pdfs = Seasons.findOneAndUpdate({ seasons: topNumber }, {
            teamResults: TR,
            playerResults: PR,
            scheduleResults: SR
        });

        //resetting offseason data
        let offseasonStatus = false;
        const offseasonReset = await Offseason.updateMany({ type: { $in: ['mvps', 'trading', 'available'] } }, { data: [] });
        if (offseasonReset.acknowledged == true && offseasonReset.matchedCount == 3) /*3 for the three records being reset*/ {
            offseasonStatus = true;
        }

        //resetting team and player data
        let teamStatus = false;
        let playerStatus = false;
        const team = await Team.updateMany({}, { $set: { wins: 0, losses: 0, kos: 0, damage: 0 } });
        const player = await Player.updateMany({}, { $set: { kos: 0, damage: 0 } });
        const teamCount = await Team.countDocuments();
        const playerCount = await Player.countDocuments();
        if (team.acknowledged == true && team.matchedCount == teamCount) {
            teamStatus = true;
        }
        if (player.acknowledged == true && player.matchedCount == playerCount) {
            playerStatus = true;
        }

        //resetting ranked data
        let rankedTStatus = false;
        let rankedPStatus = false;
        const rankedTeam = await RankedTeam.updateMany({}, { $set: { wins: 0, losses: 0, kos: 0, damage: 0 } });
        const rankedPlayer = await RankedPlayer.updateMany({}, { $set: { kos: 0, damage: 0 } });
        if (rankedTeam.acknowledged == true && rankedTeam.matchedCount == teamCount) {
            rankedTStatus = true;
        }
        if (rankedPlayer.acknowledged == true && rankedPlayer.matchedCount == playerCount) {
            rankedPStatus = true;
        }

        //creating new schedule
        //Obtaining template and team data
        const template = await Template.find();
        if (!template || template == []) {
            throw new Error('No schedule found');
        }
        const teams = await Team.find({}, 'name');
        if (!teams || teams == []) {
            throw new Error('No teams found');
        }

        //Shuffling the team array
        let currentIndex = teams.length;
        while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [teams[currentIndex], teams[randomIndex]] =
                [teams[randomIndex], teams[currentIndex]];
        }

        //Setting the schedule
        let schedule = [];
        for (let i = 0; i < template.length; i++) {
            schedule[i] = { week: i + 1, games: [] };
            for (let j = 0; j < template[i].games.length; j++) {
                let team1 = teams[template[i].games[j][0]].name;
                let team2 = teams[template[i].games[j][1]].name;
                let tempArry = [team1, team2, 'D'];
                schedule[i].games.push(tempArry);
            }
        }

        //Saving schedule to database
        Schedule.collection.drop();
        Schedule.createCollection();
        const resetSchedule = await Schedule.insertMany(schedule);

        //creating a new season archive directory
        // Old way
        //let highestNumber = parseInt(highestArchiveFolder());
        //const nextNumber = highestNumber + 1;
        //const newFolderPath = `./seasons/${nextNumber}`;
        //fs.mkdir(newFolderPath, (err) => {
        //    if (err) {
        //        throw new Error(`Error creating new directory: ${err}`);
        //    }
        //});

        // New way
        topNumber++;
        Seasons.insertMany({ season: topNumber });
        

        //condition to check if queries are successful
        if (teamStatus && playerStatus && offseasonStatus &&
            rankedTStatus && rankedPStatus && resetSchedule.length > 0) {
            res.status(200).json({ message: "Offseason data is cleared and regular season stats are resetted", success: true });
        } else {
            throw new Error("Something went wrong");
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message, success: false });
    }
})

//route to set the mvp players from the Champion's Battle
// it also determines the player injuries and trading teams
router.post('/lock-mvps', upload.none(), async (req, res) => {

    //Constant for the number of trading teams
    const NUMBER_OF_TRADES = 6;

    try {
        const data = req.body;
        //{mvp1: 'Byleth', mvp2: 'Bowser', mvp3: 'Banjo and Kazooie'}
        //placing player names in an array
        const mvps = [data.mvp1, data.mvp2, data.mvp3];

        //sending player array to database
        const result = await Offseason.findOneAndUpdate({ type: 'mvps' }, { data: mvps }, {returnDocument: 'after'});

        //----------------------------
        //This section determines the injuries
        //obtaining all player names and placing it in an array
        const players = await Player.find({}, 'name');
        if (players[0] == undefined) {
            throw new Error('No players found');
        }
        const playerArray = []
        for (let player of players) {
            playerArray.push(player.name);
        }

        //randomly selecting three players from player array
        let num1, num2, num3;
        let status = true;
        do {
            num1 = Math.floor(Math.random() * playerArray.length);
            num2 = Math.floor(Math.random() * playerArray.length);
            num3 = Math.floor(Math.random() * playerArray.length);

            //checking if random player is an mvp
            for (mvp of mvps) {
                if (mvp == playerArray[num1] || mvp == playerArray[num2] || mvp == playerArray[num2]) {
                    status = false;
                }
            }
        //checking if there are any duplicate names
        } while (num1 == num2 || num2 == num3 || num1 == num3 || status == false);

        //placing the randomly selected players into array
        const injuryArray = [];
        injuryArray.push(playerArray[num1]);
        injuryArray.push(playerArray[num2]);
        injuryArray.push(playerArray[num3]);

        //saving the randomly selected players into free agent status
        const query = await Offseason.findOneAndUpdate({ type: 'free-agents' }, { data: injuryArray });
        const freeAgentArray = query.data;

        //replacing the randomly selected players with the free agents
        
        Player.findOneAndUpdate({ name: injuryArray[0] }, { name: freeAgentArray[0] }).catch(error => { throw error; });
        Player.findOneAndUpdate({ name: injuryArray[1] }, { name: freeAgentArray[1] }).catch(error => { throw error; });
        Player.findOneAndUpdate({ name: injuryArray[2] }, { name: freeAgentArray[2] }).catch(error => { throw error; });

        //replacing the randomly selected players with the free agents in the Teams collection
        let index = 3;
        for (injury of injuryArray) {
            const team = await Team.find({ players: injury }, 'players');
            const teamPlayers = team[0].players;
            teamPlayers[teamPlayers.indexOf(injury)] = freeAgentArray[injuryArray.indexOf(injury)];
            Team.findOneAndUpdate({ players: injury }, { players: teamPlayers }).catch(error => { throw error; });
            index++;
        }

        //----------------------------
        //This section determines the trading teams
        //obtaining ranked teams and reversing the order
        const teams = await RankedTeam.find({}, 'name');
        if (teams[0] == undefined) {
            throw new Error("Teams not found");
        }
        teams.reverse();

        //adding bottom teams for trading
        tradingTeams = []
        for (let i = 0; i < NUMBER_OF_TRADES; i++) {
            tradingTeams.push(teams[i].name);
        }

        //saving bottom teams to database
        Offseason.findOneAndUpdate({ type: 'trading' }, { data: tradingTeams }).catch(error => { throw error; });

        //----------------------------
        //This section creates array of available players
        //Using the playerArray created earlier for the field
        // and removing the mvps and new injuries from the array
        for (mvp of mvps) {
            let index = playerArray.indexOf(mvp);
            playerArray.splice(index, 1);
        }
        for (injury of injuryArray) {
            let index = playerArray.indexOf(injury);
            playerArray.splice(index, 1);
        }
        //Adding the previously free agent players to player array
        playerArray.push(freeAgentArray[0]);
        playerArray.push(freeAgentArray[1]);
        playerArray.push(freeAgentArray[2]);
        
        //saving remaining players
        Offseason.findOneAndUpdate({ type: 'available' }, { data: playerArray }).catch(error => { throw error; });


        res.status(200).json({
            status: 'success',
            mvps: result.data,
            injured: injuryArray,
            replacement: freeAgentArray
        });

    } catch (err) { res.status(500).json({ status: 'fail', message: err.message }); }
    
});

//route to get available team
router.get('/trade', async (req, res) => {
    try {
        //obtaining the teams available for trade
        const tradeTeams = await Offseason.find({ type: 'trading' }, 'data');

        //checking if there are teams available
        if (tradeTeams[0].data === undefined || tradeTeams[0].data.length == 0) {
            //if there are no teams available
            res.status(200).json({ status: 'unavailable' });
        } else {
            //obtaining the next available trade team
            const nextTeam = tradeTeams[0].data[0];

            //obtaining players currently on that team
            const team = await Team.find({ name: nextTeam }, 'players');
            const players = team[0].players;

            //sending team name and player array
            res.status(200).json({ status: 'available', nextTeam: nextTeam, players: players });
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

//route to trade players
router.post('/trade', upload.none(), async (req, res) => {
    try {
        
        //ideal form {team: 'TeamName', best: 'PlayerName', player1: 'Player', player2: 'Player', player3: 'Player'}
        const data = req.body;
        let best = data.best;
        const remaining = [data.player1, data.player2, data.player3];

        //removing best player from the 'remaining' array
        remaining.splice(remaining.indexOf(best), 1);

        //randomly select one of the remaining players
        let index = Math.floor(Math.random() * remaining.length);
        let going = remaining[index];

        //obtaining available players
        const query = await Offseason.find({ type: 'available' }, 'data');
        const available = query[0].data;

        //select random player joining the team
        let coming = "";
        do {
            index = Math.floor(Math.random() * available.length);
            
            coming = available[index];
        } while (coming == best || coming == data.player1 || coming == data.player2);

        //obtaining all players from the other team
        const otherTeam = await Team.find({ players: coming }, 'name players');
        const otherTeamPlayers = otherTeam[0].players;

        //brief pause to place the players from both teams into an unavailable array
        const unavailablePlayers = [best, remaining[0], remaining[1],
            otherTeamPlayers[0], otherTeamPlayers[1], otherTeamPlayers[2]];
        
        //swapping players from their respective player arrays
        otherTeamPlayers.splice(otherTeamPlayers.indexOf(coming), 1);
        otherTeamPlayers.push(going);
        remaining.splice(remaining.indexOf(going), 1);
        remaining.push(coming);
        remaining.push(best);

        //updating the teams
        Team.findOneAndUpdate({ name: data.team }, { players: remaining }).catch(error => { throw error; });
        Team.findOneAndUpdate({ name: otherTeam[0].name }, { players: otherTeamPlayers }).catch(error => { throw error; });

        //removing unavailable players from available array
        for (player of unavailablePlayers) {
            available.splice(available.indexOf(player), 1);
        }
        Offseason.findOneAndUpdate({ type: 'available' }, { data: available }).catch(error => { throw error; });

        //sending data for next team to trade (taken from the previous route)
        //obtaining the teams available for trade
        const tradeTeams = await Offseason.find({ type: 'trading' }, 'data');

        //removing the team that finished trading
        const teamArray = tradeTeams[0].data;
        teamArray.shift();
        Offseason.findOneAndUpdate({ type: 'trading' }, { data: teamArray }).catch(error => { throw error; });

        //checking if there are teams available
        if (teamArray[0] === undefined || teamArray.length == 0) {
            //there are no teams available
            res.status(200).json({
                status: 'unavailable',
                initiatingTeam: data.team,
                going: going,
                reactingTeam: otherTeam[0].name,
                coming: coming
            });
        } else {
            //obtaining the next team to trade
            let nextTeam = teamArray[0];

            //obtaining players currently on that team
            const team = await Team.find({ name: nextTeam }, 'players');
            const players = team[0].players;

            res.status(200).json({
                status: 'available',
                initiatingTeam: data.team,
                going: going,
                reactingTeam: otherTeam[0].name,
                coming: coming,
                nextTeam: nextTeam,
                players: players
            });
        }
    } catch (err) { console.log(err);  res.status(500).json({ message: err.message }); }
});

//route to get free agents
router.get('/free-agents', async (req, res) => {
    try {
        //obtaining the free agents
        const agents = await Offseason.find({ type: 'free-agents' }, 'data');

        if (!agents[0].data[0]) {
            throw new Error('No free agents found');
        }

        res.status(200).json(agents[0].data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;