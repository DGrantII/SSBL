let highlightArray = [];
let data;

//Function to set the background color for winning team
function wins(id, id2, weekNum, gameIndex, win) {
    let color1 = document.getElementById(id).style.backgroundColor;
    let color2 = document.getElementById(id2).style.backgroundColor;
    if (color1 != "greenyellow" && color2 != "greenyellow") {
        document.getElementById(id).style.backgroundColor = "greenyellow";
        document.getElementById(id2).style.backgroundColor = "white";
        highlightArrayFunction(weekNum, gameIndex, win);
    }
}

//Function to set the background color for guess
function guess(id, id2, weekNum, gameIndex, guess) {
    let color1 = document.getElementById(id).style.backgroundColor;
    let color2 = document.getElementById(id2).style.backgroundColor;
    if (color1 != "greenyellow" && color2 != "greenyellow") {
        if (color1 != "yellow" && color2 != "yellow") {
            document.getElementById(id).style.backgroundColor = "yellow";
            highlightArrayFunction(weekNum, gameIndex, guess);
        }
        if (color1 == "yellow") {
            document.getElementById(id).style.backgroundColor = "white";
            highlightArrayFunction(weekNum, gameIndex, "D");
        }
        if (color1 != "yellow" && color2 == "yellow") {
            document.getElementById(id).style.backgroundColor = "yellow";
            document.getElementById(id2).style.backgroundColor = "white";
            highlightArrayFunction(weekNum, gameIndex, guess);
        }
    }
}

//Function to add modified game to global array
function highlightArrayFunction(weekNum, gameIndex, guess) {
    let myID = 'week' + weekNum + 'game' + (gameIndex + 1);
    const myObject = { id: myID, week: weekNum, game: gameIndex, guess: guess };

    let check = highlightArray.find(({ id }) => id === myID);
    if (check == undefined) {
        highlightArray.push(myObject);
    } else {
        highlightArray[highlightArray.indexOf(check)] = myObject;
    }
}

//Function to create pdf of schedule
function generatePDF() {
    let x = 20;
    let y = 30;
    let index = 0;

    var doc = new jspdf.jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });
    doc.setFontSize(14);
    for (let matchWeek of data) {
        if ((matchWeek.week % 6) == 1 && matchWeek.week != 1) {
            doc.addPage();
            y = 10;
            doc.text('\n', 20, y);
            y += 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`Week ${matchWeek.week}:`, x, y);
        y += 20;
        for (let game of matchWeek.games) {
            if (index % 3 == 0 && index != 0) {
                x = 20;
                y += 20;
            }
            doc.setFont("helvetica", "normal");
            if (game[2] == "H") {
                doc.text(game[0], x, y);
                x += 75;
                doc.text('@', x, y);
                x += 20;
                doc.setFillColor(173, 255, 47);
                doc.rect(x, (y - 12), 75, 15, 'F');
                doc.text(game[1], x, y);
                x += 105;
            } else if (game[2] == "A") {
                doc.setFillColor(173, 255, 47);
                doc.rect(x, (y - 12), 75, 15, 'F');
                doc.text(game[0], x, y);
                x += 75;
                doc.text('@', x, y);
                x += 20;
                doc.text(game[1], x, y);
                x += 105;
            } else {
                doc.text(game[0], x, y);
                x += 75;
                doc.text('@', x, y);
                x += 20;
                doc.text(game[1], x, y);
                x += 105;
            }
            index++;
        }
        index = 0;
        x = 20;
        y += 40;
    }
    doc.save("Schedule.pdf");
    document.getElementById("message").style.display = "block";
}

//Obtaining schedule data and populating the table
axios
    .get('http://localhost:3000/api/schedule/')
    .then(response => {
        data = response.data;
        let placeholder = document.querySelector('#output');
        let out = "";
        let ids = 1;
        let number = 1;
        for (let matchWeek of data) {
            out += `
                <tr>
                    <th colspan='12'>Week ${matchWeek.week}</th>
                </tr><tr>
            `;
            for (let index = 0; index < matchWeek.games.length; index++) {
                if (matchWeek.games[index][2] == "YH") {
                    out += `
                            <td
                                id='${ids}'
                                class='away'
                                onclick='guess(${ids}, ${ids + 1}, ${matchWeek.week}, ${index}, "YA")'
                                ondblclick='wins(${ids}, ${ids + 1}, ${matchWeek.week}, ${index}, "A")'>
                                ${matchWeek.games[index][0]}</td>
                            <td>@</td>
                            `;
                    ids++;
                    out += `
                            <td
                                id='${ids}'
                                class='away'
                                style='background-color:yellow;'
                                onclick='guess(${ids}, ${ids - 1}, ${matchWeek.week}, ${index}, "YH")'
                                ondblclick='wins(${ids}, ${ids + 1}, ${matchWeek.week}, ${index}, "H")'>
                                ${matchWeek.games[index][1]}</td>
                            `
                    ids++;
                } else if (matchWeek.games[index][2] == "YA") {
                    out += `
                            <td
                                id='${ids}'
                                class='away'
                                style='background-color:yellow;'
                                onclick='guess(${ids}, ${ids + 1}, ${matchWeek.week}, ${index}, "YA")'
                                ondblclick='wins(${ids}, ${ids + 1}, ${matchWeek.week}, ${index}, "A")'>
                                ${matchWeek.games[index][0]}</td>
                            <td>@</td>
                            `
                    ids++;
                    out += `
                            <td
                                id='${ids}'
                                class='home'
                                onclick='guess(${ids}, ${ids - 1}, ${matchWeek.week}, ${index}, "YH")'
                                ondblclick='wins(${ids}, ${ids - 1}, ${matchWeek.week}, ${index}, "H")'>
                                ${matchWeek.games[index][1]}</td>
                            `
                    ids++;
                } else if (matchWeek.games[index][2] == "H") {
                    out += `
                            <td
                                id='${ids}'
                                class='away'>
                                ${matchWeek.games[index][0]}</td>
                            <td>@</td>
                            `;
                    ids++;
                    out += `
                            <td
                                id='${ids}'
                                class='home'
                                style='background-color:greenyellow;'>
                                ${matchWeek.games[index][1]}</td>
                            `;
                    ids++;
                } else if (matchWeek.games[index][2] == "A") {
                    out += `
                            <td
                                id='${ids}'
                                class='away'
                                style='background-color:greenyellow;'>
                                ${matchWeek.games[index][0]}</td>
                            <td>@</td>
                            `;
                    ids++;
                    out += `
                            <td
                                id='${ids}'
                                class='home'>
                                ${matchWeek.games[index][1]}</td>
                            `;
                    ids++;
                } else {
                    out += `
                            <td
                                id='${ids}'
                                class='away'
                                onclick='guess(${ids}, ${ids + 1}, ${matchWeek.week}, ${index}, "YA")'
                                ondblclick='wins(${ids}, ${ids + 1}, ${matchWeek.week}, ${index}, "A")'>
                                ${matchWeek.games[index][0]}</td>
                            <td>@</td>
                            `;
                    ids++;
                    out += `
                            <td
                                id='${ids}'
                                class='home'
                                onclick='guess(${ids}, ${ids - 1}, ${matchWeek.week}, ${index}, "YH")'
                                ondblclick='wins(${ids}, ${ids - 1}, ${matchWeek.week}, ${index}, "H")'>
                                ${matchWeek.games[index][1]}</td>
                            `;
                    ids++;
                }
                if (number % 4 == 0) {
                    out += `</tr><tr>`;
                }
                number++;
            }
            out += "</tr>";
            number = 1;
        }
        placeholder.innerHTML = out;
    }).catch(err => { console.log(err); });


//Event to send global array to server when user navigates away
window.addEventListener('beforeunload', function (e) {
    let formData = new FormData();
    formData.append('data', JSON.stringify(highlightArray));
    axios.post('http://localhost:3000/api/schedule/update', formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }).catch(error => { console.log(error); });
});


