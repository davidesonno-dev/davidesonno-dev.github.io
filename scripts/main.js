let DATA;
let selected_categories = [];
let leader1Filters = {categories:[], types:[],colors:[]}; // Variable to store leader1 filters
let leader2Filters = {categories:[], types:[],colors:[]}; // Variable to store leader2 filters
// const CDNUrl = 'https://cdn.jsdelivr.net/gh/davidesonno-dev/davidesonno-dev.github.io/'
// const CDNUrl = 'https://raw.githubusercontent.com/davidesonno-dev/davidesonno-dev.github.io/main/'
const CDNUrl = ''
const imagesFolder = 'images.small'

document.addEventListener("DOMContentLoaded", () => {
    const nameFilter = document.getElementById("nameFilter");
    const typeFilters = document.querySelectorAll(".typeFilter");
    const colorFilters = document.querySelectorAll(".colorFilter");
    const categoryList = document.getElementById("categoryList");
    const selectedCategories = document.getElementById("selectedCategories");
    const characterContainer = document.getElementById("characterContainer");
    const teamContainer = document.getElementById("team");
    const characterModal = document.getElementById("characterModal");
    const setLeader1Button = document.getElementById("setLeader1");
    const setLeader2Button = document.getElementById("setLeader2");
    const leadersContainer = document.querySelector(".leaders");
    const filterCheckbox = document.getElementById('leaderCheckbox');

    let loadedImages = new Set();

    function fetchData() {
        fetch("data/character-data_02042025.json")
            .then(response => response.json())
            .then(data => {
                DATA = data;

                // Populate the characterContainer with all cards once
                DATA.forEach(character => {
                    if (!character.data || !character.data.image) return;

                    const charElement = document.createElement("div");
                    charElement.id = character.id;
                    charElement.className = "character-card";
                    charElement.style.display = "block"; // Ensure all cards are initially visible
                    const imageUrl = `data/${imagesFolder}/${character.id}.png`;
                    charElement.innerHTML = `<img data-src="${CDNUrl}${imageUrl}" alt="${character.data.name}" class="lazy-load" title="${character.data.name}">`;
                    characterContainer.appendChild(charElement);
                });
                populateCategories();
                lazyLoadImages(); // Trigger lazy load for all images
            })
            .catch(error => console.error("Error loading data:", error));
    }

    function getFilters() {
        return {
            name: nameFilter.value.trim().toLowerCase(),
            type: Array.from(typeFilters).filter(cb => cb.checked).map(cb => cb.value),
            color: Array.from(colorFilters).filter(cb => cb.checked).map(cb => cb.value),
            category: Array.from(selectedCategories.querySelectorAll("li")).map(li => li.id.trim())
        };
    }

    function applyFilters() {
        const filters = getFilters();
        const results = queryData(DATA, filters).map(character => character.id); // Get IDs of matching characters

        // Toggle the display of cards based on the query results
        DATA.forEach(character => {
            const card = document.getElementById(character.id);
            if (card) {
                card.style.display = results.includes(character.id) ? "block" : "none";
            }
        });
    }

    function displayTeam() {
        teamContainer.innerHTML = "";
        const notice = document.createElement("div");
        notice.id = "teamNotice";
        notice.style.color = "red";
        notice.style.marginTop = "10px";
        notice.style.textAlign = "center";

        if (leader1Filters.categories.length === 0 && leader1Filters.types.length === 0 && leader1Filters.colors.length === 0 &&
            leader2Filters.categories.length === 0 && leader2Filters.types.length === 0 && leader2Filters.colors.length === 0) {
            return;
        }

        let results = queryDataForTeam(DATA, leader1Filters, leader2Filters);
        if (filterCheckbox.checked) {
            let allFilters = getFilters();
            results = queryData(results, allFilters);
        }

        results.forEach(character => {
            if (!character.data || !character.data.image) return;

            const charElement = document.createElement("div");
            charElement.id = character.id;
            charElement.className = "character-card";
            const imageUrl = `data/${imagesFolder}/${character.id}.png`;
            charElement.innerHTML = `<img data-src="${CDNUrl}${imageUrl}" alt="${character.data.name}" class="lazy-load" title="${character.data.name}">`;
            teamContainer.appendChild(charElement);
        });

        lazyLoadImages(); // Trigger lazy load when new images are added
    }

    function populateCategories() {
        const categories = new Set();
        DATA.forEach(character => {
            if (character.data && character.data.categories) {
                character.data.categories.forEach(cat => categories.add(cat));
            }
        });
        categoryList.innerHTML = '' +
            '<option value="">Select Categories</option>' +
            Array.from(categories)
            .filter(cat => cat.trim() !== "") // Filter out empty categories
            .sort((a, b) => a.localeCompare(b)) // Sort categories alphabetically
            .map(cat => `<option value="${cat}">${cat}</option>`)
            .join("");
    }

    // Lazy Load using IntersectionObserver
    let observer = null; // Store the observer globally
    function lazyLoadImages() {
        if (observer) observer.disconnect(); // Stop observing old elements

        observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src; // Load image
                        img.removeAttribute("data-src"); // Remove the data-src attribute after loading
                    }
                    observer.unobserve(img); // Stop observing once loaded
                }
            });
        }, { threshold: 0.1 });

        // Observe all images with the "lazy-load" class, even if they share the same data-src
        document.querySelectorAll(".lazy-load").forEach(img => {
            if (img.dataset.src) {
                observer.observe(img);
            }
        });
    }
        
    function updateSelectedCategories() {
        const selectedCategory = categoryList.value.trim();
        if (selectedCategory && !selectedCategories.querySelector(`#${CSS.escape(selectedCategory)}`)) {
            const li = document.createElement("li");
            li.textContent = selectedCategory;
            li.id = selectedCategory;
            selectedCategories.appendChild(li);
            selected_categories.push(selectedCategory)
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.className = "remove-category";
            removeButton.addEventListener("click", () => {
                selectedCategories.removeChild(li);
                selected_categories = selected_categories.filter(cat => cat !== selectedCategory);
                applyFilters();
            });
            li.appendChild(removeButton);
            applyFilters();
            displayTeam();
        }
    }

    function showModal(characterId, x, y, isLeader = false) {
        characterModal.dataset.characterId = characterId;
        characterModal.style.top = `${y}px`;
        characterModal.style.left = `${x}px`;
        characterModal.classList.remove("hidden");

        // Populate leader skill information
        const character = DATA.find(char => char.id === characterId);
        const leaderSkillDetails = document.getElementById("leaderSkillDetails");
        if (character && character.data && character.data.leader_skill) {
            const { categories, types, colors } = character.data.leader_skill;
            leaderSkillDetails.innerHTML = `
                <strong>Categories:</strong> ${categories.join(", ") || "None"}<br>
                <strong>Types:</strong> ${types.join(", ") || "None"}<br>
                <strong>Colors:</strong> ${colors.join(", ") || "None"}
            `;
        } else {
            leaderSkillDetails.textContent = "No leader skill available.";
        }

        // Disable or hide "Set as Leader" buttons if the card is already a leader
        const setLeader1Button = document.getElementById("setLeader1");
        const setLeader2Button = document.getElementById("setLeader2");
        if (isLeader) {
            setLeader1Button.style.display = "none";
            setLeader2Button.style.display = "none";
        } else {
            setLeader1Button.style.display = "block";
            setLeader2Button.style.display = "block";
        }
    }

    function hideModal() {
        characterModal.classList.add("hidden");
        delete characterModal.dataset.characterId;
    }

    function setLeader(leaderIndex, characterId) {
        const leaderId = `leader${leaderIndex}`;
        const existingLeader = leadersContainer.querySelector(`#${leaderId}`);
        if (existingLeader) {
            existingLeader.remove(); // Remove the existing leader card

            // Add a slight delay to ensure the modal is properly closed
            setTimeout(() => hideModal(), 0);
        }

        const character = DATA.find(char => char.id === characterId);
        if (character && character.data && character.data.image) {
            const leaderCard = document.createElement("div");
            leaderCard.id = leaderId; // Use the correct leader ID
            leaderCard.className = "character-card";
            leaderCard.setAttribute("card_id", characterId); // Add card_id attribute
            const imageUrl = `data/${imagesFolder}/${characterId}.png`;
            leaderCard.innerHTML = `
                <img src="${CDNUrl}${imageUrl}" alt="${character.data.name}" title="${character.data.name}">
                <span class="leader-label">Leader ${leaderIndex}</span>
                <button class="remove-leader" data-leader-id="${leaderId}">Remove</button>
            `;

            // Add event listener to the remove button
            leaderCard.querySelector(".remove-leader").addEventListener("click", () => {
                leaderCard.remove(); // Remove the leader card
                if (leaderIndex === 1) {
                    leader1Filters = {categories: [], types: [], colors: []}; // Clear leader1 filters
                } else {
                    leader2Filters = {categories: [], types: [], colors: []}; // Clear leader2 filters
                }

                // Add a slight delay to ensure the modal is properly closed
                setTimeout(() => hideModal(), 0);
                displayTeam();
            });

            // Update the leader filters
            if (leaderIndex === 1) {
                leader1Filters = character.data.leader_skill || {categories: [], types: [], colors: []};
            } else {
                leader2Filters = character.data.leader_skill || {categories: [], types: [], colors: []};
            }

            displayTeam();

            // Ensure leader1 comes before leader2
            if (leaderIndex === 1) {
                leadersContainer.prepend(leaderCard);
            } else {
                const leader1Card = leadersContainer.querySelector("#leader1");
                if (leader1Card) {
                    leader1Card.after(leaderCard);
                } else {
                    leadersContainer.appendChild(leaderCard);
                }
            }
        }
    }

    characterContainer.addEventListener("click", (event) => {
        const card = event.target.closest(".character-card");
        if (card) {
            const rect = card.getBoundingClientRect();
            const x = rect.left + window.scrollX + rect.width / 2;
            const y = rect.top + window.scrollY + rect.height / 2; // Center vertically on the card
            showModal(card.id, x, y - 30); // Adjust Y-axis to appear higher
        }
    });

    teamContainer.addEventListener("click", (event) => {
        const card = event.target.closest(".character-card");
        if (card) {
            const rect = card.getBoundingClientRect();
            const x = rect.left + window.scrollX + rect.width / 2;
            const y = rect.top + window.scrollY + rect.height / 2; // Center vertically on the card
            showModal(card.id, x, y - 30); // Adjust Y-axis to appear higher
        }
    });

    leadersContainer.addEventListener("click", (event) => {
        const card = event.target.closest(".character-card");
        if (card) {
            const rect = card.getBoundingClientRect();
            const x = rect.left + window.scrollX + rect.width / 2;
            const y = rect.top + window.scrollY + rect.height / 2; // Center vertically on the card
            showModal(card.getAttribute("card_id"), x, y, true); // Pass `true` to indicate it's a leader card
        }
    });

    document.addEventListener("click", (event) => {
        if (!characterModal.contains(event.target) && !event.target.closest(".character-card")) {
            hideModal();
        }
    });

    setLeader1Button.addEventListener("click", () => {
        const characterId = characterModal.dataset.characterId;
        setLeader(1, characterId); // Set as Leader 1
        hideModal();
    });

    setLeader2Button.addEventListener("click", () => {
        const characterId = characterModal.dataset.characterId;
        setLeader(2, characterId); // Set as Leader 2
        hideModal();
    });

    document.getElementById("openCharacterPage").addEventListener("click", () => {
        const characterId = characterModal.dataset.characterId;
        if (characterId) {
            const character = DATA.find(char => char.id === characterId);
            if (character && character.url) {
                const url = character.url; // Get the URL from the character data
                window.open(url, "_blank"); // Open the URL in a new tab
            } else {
                console.error("Character URL not found");
            }
        }
    });

    fetchData();
    categoryList.addEventListener("change", () => {
        updateSelectedCategories();
        applyFilters();
    });
    nameFilter.addEventListener("input", () => {
        applyFilters();
        displayTeam();
    });
    typeFilters.forEach(filter => filter.addEventListener("change", () => {
        applyFilters();
        displayTeam();
    }));
    colorFilters.forEach(filter => filter.addEventListener("change", () => {
        applyFilters();
        displayTeam();
    }));
    filterCheckbox.addEventListener("change", displayTeam);
});

