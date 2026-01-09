const multer = require('multer');
const upload = multer();

const { Router } = require('express');
const Schedule = require('../../models/Schedule');
const Template = require('../../models/Template');

const router = Router();

//Route to update schedule results
router.post('/update', upload.none(), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        //{ id: 'week1game0', week: 1, game: 0, guess: 'A' }
        //The 'game' property is an index

        for (let weekData of data) {
            const weekNum = weekData.week;
            const gameNum = weekData.game;
            const gameResult = weekData.guess;

            const doc = await Schedule.find({ week: weekNum });
            const myArry = doc[0].games;
            myArry[gameNum][2] = gameResult;
            const myObject = {};
            myObject['games'] = myArry;

            await Schedule.findOneAndUpdate({week: weekNum}, myObject);
        }

        res.status(200).json({ message: "Let's see..." });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

//Route to get schedule
router.get('/', async (req, res) => {
    try {
        const schedule = await Schedule.find();
        if (!schedule || schedule == []) {
            throw 401;
        } 
        res.status(200).json(schedule);
    } catch (err) {
        if (err == 401) {
            res.status(401).json({ message: "No schedule found" })
        } else {
            res.status(500).json({ message: err.message });
        }
    }
});

//Route to modify the schedule
router.post('/modify', upload.none(), async (req, res) => {
    try {

        //validating the form was received
        if (!req.body.weekNumber || !req.body.gameNumber || !req.body.result) {
            throw new Error('Fields were left blank');
        } else {

            //validating game exists
            let gameIndex = parseInt(req.body.gameNumber) - 1;
            const query = await Schedule.find({ week: req.body.weekNumber });
            if (query[0] == undefined) {
                throw new Error('Inputted week does not exist');
            } else if (query[0].games[gameIndex] == undefined) {
                throw new Error('Inputted game does not exist');
            } else {

                //modifying the schedule
                const updateObject = {};
                const gameArry = query[0].games;
                gameArry[gameIndex][2] = req.body.result;
                updateObject['games'] = gameArry;
                const result = await Schedule.findOneAndUpdate({ week: req.body.weekNumber }, updateObject, { new: true });
                res.status(200).json({ message: `Week ${req.body.weekNumber}, Game ${req.body.gameNumber} has been modified` });
            }
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

module.exports = router;