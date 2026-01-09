//Function to display the free agents
const fetchAgents = () => {
    axios
        .get('http://localhost:3000/api/offseason/free-agents')
        .then(response => {
            const data = response.data;
            let out = `
                <tr>
                    <td>${data[0]}</td>
                    <td>${data[1]}</td>
                    <td>${data[2]}</td>
                </tr>
            `;
            document.querySelector("#data-output").innerHTML = out;
        })
}