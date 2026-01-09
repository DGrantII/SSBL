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

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}
let myName = getUrlVars()["name"];

const fetchData = () => {
    axios.get(`http://localhost:3000/api/teams/${myName}`)
        .then(response => {
            const data = response.data;
            let buffer = arrayBufferToBase64(data[0].logo.data.data);
            document.getElementById("teamName").innerHTML = data[0].name;
            let out = `
                    <tr>
                        <td rowspan="4" colspan="2"><img src="data:${data[0].logo.contentType};base64,${buffer}" alt="${data[0].name}'s logo" /></td>
                        <td>Standing: (${data[0].wins}-${data[0].losses})</td>
                    </tr>
                    <tr>
                        <td>Total KOs: ${data[0].kos}</td>
                    </tr>
                    <tr>
                        <td>Total Damage: ${data[0].damage.toLocaleString("en-US")}</td>
                    </tr>
                    <tr>
                        <td>Location: ${data[0].location}</td>
                    </tr>
                    <tr class='subHeader'><td colspan='3'>Players</td></tr>
                    <tr>
                        <td>${data[1][0].name}</td>
                        <td>${data[1][1].name}</td>
                        <td>${data[1][2].name}</td>
                    </tr>
                    <tr>
                        <td>KOs: ${data[1][0].kos}</td>
                        <td>KOs: ${data[1][1].kos}</td>
                        <td>KOs: ${data[1][2].kos}</td>
                    </tr>
                    <tr>
                        <td>Damage: ${data[1][0].damage.toLocaleString("en-US")}</td>
                        <td>Damage: ${data[1][1].damage.toLocaleString("en-US")}</td>
                        <td>Damage: ${data[1][2].damage.toLocaleString("en-US")}</td>
                    </tr>
                    <tr class='subHeader'><td colspan='3'>Team History</td></tr>
                    <tr>
                        <td>Season Debut</td>
                        <td>Playoff Appearances</td>
                        <td>Championship Apps/Wins</td>
                    </tr>
                    <tr>
                        <td>Season ${data[0].debut}</td>
                        <td>${data[0].playoffApps}</td>
                        <td>${data[0].finalsApps} / ${data[0].championships}</td>
                    </tr>
                `;
            document.getElementById("teamInfo").innerHTML = out;

        })
        .catch(err => console.log(err));
}
fetchData();