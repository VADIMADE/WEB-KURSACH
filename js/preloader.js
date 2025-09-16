document.addEventListener('DOMContentLoaded', function() {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.id = 'preloader';
    preloader.innerHTML = '<div class="loader"></div>';
    
    document.body.appendChild(preloader);
    
    window.addEventListener('load', function() {
        setTimeout(function() {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.classList.add('hidden');
                
                setTimeout(function() {
                    if (preloader && preloader.parentNode) {
                        preloader.parentNode.removeChild(preloader);
                    }
                }, 500);
            }
        }, 1000);
    });
    
    window.addEventListener('error', function() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(function() {
                if (preloader && preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 500);
        }
    });
});