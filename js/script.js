console.log("Let's write JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "Songs/ncs"; // Default folder

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    try {
        let response = await fetch(`${folder}/info.json`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        let data = await response.json();
        
        songs = data.tracks || [];
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
        songs = []; // Reset songs array on error
    }
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/${encodeURI(track)}`;
    if (!pause) {
        currentSong.play().catch(error => console.error("Playback failed:", error));
        document.getElementById("play").src = "img/pause.svg";
    }
    document.querySelector(".songinfo").textContent = track; // Use textContent instead of innerHTML
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
};

async function displayAlbums() {
    try {
        let response = await fetch("albums.json");
        let albums = await response.json();
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        for (let album of albums) {
            try {
                let infoResponse = await fetch(`Songs/${album.folder}/info.json`);
                if (!infoResponse.ok) throw new Error("Album info not found");
                let albumInfo = await infoResponse.json();
                
                cardContainer.innerHTML += `<div data-folder="${album.folder}" class="card">
                    <div class="play">▶</div>
                    <img src="Songs/${album.folder}/cover.jpg" alt="${albumInfo.title} cover">
                    <h2>${albumInfo.title}</h2>
                    <p>${albumInfo.description || ''}</p>
                </div>`;
            } catch (error) {
                console.error(`Error loading album ${album.folder}:`, error);
                cardContainer.innerHTML += `<div class="card error">
                    <h2>⚠️ Album Failed</h2>
                    <p>${album.folder}</p>
                </div>`;
            }
        }

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
    currentSong.volume = 0.5; // Initialize volume
    document.querySelector(".range input").value = 50;
    
    await getSongs(currFolder);
    if (songs.length > 0) {
        playMusic(songs[0], true);
    } else {
        console.warn("No songs found in default folder.");
    }
    displayAlbums();

    // Event Listeners (unchanged but critical)
    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play().catch(error => console.error("Playback failed:", error));
            document.getElementById("play").src = "img/pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("play").src = "img/playnow.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").textContent = 
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = 
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // ... rest of your event listeners
}

main();
