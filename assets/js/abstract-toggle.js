document.addEventListener('DOMContentLoaded', function() {
    // 使用事件委托
    document.addEventListener('click', function(event) {
        var button = event.target.closest('.abstract-toggle');
        if (!button) return;
        
        var container = button.closest('.abstract-container');
        if (!container) return;
        
        var shortDiv = container.querySelector('.abstract-short');
        var fullDiv = container.querySelector('.abstract-full');
        
        if (fullDiv.style.display === 'none') {
            shortDiv.style.display = 'none';
            fullDiv.style.display = 'block';
            button.textContent = 'Show less';
        } else {
            shortDiv.style.display = 'block';
            fullDiv.style.display = 'none';
            button.textContent = 'Show all';
        }
    });
});