let audioIsLoaded = false;
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.account-nav__link[href="#order-audio"]')
        ?.addEventListener('click', async (event) => {
            event.preventDefault();
            await loadAudioSection();
        });
});

async function loadAudioSection() {
    if (audioIsLoaded) return;
    showLoadingScreen();
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.id) {
            console.error('User ID not found in localStorage.');
            return;
        }

        const orders = await fetchOrdersByUserId(userData.id);
        const container = document.querySelector('#audio-list');
        let count = 0;
        for (const order of orders) {
            const files = await fetchAudioFiles(order.id);
            files.forEach(fileKey => {
                const filename = fileKey.split('/').pop();
                const audioItem = createAudioItem(order.id, filename);
                container.appendChild(audioItem);
                count++;
            });
        }
        if (count === 0) {
            container.innerHTML = 'У вас пока что нет файлов.';
        } else {
            document.querySelectorAll('.audio-item').forEach(initAudioPlayer);
        }
        audioIsLoaded = true;
    } catch (error) {
        console.error('Ошибка при загрузке аудио:', error);
    } finally {
        hideLoadingScreen();
    }
}

async function fetchOrdersByUserId(userId) {
    const response = await fetch('graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                query GetOrdersByUserId($userId: Int!) {
                    getOrdersByUserId(userId: $userId) {
                        id
                    }
                }
            `,
            variables: { userId }
        })
    });

    const result = await response.json();
    return result.data?.getOrdersByUserId || [];
}

async function fetchAudioFiles(orderId) {
    const response = await fetch(`orders/${orderId}/audio/`);
    return response.ok ? await response.json() : [];
}

function createAudioItem(orderId, filename) {
    const wrapper = document.createElement('div');
    wrapper.className = 'audio-item';
    wrapper.dataset.orderId = orderId;
    wrapper.dataset.filename = filename;

    wrapper.innerHTML = `
        <div class="audio-info">
            <span class="audio-filename">${filename}</span>
        </div>

        <div class="audio-player">
            <audio class="audio-element"></audio>

            <div class="player-controls">
                <button class="play-btn" disabled>
                    <svg class="icon" viewBox="0 0 24 24">
                        <path class="play-icon" d="M8 5v14l11-7z"/>
                    </svg>
                </button>

                <div class="progress-container">
                    <div class="progress-bar"></div>
                </div>

                <div class="time-info">
                    <span class="current-time">0:00</span>
                    <span class="duration">0:00</span>
                </div>
            </div>

            <div class="volume-control">
                <svg class="icon volume-icon" viewBox="0 0 24 24">
                    <path class="volume-path" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
                <label>
                    <input type="range" class="volume-slider" min="0" max="1" step="0.01" value="0.7">
                </label>
            </div>
        </div>
    `;

    return wrapper;
}

function initAudioPlayer(item) {
    const audio = item.querySelector('.audio-element');
    const playBtn = item.querySelector('.play-btn');
    const playIcon = item.querySelector('.play-icon');
    const currentTimeElem = item.querySelector('.current-time');
    const durationElem = item.querySelector('.duration');
    const progressBar = item.querySelector('.progress-bar');
    const volumeSlider = item.querySelector('.volume-slider');
    const volumeIcon = item.querySelector('.volume-icon');
    const volumeIconPath = item.querySelector('.volume-icon path');
    const progressContainer = item.querySelector('.progress-container');

    const orderId = item.dataset.orderId;
    const filename = item.dataset.filename;
    const src = `orders/${orderId}/audio/${filename}`;
    let previousVolume = parseFloat(volumeSlider.value) || 0.7;

    audio.src = src;

    audio.addEventListener('loadedmetadata', () => {
        playBtn.disabled = false;
        durationElem.textContent = formatTime(audio.duration);
    });

    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playIcon.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
        } else {
            audio.pause();
            playIcon.setAttribute('d', 'M8 5v14l11-7z');
        }
    });

    audio.addEventListener('timeupdate', () => {
        currentTimeElem.textContent = formatTime(audio.currentTime);
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progress}%`;
    });

    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value;
        if (audio.volume > 0) {
            previousVolume = audio.volume;
            volumeIconPath.setAttribute('d', 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z');
        } else {
            volumeIconPath.setAttribute('d', 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z');
        }
    });

    volumeIcon.addEventListener('click', () => {
        if (audio.volume > 0) {
            previousVolume = audio.volume;
            audio.volume = 0;
            volumeSlider.value = 0;
            volumeIconPath.setAttribute('d', 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z');
        } else {
            audio.volume = previousVolume;
            volumeSlider.value = previousVolume;
            volumeIconPath.setAttribute('d', 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z');
        }
    });

    progressContainer.addEventListener('click', (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percent = clickX / width;
        audio.currentTime = percent * audio.duration;
    });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}
