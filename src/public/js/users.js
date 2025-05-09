const logInForm = document.getElementById('login-form');
const signUpForm = document.getElementById('signup-form');
const forgotForm = document.getElementById('forgot-password');
const resetForm = document.getElementById('reset-form')

if (logInForm) {

    logInForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const loginField = document.getElementById("username");
        const passwordField = document.getElementById("password");

        if (!loginField || !passwordField) {
            toastr.warning("Username or Password fields are missing.");
            return;
        }

        const login = loginField.value.trim();
        const password = passwordField.value;

        if (!login || !password) {
            toastr.warning("Please enter both username and password.");
            return;
        }   

        try {
            const result = await ajax('/api/users/login', { login, password });
            if (result) {
                toastr.success('Success');
                setTimeout(() => {
                    window.location.href = "/users";
                }, 500);                  
            }
        } catch (error) {
            toastr.error(error.message);
        }
    });
} else if (signUpForm) {
    signUpForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const { username, email, password, confirmPassword } = getFormData();

        const checkInPut = validateUserInput(username, email, password, confirmPassword);
        if (checkInPut) {
            toastr.warning(checkInPut);
            return;
        }

        try {
            const result = await ajax('/api/users/create', { username, email, password })
            if (result) {
                toastr.success("Signup successful. Redirecting to login...");
                setTimeout(() => {
                    window.location.href = "/login"; // Redirect to login page    
                }, 1000)
            }
        } catch (error) {
            toastr.error(error.message);
        }
    });
} else if (forgotForm) {
    forgotForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const emailElement = document.getElementById('email');
        const email = emailElement.value.trim();

        if (!email) {
            toastr.warning("Please enter your email.");
            emailElement.focus();
            return;
        }

        try {
            const result = await ajax('/api/users/forgot', { email })
            if (result) {
                toastr.info("A reset link has been sent to your email.");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500)
            } 
        } catch (error) {
            toastr.error(error.message);
        }
    });
} else if (resetForm) {
    document.addEventListener('DOMContentLoaded', () => {

        // Lấy token từ URL (http://localhost:3002/reset-password/:token)
        const token = window.location.pathname.split('/').pop();

        resetForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const newPasswordElement = document.getElementById('newPassword');
            const confirmPasswordElement = document.getElementById('confirmPassword');

            const newPassword = newPasswordElement.value.trim();
            const confirmPassword = confirmPasswordElement.value.trim();

            if (newPassword.length === 0) {
                toastr.warning('This field is required.');
                newPasswordElement.focus();
                return;
            }
            if(confirmPassword.length === 0) {
                toastr.warning('This field is required.');
                confirmPasswordElement.focus();
                return;
            }
            if (!isValidPassword(newPassword)) {
                toastr.warning('Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.')
                return;
            }
            if (!isValidPassword(newPassword, confirmPassword)) {
                toastr.warning('Passwords do not correct.')
                return;
            }
            try {
                const result = await ajax(`/api/users/reset-password/${token}`, { newPassword, confirmPassword })
                if (result) {
                    toastr.success('Password has been reset successfully.');
                    setTimeout(() => {
                        const confirmChange = confirm('Do you want to login?')
                        if (!confirmChange) return;
                        window.location.href = '/login';
                    }, 400)
                }
            } catch (error) {
                toastr.error(error.message);
            }
        });
    });
} else {
    document.addEventListener("DOMContentLoaded", async () => {
        await getUsers();
        await addUser();
    })
    document.getElementById("userTableBody").addEventListener("click", async (event) => {
        if (event.target.classList.contains("updateUserBtn")) {
            const userId = event.target.getAttribute("data-id");
            if (userId) {
                await updateUser(userId);
            }
        }
    })

    async function addUser() {
        const newUserModalElement = document.getElementById("newUserModal");
        const newUserModal = newUserModalElement ? new bootstrap.Modal(newUserModalElement) : null;
        const newUser = document.querySelector("#newUser");
        const createUserBtn = document.getElementById("createUserBtn");
        const userTable = document.querySelector("#userTable");


        if (userTable) {
            userTable.style.display = "table";
        }

        if (newUser && newUserModal) {
            newUser.addEventListener("click", function () {
                newUserModal.show();
            });
        }

        if (createUserBtn) {
            createUserBtn.addEventListener("click", async function (event) {
                event.preventDefault();

                const { username, email, password, confirmPassword } = getFormData();

                const checkInPut = validateUserInput(username, email, password, confirmPassword);
                if (checkInPut) {
                    toastr.warning(checkInPut);
                    return;
                }

                try {        
                    const result = await ajax('/api/users/create', { username, email, password })
                    if (result) {
                        toastr.success("Added");
                        if (newUserModal) newUserModal.hide();
                        clearForm();
                        await getUsers();                        
                }
                } catch (error) {
                    toastr.error(error.message);
                }
            });
        }
    }

    document.getElementById("search-form").addEventListener("submit", async function (event) {
        event.preventDefault();
        const searchTerm = document.getElementById('searchById').value.trim();
        await getUsers(searchTerm);
    });

    document.getElementById('searchById').addEventListener('input', debounce(async function () {
        const searchTerm = this.value.trim();
        await getUsers(searchTerm);
    }, 500));
    
        async function getUsers(searchTerm = '') {
            try {
                const users = await ajax('/api/users', {s: searchTerm}, 'GET')
                if (users) {
                    renderTable(users);
                    document.getElementById('selectAll').checked = false;
                }
            } catch (error) {
                toastr.error(error.message);
            }
        }

        async function updateUser(userId) {
            try {
                const updateUserModalElement = document.getElementById("updateUserModal");
                if (!updateUserModalElement) {
                    toastr.error("Update user modal not found.");
                    return;
                }

                const user = await ajax(`/api/users/${userId}`, {} , 'GET')

                document.getElementById("new-username").value = user.username || "";
                document.getElementById("new-email").value = user.email || "";

                const updateUserModal = new bootstrap.Modal(updateUserModalElement);
                updateUserModal.show();

                const updateBtn = document.getElementById("updateUserBtnForm");
                const updateUserBtnForm = updateBtn.cloneNode(true);
                updateBtn.replaceWith(updateUserBtnForm);

                updateUserBtnForm.addEventListener("click", async function () {
                    const username = document.getElementById("new-username").value.trim();
                    const email = document.getElementById("new-email").value.trim();
                    const password = document.getElementById("new-password").value.trim();
                    const confirmPassword = document.getElementById("new-confirm-password").value.trim();
                    const dataUpdate = { username, email };
                    const isValidUser = isValidUserAccountName(username, email);
                    if (isValidUser) {
                        toastr.warning(isValidUser);
                        return;
                    }
                    if ((password && !confirmPassword) || (!password && confirmPassword)) {
                        toastr.warning('Please fill out this field.');
                        (password ? document.getElementById('new-confirm-password') : document.getElementById('new-password')).focus();
                        return;
                    }

                     if (password && confirmPassword) {
                        if (!isValidPassword(password)) {
                            toastr.warning("Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.");
                            return;
                        }
                        if (password !== confirmPassword) {
                            toastr.warning('Passwords do not match.');
                            return;
                        }
                        dataUpdate.password = password;
                        dataUpdate.confirmPassword = confirmPassword;
                    }

                    try {
                        const result = await ajax(`/api/users/update/${userId}`, dataUpdate, 'PUT')
                        if (result) {
                            toastr.success("Updated");
                            updateUserModal.hide();
                            clearForm();
                            await getUsers();
                        }
                    } catch (error) {
                        toastr.error(error.message);
                    }
                });
        } catch (error) {
            toastr.error(error.message);
        }
    }
    // select all check box
    const selectAll = document.getElementById('selectAll');
    selectAll?.addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('.userCheckbox');
        checkboxes.forEach(checkbox => checkbox.checked = selectAll.checked);
    }); 

    document.getElementById('deleteManyBtn')?.addEventListener('click', deleteUsers); // delete users handling

    async function deleteUsers() {

        const selectedUsers = [...document.querySelectorAll(".userCheckbox:checked")].map(cb => cb.dataset.id);

        if (selectedUsers.length === 0) {
            toastr.warning("Please choose at least one user.");
            return;
        }

        if (selectedUsers.includes(currentUserId)) {
            toastr.warning("You cannot delete your own account.");
            return;
        }

        const confirmDelete = confirm(`Are you sure you want to delete ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}?`);
        if (!confirmDelete) return;
        try {
            const result = await ajax('/api/users/delete', { userIds: selectedUsers });
            if (result) {
                toastr.success('Deleted')
                await getUsers();
                selectAll.checked = false;
            }
        } catch (error) {
            toastr.error(error.message);
        }
    }
}

// render table
function renderTable(users = []) {
    const tableBody = document.getElementById('userTableBody');
    if (!Array.isArray(users) || users.length === 0) {
        tableBody.innerHTML = `
        <tr>
            <td colspan="5" class="t_center">No User records found.</td>
        </tr>
        `
        return;
    }
    tableBody.innerHTML = users.map(user =>
        `<tr>
            <td class="text-center"><input type="checkbox" class="userCheckbox" data-id="${user._id}"></td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>${new Date(user.updatedAt).toLocaleDateString()}</td>
            <td>
                <button class="updateUserBtn btn btn-warning btn-default" data-id="${user._id}">Update</button>
            </td>
        </tr>`
    ).join('');
}