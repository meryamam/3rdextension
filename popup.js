document.getElementById('recommendBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url);
    const domain = url.hostname;
  
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCvFpRiYw4rIY-7ZtlOSUU0nM7P0pkjZLE', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `list 3 websites with content similar to ${domain}`
              // text: `explain AI in a few words`
            }]
          }]
        })
      });
  
      const data = await response.json();
      const recommendations = data.candidates[0].content.parts[0].text;
      
      document.getElementById('results').innerText = recommendations;
    } catch (error) {
      document.getElementById('results').innerText = 'Error fetching recommendations';
    }
  });