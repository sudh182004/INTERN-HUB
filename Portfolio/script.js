function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

// 

    const titles = ["Web Developer", "Data Science Enthusiast", "Programmer", "Tech Lover"];
    let currentTitleIndex = 0;
    let charIndex = 0;
    const dynamicTextElement = document.getElementById("dynamic-text");

    function typeEffect() {
        // Get the current title and type it character by character
        if (charIndex < titles[currentTitleIndex].length) {
            dynamicTextElement.textContent += titles[currentTitleIndex].charAt(charIndex);
            charIndex++;
            setTimeout(typeEffect, 100); 
        } else {
            setTimeout(eraseEffect, 1000);
        }
    }

    function eraseEffect() {
        if (charIndex > 0) {
            dynamicTextElement.textContent = titles[currentTitleIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(eraseEffect, 50); 
        } else {
           
            currentTitleIndex = (currentTitleIndex + 1) % titles.length;
            setTimeout(typeEffect, 500);
        }
    }

    typeEffect();

