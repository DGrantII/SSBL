axios.get('http://localhost:3000/api/playoffs/bracket')
    .then(response => {
        if (response.data[0] != undefined) {
            const data = response.data;
            for (let stuff of data) {
                if (stuff.type == 'round1') {
                    for (let team of stuff.data) {
                        document.getElementById(team.seed).src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                    }
                }
                if (stuff.type == 'mvps') {
                    let index = 1;
                    let myString = 'mvp';
                    for (let mvp of stuff.data) {
                        document.getElementById(myString + index).innerHTML = mvp;
                        index++;
                    }
                }
                if (stuff.type == 'round2') {
                    for (let team of stuff.data) {
                        let buffer = arrayBufferToBase64(team.logo.data);
                        switch (team.seed) {
                            case 1:
                            case 16:
                                document.getElementById('R1-G1').src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                            case 8:
                            case 9:
                                document.getElementById('R1-G2').src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                            case 5:
                            case 12:
                                document.getElementById('R1-G3').src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                            case 4:
                            case 13:
                                document.getElementById('R1-G4').src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                            case 2:
                            case 15:
                                document.getElementById('R1-G5').src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                            case 7:
                            case 10:
                                document.getElementById('R1-G6').src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                            case 6:
                            case 11:
                                document.getElementById('R1-G7').src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                            case 3:
                            case 14:
                                document.getElementById('R1-G8').src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                        }
                    }
                }
                if (stuff.type == 'semis') {
                    for (let team of stuff.data) {
                        let buffer = arrayBufferToBase64(team.logo.data);
                        switch (team.seed) {
                            case 1:
                            case 16:
                            case 8:
                            case 9:
                                document.getElementById("R2-G1").src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                            case 5:
                            case 12:
                            case 4:
                            case 13:
                                document.getElementById("R2-G2").src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                            case 2:
                            case 15:
                            case 7:
                            case 10:
                                document.getElementById("R2-G3").src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                            case 6:
                            case 11:
                            case 3:
                            case 14:
                                document.getElementById("R2-G4").src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                        }
                    }
                }
                if (stuff.type == 'finals') {
                    for (let team of stuff.data) {
                        let buffer = arrayBufferToBase64(team.logo.data);
                        switch (team.seed) {
                            case 1:
                            case 16:
                            case 8:
                            case 9:
                            case 5:
                            case 12:
                            case 4:
                            case 13:
                                document.getElementById("Semis-G1").src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                            case 2:
                            case 15:
                            case 7:
                            case 10:
                            case 6:
                            case 11:
                            case 3:
                            case 14:
                                document.getElementById("Semis-G2").src = `data:${team.logo.contentType};base64,${team.logo.data}`;
                                break;
                        }
                    }
                }
                if (stuff.type == 'champions') {
                    for (let team of stuff.data) {
                        let element = document.getElementById('champions');
                        switch (team.seed) {
                            case 1:
                            case 16:
                            case 8:
                            case 9:
                            case 5:
                            case 12:
                            case 4:
                            case 13:
                                element.className = 'trophyLeft';
                                break;
                            case 2:
                            case 15:
                            case 7:
                            case 10:
                            case 6:
                            case 11:
                            case 3:
                            case 14:
                                element.className = 'trophyRight';
                                break;
                        }
                    }
                }
                if (stuff.type == 'mvpWinners') {
                    let mvp1 = document.getElementById('mvp1').innerHTML;
                    let mvp2 = document.getElementById('mvp2').innerHTML;
                    for (let mvp of stuff.data) {
                        if (mvp == mvp1) {
                            document.getElementById('mvpChampions').className = 'trophyLeft';
                        } else if (stuff.data[0] == mvp2) {
                            document.getElementById('mvpChampions').className = 'trophyRight';
                        }
                    }
                }
            }

        }
    });

async function progress() {
    const body = document.getElementById('body');
    body.style.cursor = 'progress';
    await new Promise(resolve => setTimeout(resolve, 0));
    await PDFtest();
    body.style.cursor = 'default';
}

async function PDFtest() {
    const doc = new jspdf.jsPDF({
        orientation: 'l',
        unit: 'px',
        hotfixes: ['px_scaling']
    });

    const ratio = 1.1336;

    let images = document.querySelectorAll('div.thirdWrapper img');
    for (image of images) {
        let coords = image.getBoundingClientRect();
        doc.addImage(image, 'PNG', coords.left / ratio, coords.top / ratio, image.width / ratio, image.height / ratio, image.id, 'MEDIUM', 0);
    }

    let textArry = document.querySelectorAll('div.textWrapper p, div.mvpWrapper p');
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    for (text of textArry) {
        let coords = text.getBoundingClientRect();
        if (text.innerHTML == 'V.S') {
            doc.text(text.innerHTML, (coords.left / ratio) + 5, (coords.top / ratio) + 10);
        } else {
            doc.text(text.innerHTML, coords.left / ratio, (coords.top / ratio) + 10);
        }

    }
    const pdf = doc.output('blob');

    const data = new FormData();
    data.append('file', pdf);

    axios.post('http://localhost:3000/api/playoffs/upload', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(response => {
        window.alert(response.data.message);
    }).catch(err => {
        window.alert(err.message);
    })
}