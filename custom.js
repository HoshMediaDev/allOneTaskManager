// custom.js

function modifyImage() {
    const imageElement = document.querySelector('.n-avatar img');
    if (imageElement) {
        imageElement.style.filter = 'invert(0)';
        console.log("Image modified with filter 'invert(0)'.");
    } else {
        console.log("No image found to modify.");
    }
}
