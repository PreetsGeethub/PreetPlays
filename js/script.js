console.log("Let's write JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "Songs/ncs"; // Default folder

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    try {
        const response = await fetch(`${folder}/info.json`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        
        songs = data.tracks || [];
        const songList = document.querySelector(".songList ul");
        
        if (!songList) {
            console.error("Song list element not found");
            return;
        }

        songList.innerHTML = "";
        
        songs.forEach(song => {
            const listItem = document.createElement("li");
            listItem.className = "song-item";
            
            // Clean up filename
            const displayName = song
                .replace(/\.mp3$/, "")
                .replace(/([_-])/g, ' ');

            listItem.innerHTML = `
                <div class="song-info">
                    <span class="song-title">${displayName}</span>
                </div>
                <div class="play-control">
                    <span class="play-text">Play Now</span>
                    <img src="img/play-arrow.svg" alt="Play" class="play-icon">
                </div>
            `;

            listItem.addEventListener("click", () => playMusic(song));
            songList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading songs:", error);
        songs = [];
    }
}
// ... rest of your existing JS code (playMusic, displayAlbums, main, etc) ...
const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/${encodeURIComponent(track)}`;
    if (!pause) {
        currentSong.play()
            .then(() => {
                document.getElementById("play").src = "img/pause.svg";
            })
            .catch(error => console.error("Playback failed:", error));
    }
    document.querySelector(".songinfo").textContent = track;
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
};

async function displayAlbums() {
    try {
        let response = await fetch("albums.json");
        if (!response.ok) throw new Error("Failed to load albums.json");
        let albums = await response.json();
        let cardContainer = document.querySelector(".cardContainer");

        if (!cardContainer) {
            console.error("Card container not found");
            return;
        }

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
                    <span>Play Now</span>
                    <img class="invert" src="img/playnow.svg" alt="">
                </div>`;
            } catch (error) {
                console.error(`Error loading album ${album.folder}:`, error);
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
    // Initialize volume
    currentSong.volume = 0.5;
    document.querySelector(".range input").value = 50;

    // Check for critical elements first
    const playButton = document.getElementById("play");
    if (!playButton) {
        console.error("Play button element not found!");
        return;
    }

    // Load default songs
    await getSongs(currFolder);

    if (songs.length > 0) {
        playMusic(songs[0], true);
    } else {
        console.warn("No songs found in default folder. Check:");
        console.log("- Songs/ncs/info.json exists?");
        console.log("- info.json has valid 'tracks' array?");
        console.log("- Audio files exist in Songs/ncs/ folder?");
    }

    // Load albums
    displayAlbums();

    // Player controls
    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
                .then(() => {
                    playButton.src = "img/pause.svg";
                })
                .catch(error => console.error("Playback failed:", error));
        } else {
            currentSong.pause();
            playButton.src = "img/playnow.svg";
        }
    });

    // Time update handler
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").textContent =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click handler
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Navigation handlers
    document.getElementById("prev").addEventListener("click", () => {
        const decodedTrack = decodeURIComponent(currentSong.src.split("/").pop());
        const index = songs.indexOf(decodedTrack);
        if (index > 0) playMusic(songs[index - 1]);
    });

    document.getElementById("next").addEventListener("click", () => {
        const decodedTrack = decodeURIComponent(currentSong.src.split("/").pop());
        const index = songs.indexOf(decodedTrack);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    // Volume controls
    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    });

    document.querySelector(".volume img").addEventListener("click", e => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            e.target.src = "img/mute.svg";
            document.querySelector(".range input").value = 0;
        } else {
            currentSong.volume = 0.5;
            e.target.src = "img/volume.svg";
            document.querySelector(".range input").value = 50;
        }
    });
}

// Start the app
main();