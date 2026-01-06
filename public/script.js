document.addEventListener('DOMContentLoaded', () => {
    // DOM元素
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    const userInfo = document.getElementById('user-info');
    const messageFormContainer = document.getElementById('message-form-container');
    const messageForm = document.getElementById('message-form');
    const messagesContainer = document.getElementById('messages-container');
    const adminControls = document.getElementById('admin-controls');
    const manageUsersBtn = document.getElementById('manage-users-btn');
    const userManagementModal = document.getElementById('user-management-modal');
    const usersList = document.getElementById('users-list');
    const closeButtons = document.querySelectorAll('.close-btn');

    // 检查用户是否已登录
    checkLoginStatus();

    // 模态框控制
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
        registerModal.style.display = 'none';
    });

    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'block';
        loginModal.style.display = 'none';
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            userManagementModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === registerModal) registerModal.style.display = 'none';
        if (e.target === userManagementModal) userManagementModal.style.display = 'none';
    });

    // 登录表单提交
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                loginModal.style.display = 'none';
                loginForm.reset();
                showMessage('登录成功！');
                checkLoginStatus();
            } else {
                loginError.textContent = data.error || '登录失败，请检查用户名和密码';
                loginError.style.display = 'block';
            }
        } catch (error) {
            loginError.textContent = '网络错误，请稍后重试';
            loginError.style.display = 'block';
        }
    });

    // 注册表单提交
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                registerModal.style.display = 'none';
                registerForm.reset();
                showMessage('注册成功，请登录！');
                loginModal.style.display = 'block';
            } else {
                registerError.textContent = data.error || '注册失败，请重试';
                registerError.style.display = 'block';
            }
        } catch (error) {
            registerError.textContent = '网络错误，请稍后重试';
            registerError.style.display = 'block';
        }
    });

    // 图片上传按钮
    const imageUploadBtn = document.getElementById('image-upload-btn');
    const messageImageInput = document.getElementById('message-image');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewText = document.getElementById('image-preview-text');
    let selectedImageData = null;

    imageUploadBtn.addEventListener('click', () => {
        messageImageInput.click();
    });

    messageImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // 检查文件类型
            if (!file.type.startsWith('image/')) {
                showMessage('请选择图片文件', 'error');
                return;
            }

            // 检查文件大小（限制为5MB）
            if (file.size > 5 * 1024 * 1024) {
                showMessage('图片大小不能超过5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                selectedImageData = event.target.result;
                imagePreview.innerHTML = `<img src="${selectedImageData}" alt="预览" style="max-width: 100%; max-height: 300px; border-radius: 8px;">`;
                imagePreviewText.textContent = file.name;
            };
            reader.readAsDataURL(file);
        }
    });

    // 留言表单提交
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('message-content').value;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, image: selectedImageData }),
                credentials: 'include'
            });

            if (response.ok) {
                messageForm.reset();
                imagePreview.innerHTML = '';
                imagePreviewText.textContent = '';
                selectedImageData = null;
                showMessage('留言成功！');
                loadMessages();
            } else {
                const data = await response.json();
                showMessage(data.error || '留言失败，请重试', 'error');
            }
        } catch (error) {
            showMessage('网络错误，请稍后重试', 'error');
        }
    });

    // 管理员操作 - 管理用户
    manageUsersBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/users', {
                credentials: 'include'
            });

            if (response.ok) {
                const users = await response.json();
                displayUsers(users);
                userManagementModal.style.display = 'block';
            } else {
                showMessage('获取用户列表失败', 'error');
            }
        } catch (error) {
            showMessage('网络错误，请稍后重试', 'error');
        }
    });

    // 显示用户列表
    function displayUsers(users) {
        usersList.innerHTML = '';
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <div>
                    <strong>${user.username}</strong> (${user.email})
                </div>
                <div>
                    <select class="role-select" data-user-id="${user.id}">
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>用户</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>管理员</option>
                    </select>
                </div>
            `;
            usersList.appendChild(userItem);
        });

        // 添加角色变更事件监听
        document.querySelectorAll('.role-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const userId = e.target.getAttribute('data-user-id');
                const newRole = e.target.value;

                try {
                    const response = await fetch(`/api/users/${userId}/role`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ role: newRole }),
                        credentials: 'include'
                    });

                    if (response.ok) {
                        showMessage('用户角色已更新');
                    } else {
                        showMessage('更新用户角色失败', 'error');
                    }
                } catch (error) {
                    showMessage('网络错误，请稍后重试', 'error');
                }
            });
        });
    }

    // 检查登录状态
    async function checkLoginStatus() {
        try {
            const response = await fetch('/api/me', {
                credentials: 'include'
            });

            if (response.ok) {
                const user = await response.json();
                updateUIForLoggedInUser(user);
                loadMessages();
            } else {
                updateUIForLoggedOutUser();
                loadMessages(); // 即使未登录也可以查看公开留言
            }
        } catch (error) {
            console.error('检查登录状态失败:', error);
        }
    }

    // 更新已登录用户的UI
    function updateUIForLoggedInUser(user) {
        // 保存用户信息到 localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));

        userInfo.innerHTML = `
            <div class="logged-in-user">
                <span>欢迎, ${user.username}</span>
                <button id="logout-btn" class="btn"><i class="fas fa-sign-out-alt"></i> 退出</button>
            </div>
        `;

        // 显示留言表单
        messageFormContainer.classList.remove('hidden');

        // 如果是管理员，显示管理员控制区
        if (user.role === 'admin') {
            adminControls.classList.remove('hidden');
        } else {
            adminControls.classList.add('hidden');
        }

        // 退出登录事件
        document.getElementById('logout-btn').addEventListener('click', async () => {
            try {
                const response = await fetch('/api/logout', {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    showMessage('已成功退出登录');
                    checkLoginStatus();
                }
            } catch (error) {
                console.error('退出登录失败:', error);
            }
        });
    }

    // 更新未登录用户的UI
    function updateUIForLoggedOutUser() {
        // 清除 localStorage 中的用户信息
        localStorage.removeItem('currentUser');

        userInfo.innerHTML = `
            <button id="login-btn" class="btn"><i class="fas fa-sign-in-alt"></i> 登录</button>
            <button id="register-btn" class="btn"><i class="fas fa-user-plus"></i> 注册</button>
        `;

        // 隐藏留言表单和管理员控制区
        messageFormContainer.classList.add('hidden');
        adminControls.classList.add('hidden');

        // 重新绑定登录和注册按钮事件
        document.getElementById('login-btn').addEventListener('click', () => {
            loginModal.style.display = 'block';
        });

        document.getElementById('register-btn').addEventListener('click', () => {
            registerModal.style.display = 'block';
        });
    }

    // 加载留言列表
    async function loadMessages() {
        try {
            const response = await fetch('/api/messages', {
                credentials: 'include'
            });

            if (response.ok) {
                const messages = await response.json();
                displayMessages(messages);
            } else {
                showMessage('加载留言失败', 'error');
            }
        } catch (error) {
            console.error('加载留言失败:', error);
        }
    }

    // 显示留言列表
    function displayMessages(messages) {
        messagesContainer.innerHTML = '';

        if (messages.length === 0) {
            messagesContainer.innerHTML = '<p>暂无留言</p>';
            return;
        }

        messages.forEach(message => {
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card';
            
            // 格式化日期
            const date = new Date(message.created_at);
            const formattedDate = date.toLocaleString();

            let actionsHtml = '';
            
            // 检查当前用户是否是管理员或留言作者
            const currentUser = getCurrentUser();
            if (currentUser && (currentUser.role === 'admin' || currentUser.id === message.user_id)) {
                actionsHtml = `
                    <div class="message-actions">
                        <button class="btn secondary-btn delete-message" data-message-id="${message.id}">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                `;
            }

            let imageHtml = '';
            if (message.image_url) {
                imageHtml = `<div class="message-image"><img src="${message.image_url}" alt="留言图片" loading="lazy"></div>`;
            }

            messageCard.innerHTML = `
                <div class="message-header">
                    <span><strong>${message.username}</strong></span>
                    <span>${formattedDate}</span>
                </div>
                <div class="message-content">${message.content}</div>
                ${imageHtml}
                ${actionsHtml}
            `;

            messagesContainer.appendChild(messageCard);
        });

        // 添加删除留言事件监听
        document.querySelectorAll('.delete-message').forEach(button => {
            button.addEventListener('click', async (e) => {
                const messageId = e.target.closest('.delete-message').getAttribute('data-message-id');
                await deleteMessage(messageId);
            });
        });
    }

    // 删除留言
    async function deleteMessage(messageId) {
        if (!confirm('确定要删除这条留言吗？')) {
            return;
        }

        try {
            const response = await fetch(`/api/messages/${messageId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                showMessage('留言已删除');
                loadMessages();
            } else {
                showMessage('删除留言失败', 'error');
            }
        } catch (error) {
            showMessage('网络错误，请稍后重试', 'error');
        }
    }

    // 获取当前用户信息
    function getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    // 显示消息提示
    function showMessage(text, type = 'success') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message-notification ${type}`;
        messageEl.textContent = text;
        
        // 添加到页面
        document.body.appendChild(messageEl);
        
        // 设置样式
        messageEl.style.position = 'fixed';
        messageEl.style.bottom = '20px';
        messageEl.style.right = '20px';
        messageEl.style.padding = '10px 20px';
        messageEl.style.borderRadius = '5px';
        messageEl.style.color = 'white';
        messageEl.style.zIndex = '1000';
        messageEl.style.opacity = '0';
        messageEl.style.transition = 'opacity 0.3s';
        
        if (type === 'success') {
            messageEl.style.backgroundColor = '#2ecc71';
        } else {
            messageEl.style.backgroundColor = '#e74c3c';
        }
        
        // 显示消息
        setTimeout(() => {
            messageEl.style.opacity = '1';
        }, 10);
        
        // 3秒后隐藏消息
        setTimeout(() => {
            messageEl.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(messageEl);
            }, 300);
        }, 3000);
    }
});
    