
document.addEventListener('DOMContentLoaded', function() {
    // Interactive menu functionality
    const menuButtons = document.querySelectorAll('.menu-buttons .btn-minecraft');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Show first section by default
    if (contentSections.length > 0) {
        contentSections[0].classList.add('active');
        menuButtons[0].classList.add('active');
    }
    
    menuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            
            // Remove active class from all buttons and sections
            menuButtons.forEach(btn => btn.classList.remove('active'));
            contentSections.forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });
            
            // Add active class to clicked button and corresponding section
            this.classList.add('active');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                targetSection.classList.add('active');
                
                // Add animation effect
                targetSection.style.animation = 'none';
                setTimeout(() => {
                    targetSection.style.animation = 'fadeInUp 0.5s ease-out';
                }, 10);
            }
        });
    });
    
    // Gallery images background functionality
    const galleryImages = document.querySelectorAll('.gallery-image');
    const backgroundContainer = document.getElementById('backgroundImage');
    
    galleryImages.forEach(image => {
        image.addEventListener('click', function() {
            const bgImage = this.getAttribute('data-bg');
            
            if (bgImage) {
                // Add click effect
                this.style.transform = 'scale(0.95) rotate(-2deg)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
                
                // Set background image
                backgroundContainer.style.backgroundImage = `url(${bgImage})`;
                backgroundContainer.classList.add('show');
                
                // Create click ripple effect
                createRippleEffect(this, event);
            }
        });
        
        // Enhanced hover effects
        image.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotate(2deg)';
            this.style.filter = 'brightness(1.2)';
        });
        
        image.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.filter = '';
        });
    });
    
    // Table circles functionality
    const tableCircles = document.querySelectorAll('.table-circle');
    const tableModal = new bootstrap.Modal(document.getElementById('tableModal'));
    const modalBody = document.getElementById('tableModalBody');
    const modalTitle = document.getElementById('tableModalLabel');
    
    tableCircles.forEach(circle => {
        circle.addEventListener('click', function() {
            const tableId = this.getAttribute('data-table');
            const tableSection = document.getElementById(tableId);
            
            if (tableSection) {
                // Add rotation effect
                this.style.transform = 'scale(0.9) rotate(360deg)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 600);
                
                // Clone table content to modal
                const tableClone = tableSection.cloneNode(true);
                tableClone.classList.remove('d-none');
                
                // Update modal content
                modalBody.innerHTML = tableClone.innerHTML;
                modalTitle.textContent = tableSection.querySelector('h2').textContent;
                
                // Show modal
                tableModal.show();
                
                // Add show animation to table
                const modalTable = modalBody.querySelector('table');
                if (modalTable) {
                    modalTable.style.animation = 'slideUp 0.6s ease-out';
                }
            }
        });
        
        // Enhanced circle hover effects
        circle.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotate(5deg)';
        });
        
        circle.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Enhanced button effects
    const allButtons = document.querySelectorAll('button, .btn, .social-link, .scroll-link');
    
    allButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            createRippleEffect(this, e);
        });
    });
    
    // Download button enhanced effects
    const downloadBtn = document.querySelector('.btn-download-custom');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            // Create download animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            
        });
    }
    
    // Smooth scrolling for anchor links
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    scrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Background image click to remove
    backgroundContainer.addEventListener('click', function() {
        this.classList.remove('show');
        setTimeout(() => {
            this.style.backgroundImage = '';
        }, 500);
    });
    
    
    
    // Add entrance animations when elements come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                if (entry.target.classList.contains('interactive-menu')) {
                    entry.target.style.animation = 'slideUp 0.8s ease-out';
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animations
    const animatedElements = document.querySelectorAll('.interactive-menu, .tables-circles-container, .imagenes-grid');
    animatedElements.forEach(el => observer.observe(el));
});

// Utility function to create ripple effect
function createRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.6)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'rippleEffect 0.6s linear';
    ripple.style.pointerEvents = 'none';
    
    const originalPosition = element.style.position;
    if (originalPosition !== 'relative' && originalPosition !== 'absolute') {
        element.style.position = 'relative';
    }
    
    element.appendChild(ripple);
    
    // Add CSS animation for ripple
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    if (!document.querySelector('style[data-ripple]')) {
        style.setAttribute('data-ripple', 'true');
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}


// Add some extra interactive features
document.addEventListener('mousemove', function(e) {
    // Subtle cursor trail effect
    if (Math.random() < 0.1) {
        const trail = document.createElement('div');
        trail.style.position = 'fixed';
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
        trail.style.width = '3px';
        trail.style.height = '3px';
        trail.style.background = 'rgba(255, 142, 0, 0.6)';
        trail.style.borderRadius = '50%';
        trail.style.pointerEvents = 'none';
        trail.style.zIndex = '9998';
        trail.style.animation = 'fadeOut 1s ease-out forwards';
        
        document.body.appendChild(trail);
        
        setTimeout(() => {
            trail.remove();
        }, 1000);
    }
});

// Add fade out animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 0.6;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0);
        }
    }
`;
document.head.appendChild(fadeOutStyle);