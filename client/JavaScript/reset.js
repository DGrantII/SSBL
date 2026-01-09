function reset() {
    axios.get('http://localhost:3000/api/offseason/reset')
        .then(response => {
            const result = response.data;
            document.getElementById('message').style.display = 'none';
            document.getElementById('result').innerHTML = result.message;
            document.getElementById('finished').style.display = 'block';
        });
}