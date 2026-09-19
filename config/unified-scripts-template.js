/**
 * Unified Educational Activities JavaScript Template
 * Enhanced functionality for all entertainment app activities
 * Compatible with Omani theme and responsive design
 */

/* ===== GLOBAL CONFIGURATION ===== */
const AppConfig = {
  // Sound settings
  sounds: {
    enabled: true,
    volume: 0.7,
    paths: {
      click: '../assets/media/sounds/Click.mp3',
      success: '../assets/media/sounds/win.mp3',
      error: '../assets/media/sounds/long-beep.mp3',
      notification: '../assets/media/sounds/select.mp3',
      timer: '../assets/media/sounds/countdown-beep.mp3',
      celebration: '../assets/media/sounds/clap.mp3'
    }
  },
  
  // Animation settings
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-out'
  },
  
  // Student data
  studentData: null,
  
  // Current activity settings
  activity: {
    name: '',
    startTime: null,
    endTime: null,
    participants: []
  }
};

/* ===== UTILITY FUNCTIONS ===== */
class ActivityUtils {
  // Initialize the activity
  static init(activityName) {
    AppConfig.activity.name = activityName;
    AppConfig.activity.startTime = new Date();
    
    this.loadStudentData();
    this.setupEventListeners();
    this.setupSounds();
    this.addControlButtons();
    this.addAccessibilityFeatures();
    
    console.log(`Activity "${activityName}" initialized successfully`);
  }
  
  // Load student data
  static async loadStudentData() {
    try {
      const response = await fetch('../data/studentData.json');
      AppConfig.studentData = await response.json();
      console.log('Student data loaded successfully');
    } catch (error) {
      console.warn('Could not load student data:', error);
      AppConfig.studentData = { students: [] };
    }
  }
  
  // Setup global event listeners
  static setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'Escape':
          this.showConfirmDialog('هل تريد العودة للصفحة الرئيسية؟', () => {
            this.goHome();
          });
          break;
        case 'F11':
          e.preventDefault();
          this.toggleFullscreen();
          break;
        case ' ':
          if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
          break;
      }
    });
    
    // Prevent context menu on right click
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseActivity();
      } else {
        this.resumeActivity();
      }
    });
  }
  
  // Sound management
  static setupSounds() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = {};
    
    // Preload sounds
    Object.entries(AppConfig.sounds.paths).forEach(([name, path]) => {
      this.loadSound(name, path);
    });
  }
  
  static async loadSound(name, path) {
    try {
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds[name] = audioBuffer;
    } catch (error) {
      console.warn(`Could not load sound ${name}:`, error);
    }
  }
  
  static playSound(soundName, volume = AppConfig.sounds.volume) {
    if (!AppConfig.sounds.enabled || !this.sounds[soundName]) return;
    
    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds[soundName];
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn(`Could not play sound ${soundName}:`, error);
    }
  }
  
  // Add control buttons
  static addControlButtons() {
    // Home button
    const homeBtn = document.createElement('button');
    homeBtn.className = 'control-btn control-btn-home';
    homeBtn.innerHTML = '🏠';
    homeBtn.title = 'العودة للصفحة الرئيسية';
    homeBtn.setAttribute('aria-label', 'العودة للصفحة الرئيسية');
    homeBtn.onclick = () => this.goHome();
    
    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'control-btn control-btn-back';
    backBtn.innerHTML = '↩️';
    backBtn.title = 'رجوع';
    backBtn.setAttribute('aria-label', 'رجوع');
    backBtn.onclick = () => window.history.back();
    
    // Settings button
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'control-btn control-btn-settings';
    settingsBtn.innerHTML = '⚙️';
    settingsBtn.title = 'الإعدادات';
    settingsBtn.setAttribute('aria-label', 'الإعدادات');
    settingsBtn.onclick = () => this.showSettings();
    
    // Add buttons to body
    document.body.appendChild(homeBtn);
    document.body.appendChild(backBtn);
    document.body.appendChild(settingsBtn);
  }
  
  // Navigation functions
  static goHome() {
    this.showConfirmDialog('هل تريد العودة للصفحة الرئيسية؟', () => {
      window.location.href = '../index.html';
    });
  }
  
  static goToActivity(activityPath) {
    window.location.href = activityPath;
  }
  
  // Dialog and notification functions
  static showConfirmDialog(message, onConfirm, onCancel = null) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-header">
        <h3>${message}</h3>
      </div>
      <div class="flex-center" style="gap: 1rem; margin-top: 2rem;">
        <button class="btn btn-primary confirm-btn">نعم</button>
        <button class="btn btn-outline cancel-btn">لا</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Add event listeners
    const confirmBtn = modal.querySelector('.confirm-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    confirmBtn.onclick = () => {
      document.body.removeChild(overlay);
      if (onConfirm) onConfirm();
      this.playSound('click');
    };
    
    cancelBtn.onclick = () => {
      document.body.removeChild(overlay);
      if (onCancel) onCancel();
      this.playSound('click');
    };
    
    // Close on overlay click
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        cancelBtn.click();
      }
    };
    
    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        cancelBtn.click();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Focus the first button
    setTimeout(() => confirmBtn.focus(), 100);
  }
  
  static showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 0.5rem;">
        ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}
        ${message}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, duration);
    
    // Play sound
    this.playSound(type === 'success' ? 'success' : 
                   type === 'error' ? 'error' : 'notification');
  }
  
  // Settings modal
  static showSettings() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-header">
        <h3>إعدادات النشاط</h3>
        <button class="modal-close" aria-label="إغلاق">×</button>
      </div>
      <div class="form-group">
        <label class="form-label">
          <input type="checkbox" ${AppConfig.sounds.enabled ? 'checked' : ''}> 
          تفعيل الأصوات
        </label>
      </div>
      <div class="form-group">
        <label class="form-label">مستوى الصوت</label>
        <input type="range" min="0" max="1" step="0.1" value="${AppConfig.sounds.volume}" class="volume-slider">
      </div>
      <div class="form-group">
        <label class="form-label">
          <input type="checkbox" ${AppConfig.animations.enabled ? 'checked' : ''}> 
          تفعيل الحركات
        </label>
      </div>
      <div class="flex-center" style="gap: 1rem; margin-top: 2rem;">
        <button class="btn btn-primary save-btn">حفظ</button>
        <button class="btn btn-outline cancel-btn">إلغاء</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Event listeners
    const closeBtn = modal.querySelector('.modal-close');
    const saveBtn = modal.querySelector('.save-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const soundCheckbox = modal.querySelector('input[type="checkbox"]');
    const volumeSlider = modal.querySelector('.volume-slider');
    const animationCheckbox = modal.querySelectorAll('input[type="checkbox"]')[1];
    
    const closeModal = () => {
      document.body.removeChild(overlay);
      this.playSound('click');
    };
    
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    
    saveBtn.onclick = () => {
      AppConfig.sounds.enabled = soundCheckbox.checked;
      AppConfig.sounds.volume = parseFloat(volumeSlider.value);
      AppConfig.animations.enabled = animationCheckbox.checked;
      
      this.saveSettings();
      this.showNotification('تم حفظ الإعدادات بنجاح', 'success');
      closeModal();
    };
    
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    };
  }
  
  // Save/load settings
  static saveSettings() {
    try {
      localStorage.setItem('activitySettings', JSON.stringify({
        sounds: AppConfig.sounds,
        animations: AppConfig.animations
      }));
    } catch (error) {
      console.warn('Could not save settings:', error);
    }
  }
  
  static loadSettings() {
    try {
      const saved = localStorage.getItem('activitySettings');
      if (saved) {
        const settings = JSON.parse(saved);
        Object.assign(AppConfig.sounds, settings.sounds);
        Object.assign(AppConfig.animations, settings.animations);
      }
    } catch (error) {
      console.warn('Could not load settings:', error);
    }
  }
  
  // Accessibility features
  static addAccessibilityFeatures() {
    // High contrast mode toggle
    const toggleHighContrast = () => {
      document.body.classList.toggle('high-contrast');
      this.showNotification('تم تبديل وضع التباين العالي', 'info');
    };
    
    // Keyboard navigation enhancement
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === '=') {
        e.preventDefault();
        this.increaseFontSize();
      } else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        this.decreaseFontSize();
      } else if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        this.resetFontSize();
      } else if (e.altKey && e.key === 'h') {
        e.preventDefault();
        toggleHighContrast();
      }
    });
    
    // Add skip links
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'تخطي إلى المحتوى الرئيسي';
    skipLink.className = 'sr-only';
    skipLink.style.position = 'absolute';
    skipLink.style.top = '-100px';
    skipLink.onfocus = function() {
      this.style.top = '0';
      this.style.left = '0';
      this.style.zIndex = '10000';
      this.style.backgroundColor = 'var(--omani-gold)';
      this.style.color = 'var(--text-primary)';
      this.style.padding = '8px';
      this.style.textDecoration = 'none';
    };
    skipLink.onblur = function() {
      this.style.top = '-100px';
    };
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
  
  // Font size controls
  static increaseFontSize() {
    const root = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(root).fontSize);
    if (currentSize < 24) {
      root.style.fontSize = (currentSize + 2) + 'px';
      this.showNotification('تم تكبير حجم الخط', 'info');
    }
  }
  
  static decreaseFontSize() {
    const root = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(root).fontSize);
    if (currentSize > 12) {
      root.style.fontSize = (currentSize - 2) + 'px';
      this.showNotification('تم تصغير حجم الخط', 'info');
    }
  }
  
  static resetFontSize() {
    document.documentElement.style.fontSize = '16px';
    this.showNotification('تم إعادة تعيين حجم الخط', 'info');
  }
  
  // Fullscreen functions
  static toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Could not enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Could not exit fullscreen:', err);
      });
    }
  }
  
  // Activity state management
  static pauseActivity() {
    console.log('Activity paused');
    // Override in specific activities
  }
  
  static resumeActivity() {
    console.log('Activity resumed');
    // Override in specific activities
  }
  
  // Random selection utilities
  static getRandomStudent() {
    if (!AppConfig.studentData || !AppConfig.studentData.students) {
      return null;
    }
    const students = AppConfig.studentData.students;
    return students[Math.floor(Math.random() * students.length)];
  }
  
  static getRandomStudents(count) {
    if (!AppConfig.studentData || !AppConfig.studentData.students) {
      return [];
    }
    const students = [...AppConfig.studentData.students];
    const selected = [];
    
    for (let i = 0; i < Math.min(count, students.length); i++) {
      const randomIndex = Math.floor(Math.random() * students.length);
      selected.push(students.splice(randomIndex, 1)[0]);
    }
    
    return selected;
  }
  
  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Animation utilities
  static animateElement(element, animationType, duration = AppConfig.animations.duration) {
    if (!AppConfig.animations.enabled) return Promise.resolve();
    
    return new Promise(resolve => {
      element.style.animation = `${animationType} ${duration}ms ${AppConfig.animations.easing}`;
      
      const handleAnimationEnd = () => {
        element.removeEventListener('animationend', handleAnimationEnd);
        element.style.animation = '';
        resolve();
      };
      
      element.addEventListener('animationend', handleAnimationEnd);
    });
  }
  
  // Timer utilities
  static formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  // Local storage utilities
  static saveActivityData(key, data) {
    try {
      localStorage.setItem(`activity_${AppConfig.activity.name}_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Could not save activity data:', error);
    }
  }
  
  static loadActivityData(key) {
    try {
      const data = localStorage.getItem(`activity_${AppConfig.activity.name}_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Could not load activity data:', error);
      return null;
    }
  }
  
  // Celebration effects
  static celebrate() {
    this.playSound('celebration');
    
    // Confetti effect if library is available
    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DC143C', '#228B22', '#FFD700'] // Omani colors
      });
    }
    
    // Alternative CSS animation
    else {
      const celebrationDiv = document.createElement('div');
      celebrationDiv.innerHTML = '🎉';
      celebrationDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 4rem;
        z-index: 10000;
        animation: bounce 1s ease-out;
        pointer-events: none;
      `;
      
      document.body.appendChild(celebrationDiv);
      
      setTimeout(() => {
        if (celebrationDiv.parentNode) {
          document.body.removeChild(celebrationDiv);
        }
      }, 1000);
    }
  }
  
  // Enhanced button creation
  static createButton(text, className = 'btn btn-primary', onClick = null) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = className;
    button.onclick = (e) => {
      this.playSound('click');
      if (onClick) onClick(e);
    };
    return button;
  }
  
  // Progress tracking
  static updateProgress(current, total) {
    const percentage = Math.round((current / total) * 100);
    
    // Update any progress bars on the page
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
      bar.style.width = percentage + '%';
    });
    
    return percentage;
  }
}

/* ===== AUTO-INITIALIZATION ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Load settings first
  ActivityUtils.loadSettings();
  
  // Get activity name from page title or filename
  const activityName = document.title || window.location.pathname.split('/').pop().replace('.html', '');
  
  // Initialize the activity
  ActivityUtils.init(activityName);
  
  // Add fade-in animation to body
  if (AppConfig.animations.enabled) {
    document.body.style.opacity = '0';
    setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s ease-out';
      document.body.style.opacity = '1';
    }, 100);
  }
});

/* ===== CSS ANIMATIONS FOR JAVASCRIPT ===== */
const cssAnimations = `
  @keyframes slideOut {
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .high-contrast {
    filter: contrast(2) saturate(1.5);
  }
  
  .high-contrast .card {
    border: 3px solid var(--dark-gray) !important;
  }
  
  .high-contrast .btn {
    border: 2px solid var(--dark-gray) !important;
    font-weight: 700 !important;
  }
`;

// Add animations to head
const styleSheet = document.createElement('style');
styleSheet.textContent = cssAnimations;
document.head.appendChild(styleSheet);

/* ===== EXPORT FOR MODULE USAGE ===== */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ActivityUtils, AppConfig };
}

// Make available globally
window.ActivityUtils = ActivityUtils;
window.AppConfig = AppConfig;
