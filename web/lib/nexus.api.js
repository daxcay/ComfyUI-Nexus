const BASE_URL = 'nexus';

async function fetchWithHandling(url, options = {}) {
    try {
//        console.info("Calling: ", url)
        const response = await fetch(url, options);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }
        return data;
    } catch (error) {
        console.error(`Fetch error: ${error.message}`);
        return { error: error.message };
    }
}

export async function getUserSpecificWorkflows(userId) {
    const url = `${BASE_URL}/workflows`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
    };
    return await fetchWithHandling(url, options);
}

export async function getUserSpecificWorkflow(userId, workflowId) {
    const url = `${BASE_URL}/workflows/${workflowId}`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
    };
    return await fetchWithHandling(url, options);
}

export async function getUserSpecificWorkflowsMeta(userId) {
    const url = `${BASE_URL}/workflows/meta`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
    };
    return await fetchWithHandling(url, options);
}

export async function postWorkflow(userId, workflowData) {
    const url = `${BASE_URL}/workflow`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...workflowData }),
    };
    return await fetchWithHandling(url, options);
}

export async function postBackupWorkflow(userId, workflowData) {
    const url = `${BASE_URL}/workflow/backup`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...workflowData }),
    };
    return await fetchWithHandling(url, options);
}

export async function getLatestWorkflow() {
    const url = `${BASE_URL}/workflow`;
    return await fetchWithHandling(url);
}

export async function getPermissionById(userId) {
    const url = `${BASE_URL}/permission/${userId}`;
    return await fetchWithHandling(url);
}

export async function postPermissionById(userId, adminId, data, token) {
    const url = `${BASE_URL}/permission/${userId}`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify({ admin_id: adminId, data }),
    };
    return await fetchWithHandling(url, options);
}

export async function nexusLogin(uuid, account, password) {
    const url = `${BASE_URL}/login`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, account, password }),
    };
    return await fetchWithHandling(url, options);
}

export async function nexusVerify(token) {
    const url = `${BASE_URL}/verify`;
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
    };
    return await fetchWithHandling(url, options);
}

export async function getNameById(userId) {
    const url = `${BASE_URL}/name/${userId}`;
    return await fetchWithHandling(url);
}

