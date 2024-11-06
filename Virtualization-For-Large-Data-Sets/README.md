# Virtualization for Large Datasets

## Overview

This project implements a virtualization solution using vanilla JavaScript to efficiently handle the display of large datasets in a scrollable container. It is designed to improve performance by rendering only the visible items on the screen, making it capable of handling datasets with 100,000+ items without significant lag or memory issues.

## Features

- **Virtualization**: Only visible items are rendered to optimize performance.
- **Dynamic Loading**: Additional rows and columns are loaded as the user scrolls down or to the right.
- **No Third-Party Libraries**: The solution is built using vanilla JavaScript, ensuring a lightweight implementation.
- **Buffer Zones**: A buffer zone is implemented to preload items before they enter the viewport for a smoother scrolling experience.
- **Horizontal and Vertical Scrolling**: Supports both horizontal and vertical scrolling for viewing data.
- **Cache Mechanism**: A caching system is in place to prevent redundant API calls and improve loading times.

## Installation

To run this project locally, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone <url>
   cd Virtualization-For-Large-Data-Sets
   open index.html with live server
