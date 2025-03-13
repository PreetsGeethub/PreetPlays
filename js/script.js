console.log("lets write javascript");

let currentSong = new Audio();

let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    console.log(folder);
    // Changed from localhost to relative path:
    let a = await fetch(`./${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `<li>
            <img class="invert" src="img/music.svg" alt="music">
            <div class="songInfo">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Preet</div>
            </div>
            <div class="playNow">
                <span>Play Now</span>
                <img class="invert" src="img/playnow.svg" alt="playnow">
            </div>
        </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".songInfo").firstElementChild.innerHTML)
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    // Use relative path to load the track:
    currentSong.src = `/${currFolder}/` + track;
    console.log(track);
    console.log(currentSong.src);

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    // Update to relative path:
    let a = await fetch(`./Songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    
    // Get anchors only from the response div
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; // Clear existing cards
    
    for (let index = 0; index < anchors.length; index++) {
        const e = anchors[index];
        
        if (e.href.includes("/Songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            try {
                // Update the URL for info.json fetch:
                let a = await fetch(`./Songs/${folder}/info.json`);
                let response = await a.json();
                
                cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/Songs/${folder}/cover.jpg" alt="cover">
                    <h2>${response.title}</h2>
                    <p>${response.description || response.discription || ''}</p>
                </div>`;
            } catch (error) {
                console.error(`Error loading info for folder ${folder}:`, error);
            }
        }
    }
    
    // Add event listeners to the cards
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs");
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {

    // get the list of all the songs from a folder in Songs:
    await getSongs("Songs/ncs");
    playMusic(songs[0], true);
    console.log(songs);

    // display albums on the page
    displayAlbums();

    // Attach event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/playnow.svg";
        }
    });

    // Listen for timeupdate function
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });
    
    // add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".Side").style.left = "0";
    });

    // add an event listener to close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".Side").style.left = "-100%";
    });

    // add event listeners to previous and next
    prev.addEventListener("click", () => {
        console.log("previousCLicked");
        console.log(currentSong);

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        console.log(songs, index);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });
    
    next.addEventListener("click", () => {
        console.log("nextClicked");
        console.log(currentSong);

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // add the event listener to mute the volume
    document.querySelector(".volume>img").addEventListener("click", e => { 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();
