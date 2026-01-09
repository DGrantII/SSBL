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

async function iconRoll() {
    //obtaining logos from server
    const response = await axios.get('http://localhost:3000/api/teams/logos');
    const logos = response.data;

    //creating hidden div and populating it with the logos
    const placeholder = document.getElementById('placeholder');
    let out = "";
    for (let logo of logos) {
        let base64 = arrayBufferToBase64(logo.logo.data.data);
        out += `<img class='teams' id='${logo.name}' src='data:${logo.logo.contentType};base64,${base64}'>`;
    }
    placeholder.innerHTML = out;

    //Icon roll variables
    const items = [];
    let count = 0;
    let location1 = (-288 * 0.8);
    let location2 = (-288 * 0.8);
    let iconRoll1 = {
        canvas: document.getElementById('teamRoll1'),
        start: function () {
            this.canvas.width = window.innerWidth;
            this.canvas.height = (250 * 0.8);
            this.context = this.canvas.getContext("2d");
            this.interval = setInterval(updateLogos, 40);
        },
        clear: function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    let iconRoll2 = {
        canvas: document.getElementById('teamRoll2'),
        start: function () {
            this.canvas.width = window.innerWidth;
            this.canvas.height = (250 * 0.8);
            this.context = this.canvas.getContext("2d");
            this.interval = setInterval(updateLogos, 40);
        },
        clear: function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    //Shuffling the logos
    for (let i = logos.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let k = logos[i];
        logos[i] = logos[j];
        logos[j] = k;
    }

    //Loop to initialize each logo
    for (let logo of logos) {
        if (count <= 13) {
            items[count] = new Component((logo.width * 0.8), (200 * 0.8), location1, 10, logo.name);
            count++;
            location1 += (50 * 0.8) + logo.width;
        } else {
            items[count] = new Component2((logo.width * 0.8), (200 * 0.8), location2, 10, logo.name);
            count++;
            location2 += (50 * 0.8) + logo.width;
        }
    }

    //Starting the animation
    iconRoll1.start();
    iconRoll2.start();

    function Component(width, height, x, y, id) {
        const img = document.getElementById(id);
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.update = function () {
            const ctx = iconRoll1.context;
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        }
    }

    function Component2(width, height, x, y, id) {
        const img = document.getElementById(id);
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.update = function () {
            const ctx = iconRoll2.context;
            ctx.drawImage(img, this.x, this.y, this.width, this.height);
        }
    }

    function updateLogos() {
        iconRoll1.clear();
        iconRoll2.clear();

        for (let i = 0; i < items.length; i++) {
            if (i <= 13) {
                items[i].x += 1;
                if (items[i].x > location1) {
                    items[i].x = (-288 * 0.8);
                }
            } else {
                items[i].x -= 1;
                if (items[i].x < (-288 * 0.8)) {
                    items[i].x = location2;
                }
            }
        }

        for (let i = 0; i < items.length; i++) {
            items[i].update();
        }
    }
}
iconRoll();