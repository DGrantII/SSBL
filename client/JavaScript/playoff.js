function prepareForm() {
    axios.get('http://localhost:3000/api/playoffs/names')
        .then(response => {
            const teams = response.data;
            let out = `<option value="All-Stars" /><option value="Elites" />`;
            let placeholder = document.querySelector('#teams');
            for (let i = 0; i < teams.length; i++) {
                out += `<option value="${teams[i]}" />`;
            }
            placeholder.innerHTML = out;

            //portion to enable tab autocomlete
            let optionInput = document.getElementsByClassName('playoffs');
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
        })
        .catch(err => { console.log(err); });

    document.getElementById('inputForm').addEventListener('submit', function (e) {
        e.preventDefault();
        sendData(e.target);
        this.reset();

    });
}

function sendData(form) {
    let formData = new FormData(form);
    axios.post('http://localhost:3000/api/playoffs/results', formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }).then(response => {
        const message = response.data;
        let element = document.getElementById('output');
        element.style.color = "black";
        element.innerHTML = message.result;
    }).catch(err => {
        const error = err.response.data;
        let element = document.getElementById("output");
        element.style.color = "red";
        element.innerHTML = error.message;

    });
}

function setRound1() {
    axios.get("http://localhost:3000/api/playoffs/round1")
        .then(response => {
            const data = response.data;
            if (data.message == 'success') {
                document.getElementById('result').style.display = 'block';
                document.getElementById('message').style.display = 'none';
            }
        });
}

//Function to set initial playoff teams with cookies
function setInitialPlayoffTeams() {
    let homeSeed = getCookies("homeSeedP");
    let homeLogo = getCookies("homeLogoP");
    let awaySeed = getCookies("awaySeedP");
    let awayLogo = getCookies("awayLogoP");
    let location = getCookies("locationP");

    if (homeLogo != undefined && homeLogo != 'undefined') {
        document.getElementById("homeLogo").src = homeLogo;
        document.getElementById("home").innerHTML = `<strong>(${homeSeed})</strong>`;
    }
    if (awayLogo != undefined && awayLogo != 'undefined') {
        document.getElementById("awayLogo").src = awayLogo;
        document.getElementById("away").innerHTML = `<strong>(${awaySeed})</strong>`;
    }
    if (location != undefined && location != 'undefined') {
        document.getElementById("location").innerHTML = location;
    }
}

function clearData() {
    axios.get("http://localhost:3000/api/playoffs/clear")
        .then(response => {
            const data = response.data;
            if (data.message == 'success') {
                document.getElementById('message').style.display = 'none';
                document.getElementById('result').style.display = 'block';
            }
        });
}

function clearPlayoffCookies() {
    document.cookie = "awayP=" + undefined;
    document.cookie = "awaySeedP=" + undefined;
    document.cookie = "awayLogoP=" + undefined;
    document.cookie = "homeP=" + undefined;
    document.cookie = "homeSeedP=" + undefined;
    document.cookie = "homeLogoP=" + undefined;
    document.cookie = "locationP=" + undefined;
}