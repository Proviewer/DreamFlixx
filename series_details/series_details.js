function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function switchEmbed(embedUrl) {
    console.log("Switching embed to:", embedUrl);
    const iframe = document.getElementById('seriesIframe');
    iframe.src = embedUrl;
}

document.addEventListener("DOMContentLoaded", function() {
    const seriesId = getParameterByName('id');
    const apiKey = '68e094699525b18a70bab2f86b1fa706';
    const seriesDetailsUrl = `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}`;
    const castUrl = `https://api.themoviedb.org/3/tv/${seriesId}/credits?api_key=${apiKey}`;
    const videosUrl = `https://api.themoviedb.org/3/tv/${seriesId}/videos?api_key=${apiKey}`;

    function fetchCastDetails() {
        fetch(castUrl)
            .then(response => response.json())
            .then(data => {
                const castList = document.getElementById('castList');
                data.cast.slice(0, 5).forEach(actor => {
                    const listItem = document.createElement('div');
                    listItem.style.width = 'fit-content';
                    listItem.style.display = 'flex';
                    listItem.style.flexDirection = 'column';
                    listItem.style.paddingRight = '20px';
                    listItem.style.fontFamily = 'Poppins';
                    listItem.style.fontSize = '1vw';

                    const actorName = document.createElement('span');
                    const actorImage = document.createElement('img');
                    actorName.textContent = actor.name;
                    actorImage.src = `https://image.tmdb.org/t/p/w185${actor.profile_path}`;
                    actorImage.alt = actor.name;
                    actorImage.style.borderRadius = "1.2rem";
                    listItem.appendChild(actorImage);
                    listItem.appendChild(actorName);
                    castList.appendChild(listItem);
                });
            })
            .catch(error => console.error('Error fetching cast details:', error));
    }

    function fetchSeasonsAndEpisodes() {
        fetch(seriesDetailsUrl)
            .then(response => response.json())
            .then(data => {
                const seasonSelect = document.getElementById('Sno');
                const episodeSelect = document.getElementById('epNo');

                data.seasons.filter(season => season.season_number !== 0).forEach(season => {
                    const option = document.createElement('option');
                    option.value = season.season_number;
                    option.textContent = `Season ${season.season_number}`;
                    seasonSelect.appendChild(option);
                });

                // Trigger change event to populate episodes for the first season
                seasonSelect.dispatchEvent(new Event('change'));
            })
            .catch(error => console.error('Error fetching seasons and episodes:', error));
    }

    fetch(seriesDetailsUrl)
        .then(response => response.json())
        .then(data => {
            const poster = document.getElementById('poster');
            const title = document.getElementById('title');
            const description = document.getElementById('description');

            poster.src = `https://image.tmdb.org/t/p/w780${data.backdrop_path}`;
            title.textContent = data.name;
            description.textContent = data.overview;

            fetchCastDetails();
            fetchSeasonsAndEpisodes();
        })
        .catch(error => console.error('Error fetching series details:', error));

    const seasonSelect = document.getElementById('Sno');
    const episodeSelect = document.getElementById('epNo');

    seasonSelect.addEventListener('change', function() {
        const seasonNumber = this.value;
        episodeSelect.innerHTML = '';
        fetchEpisodesForSeason(seasonNumber);
    });

    function fetchEpisodesForSeason(seasonNumber) {
        const episodesUrl = `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${apiKey}`;
        fetch(episodesUrl)
            .then(response => response.json())
            .then(data => {
                data.episodes.forEach(episode => {
                    const option = document.createElement('option');
                    option.value = episode.episode_number;
                    option.textContent = `Episode ${episode.episode_number}`;
                    episodeSelect.appendChild(option);
                });

                episodeSelect.dispatchEvent(new Event('change'));
            })
            .catch(error => console.error('Error fetching episodes:', error));
    }

    episodeSelect.addEventListener('change', function() {
        const seasonNumber = seasonSelect.value;
        const episodeNumber = this.value;

        const server1Url = `https://embed.smashystream.com/playere.php?tmdb=${seriesId}&season=${seasonNumber}&episode=${episodeNumber}`;
        const server2Url = `https://multiembed.mov/directstream.php?video_id=${seriesId}&tmdb=1&s=${seasonNumber}&e=${episodeNumber}`;
        const server3Url = `https://vidsrc.xyz/embed/tv?tmdb=${seriesId}&season=${seasonNumber}&episode=${episodeNumber}`;

        const currentEmbedUrl = document.getElementById('seriesIframe').src;

        document.getElementById('Server1Btn').setAttribute('onclick', `switchEmbed('${server1Url}')`);
        document.getElementById('Server2Btn').setAttribute('onclick', `switchEmbed('${server2Url}')`);
        document.getElementById('Server3Btn').setAttribute('onclick', `switchEmbed('${server3Url}')`);

        let embedUrl;
        if (currentEmbedUrl.includes('embed.smashystream.com')) {
            embedUrl = server1Url;
        } else if (currentEmbedUrl.includes('multiembed.mov')) {
            embedUrl = server2Url;
        } else {
            embedUrl = server3Url;
        }

        switchEmbed(embedUrl);
    });

    function fetchAndEmbedTrailer() {
        fetch(videosUrl)
            .then(response => response.json())
            .then(data => {
                const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
                if (trailer) {
                    const trailerKey = trailer.key;
                    switchEmbed(`https://www.youtube.com/embed/${trailerKey}`);
                } else {
                    console.log("Trailer not found");
                }
            })
            .catch(error => console.error('Error fetching trailer:', error));
    }

    const trailer = document.getElementById('Trailerbtn');
    trailer.addEventListener('click', fetchAndEmbedTrailer);

    let sidebar = document.querySelector(".sidebar");
    let closeBtn = document.querySelector("#btn");
    let searchBtn = document.querySelector(".bx-search");

    closeBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    searchBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    function menuBtnChange() {
        if (sidebar.classList.contains("open")) {
            closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
        } else {
            closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
        }
    }

    function searchSeries() {
        const query = document.getElementById('searchInput').value;
        if (query.length < 3) {
            alert("Please enter at least 3 characters for search.");
            return;
        }
        const url = `../results/results.html?query=${query}`;
        window.location.href = url;
    }
});
