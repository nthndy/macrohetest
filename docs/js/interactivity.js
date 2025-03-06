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
                overlayText.className = 'hover-text-image';
                overlayText.innerText = "Click to inspect";

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
        const isF3Container = container.classList.contains('F3A-container') ||
                            container.classList.contains('F3B-container') ||
                            container.classList.contains('F3C-container');

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

                if (isF2Container || isF3Container) {
                    // Create video preview for F2
                    const preview = document.createElement('video');
                    preview.className = 'hover-preview';
                    // preview.style.maxWidth = '300px';
                    preview.style.maxHeight = '800px';
                    preview.autoplay = true;
                    preview.loop = true;
                    preview.muted = true;
                    preview.playsInline = true;
                    const source = document.createElement('source');
                    source.src = video.querySelector('source').src;
                    source.type = 'video/mp4';
                    preview.appendChild(source);

                    const overlayText = document.createElement('div');
                    overlayText.className = 'hover-text-video';
                    overlayText.innerText = "Click to view fullscreen";

                    previewWrapper.appendChild(preview);
                    previewWrapper.appendChild(overlayText);
                } else {
                    // Original image preview for F1 containers
                    const preview = document.createElement('video');
                    // preview.src = previewImageSrc || img.src;
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
                    overlayText.className = 'hover-text-video';
                    overlayText.innerText = "Click to view fullscreen";

                    // previewWrapper.appendChild(preview);
                    // previewWrapper.appendChild(overlayText);
                    //
                    // const overlayText = document.createElement('div');
                    // overlayText.className = 'hover-text-image';
                    // overlayText.innerText = "Click to view fullscreen";

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
            // Common layout properties
            const layout = {
                ...data.layout,
                responsive: true,
                margin: { l: 10, r: 10, t: 10, b: 10 }
            };
            return Plotly.newPlot(plotId, data.data, layout, {
                responsive: true,
                displayModeBar: false
            });
        })
        .then(() => {
            // Add this condition here
            if (plotId === 'plot-3D') {
                addF3DLabels();
            }

            // Existing resize listener
            window.addEventListener('resize', () => {
                Plotly.Plots.resize(plotDiv);
            });
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
        { id: 'plot-4B', jsonPath: './figures/data/F4B_plot_data.json', container: 'F4B' },

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
                // Modify the layout to stretch the diagram
                if (data.layout) {
                    // Make sure we have a defined width and height
                    data.layout.width = data.layout.width || 450;
                    data.layout.height = data.layout.height || 300;

                    // Adjust aspect ratio if needed
                    // You can make it wider by increasing width or decreasing height
                    data.layout.width = data.layout.width *1.45; // Make 50% wider

                    // Remove any fixed autosize settings if present
                    data.layout.autosize = true;
                }

                return Plotly.newPlot(id, data.data, data.layout);
            })
            .then(() => {
                // After rendering, you can also adjust the container
                const container = sankeyDiv.closest('.sankey-plot');
                if (container) {
                    container.style.flex = 1;
                    container.style.minWidth = 0; // Prevents overflow
                }
            })
            .catch(error => console.error(`❌ Error loading ${sankeyDataFiles[index]}:`, error));
    });
    // Add a resize handler to redraw the plots when the window is resized
    window.addEventListener('resize', function() {
        sankeyIds.forEach(id => {
            const div = document.getElementById(id);
            if (div) {
                Plotly.relayout(id, {
                    autosize: true
                });
            }
        });
    });


}

function addF3DLabels() {
  setTimeout(() => {
    const plotDiv = document.getElementById('plot-3D');
    if (!plotDiv) return;

    // Get the plot container
    const container = plotDiv.closest('.F3D-container') || plotDiv.parentElement;
    container.style.position = 'relative'; // Ensure container has position for absolute positioning

    // Get the dimensions of the plot area to use for positioning
    const plotRect = plotDiv.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Calculate relative positions
    const leftColumnCenter = 0.65 * plotRect.width;  // Center of left column (main plot)
    const middleColumnCenter = 0.9 * plotRect.width; // Center of middle column (proportions)
    const middleleftColumnCenter = 0.8 * plotRect.width; // Center of middle column (proportions)
    const rightColumnCenter = 0.97 * plotRect.width; // Center of right column (origin)

    // Define colors for the keys
    const colors = {
      strain: {
        'WT': '#a6d96a',
        'ΔRD1': '#d02c91'
      },
      growthSpeed: {
        'Fast': '#a6d96a',
        'Normal': '#d1d1ca',
        'Slow': '#d02c91'
      },
      mtbOrigin: {
        'Transfer': '#d02c91',
        'Uptake': '#f1b6da',
        'Intrinsic Growth': '#a6d96a'
      }
    };

    // Create strain legend section - position above strain column
    const strainLegend = document.createElement('div');
    strainLegend.style.position = 'absolute';
    strainLegend.style.left = `${leftColumnCenter}px`;
    strainLegend.style.top = '10px';
    strainLegend.style.transform = 'translateX(-50%)';

    const strainTitle = document.createElement('div');
    strainTitle.innerText = 'Strain';
    strainTitle.style.fontFamily = 'Helvetica, Arial, sans-serif';
    strainTitle.style.fontSize = '16px';
    strainTitle.style.marginBottom = '8px';
    strainTitle.style.textAlign = 'center';
    strainLegend.appendChild(strainTitle);

    // Color boxes for strain
    const strainBoxContainer = document.createElement('div');
    strainBoxContainer.style.display = 'flex';
    strainBoxContainer.style.justifyContent = 'center';
    strainBoxContainer.style.gap = '15px';

    Object.entries(colors.strain).forEach(([label, color]) => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.alignItems = 'center';

      const box = document.createElement('div');
      box.style.width = '12px';
      box.style.height = '12px';
      box.style.backgroundColor = color;
      box.style.marginRight = '5px';

      const text = document.createElement('div');
      text.innerText = label;
      text.style.fontSize = '14px';

      item.appendChild(box);
      item.appendChild(text);
      strainBoxContainer.appendChild(item);
    });

    strainLegend.appendChild(strainBoxContainer);
    container.appendChild(strainLegend);

    // Create Growth Speed legend section - position above middle column
    const speedLegend = document.createElement('div');
    speedLegend.style.position = 'absolute';
    speedLegend.style.left = `${middleleftColumnCenter}px`;
    speedLegend.style.top = '1px';
    speedLegend.style.transform = 'translateX(-50%)';

    const speedTitle = document.createElement('div');
    speedTitle.innerText = 'Growth Speed';
    speedTitle.style.fontFamily = 'Helvetica, Arial, sans-serif';
    speedTitle.style.fontSize = '16px';
    speedTitle.style.marginBottom = '8px';
    speedTitle.style.textAlign = 'center';
    speedLegend.appendChild(speedTitle);

    // Color boxes for growth speed
    const speedBoxContainer = document.createElement('div');
    speedBoxContainer.style.display = 'flex';
    speedBoxContainer.style.flexDirection = 'column';
    speedBoxContainer.style.gap = '5px';

    Object.entries(colors.growthSpeed).forEach(([label, color]) => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.alignItems = 'center';

      const box = document.createElement('div');
      box.style.width = '12px';
      box.style.height = '12px';
      box.style.backgroundColor = color;
      box.style.marginRight = '5px';

      const text = document.createElement('div');
      text.innerText = label;
      text.style.fontSize = '14px';

      item.appendChild(box);
      item.appendChild(text);
      speedBoxContainer.appendChild(item);
    });

    speedLegend.appendChild(speedBoxContainer);
    container.appendChild(speedLegend);

    // Create Mtb Origin legend section - position above right column
    const originLegend = document.createElement('div');
    originLegend.style.position = 'absolute';
    originLegend.style.left = `${rightColumnCenter}px`;
    originLegend.style.top = '1px';
    originLegend.style.transform = 'translateX(-50%)';

    const originTitle = document.createElement('div');
    originTitle.innerText = 'Mtb Origin';
    originTitle.style.fontFamily = 'Helvetica, Arial, sans-serif';
    originTitle.style.fontSize = '16px';
    originTitle.style.marginBottom = '8px';
    originTitle.style.textAlign = 'center';
    originTitle.style.whiteSpace = 'nowrap'; // Add this line to prevent wrapping
    originLegend.appendChild(originTitle);

    // Color boxes for mtb origin
    const originBoxContainer = document.createElement('div');
    originBoxContainer.style.display = 'flex';
    originBoxContainer.style.flexDirection = 'column';
    originBoxContainer.style.gap = '5px';

    Object.entries(colors.mtbOrigin).forEach(([label, color]) => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.alignItems = 'center';

      const box = document.createElement('div');
      box.style.width = '12px';
      box.style.height = '12px';
      box.style.backgroundColor = color;
      box.style.marginRight = '5px';

      const text = document.createElement('div');
      text.innerText = label;
      text.style.fontSize = '14px';
      text.style.whiteSpace = 'nowrap'; // Add this line to prevent wrapping

      item.appendChild(box);
      item.appendChild(text);
      originBoxContainer.appendChild(item);
    });

    originLegend.appendChild(originBoxContainer);
    container.appendChild(originLegend);

    // Create and position the bottom label under the middle column
    const bottomLabel = document.createElement('div');
    bottomLabel.innerText = "Growth Phenotype Proportions";
    bottomLabel.style.position = 'absolute';
    bottomLabel.style.left = `${middleColumnCenter}px`;
    bottomLabel.style.bottom = '10px';
    bottomLabel.style.transform = 'translateX(-50%)';
    bottomLabel.style.fontFamily = 'Helvetica, Arial, sans-serif';
    bottomLabel.style.fontSize = '16px';
    bottomLabel.style.textAlign = 'center';
    bottomLabel.style.whiteSpace = 'nowrap'; // Allow line break in text
    container.appendChild(bottomLabel);

    // Create and position the top title label
    const topLabel = document.createElement('div');
    topLabel.innerHTML = "<b>Distribution of Mtb doubling times<br>separated by Intrinsic versus Extrinsic origin</b>"; // Use innerHTML to handle <br> tags and <b> for bold
    topLabel.style.position = 'absolute';
    topLabel.style.left = '5%';
    topLabel.style.top = '5%';
    topLabel.style.fontFamily = 'Helvetica, Arial, sans-serif';
    topLabel.style.fontSize = '20px';
    topLabel.style.textAlign = 'left'; // Changed to left align since it's at 2%
    topLabel.style.whiteSpace = 'normal'; // Allow wrapping
    topLabel.style.lineHeight = '1.3'; // Add some spacing between lines
    container.appendChild(topLabel);

  }, 50); // Increased wait time slightly to ensure plot is rendered
}
// Improved hover video function with no text label
function setupHoverVideoPlayers() {
  console.log("Initializing hover video players...");

  // Remove any existing popup to avoid duplicates
  const existingPopup = document.getElementById('hover-video-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create a global hover video container
  const hoverPopup = document.createElement('div');
  hoverPopup.id = 'hover-video-popup';
  hoverPopup.className = 'hover-popup';

  // Create video element
  const popupVideo = document.createElement('video');
  popupVideo.id = 'hover-popup-video';
  popupVideo.autoplay = true;
  popupVideo.loop = true;
  popupVideo.muted = true;
  popupVideo.playsInline = true;

  hoverPopup.appendChild(popupVideo);
  document.body.appendChild(hoverPopup);

  // Handle all plots that might have hover data
  const plotIds = ['plot-1H', 'plot-2A', 'plot-2B', 'plot-2C', 'plot-2D',
                  'plot-3A', 'plot-3B', 'plot-3C', 'plot-3D', 'plot-4B'];

  plotIds.forEach(plotId => {
    const plotDiv = document.getElementById(plotId);
    if (!plotDiv) {
      console.log(`Plot ${plotId} not found, skipping video hover setup...`);
      return;
    }

    console.log(`Setting up video hover for ${plotId}`);

    // Check if the plot is a fully initialized Plotly plot
    let usePlotlyEvents = false;
    if (plotDiv._fullLayout && plotDiv.on && typeof plotDiv.on === 'function') {
      usePlotlyEvents = true;

      // Use Plotly's native event system
      plotDiv.on('plotly_hover', function(eventData) {
        if (!eventData || !eventData.points || eventData.points.length === 0) return;
        handleHoverVideo(eventData.points[0], eventData.event);
      });

      plotDiv.on('plotly_unhover', function() {
        hoverPopup.style.display = 'none';
        popupVideo.pause();
      });
    } else {
      // Fallback to DOM events if Plotly events aren't available
      console.log(`Using DOM events for ${plotId} instead of Plotly events`);

      plotDiv.addEventListener('mouseover', function(e) {
        // For DOM events, we'll try to find data in attributes or data properties
        const target = e.target;

        // Try to find a data point closest to where the user is hovering
        if (plotDiv._fullData) {
          // This is a simplification - in a real implementation, we'd need more sophisticated
          // point detection based on mouse coordinates
          const data = plotDiv._fullData[0];
          if (data && data.customdata && data.customdata.length > 0) {
            const simplePoint = {
              customdata: data.customdata[0],
              text: data.text ? data.text[0] : null,
              hovertext: data.hovertext ? data.hovertext[0] : null
            };
            handleHoverVideo(simplePoint, e);
          }
        }
      });

      plotDiv.addEventListener('mouseout', function() {
        hoverPopup.style.display = 'none';
        popupVideo.pause();
      });
    }

    // Always add mousemove to update position, regardless of event system
    plotDiv.addEventListener('mousemove', function(e) {
      if (hoverPopup.style.display === 'block') {
        // Position popup near the cursor
        hoverPopup.style.left = `${e.clientX + 20}px`;
        hoverPopup.style.top = `${e.clientY - 120}px`;
      }
    });
  });

  function handleHoverVideo(point, event) {
    // Try to find video source in the data point
    let videoSrc = null;

    // Check customdata object first
    if (point.customdata) {
      if (typeof point.customdata === 'object') {
        // Check for video URL in various properties
        const possibleProps = ['Video', 'video', 'VideoLink', 'videoLink', 'src', 'source'];
        for (const prop of possibleProps) {
          if (point.customdata[prop] && typeof point.customdata[prop] === 'string') {
            videoSrc = point.customdata[prop];
            console.log(`Found video in customdata.${prop}`);
            break;
          }
        }
      }
      // If customdata is directly a string URL
      else if (typeof point.customdata === 'string') {
        videoSrc = point.customdata;
        console.log('Found video in customdata string');
      }
    }

    // Check text field
    if (!videoSrc && point.text) {
      // Look for Video Link pattern
      const videoLinkMatch = typeof point.text === 'string' &&
                            point.text.match(/Video Link[:\s]+([^<\\s"]+)/i);
      if (videoLinkMatch && videoLinkMatch[1]) {
        videoSrc = videoLinkMatch[1];
        console.log('Found video in text Video Link field');
      }

      // Look for any video URL pattern
      if (!videoSrc) {
        const videoMatch = typeof point.text === 'string' &&
                          point.text.match(/(https?:\/\/[^\s<>"]+\.mp4|\/[^\s<>"]+\.mp4)/i);
        if (videoMatch) {
          videoSrc = videoMatch[0];
          console.log('Found video by URL pattern in text');
        }
      }
    }

    // Also try hovertext
    if (!videoSrc && point.hovertext) {
      const videoMatch = typeof point.hovertext === 'string' &&
                        point.hovertext.match(/(https?:\/\/[^\s<>"]+\.mp4|\/[^\s<>"]+\.mp4)/i);
      if (videoMatch) {
        videoSrc = videoMatch[0];
        console.log('Found video in hovertext');
      }
    }

    if (!videoSrc) {
      console.log(`No video source found for hover point:`, point);
      return;
    }

    console.log(`Found video source: ${videoSrc}`);

    // Set video source
    const source = document.createElement('source');
    source.src = videoSrc;
    source.type = 'video/mp4';

    // Clear any existing sources
    while (popupVideo.firstChild) {
      popupVideo.removeChild(popupVideo.firstChild);
    }

    popupVideo.appendChild(source);

    // Try to load and play the video
    popupVideo.load();
    const playPromise = popupVideo.play();

    if (playPromise !== undefined) {
      playPromise.then(_ => {
        // Video is playing, show the popup
        hoverPopup.style.display = 'block';
        // Position popup next to cursor
        hoverPopup.style.left = `${event.clientX + 20}px`;
        hoverPopup.style.top = `${event.clientY - 120}px`;
      })
      .catch(error => {
        console.log(`Error playing video: ${error}`);
        hoverPopup.style.display = 'none';
      });
    }
  }

  // Hide video when mouse leaves the document
  document.addEventListener('mouseleave', function() {
    hoverPopup.style.display = 'none';
    popupVideo.pause();
  });

  console.log("Hover video players initialization complete");
}

// Add this to your initialization flow
function enhancedInitializeFigures() {
  // Call original initialization
  initializeFigures();

  // Wait for plots to be fully initialized before setting up video hover
  setTimeout(setupHoverVideoPlayers, 2000); // 2 seconds to ensure plots are fully loaded
}

// Replace your document.addEventListener line with this
document.removeEventListener('DOMContentLoaded', initializeFigures);
document.addEventListener('DOMContentLoaded', enhancedInitializeFigures);
