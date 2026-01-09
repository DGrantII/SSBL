function playerLevel1(modifyType) {
    let out = '<p class="formHeader">';
    if (modifyType == 'Name') {
        out += `
                    Enter the old name and new name</p>
                    <input type="text" id="pName1" list="playerList" class="playerName" name="oldName" placeholder="Old Name" required />
                    <input type="text" class="playerName" name="newName" placeholder="New Name" required />
                    <input type="hidden" id="imageCheck" name="imageCheck" value="false" />
                    <input type="submit" name="submit" />
                `;
        document.getElementById('level1').style.display = 'none';
        let placeholder = document.getElementById('level2');
        placeholder.innerHTML = out;
        placeholder.style.display = 'block';
        dropdown('pName1', 'playerList');
    } else if (modifyType == 'KOs' || modifyType == 'Damage') {
        out += `
                    How are you modifying the ${modifyType}?</p>
                    <label for="increase">Increase:</label>
                    <input id="increase" type="radio" name="valueType" value="increase" onclick="playerLevel2('increase')" />
                    <label for="decrease">Decrease:</label>
                    <input id="decrease" type="radio" name="valueType" value="decrease" onclick="playerLevel2('decrease')" />
                    <label for="replace">Replace:</label>
                    <input id="replace" type="radio" name="valueType" value="replace" onclick="playerLevel2('replace')" />
                `;
        document.getElementById('level2').style.display = 'none';
        let placeholder = document.getElementById('level1');
        placeholder.innerHTML = out;
        placeholder.style.display = 'block';
    }
}

function playerLevel2(valueType) {
    let out = '<label for="value">';
    if (valueType == 'replace') {
        out += `Enter the replacement value:</label>`;
    } else {
        out += `Enter the value to be ${valueType}d by:</label>`;
    }
    out += `
                <input id="value" type="number" name="value" required/><br />
                <label for="playerName">Enter the name of the player:</label>
                <input type="text" id="playerName" list="playerList" class="playerName" name="name" required /><br />
                <input type="hidden" id="imageCheck" name="imageCheck" value="false" />
                <input type="submit" name="submit" />
            `;
    let placeholder = document.getElementById('level2');
    placeholder.innerHTML = out;
    placeholder.style.display = 'block';
    dropdown('playerName', 'playerList');
}

function teamLevel1(modifyType) {
    let placeholder1 = document.getElementById('level1');
    let placeholder2 = document.getElementById('level2');
    let out = '<p class="formHeader">';
    if (modifyType == 'Name') {
        out += `
                    Enter the old name and new name</p>
                    <input type="text" id="tName1" list="teamList" class="teamName" name="oldName" placeholder="Old Name" title="Name must be capitalized" required />
                    <input type="text" class="teamName" name="newName" placeholder="New Name" title="Name must be capitalized" required />
                    <input type="hidden" id="imageCheck" name="imageCheck" value="false" />
                    <input type="submit" name="submit" />
                `;
        placeholder2.innerHTML = '';
        placeholder1.innerHTML = out;
        dropdown('tName1', 'teamList');
    } else if (modifyType == 'Location') {
        out += `
                    Enter the team name and new location</p>
                    <input type="text" id="tName2" list="teamList" class="teamName" name="teamName" placeholder="Team Name" title="Name must be capitalized" required />
                    <input type="text" class="location" name="location" placeholder="New Location" title="Each word must be capitalized" required />
                    <input type="hidden" id="imageCheck" name="imageCheck" value="false" />
                    <input type="submit" name="submit" />
                `;
        placeholder2.innerHTML = '';
        placeholder1.innerHTML = out;
        dropdown('tName2', 'teamList');
    } else if (modifyType == 'Record') {
        out += `
                    How are you modifying the record?</p>
                    <label for="modulate">Increase/Decrease:</label>
                    <input id="modulate" type="radio" name="valueType" value="modulate" onclick="teamLevel2('modulate')" />
                    <label for="replace">Replace:</label>
                    <input id="replace" type="radio" name="valueType" value="replace" onclick="teamLevel2('replace')" />
                `;
        placeholder2.innerHTML = '';
        placeholder1.innerHTML = out;
    } else if (modifyType == 'Logo') {
        out += `
                    Are you updating the logo or changing the team? (new logo, new team name)</p>
                    <label for="update">Update:</label>
                    <input id="update" type="radio" name="logoType" value="update" onclick="teamLevel2('update')" />
                    <label for="change">Change:</label>
                    <input id="change" type="radio" name="logoType" value="change" onclick="teamLevel2('change')" />
                `;
        placeholder2.innerHTML = '';
        placeholder1.innerHTML = out;
    }
}

function teamLevel2(valueType) {
    let placeholder2 = document.getElementById('level2');
    let out = "";
    let id = "";
    if (valueType == 'replace') {
        out += `
                    <label for="wins">Enter the number of wins:</label>
                    <input id="wins" type="number" name="wins" min="0" required /><br />
                    <label for="losses">Enter the number of losses:</label>
                    <input id="losses" type="number" name="losses" min="0" required /><br />
                    <label for="teamName">Enter the name of the team:</label>
                    <input id="teamName" type="text" list="teamList" class="teamName" name="teamName" title="Name must be capitalized" required /><br />
                    <input type="hidden" id="imageCheck" name="imageCheck" value="false" />
                    <input type="submit" name="submit" />
                `;
        id = 'teamName';
    } else if (valueType == 'modulate') {
        out += `
                    <p>Wins</p>
                    <label for="wIncrease">Increase</label>
                    <input id="wIncrease" type="radio" name="winType" value="increase" required />
                    <label for="wDecrease">Decrease</label>
                    <input id="wDecrease" type="radio" name="winType" value="decrease" required /><br />
                    <label for="wValue">Enter the value to be increased/decreased by:</label>
                    <input id="wValue" type="number" name="wValue" min="0" required />
                    <p>Losses</p>
                    <label for="lIncrease">Increase</label>
                    <input id="lIncrease" type="radio" name="lossType" value="increase" required />
                    <label for="lDecrease">Decrease</label>
                    <input id="lDecrease" type="radio" name="lossType" value="decrease" required /><br />
                    <label for="lValue">Enter the value to be increased/decreased by:</label>
                    <input id="lValue" type="number" name="lValue" min="0" required /><br />
                    <label for="teamName">Enter the name of the team:</label>
                    <input id="teamName" type="text" list="teamList" class="teamName" name="teamName" title="Name must be capitalized" required /><br />
                    <input type="hidden" id="imageCheck" name="imageCheck" value="false" />
                    <input type="submit" name="submit" />
                `;
        id = 'teamName';
    } else if (valueType == 'update') {
        out += `
                    <label for="teamName">Enter the name of the team:</label>
                    <input id="teamName" type="text" list="teamList" class="teamName" name="teamName" title="Name must be capitalized" required /><br />
                    <label for="logo">Select a logo file:</label>
                    <input id="logo" type="file" name="logo" title="PNG files only" required/><br />
                    <input type="hidden" id="imageCheck" name="imageCheck" value="true" />
                    <input type="submit" name="submit" />
                `;
        id = 'teamName';
    } else if (valueType == 'change') {
        out += `
                    <label for="oldTeamName">Enter the name of the old team:</label>
                    <input id="oldTeamName" type="text" list="teamList" class="teamName" name="oldName" title="Name must be capitalized" required /><br />
                    <label for="newTeamName">Enter the name of the new team:</label>
                    <input id="newTeamName" type="text" class="teamName" name="newName" title="Name must be capitalized" required /><br />
                    <label for="season">Enter the season this team will debut in:</label>
                    <input id="season" type="number" name="seasonDebut" min="0" required /><br />
                    <label for="logo">Select a logo file (for new team):</label>
                    <input id="logo" type="file" name="logo" title="PNG files only" required /><br />
                    <input type="hidden" id="imageCheck" name="imageCheck" value="true" />
                    <input type="submit" name="submit" />
                `;
        id = 'oldTeamName';
    }
    placeholder2.innerHTML = out;
    dropdown(id, 'teamList');
}

function submitEvent(route) {
    document.getElementById('inputForm').addEventListener('submit', function (event) {
        event.preventDefault();

        //validating image
        const formData = new FormData(this);
        let imageStatus = true;
        const hiddenField = document.querySelector("input[type='hidden']");
        if (hiddenField.value == 'true') {
            let image = document.querySelector("input[type='file']");
            let filename = image.value.split('\\').pop();
            if (validateImage(filename) == false) {
                imageStatus = false;
            }
        }
        
        

        //validating text
        let textList = document.querySelectorAll("input[type='text']");
        let status = true;
        let errArry = [];
        for (let i = 0; i < textList.length; i++) {
            if (validateText(textList[i].value, textList[i].className) == false) {
                status = false;
                errArry.push(textList[i].value);
            }
        }

        if (status == false) {
            let out = `Error: Text input was not valid</br>The problem text is as follows:`;
            for (text of errArry) {
                out += ` ${text}`;
            }
            document.getElementById('output').textContent = out;
        } else if (imageStatus == false) {
            let out = 'Error: Image was not in the correct PNG format (the extension should be lowercase)';
            document.getElementById('output').textContent = out;
        } else {
            axios
                .post(`http://localhost:3000/api/${route}/modify`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                .then((res) => {
                    document.getElementById('inputForm').style.display = 'none';
                    document.getElementById('output').textContent = res.data.message;
                })
                .catch((err) => {
                    document.getElementById('output').textContent = 'Error: ' + err.response.data.message;
                });
        }
    });
}

function validateText(text, textType) {
    let pattern = /^$/;
    if (textType == 'playerName') {
        //pattern for validating player name
        pattern = /^[a-zA-Z.\-\s]+$/;
    } else if (textType == 'teamName') {
        //pattern for validating team name
        pattern = /^[A-Z][a-z]*$/;
    } else if (textType == 'location') {
        //pattern for validating the location
        pattern = /^([A-Z][a-z]*)( [A-Z][a-z]*)*$/;
    }

    //pattern matching
    if (pattern.test(text)) {
        return true;
    } else {
        return false;
    }
}

function validateImage(filename) {
    tempArry = filename.split(".");
    if (tempArry[1] == "png") {
        return true;
    } else {
        return false;
    }
}

function getPlayerNames() {
    axios.get('http://localhost:3000/api/input/players')
        .then(response => {
            const players = response.data;
            let out = '';
            let placeholder = document.querySelector('#playerList');
            for (let i = 0; i < players.length; i++) {
                out += `<option value="${players[i].name}" />`;
            }
            placeholder.innerHTML = out;
        });
}

function getTeamNames() {
    axios.get('http://localhost:3000/api/input/teams')
        .then(response => {
            const teams = response.data;
            let out = '';
            let placeholder = document.querySelector('#teamList');
            for (let i = 0; i < teams.length; i++) {
                out += `<option value="${teams[i].name}" />`;
            }
            placeholder.innerHTML = out;
        });
}

function dropdown(inputID, datalistID) {
    //portion to set up dropdown
    const input = document.getElementById(inputID);
    const datalist = document.getElementById(datalistID);
    const datalistOptions = Array.from(datalist.options);
    input.addEventListener('input', () => {
        const value = input.value.toLowerCase();
        datalistOptions.forEach(option => {
            if (!option.value.toLowerCase().startsWith(value)) {
                option.disabled = 'disabled';
            } else {
                option.removeAttribute('disabled');
            }
        });
    });

    //portion to enable tab autocomplete
    input.addEventListener('keydown', function (event) {
        if (event.key == 'Tab') {
            const newValue = this.value.toLowerCase();
            const datalist2 = document.getElementById(datalistID);
            const matchElement = Array.from(datalist2.options).find(option => option.value.toLowerCase().startsWith(newValue));
            if (matchElement) {
                this.value = matchElement.value;
            }
        }
    });
}