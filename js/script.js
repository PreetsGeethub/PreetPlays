async function getSongs(folder) {
    try {
        let response = await fetch(`${folder}/info.json`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        let data = await response.json();
        
        songs = data.tracks || [];
        // Changed selector to match your HTML structure
        let songList = document.getElementById("song-list");
        
        if (!songList) {
            console.error("Could not find #song-list element");
            return;
        }

        songList.innerHTML = "";
        
        songs.forEach(song => {
            let listItem = document.createElement("li");
            listItem.textContent = song;
            listItem.addEventListener("click", () => playMusic(song));
            songList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error loading songs:", error);
        songs = [];
    }
}
