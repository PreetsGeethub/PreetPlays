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

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/${encodeURIComponent(track)}`;
    if (!pause) {
        currentSong.play()
            .then(() => {
                document.getElementById("play").src = "./img/pause.svg";
            })
            .catch(error => console.error("Playback failed:", error));
    }
    document.querySelector(".songinfo").textContent = track;
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
};

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
            
            const displayName = song
                .replace(/\.mp3$/, "")
                .replace(/([_-])/g, ' ');

            listItem.innerHTML = `
                <div class="song-info">
                    <img src="./img/music.svg" class="music-icon" alt="Song">
                    ${displayName}
                </div>
                <div class="play-control">
                    <span>Play Now</span>
                    <img src="./img/playnow.svg" alt="Play" class="play-icon invert">
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

async function displayAlbums() {
    try {
        const response = await fetch("albums.json");
        if (!response.ok) throw new Error("Failed to load albums.json");
        const albums = await response.json();
        const cardContainer = document.querySelector(".cardContainer");

        if (!cardContainer) {
            console.error("Card container not found");
            return;
        }

        cardContainer.innerHTML = "";

        for (const album of albums) {
            try {
                const infoResponse = await fetch(`Songs/${album.folder}/info.json`);
                if (!infoResponse.ok) throw new Error("Album info not found");
                const albumInfo = await infoResponse.json();

                cardContainer.innerHTML += `
                    <div data-folder="${album.folder}" class="card">
                        <div class="card-image">
                            <img src="Songs/${album.folder}/cover.jpg" alt="${albumInfo.title} cover">
                            <div class="play-indicator">
                                <svg viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="currentColor" d="M8 5v14l11-7z"/>
                                </svg>
                            </div>
                        </div>
                        <div class="album-info">
                            <h2>${albumInfo.title}</h2>
                            <p>${albumInfo.description || ''}</p>
                        </div>
                    </div>
                `;
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
    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const closeBtn = document.querySelector('.close');
    const sidebar = document.querySelector('.Side');

    if (hamburger && closeBtn && sidebar) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.add('active');
            console.log('Sidebar opened');
        });

        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
            console.log('Sidebar closed');
        });
    } else {
        console.error('Navigation elements missing');
    }

    // Initialize volume
    currentSong.volume = 0.5;
    document.querySelector(".range input").value = 50;

    // Check for critical elements
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
    await displayAlbums();

    // Player controls
    playButton.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
                .then(() => {
                    playButton.src = "./img/pause.svg";
                })
                .catch(error => console.error("Playback failed:", error));
        } else {
            currentSong.pause();
            playButton.src = "./img/playnow.svg";
        }
    });

    // Time update handler
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").textContent =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar interaction
    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = `${percent}%`;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Navigation controls
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
            e.target.src = "./img/mute.svg";
            document.querySelector(".range input").value = 0;
        } else {
            currentSong.volume = 0.5;
            e.target.src = "./img/volume.svg";
            document.querySelector(".range input").value = 50;
        }
    });
}

// Initialize application
main();