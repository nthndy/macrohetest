// 1. Setup Clickable Image Popup (Zoom + Pan)
// 1. Setup Clickable Image Popup (Zoom + Pan)
function setupImagePopup(imageContainers) {
    imageContainers.forEach(container => {
        const popup = container.querySelector('.image-popup');
        if (!popup) return; // Skip if popup doesn't exist

        const closeBtn = popup.querySelector('.close-popup');
        if (!closeBtn) return; // Skip if close button is missing

        const img = container.querySelector('img');
        if (!img) return; // Skip if no image exists

        // Open popup on image click (disable hover preview)
        img.addEventListener('click', () => {
            popup.style.display = 'block';
            disableHoverPreview(); // Prevent hover preview from appearing
        });

        // Close popup on close button (re-enable hover preview)
        closeBtn.addEventListener('click', () => {
            popup.style.display = 'none';
            enableHoverPreview(); // Restore hover preview functionality
        });

        // Close popup when clicking outside the content
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none';
                enableHoverPreview(); // Restore hover preview
            }
        });
    });
}

// 2. Disable Hover Preview When Zoom Mode is Active
function disableHoverPreview() {
    document.querySelectorAll('.hover-preview').forEach(preview => preview.remove());
}

// 3. Re-enable Hover Preview When Zoom Mode is Closed
function enableHoverPreview() {
    document.querySelectorAll('.hover-preview').forEach(preview => preview.style.display = 'block');
}


// 4. Setup Hover Image Preview
function setupHoverPreview(imageContainers) {
    imageContainers.forEach(container => {
        console.log("🔍 Hover detected on", container);

        const zoomableImage = container.querySelector('.image-popup .zoomable-image');
        const popup = container.querySelector('.image-popup');
        if (!zoomableImage || !popup) {
            console.warn("⚠️ No zoomable-image or popup found in", container);
            return;
        }

        let hoverDisabled = false;  // 🔹 Track if hover should be disabled

        container.addEventListener('mouseenter', (event) => {
            if (hoverDisabled) return; // 🔹 If disabled, stop hover preview

            console.log("🖼 Hover preview for", zoomableImage.src);
            removeHoverPreview();

            // Create preview wrapper
            const previewWrapper = document.createElement('div');
            previewWrapper.className = 'hover-preview-wrapper';

            // Create preview image
            const preview = document.createElement('img');
            preview.src = zoomableImage.src;
            preview.className = 'hover-preview';

            // Create text overlay
            const overlayText = document.createElement('div');
            overlayText.className = 'hover-text';
            overlayText.innerText = "Click to pan and zoom";

            // Append elements
            previewWrapper.appendChild(preview);
            previewWrapper.appendChild(overlayText);
            document.body.appendChild(previewWrapper);

            // Function to move preview with cursor
            const movePreview = (e) => {
                previewWrapper.style.left = `${e.clientX + 20}px`;
                previewWrapper.style.top = `${e.clientY + 20}px`;
            };
            movePreview(event);

            container.addEventListener('mousemove', movePreview);
            container.addEventListener('mouseleave', () => {
                console.log("❌ Removed preview image");
                removeHoverPreview();
                container.removeEventListener('mousemove', movePreview);
            });
        });

        // 🔹 Remove hover preview AND disable it when clicked
        container.addEventListener('click', () => {
            console.log("🛑 Click detected - Disabling hover preview");
            removeHoverPreview();
            hoverDisabled = true;
        });

        // 🔹 Re-enable hover when zoom popup is closed
        const closeBtn = popup.querySelector('.close-popup');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log("🔄 Popup closed - Re-enabling hover preview");
                hoverDisabled = false;
            });
        }
    });
}

// Function to remove hover preview completely
function removeHoverPreview() {
    document.querySelectorAll('.hover-preview-wrapper').forEach(el => el.remove());
}







// 5. Setup Video Hover and Popup
function setupVideoHoverAndPopup(videoContainers) {
    videoContainers.forEach(container => {
        const popup = container.querySelector('.video-popup');
        const video = popup.querySelector('video');
        const closeBtn = popup.querySelector('.close-popup');
        const videoSrc = video.querySelector('source').src;

        // Hover video preview
        container.addEventListener('mouseenter', (event) => {
            const preview = document.createElement('video');
            preview.src = videoSrc;
            preview.muted = true;
            preview.autoplay = true;
            preview.loop = true;
            preview.className = 'video-hover-preview';
            document.body.appendChild(preview);

            // Position preview near the cursor
            const movePreview = (e) => {
                preview.style.left = `${e.clientX + 15}px`;
                preview.style.top = `${e.clientY + 15}px`;
            };
            movePreview(event);

            container.addEventListener('mousemove', movePreview);
            container.addEventListener('mouseleave', () => {
                preview.remove();
                container.removeEventListener('mousemove', movePreview);
            });
        });

        // Click to open fullscreen video popup
        container.querySelector('img').addEventListener('click', () => {
            popup.style.display = 'block';
            video.play();
        });

        // Close popup
        closeBtn.addEventListener('click', () => {
            popup.style.display = 'none';
            video.pause();
        });

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none';
                video.pause();
            }
        });
    });
}

// 6. Setup Plotly Plot Hover
function setupPlotHover(plotId) {
    const plotDiv = document.getElementById(plotId);
    if (!plotDiv) return;

    plotDiv.on('plotly_hover', function(eventData) {
        const point = eventData.points[0];
        const hoverPopup = document.createElement('div');
        hoverPopup.className = 'plot-hover-popup';
        hoverPopup.innerHTML = `
            <img src="${point.customdata.image}" alt="Data Point Image" />
        `;
        document.body.appendChild(hoverPopup);

        hoverPopup.style.left = `${eventData.event.clientX + 15}px`;
        hoverPopup.style.top = `${eventData.event.clientY + 15}px`;

        plotDiv.on('plotly_unhover', () => hoverPopup.remove());
    });
}

// 7. Initialize Figure 1
function initializeFigure1() {
    // Setup clickable image popups
    setupImagePopup(document.querySelectorAll('.F1B-container, .F1C-container, .F1F-container'));

    // Setup hover image previews
    setupHoverPreview(document.querySelectorAll('.F1B-container, .F1C-container, .F1F-container'));

    // Setup video hover and popup
    setupVideoHoverAndPopup(document.querySelectorAll('.F1E-container, .F1G-container'));

    // Setup interactive Plotly hover
    setupPlotHover('plot-1H');
}

// Wait for DOM to Load
document.addEventListener('DOMContentLoaded', initializeFigure1);
