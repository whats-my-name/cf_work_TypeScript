// 页面加载完成后获取用户列表
document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    setupFormSubmit();
});

// 获取用户列表并展示
async function fetchUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        const usersContainer = document.getElementById('users');
        usersContainer.innerHTML = '';
        
        if (users.length === 0) {
            usersContainer.innerHTML = '<p>No users found.</p>';
            return;
        }
        
        users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            userCard.innerHTML = `
                <h3>${user.name}</h3>
                <p>Email: ${user.email}</p>
                <p>Joined: ${new Date(user.created_at).toLocaleDateString()}</p>
            `;
            usersContainer.appendChild(userCard);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// 设置表单提交事件
function setupFormSubmit() {
    const form = document.getElementById('addUserForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });
            
            if (response.ok) {
                // 重置表单并刷新用户列表
                form.reset();
                fetchUsers();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Failed to add user');
        }
    });
}
