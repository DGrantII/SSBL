//Function to populate table with team links
const fetchTeams = () => {
    axios
        .get('http://localhost:3000/api/teams/')
        .then(response => {
            const data = response.data;
            let out = "";
            let placeholder = document.querySelector("#data-output");

            let index = 0;
            while (index < data.length) {
                if (index < data.length - 3) {
                    out += `
                                <tr>
                                    <td><a href="info.html?name=${data[index].name}">${data[index].name} (${data[index].wins} - ${data[index].losses})</a></td>
                                    <td><a href="info.html?name=${data[index + 1].name}">${data[index + 1].name} (${data[index + 1].wins} - ${data[index + 1].losses})</a></td>
                                    <td><a href="info.html?name=${data[index + 2].name}">${data[index + 2].name} (${data[index + 2].wins} - ${data[index + 2].losses})</a></td>
                                </tr>
                            `
                    index += 3;
                } else if (index < data.length - 2) {
                    out += `
                                <tr>
                                    <td colspan="2"><a href="info.html?name=${data[index].name}">${data[index].name} (${data[index].wins} - ${data[index].losses})</a></td>
                                    <td><a href="info.html?name=${data[index + 1].name}">${data[index + 1].name} (${data[index + 1].wins} - ${data[index + 1].losses})</a></td>
                                </tr>
                            `
                    break;
                } else {
                    out += `<tr><td colspan="3"><a href="info.html?name=${data[index].name}">${data[index].name} (${data[index].wins} - ${data[index].losses})</a></td></tr>`
                    break;
                }
            }
            placeholder.innerHTML = out;
        })
        .catch(err => { console.log(err) });
}