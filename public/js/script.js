document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Redirect if not logged in and trying to access protected pages
    if (!token && (currentPage === 'home.html' || currentPage === 'profile.html')) {
        window.location.href = 'login.html';
    }
    
    // Redirect if logged in and trying to access login/register pages
    if (token && (currentPage === 'login.html' || currentPage === 'register.html')) {
        window.location.href = 'home.html';
    }
    
    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }
    
    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    const errorDiv = document.getElementById('error-message');
                    errorDiv.textContent = data.error;
                    errorDiv.classList.remove('d-none');
                    setTimeout(() => {
                        errorDiv.classList.add('d-none');
                    }, 3000);
                } else {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'home.html';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const errorDiv = document.getElementById('error-message');
                errorDiv.textContent = 'An error occurred. Please try again.';
                errorDiv.classList.remove('d-none');
                setTimeout(() => {
                    errorDiv.classList.add('d-none');
                }, 3000);
            });
        });
    }
    
    // Register form submission
    const registerForm = document.getElementById('register-form');
    console.log("Form Data Submitted:", registerForm);
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const phone = document.getElementById('phone').value;
            const bloodGroup = document.getElementById('blood-group').value;
            const age = document.getElementById('age').value;
            const gender = document.getElementById('gender').value;
            const address = document.getElementById('address').value;
            const isAvailable = document.getElementById('donor-availability').checked;
            const donationHospital = document.getElementById("donation-hospital").value;
            if (!donationHospital) {
                console.error("Donation hospital is required but missing!");
            }
            
            // Form validation
            const errorDiv = document.getElementById('error-message');
    
            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }
    
            if (password.length < 6) {
                showError('Password must be at least 6 characters');
                return;
            }
    
            if (age < 18 || age > 65) {
                showError('Age must be between 18 and 65');
                return;
            }
    
            if (!name || !email || !password || !phone || !bloodGroup || !age || !gender || !address || !donationHospital) {
                showError('All fields are required');
                return;
            }
    
            // Show loading state
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Registering...';
            submitBtn.disabled = true;
    
            fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    phone,
                    bloodGroup,
                    age: parseInt(age),
                    gender,
                    address,
                    isAvailable,
                    donationHospital
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Registration failed');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    showError(data.error);
                } else {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'home.html';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError(error.message || 'An error occurred. Please try again.');
            })
            .finally(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            });
    
            function showError(message) {
                errorDiv.textContent = message;
                errorDiv.classList.remove('d-none');
                setTimeout(() => {
                    errorDiv.classList.add('d-none');
                }, 3000);
            }
        });
    }
    
    
    // Load user profile
    if (currentPage === 'profile.html' && token) {
        const user = JSON.parse(localStorage.getItem('user'));
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone;
        document.getElementById('blood-group').value = user.bloodGroup;
        document.getElementById('age').value = user.age;
        document.getElementById('gender').value = user.gender;
        document.getElementById('address').value = user.address;
        document.getElementById('donor-availability').checked = user.isAvailable;
    }
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const bloodGroup = document.getElementById('blood-group').value;
            const age = document.getElementById('age').value;
            const gender = document.getElementById('gender').value;
            const address = document.getElementById('address').value;
            const isAvailable = document.getElementById('donor-availability').checked;
            
            fetch('http://localhost:5000/api/auth/updateProfile', { // Fixed endpoint path
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    phone,
                    bloodGroup,
                    age: parseInt(age), // Ensure age is sent as a number
                    gender,
                    address,
                    isAvailable
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    const errorDiv = document.getElementById('error-message');
                    errorDiv.textContent = data.error;
                    errorDiv.classList.remove('d-none');
                    setTimeout(() => {
                        errorDiv.classList.add('d-none');
                    }, 3000);
                } else {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    const successDiv = document.getElementById('success-message');
                    successDiv.textContent = 'Profile updated successfully';
                    successDiv.classList.remove('d-none');
                    setTimeout(() => {
                        successDiv.classList.add('d-none');
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const errorDiv = document.getElementById('error-message');
                errorDiv.textContent = 'An error occurred. Please try again.';
                errorDiv.classList.remove('d-none');
                setTimeout(() => {
                    errorDiv.classList.add('d-none');
                }, 3000);
            });
        });
    }
    
    // Toggle availability
    const toggleAvailability = document.getElementById('toggle-availability');
    if (toggleAvailability) {
        toggleAvailability.addEventListener('click', function() {
            const user = JSON.parse(localStorage.getItem('user'));
            const newAvailability = !user.isAvailable;
            
            fetch('http://localhost:5000/api/auth/toggleAvailability', { // Fixed endpoint path
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isAvailable: newAvailability })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error toggling availability:', data.error);
                } else {
                    user.isAvailable = newAvailability;
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    const availabilityStatus = document.getElementById('availability-status');
                    if (newAvailability) {
                        availabilityStatus.textContent = 'Available';
                        availabilityStatus.classList.add('bg-success');
                        availabilityStatus.classList.remove('bg-danger');
                    } else {
                        availabilityStatus.textContent = 'Not Available';
                        availabilityStatus.classList.add('bg-danger');
                        availabilityStatus.classList.remove('bg-success');
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }
    
    // Donor search functionality
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const bloodGroup = document.getElementById('search-blood-group').value.trim().toUpperCase();
            const district = document.getElementById('search-district').value.trim().toLowerCase();
            const hospital = document.getElementById('search-hospital').value.trim();
            
            fetch(`http://localhost:5000/api/donors/search?bloodGroup=${bloodGroup}&district=${district}&hospital=${hospital}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => response.json())
            .then(data => {
                const donorResults = document.getElementById('donor-results');
                donorResults.innerHTML = '';
                
                if (data.error) {
                    donorResults.innerHTML = `<p class='text-danger text-center'>${data.error}</p>`;
                } else if (data.donors.length === 0) {
                    donorResults.innerHTML = '<p class="text-muted text-center">No donors found.</p>';
                } else {
                    data.donors.forEach(donor => {
                        const donorCard = document.createElement('div');
                        donorCard.className = 'donor-card';
                        donorCard.innerHTML = `
                            <div class='row'>
                                <div class='col-md-8'>
                                    <h5>${donor.name}</h5>
                                    <p><strong>Blood Group:</strong> ${donor.bloodGroup}</p>
                                    <p><strong>Age:</strong> ${donor.age}</p>
                                    <p><strong>Gender:</strong> ${donor.gender}</p>
                                    <p><strong>Address:</strong> ${donor.address}</p>
                                </div>
                                <div class='col-md-4 text-end'>
                                    <button class='btn btn-danger contact-donor' data-phone='${donor.phone}' data-email='${donor.email}'>Contact</button>
                                </div>
                            </div>
                        `;
                        donorResults.appendChild(donorCard);
                    });
                    
                    document.querySelectorAll('.contact-donor').forEach(button => {
                        button.addEventListener('click', function() {
                            alert(`Contact Info:\nPhone: ${this.getAttribute('data-phone')}\nEmail: ${this.getAttribute('data-email')}`);
                        });
                    });
                }
            })
            .catch(() => {
                document.getElementById('donor-results').innerHTML = '<p class="text-danger text-center">Error fetching donors. Please try again.</p>';
            });
        });
    }
});