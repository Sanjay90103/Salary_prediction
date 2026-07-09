document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const predictForm = document.getElementById("predictForm");
    const nameInput = document.getElementById("name");
    const ageInput = document.getElementById("age");
    const educationInput = document.getElementById("education");
    const experienceInput = document.getElementById("experience");
    const roleInput = document.getElementById("role");
    
    const spinnerOverlay = document.getElementById("spinnerOverlay");
    const resultsPlaceholder = document.getElementById("resultsPlaceholder");
    const resultsActive = document.getElementById("resultsActive");
    
    // Result details elements
    const resName = document.getElementById("resName");
    const resAnnual = document.getElementById("resAnnual");
    const resMonthly = document.getElementById("resMonthly");
    const bldRole = document.getElementById("bldRole");
    const bldExp = document.getElementById("bldExp");
    const bldEdu = document.getElementById("bldEdu");
    const bldAge = document.getElementById("bldAge");
    
    // Global alert error element
    const globalAlert = document.getElementById("globalAlert");
    const resetBtn = document.getElementById("resetBtn");
    
    // Autocomplete elements & data
    const roleSuggestions = document.getElementById("roleSuggestions");
    const JOB_ROLES = [
        "Software Engineer",
        "Senior Software Engineer",
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Python Developer",
        "Java Developer",
        "Data Scientist",
        "Machine Learning Engineer",
        "AI Engineer",
        "Data Analyst",
        "Business Analyst",
        "Cloud Engineer",
        "DevOps Engineer",
        "QA Engineer",
        "Test Engineer",
        "UI Designer",
        "UX Designer",
        "UI/UX Designer",
        "Android Developer",
        "iOS Developer",
        "Cyber Security Analyst",
        "Network Engineer",
        "System Administrator",
        "Database Administrator",
        "Product Manager",
        "Project Manager",
        "HR Executive",
        "Accountant",
        "Marketing Executive",
        "Sales Executive",
        "Graphic Designer",
        "Content Writer",
        "Customer Support Executive",
        "Operations Manager",
        "Finance Analyst",
        "Research Engineer",
        "Embedded Engineer",
        "Mechanical Engineer",
        "Civil Engineer",
        "Electrical Engineer"
    ];
    let currentFocus = -1;

    if (predictForm) {
        predictForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Clear any global errors
            hideGlobalError();
            
            // Validate client inputs
            const isValid = validateForm();
            if (!isValid) return;
            
            // Show loading spinner
            showLoading(true);
            
            // Prep request data
            const requestData = {
                name: nameInput.value.trim(),
                age: parseInt(ageInput.value),
                education: educationInput.value,
                experience: parseInt(experienceInput.value),
                role: roleInput.value
            };
            
            try {
                const response = await fetch("https://salary-prediction-o1cz.onrender.com/api/predict", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    // Handle API-side validation errors or internal errors
                    if (data.errors) {
                        displayBackendErrors(data.errors);
                    } else if (data.error) {
                        showGlobalError(data.error);
                    } else {
                        showGlobalError("Something went wrong. Please try again.");
                    }
                    showLoading(false);
                    return;
                }
                
                // Success path
                showLoading(false);
                displayResults(data);
                
            } catch (err) {
                console.error("Network or script error:", err);
                showLoading(false);
                showGlobalError("Unable to connect to the backend server. Please verify Flask is running.");
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            // Reset the form values
            predictForm.reset();
            
            // Remove error classes and text from inputs
            document.querySelectorAll(".form-input").forEach(input => {
                input.classList.remove("error");
            });
            document.querySelectorAll(".form-error-msg").forEach(msg => {
                msg.textContent = "";
            });
            
            // Hide role suggestions dropdown
            if (roleSuggestions) {
                roleSuggestions.innerHTML = "";
                roleSuggestions.style.display = "none";
            }
            
            // Swap active result back to placeholder
            resultsActive.style.display = "none";
            resultsPlaceholder.style.display = "block";
            
            hideGlobalError();
        });
    }

    // Input validations
    function validateForm() {
        let isValid = true;
        
        // 1. Name validation
        const nameVal = nameInput.value.trim();
        if (!nameVal) {
            setError(nameInput, "Name is required.");
            isValid = false;
        } else if (nameVal.length < 2) {
            setError(nameInput, "Name must be at least 2 characters.");
            isValid = false;
        } else {
            clearError(nameInput);
        }
        
        // 2. Age validation
        const ageVal = ageInput.value.trim();
        const ageInt = parseInt(ageVal);
        if (!ageVal) {
            setError(ageInput, "Age is required.");
            isValid = false;
        } else if (isNaN(ageInt) || ageInt < 21 || ageInt > 65) {
            setError(ageInput, "Age must be a number between 21 and 65.");
            isValid = false;
        } else {
            clearError(ageInput);
        }
        
        // 3. Education validation
        if (!educationInput.value) {
            setError(educationInput, "Please select an education level.");
            isValid = false;
        } else {
            clearError(educationInput);
        }
        
        // 4. Experience validation
        const expVal = experienceInput.value.trim();
        const expInt = parseInt(expVal);
        if (!expVal) {
            setError(experienceInput, "Experience is required.");
            isValid = false;
        } else if (isNaN(expInt) || expInt < 0 || expInt > 45) {
            setError(experienceInput, "Experience must be between 0 and 45 years.");
            isValid = false;
        } else {
            clearError(experienceInput);
        }
        
        // 5. Logical Cross-validation (Age vs Experience)
        if (isValid) {
            const age = parseInt(ageInput.value);
            const exp = parseInt(experienceInput.value);
            if (exp > (age - 18)) {
                setError(experienceInput, `Experience cannot exceed ${age - 18} years (assumes working after age 18).`);
                isValid = false;
            }
        }
        
        // 6. Role validation
        const roleVal = roleInput.value.trim();
        const matchedRole = JOB_ROLES.find(r => r.toLowerCase() === roleVal.toLowerCase());
        if (!roleVal) {
            setError(roleInput, "Please select a job role.");
            isValid = false;
        } else if (!matchedRole) {
            setError(roleInput, "Job role not found. Please choose one from the suggestions.");
            isValid = false;
        } else {
            roleInput.value = matchedRole; // Normalize to canonical casing
            clearError(roleInput);
        }
        
        return isValid;
    }

    // Helper functions for displaying validations
    function setError(input, message) {
        input.classList.add("error");
        const errorMsg = input.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains("form-error-msg")) {
            errorMsg.textContent = message;
        }
    }
    
    function clearError(input) {
        input.classList.remove("error");
        const errorMsg = input.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains("form-error-msg")) {
            errorMsg.textContent = "";
        }
    }

    function displayBackendErrors(errors) {
        // Errors is a dictionary key-value mapping of field: message
        for (const field in errors) {
            const inputField = document.getElementById(field);
            if (inputField) {
                setError(inputField, errors[field]);
            }
        }
    }

    // Spinner Control
    function showLoading(isLoading) {
        if (isLoading) {
            spinnerOverlay.classList.add("active");
        } else {
            spinnerOverlay.classList.remove("active");
        }
    }

    // Global Alert Display
    function showGlobalError(message) {
        globalAlert.textContent = message;
        globalAlert.style.display = "block";
        globalAlert.scrollIntoView({ behavior: "smooth" });
    }

    function hideGlobalError() {
        globalAlert.style.display = "none";
        globalAlert.textContent = "";
    }

    // Format Currency Helper
    const formatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    });
    
    const formatterMonthly = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    });

    // Display predictions on the layout
    function displayResults(data) {
        resName.textContent = data.name;
        resAnnual.textContent = `${formatter.format(data.predicted_annual)} / year`;
        resMonthly.textContent = `${formatterMonthly.format(data.predicted_monthly)} / month`;
        
        // Update summary box
        bldRole.textContent = data.input_summary.role;
        bldExp.textContent = `${data.input_summary.experience} ${data.input_summary.experience === 1 ? 'Year' : 'Years'}`;
        bldEdu.textContent = data.input_summary.education;
        bldAge.textContent = `${data.input_summary.age} Years Old`;
        
        // Fade toggle transitions
        resultsPlaceholder.style.display = "none";
        resultsActive.style.display = "block";
    }

    // Autocomplete Helper Functions
    function showSuggestions(val) {
        if (!roleSuggestions) return;
        const query = val.toLowerCase().trim();
        roleSuggestions.innerHTML = "";
        currentFocus = -1;

        // Filter JOB_ROLES based on matching query
        const matches = JOB_ROLES.filter(role => role.toLowerCase().includes(query));

        if (matches.length === 0) {
            roleSuggestions.style.display = "none";
            return;
        }

        matches.forEach((role) => {
            const item = document.createElement("div");
            item.classList.add("suggestion-item");
            item.setAttribute("data-value", role);

            // Bold matching character segments
            if (query) {
                const startIndex = role.toLowerCase().indexOf(query);
                if (startIndex !== -1) {
                    const before = role.substring(0, startIndex);
                    const match = role.substring(startIndex, startIndex + query.length);
                    const after = role.substring(startIndex + query.length);
                    item.innerHTML = `${escapeHTML(before)}<strong>${escapeHTML(match)}</strong>${escapeHTML(after)}`;
                } else {
                    item.textContent = role;
                }
            } else {
                item.textContent = role;
            }

            // Click handler
            item.addEventListener("mousedown", (e) => {
                e.preventDefault(); // prevents blur from closing the list before selecting
                selectRole(role);
            });

            roleSuggestions.appendChild(item);
        });

        roleSuggestions.style.display = "block";
    }

    function escapeHTML(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function selectRole(role) {
        roleInput.value = role;
        roleSuggestions.style.display = "none";
        clearError(roleInput);
    }

    function addActive(items) {
        if (!items) return false;
        removeActive(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = items.length - 1;
        
        items[currentFocus].classList.add("active");
        
        // Ensure scroll visibility
        const containerHeight = roleSuggestions.clientHeight;
        const itemTop = items[currentFocus].offsetTop;
        const itemHeight = items[currentFocus].offsetHeight;
        
        if (itemTop + itemHeight > roleSuggestions.scrollTop + containerHeight) {
            roleSuggestions.scrollTop = itemTop + itemHeight - containerHeight;
        } else if (itemTop < roleSuggestions.scrollTop) {
            roleSuggestions.scrollTop = itemTop;
        }
    }

    function removeActive(items) {
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove("active");
        }
    }

    // Set up Autocomplete Event Listeners
    if (roleInput && roleSuggestions) {
        roleInput.addEventListener("input", () => {
            showSuggestions(roleInput.value);
        });

        roleInput.addEventListener("focus", () => {
            showSuggestions(roleInput.value);
        });

        roleInput.addEventListener("blur", () => {
            roleSuggestions.style.display = "none";
        });

        roleInput.addEventListener("keydown", (e) => {
            const items = roleSuggestions.getElementsByClassName("suggestion-item");
            if (roleSuggestions.style.display === "none" || items.length === 0) {
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                currentFocus++;
                addActive(items);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                currentFocus--;
                addActive(items);
            } else if (e.key === "Enter") {
                if (currentFocus > -1 && items[currentFocus]) {
                    e.preventDefault();
                    items[currentFocus].click();
                }
            } else if (e.key === "Escape") {
                roleSuggestions.style.display = "none";
            }
        });
    }
});
