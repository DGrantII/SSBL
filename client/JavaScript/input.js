//Function to submit form for regular season
const form = document.getElementById('inputForm');
form.addEventListener('submit', (event) => {
    event.preventDefault();
  
    var formData = new FormData(form);

    axios
        .post('http://localhost:3000/api/input/', formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        .then((res) => {
            document.getElementById('reset').click();
            document.getElementById('output').innerHTML = res.data.message;
        })
        .catch((err) => {
            document.getElementById('output').innerHTML = err.response.data.message;
        })
});
getNames();

//Function to get the dropdown names for regular season
function getNames() {
    axios
        .get('http://localhost:3000/api/input/names')
        .then(response => {
            const teams = response.data[0];
            const players = response.data[1];

            let out = "";
            let placeholder = document.querySelector('#teams');
            for (let i = 0; i < teams.length; i++) {
                out += `<option value="${teams[i].name}" />`;
            }
            placeholder.innerHTML = out;

            out = "";
            placeholder = document.querySelector('#players');
            for (let i = 0; i < players.length; i++) {
                out += `<option value="${players[i].name}" />`;
            }
            placeholder.innerHTML = out;

            //portion to set up dropdown
            const teamInputs = Array.from(document.getElementsByClassName('teams'));
            const playerInputs = Array.from(document.getElementsByClassName('players'));
            const teamDatalist = document.getElementById('teams');
            const playerDatalist = document.getElementById('players');
            const teamOptions = Array.from(teamDatalist.options);
            const playerOptions = Array.from(playerDatalist.options);
            teamInputs.forEach(input => {
                input.addEventListener('input', () => {
                    const value = input.value.toLowerCase();
                    teamDatalist.innerHTML = '';
                    teamOptions.forEach(option => {
                        if (option.value.toLowerCase().startsWith(value)) {
                            teamDatalist.appendChild(option);
                        }
                    });
                });
            });
            playerInputs.forEach(input => {
                input.addEventListener('input', () => {
                    const value = input.value.toLowerCase();
                    playerDatalist.innerHTML = '';
                    playerOptions.forEach(option => {
                        if (option.value.toLowerCase().startsWith(value)) {
                            playerDatalist.appendChild(option);
                        }
                    });
                });
            });

            //portion to enable tab autocomlete
            let optionInput = document.getElementsByClassName('teams');
            for (option of optionInput) {
                option.addEventListener('keydown', function (event) {
                    if (event.key == "Tab") {
                        const input = this.value.toLowerCase();
                        const datalist = document.getElementById('teams');
                        const matchElement = Array.from(datalist.options).find(option => option.value.toLowerCase().includes(input));
                        if (matchElement) {
                            this.value = matchElement.value;
                        }
                    }
                });
            }
            optionInput = document.getElementsByClassName('players');
            for (option of optionInput) {
                option.addEventListener('keydown', function (event) {
                    if (event.key == "Tab") {
                        const input = this.value.toLowerCase();
                        const datalist = document.getElementById('players');
                        const matchElement = Array.from(datalist.options).find(option => option.value.toLowerCase().includes(input));
                        if (matchElement) {
                            this.value = matchElement.value;
                        }
                    }
                });
            }
        })
        .catch(err => { console.log(err); });
}

//Function to rank the teams and players
async function rank() {
    document.body.style.cursor = 'progress';
    axios
        .get('http://localhost:3000/api/players/ranking')
        .then(response => {
            if (response.data.message == 'success') {
                axios.get('http://localhost:3000/api/teams/ranking')
                    .then(res => {
                        if (res.status == 200) {
                            document.getElementById('output').innerHTML = res.data.message;
                            document.body.style.cursor = 'default';
                        }
                        document.body.style.cursor = 'default';
                    })
                    .catch((err) => { console.log(err); });
            }
        })
        .catch((err) => { console.log(err); });
}

