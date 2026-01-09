axios.get('http://localhost:3000/api/playoffs/champions')
    .then(response => {
        const data = response.data;
        if (data.status == true) {
            document.getElementById('champion').src = data.team;
            document.getElementById('player1').innerHTML = data.players[0];
            document.getElementById('player2').innerHTML = data.players[1];
            document.getElementById('player3').innerHTML = data.players[2];
        }
    });