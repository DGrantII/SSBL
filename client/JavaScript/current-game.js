async function wakeLock() {
    try {
        let wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock active');
    } catch (err) {
        console.error(`Wake Lock error: ${err.message}`);
    }
}

//Function to convert ArrayBuffer array to base64
function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

//Function to populate dropdown buttons with teams
function loadDropdown() {
    axios
        .get('http://localhost:3000/api/teams/current-game')
        .then(response => {
            const data = response.data;
            const homeContent = document.getElementById("homeDropdown");
            const awayContent = document.getElementById("awayDropdown");
            const test = document.getElementById('testing');
            let out = "";
            let out2 = "";
            for (let team of data) {
                let buffer = arrayBufferToBase64(team.logo.data.data);
                out += `<a onclick="
                            selectTeam('awayLogo', 'away', ${team.wins}, ${team.losses}, '${buffer}', '${team.logo.contentType}'),
                            setCookie('${team.name}', 'away')">${team.name}</a>`;
                out2 += `<a onclick="
                            selectHomeTeam('homeLogo', 'home', ${team.wins}, ${team.losses}, '${buffer}', '${team.logo.contentType}', '${team.location}'),
                            setCookie('${team.name}', 'home')">${team.name}</a>`;
            }
            homeContent.innerHTML = out2;
            awayContent.innerHTML = out;
        })
        .catch(err => { console.lgo(err); });
}

//Function to populate playoff dropdown buttons with teams
function loadPlayoffDropdown() {
    axios.get('http://localhost:3000/api/playoffs/current-game')
        .then(response => {
            const data = response.data;
            if (data.status == true) {
                const homeContent = document.getElementById('homeDropdown');
                const awayContent = document.getElementById('awayDropdown');
                let out = `
                    <a onclick="selectChampionsBattle('awayLogo', 'away', 'http://localhost:3000/images/AllStars.png')">All-Stars</a>
                    <a onclick="selectChampionsBattle('awayLogo', 'away', 'http://localhost:3000/images/Elites.png')">Elites</a>
                `;
                let out2 = `
                    <a onclick="selectChampionsBattle('homeLogo', 'home', 'http://localhost:3000/images/AllStars.png')">All-Stars</a>
                    <a onclick="selectChampionsBattle('homeLogo', 'home', 'http://localhost:3000/images/Elites.png')">Elites</a>
                `;
                for (let team of data.results) {
                    out += `<a onclick="
                                selectPlayoffTeam('awayLogo', 'away', ${team.seed}, '${team.logo.data}', '${team.logo.contentType}'),
                                setPlayoffCookie('${team.name}', 'away', '${team.seed}', '${team.logo}')">${team.name}</a>`;
                    out2 += `<a onclick="
                                selectPlayoffTeam('homeLogo', 'home', ${team.seed}, '${team.logo.data}', '${team.logo.contentType}'),
                                setPlayoffCookie('${team.name}', 'home', '${team.seed}', '${team.logo}')">${team.name}</a>`;

                }
                homeContent.innerHTML = out2;
                awayContent.innerHTML = out;
            }
        }).catch(err => { console.log(err); });
}

//Function to reveal the dropdown list
function reveal(id) {
    let tag = document.getElementById(id);
    tag.style.display = tag.style.display === 'block' ? 'none' : 'block';
}

//Function to hide the dropdown list
function hide(id, id2) {
    var tag = document.getElementById(id);
    var tag2 = document.getElementById(id2);
    tag.style.display = 'none';
    tag2.style.display = 'none';
}

//Function to select the away team
function selectTeam(imageID, statID, wins, losses, logo, contentType) {
    document.getElementById(imageID).src = `data:${contentType};base64,${logo}`;
    document.getElementById(statID).innerHTML = `<strong>(${wins} - ${losses})</strong>`;
}

//Function to select the home team
function selectHomeTeam(imageID, statID, wins, losses, logo, contentType, location) {
    selectTeam(imageID, statID, wins, losses, logo, contentType);
    document.getElementById('location').innerHTML = location;
}

//Function to select the playoff team
function selectPlayoffTeam(imageID, statID, seed, logo, contentType) {
    document.getElementById(imageID).src = `data:${contentType};base64,${logo}`;
    document.getElementById(statID).innerHTML = `<strong>(${seed})</strong`;
}

//Function to select the champion's battle teams
function selectChampionsBattle(imageID, statID, logo) {
    document.getElementById(imageID).src = logo;
    document.getElementById(statID).innerHTML = "";
}

//Function to select the playoff location
function place(stage, id) {
    document.getElementById('location').innerHTML = stage;
    var tag = document.getElementById(id);
    tag.style.display = 'none';
}

//Function to set initial teams with cookies
async function setInitialTeams() {
    //let homeStats = getCookies("homeStats");
    //let homeLogo = getCookies("homeLogo");
    //let homeContentType = getCookies("homeContentType");
    //let awayStats = getCookies("awayStats");
    //let awayLogo = getCookies("awayLogo");
    //let awayContentType = getCookies("awayContentType");
    //let location = getCookies("location");

    //if (homeLogo != undefined) {
    //    document.getElementById("homeLogo").src = `data:${homeContentType};base64,${homeLogo}`;
    //    document.getElementById("home").innerHTML = `<strong>${homeStats}</strong>`;
    //    document.getElementById("location").innerHTML = location;
    //}
    //if (awayLogo != undefined) {
    //    document.getElementById("awayLogo").src = `data:${awayContentType};base64,${awayLogo}`;
    //    document.getElementById("away").innerHTML = `<strong>${awayStats}</strong>`;
    //}

    let home = getCookies('home');
    let away = getCookies('away');

    if (home != undefined && away != undefined) {
        const response = await axios.get(`http://localhost:3000/api/teams/current-game/${home}/${away}`);
        const data = response.data;
        let buffer = arrayBufferToBase64(data[1].logo.data.data);
        selectTeam('awayLogo', 'away', data[1].wins, data[1].losses, buffer, data[1].logo.contentType);
        buffer = arrayBufferToBase64(data[0].logo.data.data);
        selectHomeTeam('homeLogo', 'home', data[0].wins, data[0].losses, buffer, data[0].logo.contentType, data[0].location);
        
    }
}



//Function to set cookies
function setCookie(name, status) {
    const d = new Date();
    const month = d.getMonth();
    d.setMonth(month + 1);
    const expireDate = d.toUTCString();
    if (status == 'away') {
        document.cookie = `away=${name}; expires=${expireDate}`;
    }
    if (status == 'home') {
        document.cookie = `home=${name}; expires=${expireDate}`;
    }
}

//Functions to set playoff cookies
function setPlayoffCookie(name, status, seed, logo) {
    const d = new Date();
    const month = d.getMonth();
    d.setMonth(month + 1);
    const expireDate = d.toUTCString();
    if (status == 'away') {
        document.cookie = `awayP=${name}; expires=${expireDate}`;
        document.cookie = `awaySeedP=${seed}; expires=${expireDate}`;
        document.cookie = `awayLogoP=${logo}; expires=${expireDate}`;
    }
    if (status == 'home') {
        document.cookie = `homeP=${name}; expires=${expireDate}`;
        document.cookie = `homeSeedP=${seed}; expires=${expireDate}`;
        document.cookie = `homeLogoP=${logo}; expires=${expireDate}`;
    }
}
function setLocationCookie(location) {
    const d = new Date();
    const month = d.getMonth();
    d.setMonth(month + 1);
    const expireDate = d.toUTCString();
    document.cookie = `locationP=${location}; expires=${expireDate}`;
}

//Function to read cookie value
function getCookies(name) {
    const regex = new RegExp(`(^| )${name}=([^;]+)`)
    const match = document.cookie.match(regex)
    if (match) {
        return match[2]
    }
}