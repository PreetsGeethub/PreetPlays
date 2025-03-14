console.log("Let's write JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "Songs/ncs"; // Default folder

// ... (secondsToMinutesSeconds remains the same)

async function getSongs(folder) {
    try {
        let response = await fetch(`${folder}/info.json`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        let data = await response.json();
        
        songs = data.tracks || []; // Assuming JSON has a 'tracks' array
        let songList = document.getElementById("song-list");
        songList.innerHTML = "";
        
        songs.forEach(song => {
            let listItem = document.createElement("li");
            listItem.textContent = song;
            listItem.addEventListener("click", () => playMusic(song));
            songList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading songs:", error);
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    try {
        // Load albums from a predefined JSON instead of directory listing
        let response = await fetch("albums.json");
        let albums = await response.json();
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        for (let album of albums) {
            try {
                let infoResponse = await fetch(`Songs/${album.folder}/info.json`);
                let albumInfo = await infoResponse.json();
                cardContainer.innerHTML += `<div data-folder="${album.folder}" class="card">
                    <div class="play">▶</div>
                    <img src="Songs/${album.folder}/cover.jpg" alt="cover">
                    <h2>${albumInfo.title}</h2>
                    <p>${albumInfo.description || ''}</p>
                </div>`;
            } catch (error) {
                console.error(`Error loading album ${album.folder}:`, error);
            }
        }

        // Add event listeners to cards
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", async () => {
                currFolder = `Songs/${card.dataset.folder}`;
                await getSongs(currFolder);
                if (songs.length > 0) playMusic(songs[0]);
            });
        });
    } catch (error) {
        console.error("Error loading albums:", error);
    }
}

async function main() {
    await getSongs(currFolder); // Load default folder
    if (songs.length > 0) playMusic(songs[0], true);
    displayAlbums();

    // ... (rest of your event listeners remain the same)
}

main();
