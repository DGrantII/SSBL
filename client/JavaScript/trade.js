const readyTeam = { name: "", players: [] };
axios.get("http://localhost:3000/api/offseason/trade")
    .then(response => {
        const result = response.data;
        //result format: {status: 'availability', nextTeam: 'teamName', players: 'playerArray'}
        if (result.status == 'unavailable') {
            document.getElementById('message').innerHTML = "<p>There are no teams available to trade</p>";
        } else {
            //saving the data for the next team in global object
            readyTeam.name = result.nextTeam;
            readyTeam.players = result.players;

            //filling the input form with data
            populateInputForm("");

            //creating the event listener for the form
            document.getElementById('inputForm').addEventListener('submit', function (e) {
                e.preventDefault();
                sendData(e.target);
                this.reset();
            });

            //making form visible
            document.getElementById('form').style.display = 'block';
        }
    }).catch(err => { console.log(err); });

function sendData(form) {
    let formData = new FormData(form);
    formData.append('team', readyTeam.name);
    formData.append('player1', readyTeam.players[0]);
    formData.append('player2', readyTeam.players[1]);
    formData.append('player3', readyTeam.players[2]);

    axios.post('http://localhost:3000/api/offseason/trade', formData, {
        headers: {
            "Content-Type": 'multipart/form-data',
        },
    }).then(response => {
        const result = response.data;
        //result format: {status: 'availability', initiatingTeam: 'teamName', going: 'playerLeavingTeam',
        //      reactingTeam: 'teamName', coming: 'playerJoiningTeam', nextTeam: 'teamName', players: 'playerArray'}

        //creating the conditional string
        let conditionalString = "<p>" + result.going + " of the " +
            result.initiatingTeam + " was traded for " + result.coming + " of the " +
            result.reactingTeam + "</p>";

        if (result.status == 'unavailable') {
            document.getElementById('message').innerHTML = conditionalString + "<p>There are no teams available to trade</p>";
            document.getElementById('form').style.display = 'none';
        } else {
            //saving the data for the next team in global object
            readyTeam.name = result.nextTeam;
            readyTeam.players = result.players;

            //filling input form with data
            populateInputForm(conditionalString);

        }
    }).catch(err => { console.log(err); });
}

function populateInputForm(conditionalString) {
    document.getElementById('message').innerHTML = conditionalString + "<p>" + readyTeam.name + " are ready to trade</p>";
    const radios = document.getElementsByClassName('radioInput');
    const labels = document.getElementsByClassName('radioLabel');
    let index = 0;
    for (radio of radios) {
        radio.value = readyTeam.players[index];
        labels[index].textContent = readyTeam.players[index];
        index++;
    }
}