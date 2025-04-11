function modifyImage() {
    const imageElement = document.querySelector('.n-avatar img');
    
    if (imageElement) {
        imageElement.style.filter = 'invert(1)';
    }
}

modifyImage();
