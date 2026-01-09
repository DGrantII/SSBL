const { Router } = require('express');
const router = Router();
const path = require('path');
const fs = require('fs');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const Champions = require('../../models/Champions');
const MVPs = require('../../models/MVPs');
const Archive = require('../../models/Archive');
const Seasons = require('../../models/Seasons');
const Images = require('../../models/Images');

//route to get the champions data
router.get('/champions', async (req, res) => {
    try {
        const query = await Seasons.find({}, 'champions');
        const result = [];
        index = 1;
        for (record of query) {
            if (record.champions == undefined) {
                break;
            }
            temporary = {
                season: index,
                name: record.champions.name,
                seed: record.champions.seed,
                players: record.champions.players,
                logo: record.champions.logo
            }
            result.push(temporary);
            index++;
        }
        res.status(200).json({ result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//route to get the champion's battle data
router.get('/mvps', async (req, res) => {
    try {
        const query = await Seasons.find({}, 'mvps');
        const result = [];
        index = 1;
        for (record of query) {
            if (record.mvps == undefined) {
                break;
            }
            temporary = {
                season: index,
                name: record.mvps.name,
                players: record.mvps.players,
                logo: record.mvps.logo
            }
            result.push(temporary);
            index++;
        }
        res.status(200).json({ result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//route to get old teams names
router.get('/old-teams', async (req, res) => {
    try {
        const result = await Archive.find({}, 'name');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//route to get old team stats
router.get('/old-teams/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const result = await Archive.find({ name: name });
        if (!result) {
            throw new Error('Team not found');
        }
        res.status(200).json(result);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
})

//route to get the pdf archived data
router.get('/:season/:file', async (req, res) => {
    const season = req.params.season;
    const file = req.params.file + 'Results';
    const query = await Seasons.find({ season: season }, `${file}`);
    const result = query[0][file];
    res.send(result);
});

//testing routes
router.get('/testing', async (req, res) => {
    const myObject = {
        name: 'Vortex',
        logo: {
            data: fs.readFileSync('./temporary/Vortex.png'),
            contentType: 'image/png'
        },
        location: 'Windy Hill Zone',
        debut: 1,
        lastSeason: 4,
        playoffApps: 2,
        finalsApps: 0,
        championships: 0
    }
    Archive.insertMany(myObject);
    res.send('testing')
})

router.get('/testing/:season/:file', async (req, res) => {
    const season = req.params.season;
    const file = req.params.file + 'Results';
    const query = await Seasons.find({ season: season }, `${file}`);
    const result = query[0][file];
    res.send(result);
});

router.get('/testing2', async (req, res) => {
    const query = await Seasons.findOne({}, 'season').sort({ season: -1 }).exec();
    const topNumber = query.season + 1;
    const result = Seasons.insertMany({ season: topNumber });
    res.send('testing 2');
})

module.exports = router;