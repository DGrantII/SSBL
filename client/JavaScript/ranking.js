//Function to obtain ranked teams
function rankTeams() {
    axios
        .get('http://localhost:3000/api/teams/rank')
        .then(response => {
            const data = response.data;
            let placeholder = document.querySelector('#data-output');
            let rank = 1;
            let out = "";
            for (let team of data) {
                out += `
                    <tr>
                        <td> ${rank}) </td>
                        <td> ${team.name} <img class='change' src='${team.changeIcon}' /> ${team.change} </td>
                        <td> (${team.wins} - ${team.losses}) </td>
                    </tr>
                `;
                rank++;
            }
            placeholder.innerHTML = out;
        })
        .catch(err => { console.log(err); });
}

//Function to obtain top teams
function topTeams() {
    axios
        .get('http://localhost:3000/api/teams/top-teams')
        .then(response => {
            const data = response.data;
            console.log(data);
            let placeholder = document.querySelector('#topTeams');
            let rank = 1;
            let out = "";
            for (let team of data) {
                out += `
                    <tr>
                        <td> ${rank}) ${team.name} (${team.wins} - ${team.losses})</td>
                    </tr>
                `;
                rank++;
            }
            placeholder.innerHTML = out;
        })
        .catch(err => { console.log(err); });
}

//Function to obtain ranked players
function rankPlayers() {
    axios
        .get('http://localhost:3000/api/players/rank')
        .then(response => {
            const data = response.data;
            let placeholder = document.querySelector('#data-output');
            let rank = 1;
            let out = "";
            for (let player of data) {
                out += `
                    <tr>
                        <td> ${rank}) </td>
                        <td> ${player.name} <img class='change' src='${player.changeIcon}' /> ${player.change} </td>
                        <td> (${player.kos}, ${player.damage}) </td>
                    </tr>
                `;
                rank++;
            }
            placeholder.innerHTML = out;
        })
        .catch(err => { console.log(err); });
}

//Function to obtain top players
function topPlayers() {
    axios
        .get('http://localhost:3000/api/players/top-players')
        .then(response => {
            const data = response.data;
            let placeholder = document.querySelector('#topPlayers');
            let rank = 1;
            let out = "";
            for (let player of data) {
                out += `
                    <tr>
                        <td> ${rank}) ${player.name} (${player.kos}, ${player.damage})</td>
                    </tr>
                `;
                rank++;
            }
            placeholder.innerHTML = out;
        })
        .catch(err => { console.log(err); });
}