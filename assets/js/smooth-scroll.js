document.addEventListener('DOMContentLoaded', function () {
    // 选择所有导航栏链接
    const navLinks = document.querySelectorAll('.nav__list a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // 检查是否是页面内锚点链接
            if (href.startsWith('#') || href.includes('#')) {
                e.preventDefault(); // 阻止默认跳转
                const targetId = href.split('#')[1];
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    // 平滑滚动到目标位置
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    // 更新 URL（可选）
                    window.history.pushState(null, null, `#${targetId}`);
                }
            }
        });
    });
});
