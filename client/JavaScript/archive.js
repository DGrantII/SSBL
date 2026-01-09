function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function getTableArchives(type) {
    axios.get(`http://localhost:3000/api/archives/${type}`)
        .then(response => {
            let out = '<tr>';
            let placeholder = document.getElementById('output');
            let number = 0;

            let data = response.data;

            for (let record of data.result) {
                let base64 = arrayBufferToBase64(record.logo.data.data);
                if ((number % 3) == 0) {                    
                    out += `
                        </tr><tr>
                            <td> Season ${record.season}<br />
                            <img src="data:${record.logo.contentType};base64,${base64}" /><br />
                    `;
                    if (type == 'champions') {
                        out += `(${record.seed})<br />`;
                    }
                    out += `
                        ${record.players[0]}<br />
                        ${record.players[1]}<br />
                        ${record.players[2]}<br />
                    `;
                } else {                
                    out += `
                        <td> Season ${record.season}<br />
                        <img src="data:${record.logo.contentType};base64,${base64}" /><br />
                    `;
                    if (type == 'champions') {
                        out += `(${record.seed})<br />`;
                    }
                    out += `
                        ${record.players[0]}<br />
                        ${record.players[1]}<br />
                        ${record.players[2]}<br />
                    `;
                }
                number++;
            }
            out += '</tr>';
            placeholder.innerHTML = out;
        });
}

//function getPDFArchives(type) {
//    document.getElementById('inputForm').addEventListener('submit', (event) => {
//        event.preventDefault();
//        let number = document.getElementById('number').value;
//        document.getElementById('inputForm').style.display = 'none';
//        document.getElementById('output').data = `http://localhost:3000/api/archives/${number}/${type}`;
//    });
//}

function getPDFArchives(type) {
    document.getElementById('inputForm').addEventListener('submit', (event) => {
        event.preventDefault();
        let number = document.getElementById('number').value;
        document.getElementById('inputForm').style.display = 'none';
        axios.get(`http://localhost:3000/api/archives/${number}/${type}`)
            .then(response => {
                const data = response.data;

                //obtaining integer array
                const intArray = data.data.data;

                //converting array into ArrayBuffer
                const arrayBuffer = new ArrayBuffer(intArray.length);
                const unit8View = new Uint8Array(arrayBuffer);
                for (let i = 0; i < intArray.length; i++) {
                    unit8View[i] = intArray[i];
                }

                //converting buffer into Blob
                const blob = new Blob([arrayBuffer], { type: data.contentType });
                const url = URL.createObjectURL(blob);
                document.getElementById('output').data = url;
            })
    })
}

function getOldTeams() {
    axios.get('http://localhost:3000/api/archives/old-teams')
        .then(response => {
            const data = response.data;
            let out = '';
            let placeholder = document.querySelector('#data-output');
            let index = 0;
            while (index < data.length) {
                if (index <= data.length - 3) {
                    out += `
                                <tr>
                                    <td><a href='info.html?name=${data[index].name}'>${data[index].name}</a></td>
                                    <td><a href="info.html?name=${data[index + 1].name}">${data[index + 1].name}</a></td>
                                    <td><a href="info.html?name=${data[index + 2].name}">${data[index + 2].name}</a></td>
                                </tr>
                            `;
                    index += 3;
                } else if (index <= data.length - 2) {
                    out += `
                                <tr>
                                    <td><a href="info.html?name=${data[index].name}">${data[index].name}</a></td>
                                    <td colspan="2"><a href="info.html?name=${data[index + 1].name}">${data[index + 1].name}</a></td>
                                </tr>
                            `;
                    break;
                } else {
                    out += `<tr><td colspan="3"><a href="info.html?name=${data[index].name}">${data[index].name}</a></td></tr>`;
                    break;
                }
            }
            placeholder.innerHTML = out;
        }).catch(err => console.log(err.message));
}

function getURLvars() {
    let vars = {};
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function getOldTeamData() {
    let teamName = getURLvars()['name'];
    axios.get(`http://localhost:3000/api/archives/old-teams/${teamName}`)
        .then(response => {
            const data = response.data[0];
            const base64 = arrayBufferToBase64(data.logo.data.data);
            document.getElementById('teamName').textContent = data.name;
            let out = `
                        <tr>
                            <td rowspan="4" colspan="2"><img src="data:${data.logo.contentType};base64,${base64}" alt="${data.name}'s logo" /></td>
                            <td>Debut Season: ${data.debut}</td>
                        </tr>
                        <tr>
                            <td>Final Season: ${data.lastSeason}</td>
                        </tr>
                        <tr>
                            <td>Playoff Appearances: ${data.playoffApps}</td>
                        </tr>
                        <tr>
                            <td>Championship Apps/Wins: ${data.finalsApps} / ${data.championships}</td>
                        </tr>
                    `;
            document.getElementById('teamInfo').innerHTML = out;
        }).catch(err => console.log(err.message));
}