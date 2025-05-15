function showLoadingScreen() {
    document.querySelector('#loading-screen').style.visibility = 'visible';
    document.querySelector('#loading-screen').style.opacity = '1';
}

function hideLoadingScreen() {
    document.querySelector('#loading-screen').style.opacity = '0';
    document.querySelector('#loading-screen').style.visibility = 'hidden';
}