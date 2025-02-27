// ===========================================
// 1. Setup Clickable Image Popup (Zoom + Pan)
// ===========================================
function setupImagePopup(imageContainers) {
    imageContainers.forEach(container => {
        const popup = container.querySelector('.image-popup');
        if (!popup) return;

        const closeBtn = popup.querySelector('.close-popup');
        if (!closeBtn) return;

        const img = container.querySelector('img');
        const zoomableImage = popup.querySelector('.zoomable-image');
        if (!img || !zoomableImage) return;

        // Add escape key handler
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.style.display === 'block') {
                popup.style.display = 'none';
                enableHoverPreview();
            }
        });
        // Initialize zoom and pan variables
        let scale = 1;
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        let translateX = 0;
        let translateY = 0;

        img.addEventListener('click', () => {
            popup.style.display = 'block';
            disableHoverPreview();
            // Reset transform on open
            scale = 1;
            translateX = 0;
            translateY = 0;
            zoomableImage.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // Smoother zoom with mouse wheel
        popup.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = zoomableImage.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Zoom speed factor
            const zoomSpeed = 0.05;
            const zoomFactor = 1 + (e.deltaY > 0 ? -zoomSpeed : zoomSpeed);

            const newScale = Math.min(Math.max(1, scale * zoomFactor), 5);
            if (newScale !== scale) {
                scale = newScale;
                zoomableImage.style.transform =
                    `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            }
        });

        // Improved panning
        zoomableImage.addEventListener('mousedown', (e) => {
            e.preventDefault();  // Prevent default dragging behavior
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            zoomableImage.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            translateX += deltaX;
            translateY += deltaY;

            lastX = e.clientX;
            lastY = e.clientY;

            zoomableImage.style.transform =
                `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            zoomableImage.style.cursor = 'grab';
        });

        closeBtn.addEventListener('click', () => {
            popup.style.display = 'none';
            enableHoverPreview();
        });

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none';
                enableHoverPreview();
            }
        });
    });
}

// ===========================================
// 2. Disable/Enable Hover Previews
// ===========================================
function disableHoverPreview() {
    document.querySelectorAll('.hover-preview').forEach(preview => preview.remove());
}

function enableHoverPreview() {
    document.querySelectorAll('.hover-preview').forEach(preview => preview.style.display = 'block');
}

// ===========================================
// 3. Setup Hover Image Preview
// ===========================================
function setupHoverPreview(imageContainers) {
    imageContainers.forEach(container => {
        // console.log("🔍 Hover detected on", container); keep the debug step in for now

        const zoomableImage = container.querySelector('.image-popup .zoomable-image');
        const popup = container.querySelector('.image-popup');
        const img = container.querySelector('img');  // Get the main image element
        const previewImageSrc = img.dataset.previewImage;  // Get low-res source if specified

        if (!zoomableImage || !popup) {
            console.warn("⚠️ No zoomable-image or popup found in", container);
            return;
        }

        let hoverDisabled = false;
        let previewWrapper = null;  // Keep reference to prevent multiple creations

        container.addEventListener('mouseenter', (event) => {
            if (hoverDisabled) return;

            console.log("🖼 Hover preview for", previewImageSrc || zoomableImage.src);
            removeHoverPreview();

            // Create preview wrapper only if it doesn't exist
            if (!previewWrapper) {
                previewWrapper = document.createElement('div');
                previewWrapper.className = 'hover-preview-wrapper';

                const preview = document.createElement('img');
                preview.src = previewImageSrc || zoomableImage.src;  // Use low-res if available
                preview.className = 'hover-preview';
                preview.style.maxWidth = '300px';  // Limit size for better performance
                preview.style.maxHeight = '300px';

                const overlayText = document.createElement('div');
                overlayText.className = 'hover-text';
                overlayText.innerText = "Click to pan and zoom";

                previewWrapper.appendChild(preview);
                previewWrapper.appendChild(overlayText);
            }

            document.body.appendChild(previewWrapper);

            const movePreview = (e) => {
                requestAnimationFrame(() => {
                    previewWrapper.style.left = `${e.clientX + 20}px`;
                    previewWrapper.style.top = `${e.clientY - 20}px`;
                });
            };
            movePreview(event);

            container.addEventListener('mousemove', movePreview);
            container.addEventListener('mouseleave', () => {
                console.log("❌ Removed preview image");
                removeHoverPreview();
                container.removeEventListener('mousemove', movePreview);
            });
        });

        container.addEventListener('click', () => {
            console.log("🛑 Click detected - Disabling hover preview");
            removeHoverPreview();
            hoverDisabled = true;
        });

        const closeBtn = popup.querySelector('.close-popup');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log("🔄 Popup closed - Re-enabling hover preview");
                hoverDisabled = false;
            });
        }
    });
}

function removeHoverPreview() {
    document.querySelectorAll('.hover-preview-wrapper').forEach(el => el.remove());
}

// ===========================================
// 4. Setup Video Hover and Popup
// ===========================================
function setupVideoHoverAndPopup(videoContainers) {
    videoContainers.forEach(container => {
        const popup = container.querySelector('.video-popup');
        const video = popup.querySelector('video');
        const closeBtn = popup.querySelector('.close-popup');
        const img = container.querySelector('img');
        const previewImageSrc = img.dataset.previewImage;
        const isF2Container = container.classList.contains('F2A-container') ||
                            container.classList.contains('F2B-container') ||
                            container.classList.contains('F2C-container');

        let hoverDisabled = false;
        let previewWrapper = null;

        // Add escape key handler
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.style.display === 'block') {
                popup.style.display = 'none';
                enableHoverPreview();
            }
        });

        // Add hover preview functionality
        container.addEventListener('mouseenter', (event) => {
            if (hoverDisabled) return;

            removeHoverPreview();

            if (!previewWrapper) {
                previewWrapper = document.createElement('div');
                previewWrapper.className = 'hover-preview-wrapper';

                if (isF2Container) {
                    // Create video preview for F2
                    const preview = document.createElement('video');
                    preview.className = 'hover-preview';
                    preview.style.maxWidth = '300px';
                    preview.style.maxHeight = '300px';
                    preview.autoplay = true;
                    preview.loop = true;
                    preview.muted = true;
                    preview.playsInline = true;
                    const source = document.createElement('source');
                    source.src = video.querySelector('source').src;
                    source.type = 'video/mp4';
                    preview.appendChild(source);

                    const overlayText = document.createElement('div');
                    overlayText.className = 'hover-text';
                    overlayText.innerText = "Click to view larger";

                    previewWrapper.appendChild(preview);
                    previewWrapper.appendChild(overlayText);
                } else {
                    // Original image preview for F1 containers
                    const preview = document.createElement('img');
                    preview.src = previewImageSrc || img.src;
                    preview.className = 'hover-preview';
                    preview.style.maxWidth = '300px';
                    preview.style.maxHeight = '300px';

                    const overlayText = document.createElement('div');
                    overlayText.className = 'hover-text';
                    overlayText.innerText = "Click to view video";

                    previewWrapper.appendChild(preview);
                    previewWrapper.appendChild(overlayText);
                }
            }

            document.body.appendChild(previewWrapper);

            const movePreview = (e) => {
                requestAnimationFrame(() => {
                    previewWrapper.style.left = `${e.clientX + 20}px`;
                    previewWrapper.style.top = `${e.clientY - 20}px`;
                });
            };
            movePreview(event);

            container.addEventListener('mousemove', movePreview);
            container.addEventListener('mouseleave', () => {
                removeHoverPreview();
                container.removeEventListener('mousemove', movePreview);
            });
        });

        // Existing video popup functionality
        img.addEventListener('click', () => {
            hoverDisabled = true;
            removeHoverPreview();
            popup.style.display = 'block';
            video.play();
        });

        closeBtn.addEventListener('click', () => {
            popup.style.display = 'none';
            video.pause();
            hoverDisabled = false;
        });

        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.style.display = 'none';
                video.pause();
                hoverDisabled = false;
            }
        });
    });
}

// ===========================================
// 5. Load Plotly Data from JSON
// ===========================================
function loadPlotlyFigure(plotId, jsonPath, containerPrefix) {
    const plotDiv = document.getElementById(plotId);
    if (!plotDiv) {
        console.error(`❌ Error: Could not find div for ${plotId}`);
        return;
    }

    fetch(jsonPath)
        .then(response => response.json())
        .then(data => {
            // Let Plotly handle initial render at its natural size
            return Plotly.newPlot(plotDiv, data.data, data.layout);
        })
        .then(() => {
            // After plot is rendered, get its height and update images if needed
            const plotHeight = plotDiv.clientHeight;
            const figureNumber = plotId.charAt(plotId.length - 1);  // Get A, B, or C

            // Use containerPrefix if provided, otherwise extract from plotId
            const prefix = containerPrefix || (plotId.includes('plot-2') ? 'F2' :
                            plotId.includes('plot-3') ? 'F3' : null);

            if (prefix) {
                const imageContainer = document.querySelector(`.${prefix}${figureNumber}-container`);
                if (imageContainer) {
                    // Apply different handling for F2 vs F3
                    if (prefix === 'F2') {
                        // For F2, set explicit height on container
                        imageContainer.style.height = `${plotHeight}px`;

                        // Ensure image fills container while maintaining aspect ratio
                        const img = imageContainer.querySelector('img');
                        if (img) {
                            img.style.height = '100%';
                            img.style.width = 'auto';
                            img.style.objectFit = 'contain';
                        }
                    } else if (prefix === 'F3') {
                        // For F3, set matching height but preserve grid layout
                        imageContainer.style.height = `${plotHeight}px`;

                        // Set the image to fill the container
                        const img = imageContainer.querySelector('img');
                        if (img) {
                            img.style.height = '100%';
                            img.style.width = '100%';
                            img.style.objectFit = 'contain';
                        }
                    }
                }
            }

            // Only setup hover for F1H plots
            if (plotId === 'plot-1H') {
                setupPlotHover(plotId);
            }

            // // If this is a Figure 3 plot, call overall adjustment after all plots load
            // if (plotId.includes('plot-3')) {
            //     // Use setTimeout to ensure plot has fully rendered
            //     setTimeout(adjustFigure3GridLayout, 200);
            // }
        })
        .catch(error => console.error(`❌ Error loading ${jsonPath}:`, error));
}

// ===========================================
// 6. Setup Plotly Hover Interaction
// ===========================================
function setupPlotHover(plotId) {
    const plotDiv = document.getElementById(plotId);
    if (!plotDiv) {
        console.warn(`⚠️ No Plotly div found for ${plotId}`);
        return;
    }

    // Update selector to just look for the image container
    const hoverPopup = document.querySelector('.F1H-container .plot-preview-container');
    const hoverImage = document.getElementById("plot-hover-image");

    if (!hoverPopup || !hoverImage) {
        console.warn("⚠️ Required elements not found:", {
            hoverPopup: !!hoverPopup,
            hoverImage: !!hoverImage
        });
        return;
    }

    plotDiv.on('plotly_hover', function(eventData) {
        if (!eventData || !eventData.points || eventData.points.length === 0) return;

        const point = eventData.points[0];
        const mediaSrc = point.customdata?.image || null;
        if (!mediaSrc) return;

        // console.log("🎥 Media detected:", mediaSrc); keep this debug step in for now
        hoverImage.src = mediaSrc;
        hoverPopup.style.display = 'block';
        hoverPopup.style.position = 'fixed';
        hoverPopup.style.zIndex = "99999";
        hoverPopup.style.left = `${eventData.event.clientX - hoverPopup.offsetWidth - 5}px`;
        hoverPopup.style.top = `${eventData.event.clientY - (hoverPopup.offsetHeight / 2)}px`;

        const movePopup = (e) => {
            hoverPopup.style.left = `${e.clientX - hoverPopup.offsetWidth - 5}px`;
            hoverPopup.style.top = `${e.clientY - (hoverPopup.offsetHeight / 2)}px`;
        };

        plotDiv.addEventListener('mousemove', movePopup);

        plotDiv.on('plotly_unhover', () => {
            hoverPopup.style.display = 'none';
            plotDiv.removeEventListener('mousemove', movePopup);
        });
    });
}

// ===========================================
// 7. Initialize All Components
// ===========================================
function initializeFigures() {
    // Existing code
    setupImagePopup(document.querySelectorAll('.F1B-container, .F1C-container, .F1F-container'));
    setupHoverPreview(document.querySelectorAll('.F1B-container, .F1C-container, .F1F-container'));
    setupVideoHoverAndPopup(document.querySelectorAll('.F1E-container, .F1G-container, .F2A-container, .F2B-container, .F2C-container, .F3A-container, .F3B-container, .F3C-container'));

    // Dynamically load all figures
    const plotFigures = [
        { id: 'plot-1H', jsonPath: './figures/data/F1H_plot_data.json' },
        { id: 'plot-2A', jsonPath: './figures/data/F2A_plot_data.json' },
        { id: 'plot-2B', jsonPath: './figures/data/F2B_plot_data.json' },
        { id: 'plot-2C', jsonPath: './figures/data/F2C_plot_data.json' },
        { id: 'plot-2D', jsonPath: './figures/data/F2D_plot_data.json' },
        // Add Figure 3 plots
        { id: 'plot-3A', jsonPath: './figures/data/F3A_plot_data.json', container: 'F3A' },
        { id: 'plot-3B', jsonPath: './figures/data/F3B_plot_data.json', container: 'F3B' },
        { id: 'plot-3C', jsonPath: './figures/data/F3C_plot_data.json', container: 'F3C' },
        { id: 'plot-3D', jsonPath: './figures/data/F3D_plot_data.json', container: 'F3D' },

    ];

    plotFigures.forEach(fig => {
        loadPlotlyFigure(fig.id, fig.jsonPath, fig.container);
    });

    // Setup Sankey diagrams if they exist
    const sankeyPlots = document.querySelectorAll('#plot-3E, #plot-3F');
    if (sankeyPlots.length > 0) {
        setupSankeyDiagrams();
    }
}

// ===========================================
// 8. Set up the sankey diagrams
// ===========================================
function setupSankeyDiagrams() {
    const sankeyDataFiles = [
        './figures/data/F3E_plot_data.json',
        './figures/data/F3F_plot_data.json'
    ];

    const sankeyIds = ['plot-3E', 'plot-3F'];

    sankeyIds.forEach((id, index) => {
        const sankeyDiv = document.getElementById(id);
        if (!sankeyDiv) return;

        fetch(sankeyDataFiles[index])
            .then(response => response.json())
            .then(data => {
                Plotly.newPlot(id, data.data, data.layout);
            })
            .catch(error => console.error(`❌ Error loading ${sankeyDataFiles[index]}:`, error));
    });
}

// ===========================================
// 10. Wait for DOM to Load
// ===========================================
document.addEventListener('DOMContentLoaded', initializeFigures);
