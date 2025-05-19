document.getElementById('recommendBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  const domain = url.hostname;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=123Y-456Z', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `list 3 websites with content similar to ${domain} and provide a description less than 20 words of each website and explain why the site is similar in less than 20 words`
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

// Event listener for subButton
document.getElementById('subButton').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://meryam.substack.com' });
});

// Note feature functionality
const noteInput = document.getElementById('noteInput');
const charCount = document.getElementById('charCount');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const saveStatus = document.getElementById('saveStatus');
const downloadBtn = document.getElementById('downloadBtn');

// Load previously saved note
chrome.storage.local.get(['userNote'], (result) => {
  if (result.userNote) {
    noteInput.value = result.userNote;
    updateCharCount();
  }
});

// Update character count
noteInput.addEventListener('input', updateCharCount);

function updateCharCount() {
  const count = noteInput.value.length;
  charCount.textContent = `${count}/200 characters`;
  
  // Change color when approaching limit
  if (count > 150) {
    charCount.style.color = count >= 200 ? '#ff0000' : '#ff9900';
  } else {
    charCount.style.color = '#666';
  }
}

// Save note to Chrome storage
saveNoteBtn.addEventListener('click', () => {
  const note = noteInput.value;
  
  // Save to Chrome storage
  chrome.storage.local.set({ userNote: note }, () => {
    saveStatus.textContent = 'Note saved!';
    saveStatus.style.color = '#28a745';
    
    // Clear status message after 2 seconds
    setTimeout(() => {
      saveStatus.textContent = '';
    }, 2000);
  });
});

// Download note as file with user-selected location
downloadBtn.addEventListener('click', async () => {
  const note = noteInput.value;
  if (!note.trim()) {
    saveStatus.textContent = 'Nothing to download!';
    saveStatus.style.color = '#dc3545';
    setTimeout(() => {
      saveStatus.textContent = '';
    }, 2000);
    return;
  }

  // Get current tab to extract page title
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Get page title and sanitize it for use in a filename
  // Remove any characters that aren't safe for filenames
  let pageTitle = tab.title || "untitled";
  pageTitle = pageTitle
    .replace(/[\/\\:*?"<>|]/g, '_') // Replace unsafe filename chars with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 50); // Limit length to avoid too long filenames
  
  // Get current date for filename
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  // Create filename with page title and date
  const filename = `note_${pageTitle}_${dateStr}.txt`;
  
  // Create a Blob with the note content
  const blob = new Blob([note], {type: 'text/plain'});
  
  // Create object URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Use Chrome's downloads API to prompt for location
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true  // This prompts the user for download location
  }, (downloadId) => {
    // Clean up the object URL
    URL.revokeObjectURL(url);
    
    if (chrome.runtime.lastError) {
      saveStatus.textContent = 'Download failed';
      saveStatus.style.color = '#dc3545';
    } else {
      saveStatus.textContent = 'Download started';
      saveStatus.style.color = '#28a745';
    }
    
    setTimeout(() => {
      saveStatus.textContent = '';
    }, 2000);
  });
});