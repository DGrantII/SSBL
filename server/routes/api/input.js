const multer = require('multer');
const upload = multer();

const { Router } = require('express');
const Team = require("../../models/Team");
const Player = require("../../models/Player");

const router = Router();

//route to update team and character data
router.post('/', upload.none(), async (req, res) => {
    try {
        //Validating content in fields
        if (
            !req.body.l_name ||
            !req.body.l_player1 ||
            !req.body.l_player2 ||
            !req.body.l_player3 ||
            !req.body.l_p1kos ||
            !req.body.l_p2kos ||
            !req.body.l_p3kos ||
            !req.body.l_p1damage ||
            !req.body.l_p2damage ||
            !req.body.l_p3damage ||
            !req.body.r_name ||
            !req.body.r_player1 ||
            !req.body.r_player2 ||
            !req.body.r_player3 ||
            !req.body.r_p1kos ||
            !req.body.r_p2kos ||
            !req.body.r_p3kos ||
            !req.body.r_p1damage ||
            !req.body.r_p2damage ||
            !req.body.r_p3damage ||
            !req.body.winningTeam
        ) {
            throw new Error('Field(s) were left blank');
        }

        console.log(req.body.winningTeam);
        if (req.body.winningTeam == 'l_team') {
            console.log('YES L TEAM');
        } else if (req.body.winningTeam == 'r_team') {
            console.log('YO R TEEEEM');
        }

        //Validating left team name
        const l_team = await Team.find({ name: req.body.l_name });
        if (!l_team[0]) {
            throw new Error('Left team not found');
        }

        //Validating right team name
        const r_team = await Team.find({ name: req.body.r_name });
        if (!r_team[0]) {
            throw new Error('Right team not found');
        }

        //Validating players in left team
        const l_players = l_team[0].players;
        if (!l_players.includes(req.body.l_player1) || !l_players.includes(req.body.l_player2) || !l_players.includes(req.body.l_player3)) {
            throw new Error('Player(s) not found in left team');
        }

        //Validating players in right team
        const r_players = r_team[0].players;
        if (!r_players.includes(req.body.r_player1) || !r_players.includes(req.body.r_player2) || !r_players.includes(req.body.r_player3)) {
            throw new Error('Player(s) not found in right team');
        }

        //Saving stats to teams
        if (req.body.winningTeam == 'l_team') {
            const Lwinner = await Team.findOneAndUpdate({ name: req.body.l_name }, {
                $inc: {
                    wins: 1,
                    kos: (parseInt(req.body.l_p1kos) + parseInt(req.body.l_p2kos) + parseInt(req.body.l_p3kos)),
                    damage: (parseInt(req.body.l_p1damage) + parseInt(req.body.l_p2damage) + parseInt(req.body.l_p3damage))
                }
            });
            const Rloser = await Team.findOneAndUpdate({ name: req.body.r_name }, {
                $inc: {
                    losses: 1,
                    kos: (parseInt(req.body.r_p1kos) + parseInt(req.body.r_p2kos) + parseInt(req.body.r_p3kos)),
                    damage: (parseInt(req.body.r_p1damage) + parseInt(req.body.r_p2damage) + parseInt(req.body.r_p3damage))
                }
            });
        } else if (req.body.winningTeam == 'r_team') {
            const Rwinner = await Team.findOneAndUpdate({ name: req.body.r_name }, {
                $inc: {
                    wins: 1,
                    kos: (parseInt(req.body.r_p1kos) + parseInt(req.body.r_p2kos) + parseInt(req.body.r_p3kos)),
                    damage: (parseInt(req.body.r_p1damage) + parseInt(req.body.r_p2damage) + parseInt(req.body.r_p3damage))
                }
            });
            const Lloser = await Team.findOneAndUpdate({ name: req.body.l_name }, {
                $inc: {
                    losses: 1,
                    kos: (parseInt(req.body.l_p1kos) + parseInt(req.body.l_p2kos) + parseInt(req.body.l_p3kos)),
                    damage: (parseInt(req.body.l_p1damage) + parseInt(req.body.l_p2damage) + parseInt(req.body.l_p3damage))
                }
            });
        } else {
            throw new Error('Something went wrong when selecting the winning team (backend problem)');
        }

        //Update player data
        await Player.findOneAndUpdate({ name: req.body.r_player1 }, { $inc: { kos: req.body.r_p1kos, damage: req.body.r_p1damage } });
        await Player.findOneAndUpdate({ name: req.body.r_player2 }, { $inc: { kos: req.body.r_p2kos, damage: req.body.r_p2damage } });
        await Player.findOneAndUpdate({ name: req.body.r_player3 }, { $inc: { kos: req.body.r_p3kos, damage: req.body.r_p3damage } });

        await Player.findOneAndUpdate({ name: req.body.l_player1 }, { $inc: { kos: req.body.l_p1kos, damage: req.body.l_p1damage } });
        await Player.findOneAndUpdate({ name: req.body.l_player2 }, { $inc: { kos: req.body.l_p2kos, damage: req.body.l_p2damage } });
        await Player.findOneAndUpdate({ name: req.body.l_player3 }, { $inc: { kos: req.body.l_p3kos, damage: req.body.l_p3damage } });

        res.status(200).json({ message: "Teams successfully updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//routes to get the names of teams and players for dropdown list
router.get('/names', async (req, res) => {
    try {
        const teams = await Team.find({}, 'name');
        if (!teams) {
            throw new Error('No teams found');
        }
        const players = await Player.find({}, 'name');
        if (!players) {
            throw new Error('No players found');
        }

        teams.sort((a, b) => {
            let fa = a.name.toLowerCase(),
                fb = b.name.toLowerCase();
            if (fa < fb) { return -1; }
            if (fa > fb) { return 1; }
            return 0;
        });
        players.sort((a, b) => {
            let fa = a.name.toLowerCase(),
                fb = b.name.toLowerCase();
            if (fa < fb) { return -1; }
            if (fa > fb) { return 1; }
            return 0;
        });

        const response = [];
        response[0] = teams;
        response[1] = players;
        
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/teams', async (req, res) => {
    try {
        const teams = await Team.find({}, 'name');
        if (!teams || teams[0] == undefined || teams[0] == null) {
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

router.get('/players', async (req, res) => {
    try {
        const players = await Player.find({}, 'name');
        if (!players || players[0] == undefined || players[0] == null) {
            throw new Error('No players found');
        }
        players.sort((a, b) => {
            let fa = a.name.toLowerCase(),
                fb = b.name.toLowerCase();
            if (fa < fb) { return -1; }
            if (fa > fb) { return 1; }
            return 0;
        });
        res.status(200).json(players);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;