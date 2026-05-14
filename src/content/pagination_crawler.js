export async function paginate(document, adapter) {
    // Attempt infinite scroll first
    const previousHeight = document.body.scrollHeight;
    window.scrollTo(0, document.body.scrollHeight);
    
    await new Promise(r => setTimeout(r, 2000)); // Wait for lazy load
    
    if (document.body.scrollHeight > previousHeight) {
        return true; // Infinite scroll worked
    }

    // Attempt to click Next button
    let nextBtn = null;
    
    if (adapter.getNextButton) {
        nextBtn = adapter.getNextButton(document);
    } else {
        // Generic heuristic: Look for 'next', '>', '→'
        const buttons = Array.from(document.querySelectorAll('a, button'));
        nextBtn = buttons.find(b => {
            const text = b.innerText.toLowerCase();
            return text.includes('next') || text.includes('>') || text === '→';
        });
    }

    if (nextBtn && !nextBtn.disabled) {
        console.log("Clicking next button...");
        nextBtn.click();
        await new Promise(r => setTimeout(r, 3000)); // Wait for navigation/ajax
        return true;
    }

    return false;
}
