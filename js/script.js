console.log("Let's write JavaScript");

let currentSong = new Audio();
let songs = [];
let currFolder = "Songs/ncs"; // Default folder

// ... (keep secondsToMinutesSeconds and playMusic functions unchanged)

async function getSongs(folder) {
    // ... (keep existing getSongs implementation unchanged)
}

async function displayAlbums() {
    try {
        const response = await fetch("albums.json");
        if (!response.ok) throw new Error("Failed to load albums.json");
        const albums = await response.json();
        const cardContainer = document.querySelector(".cardContainer");

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

        // ... (rest of displayAlbums unchanged)
    } catch (error) {
        console.error("Error loading albums:", error);
    }
}

async function main() {
    // Hamburger functionality
    const hamburger = document.querySelector('.hamburger');
    const closeBtn = document.querySelector('.close');
    const sidebar = document.querySelector('.Side');

    const toggleSidebar = () => {
        sidebar.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    };

    if (hamburger && closeBtn && sidebar) {
        hamburger.addEventListener('click', toggleSidebar);
        closeBtn.addEventListener('click', toggleSidebar);
    }

    // ... (rest of main function unchanged)
}

// Initialize application
main();