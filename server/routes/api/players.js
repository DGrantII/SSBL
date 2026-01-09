const multer = require('multer');
const upload = multer();

const { Router } = require('express');
const Player = require('../../models/Player');
const RankedPlayer = require('../../models/RankedPlayer');
const Team = require('../../models/Team');

const router = Router();

//Route for ranked players
router.get('/rank', async (req, res) => {
    try {
        const players = await RankedPlayer.find();
        if (!players) {
            throw new Error('No players found');
        }
        
        res.status(200).json(players);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Route to get top players for home page
router.get('/top-players', async (req, res) => {
    try {
        const players = await RankedPlayer.find();
        if (!players) {
            throw new Error('No players found');
        }
        
        const topPlayers = [];
        for (let i = 0; i < 6; i++) {
            topPlayers[i] = players[i];
        }
        res.status(200).json(topPlayers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//Route for ranking the players (using the ranked players collection)
router.get('/ranking', async (req, res) => {
    try {
        const players = await Player.find();
        if (!players || players == []) {
            throw new Error('No players found');
        }

        //Sorting the players
        players.sort((a, b) => {
            if (a.kos == b.kos) {
                if (a.damage < b.damage) { return 1 };
                if (a.damage > b.damage) { return -1 };
            }
            if (a.kos < b.kos) { return 1 };
            if (a.kos > b.kos) { return -1 };
        });

        //tracking change in position
        const result = await RankedPlayer.find({}, 'name');
        const ranked = [];
        for (let index = 0; index < players.length; index++) {
            ranked[index] = {
                name: players[index].name,
                kos: players[index].kos,
                damage: players[index].damage
            }

            let oldPOS = result.findIndex(obj => obj.name == players[index].name);
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

        RankedPlayer.collection.drop();
        RankedPlayer.createCollection();
        RankedPlayer.insertMany(ranked).catch(function (error) { throw error; });

        res.status(200).json({ message: "success" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
})

//Route for changing player data
router.post('/modify', upload.none(), async (req, res) => {
    try {

        //validating form was received
        if (!req.body.modifyType) {
            throw new Error('No valid data received');
        } else {

            //verifying what data needs to be modified
            if (req.body.modifyType == 'name') {

                //validating the name received
                const testQuery = await Player.find({ name: req.body.oldName }, 'name');
                if (!testQuery[0].name || testQuery[0].name == "") {
                    throw new Error('Player name not found');
                }

                //changing the name
                const newName = await Player.findOneAndUpdate({ name: req.body.oldName }, { name: req.body.newName }, { new: true });
                const modifiedTeam = await Team.findOneAndUpdate({ players: req.body.oldName }, { $set: { "players.$": req.body.newName } });
                const ranked = await RankedPlayer.findOneAndUpdate({ name: req.body.oldName }, { name: req.body.newName });
                res.status(200).json({ message: `${req.body.oldName} has been changed to ${newName.name}` });

            } else if (req.body.modifyType == 'kos') {

                //validating the name received
                const testQuery = await Player.find({ name: req.body.name }, 'name');
                if (!testQuery[0].name || testQuery[0].name == "") {
                    throw new Error('Player name not found');
                }

                //checking the type of modification
                if (req.body.valueType == 'increase') {
                    //increasing kos by inputted value
                    const modifiedStats = await Player.findOneAndUpdate({ name: req.body.name }, { $inc: { kos: req.body.value } }, { new: true });
                    const modifiedTeam = await Team.findOneAndUpdate({ players: req.body.name }, { $inc: { kos: req.body.value } });
                    res.status(200).json({ message: `The KOs for ${req.body.name} has been increased by ${req.body.value} to ${modifiedStats.kos}` });

                } else if (req.body.valueType == 'decrease') {
                    //decreasing kos by inputted value
                    const modifiedStats = await Player.findOneAndUpdate({ name: req.body.name }, { $inc: { kos: -req.body.value } }, { new: true });
                    const modifiedTeam = await Team.findOneAndUpdate({ players: req.body.name }, { $inc: { kos: -req.body.value } });
                    res.status(200).json({ message: `The KOs for ${req.body.name} has been decreased by ${req.body.value} to ${modifiedStats.kos}` });

                } else if (req.body.valueType == 'replace') {
                    //replacing kos by inputted value
                    const modifiedStats = await Player.findOneAndUpdate({ name: req.body.name }, { kos: req.body.value });
                    let difference = req.body.value - modifiedStats.kos;
                    const modifiedTeam = await Team.findOneAndUpdate({ players: req.body.name }, { $inc: { kos: difference } });
                    res.status(200).json({ message: `The KOs for ${req.body.name} has been changed from ${modifiedStats.kos} to ${req.body.value}` });
                }

            } else if (req.body.modifyType == 'damage') {

                //validating the name received
                const testQuery = await Player.find({ name: req.body.name }, 'name');
                if (!testQuery[0].name || testQuery[0].name == "") {
                    throw new Error('Player name not found');
                }

                //checking the type of modification
                if (req.body.valueType == 'increase') {
                    //increasing damage by inputted value
                    const modifiedStats = await Player.findOneAndUpdate({ name: req.body.name }, { $inc: { damage: req.body.value } }, { new: true });
                    const modifiedTeam = await Team.findOneAndUpdate({ players: req.body.name }, { $inc: { damage: req.body.value } });
                    res.status(200).json({ message: `The damage for ${req.body.name} has been increased by ${req.body.value} to ${modifiedStats.damage}` });

                } else if (req.body.valueType == 'decrease') {
                    //decreasing damage by inputted value
                    const modifiedStats = await Player.findOneAndUpdate({ name: req.body.name }, { $inc: { damage: -req.body.value } }, { new: true });
                    const modifiedTeam = await Team.findOneAndUpdate({ players: req.body.name }, { $inc: { damage: -req.body.value } });
                    res.status(200).json({ message: `The damage for ${req.body.name} has been decreased by ${req.body.value} to ${modifiedStats.damage}` });

                } else if (req.body.valueType == 'replace') {
                    //replacing damage by inputted value
                    const modifiedStats = await Player.findOneAndUpdate({ name: req.body.name }, { damage: req.body.value });
                    let difference = req.body.value - modifiedStats.damage;
                    const modifiedTeam = await Team.findOneAndUpdate({ players: req.body.name }, { $inc: { damage: difference } });
                    res.status(200).json({ message: `The damage for ${req.body.name} has been changed from ${modifiedStats.damage} to ${req.body.value}` });
                }
            } else {
                throw new Error('Incorrect value for data modification');
            }
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;