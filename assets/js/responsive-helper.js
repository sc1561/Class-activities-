/**
 * نظام التصميم المتجاوب المساعد
 * Responsive Design Helper System
 */

class ResponsiveHelper {
    constructor() {
        this.breakpoints = {
            mobile: 576,
            tablet: 768,
            desktop: 992,
            large: 1200
        };
        
        this.currentDevice = this.detectDevice();
        this.orientation = this.getOrientation();
        
        this.init();
    }
    
    init() {
        // Listen for resize events
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Initialize responsive features
        this.setupResponsiveModals();
        this.setupResponsiveTables();
        this.setupResponsiveImages();
        this.setupTouchEnhancements();
    }
    
    detectDevice() {
        const width = window.innerWidth;
        
        if (width < this.breakpoints.mobile) return 'small-mobile';
        if (width < this.breakpoints.tablet) return 'mobile';
        if (width < this.breakpoints.desktop) return 'tablet';
        if (width < this.breakpoints.large) return 'desktop';
        return 'large-desktop';
    }
    
    getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }
    
    isMobile() {
        return ['small-mobile', 'mobile'].includes(this.currentDevice);
    }
    
    isTablet() {
        return this.currentDevice === 'tablet';
    }
    
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    handleResize() {
        const newDevice = this.detectDevice();
        const newOrientation = this.getOrientation();
        
        if (newDevice !== this.currentDevice) {
            this.currentDevice = newDevice;
            this.onDeviceChange(newDevice);
        }
        
        if (newOrientation !== this.orientation) {
            this.orientation = newOrientation;
            this.onOrientationChange(newOrientation);
        }
        
        this.adjustModalSizes();
        this.adjustTableLayout();
    }
    
    handleOrientationChange() {
        this.orientation = this.getOrientation();
        this.onOrientationChange(this.orientation);
        this.adjustModalSizes();
    }
    
    onDeviceChange(device) {
        document.body.className = document.body.className.replace(/device-\w+/g, '');
        document.body.classList.add(`device-${device}`);
        
        // Emit custom event
        window.dispatchEvent(new CustomEvent('devicechange', {
            detail: { device, helper: this }
        }));
    }
    
    onOrientationChange(orientation) {
        document.body.className = document.body.className.replace(/orientation-\w+/g, '');
        document.body.classList.add(`orientation-${orientation}`);
        
        // Emit custom event
        window.dispatchEvent(new CustomEvent('orientationchange', {
            detail: { orientation, helper: this }
        }));
    }
    
    setupResponsiveModals() {
        // Make modals responsive
        const modals = document.querySelectorAll('.modal, .welcome-modal, .celebration-modal');
        
        modals.forEach(modal => {
            const content = modal.querySelector('.modal-content, .welcome-modal-content, .modal-content-responsive');
            if (content) {
                this.makeModalResponsive(content);
            }
        });
    }
    
    makeModalResponsive(modalContent) {
        // Adjust modal content based on screen size
        const adjustModal = () => {
            if (this.isMobile()) {
                modalContent.style.width = '95%';
                modalContent.style.maxHeight = '90vh';
                modalContent.style.overflow = 'auto';
                modalContent.style.margin = '1rem';
            } else if (this.isTablet()) {
                modalContent.style.width = '80%';
                modalContent.style.maxHeight = '85vh';
                modalContent.style.margin = '2rem';
            } else {
                modalContent.style.width = '';
                modalContent.style.maxHeight = '';
                modalContent.style.margin = '';
            }
        };
        
        adjustModal();
        window.addEventListener('resize', this.debounce(adjustModal, 250));
    }
    
    setupResponsiveTables() {
        const tables = document.querySelectorAll('table:not(.responsive-handled)');
        
        tables.forEach(table => {
            table.classList.add('responsive-handled');
            this.makeTableResponsive(table);
        });
    }
    
    makeTableResponsive(table) {
        if (this.isMobile()) {
            // Convert table to card layout on mobile
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive-wrapper';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
            
            table.style.fontSize = '0.85rem';
            table.style.width = '100%';
        }
    }
    
    setupResponsiveImages() {
        const images = document.querySelectorAll('img:not(.responsive-handled)');
        
        images.forEach(img => {
            img.classList.add('responsive-handled');
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        });
    }
    
    setupTouchEnhancements() {
        if (this.isTouchDevice()) {
            document.body.classList.add('touch-device');
            
            // Add touch-friendly classes
            const buttons = document.querySelectorAll('button, .btn, .cosmic-btn, .eval-btn, .control-btn');
            buttons.forEach(btn => {
                btn.style.minHeight = '44px';
                btn.style.minWidth = '44px';
            });
            
            // Remove hover effects on touch devices
            const hoverElements = document.querySelectorAll('.hover-effect');
            hoverElements.forEach(element => {
                element.classList.remove('hover-effect');
            });
        }
    }
    
    adjustModalSizes() {
        const modals = document.querySelectorAll('.modal-content, .welcome-modal-content');
        
        modals.forEach(modal => {
            if (this.isMobile()) {
                modal.style.transform = 'none';
                modal.style.position = 'relative';
                modal.style.top = 'auto';
                modal.style.left = 'auto';
            }
        });
    }
    
    adjustTableLayout() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            if (this.isMobile()) {
                table.style.fontSize = '0.8rem';
                
                // Hide less important columns on mobile
                const cells = table.querySelectorAll('th:nth-child(n+4), td:nth-child(n+4)');
                cells.forEach(cell => {
                    cell.style.display = 'none';
                });
            } else {
                table.style.fontSize = '';
                const cells = table.querySelectorAll('th, td');
                cells.forEach(cell => {
                    cell.style.display = '';
                });
            }
        });
    }
    
    // Utility function to create responsive grid
    createResponsiveGrid(container, items, options = {}) {
        const defaults = {
            mobile: 1,
            tablet: 2,
            desktop: 3,
            large: 4
        };
        
        const settings = { ...defaults, ...options };
        
        container.style.display = 'grid';
        container.style.gap = '1rem';
        
        const updateGrid = () => {
            let cols = settings.large;
            
            if (this.currentDevice === 'small-mobile' || this.currentDevice === 'mobile') {
                cols = settings.mobile;
            } else if (this.currentDevice === 'tablet') {
                cols = settings.tablet;
            } else if (this.currentDevice === 'desktop') {
                cols = settings.desktop;
            }
            
            container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        };
        
        updateGrid();
        window.addEventListener('resize', this.debounce(updateGrid, 250));
    }
    
    // Utility function for responsive font sizes
    setResponsiveFontSize(element, sizes = {}) {
        const defaults = {
            mobile: '0.9rem',
            tablet: '1rem',
            desktop: '1.1rem',
            large: '1.2rem'
        };
        
        const settings = { ...defaults, ...sizes };
        
        const updateFontSize = () => {
            element.style.fontSize = settings[this.currentDevice] || settings.desktop;
        };
        
        updateFontSize();
        window.addEventListener('resize', this.debounce(updateFontSize, 250));
    }
    
    // Utility debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Get current viewport info
    getViewportInfo() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            device: this.currentDevice,
            orientation: this.orientation,
            isMobile: this.isMobile(),
            isTablet: this.isTablet(),
            isTouchDevice: this.isTouchDevice()
        };
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.responsiveHelper = new ResponsiveHelper();
    
    // Add device classes to body
    document.body.classList.add(`device-${window.responsiveHelper.currentDevice}`);
    document.body.classList.add(`orientation-${window.responsiveHelper.orientation}`);
    
    if (window.responsiveHelper.isTouchDevice()) {
        document.body.classList.add('touch-device');
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResponsiveHelper;
}
