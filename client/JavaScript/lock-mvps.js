function lockMVP() {
    axios.get('http://localhost:3000/api/offseason/names')
        .then(response => {
            const result = response.data;
            if (result.status == 'ready') {
                document.getElementById('message').style.display = 'none';
                document.getElementById('form').style.display = 'block';
                const placeholder = document.querySelector('#players');
                let out = "";
                for (let player of result.data) {
                    out += `<option value="${player}" />`;
                }
                placeholder.innerHTML = out;

                //portion to enable tab autocomlete
                let optionInput = document.getElementsByClassName('mvps');
                for (option of optionInput) {
                    option.addEventListener('keydown', function (event) {
                        if (event.key == "Tab") {
                            const input = this.value.toLowerCase();
                            const datalist = document.getElementById('players');
                            const matchElement = Array.from(datalist.options).find(option => option.value.toLowerCase().includes(input));
                            if (matchElement) {
                                this.value = matchElement.value;
                            }
                        }
                    });
                }

            } else if (result.status == 'complete') {
                document.getElementById('message').style.display = 'none';
                document.getElementById('finished').style.display = 'block';
            }
        });
}

function sendData(form) {
    let formData = new FormData(form);

    axios.post('http://localhost:3000/api/offseason/lock-mvps', formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }).then(response => {
        const result = response.data;
        //variable arrays mvps, injured, and replacement are in the form: ['name', 'name', 'name']
        if (result.status == 'success') {
            document.getElementById('result').innerHTML =
                `<p>${result.mvps[0]}, ${result.mvps[1]}, and ` +
                `${result.mvps[2]} are secure and can not be traded</p>` +
                `<p>${result.injured[0]} was injured and replaced by ${result.replacement[0]}</p>` +
                `<p>${result.injured[1]} was injured and replaced by ${result.replacement[1]}</p>` +
                `<p>${result.injured[2]} was injured and replaced by ${result.replacement[2]}</p>`;
            document.getElementById('inputForm').style.display = 'none';
        } else {
            document.getElementById('result').innerHTML = `<p>${result.message}</p>`;
        }
        document.getElementById('prompt').style.display = 'none';
        document.getElementById('result').style.display = 'block';
    })
}

document.getElementById('inputForm').addEventListener('submit', function (e) {
    e.preventDefault();
    sendData(e.target);
    this.reset();
})