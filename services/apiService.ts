// apiService.ts
export const fetchProjectsAndTasks = async (token: string) => {
  try {
    const response = await fetch('https://kronos.tarento.com/api/v1/user/getAllProjectTask', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Authorization': token,
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.responseData;
  } catch (err) {
    console.error('Error fetching projects and tasks:', err);
    throw err;
  }
};

export const fetchData = async (token: string, startDate: string, endDate: string) => {
  try {
    const response = await fetch('https://kronos.tarento.com/api/v1/user/web/getTimeOverViewWeb', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Authorization': token,
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startDate, endDate }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const fetchedData = await response.json();
    console.log('responseData data:', fetchedData);

    return fetchedData.responseData;
  } catch (err) {
    console.error('Error fetching data:', err);
    throw err;
  }
};

export const saveData = async (token: string,payload:any) => {
  try {
    const response = await fetch('https://kronos.tarento.com/api/v1/user/saveTaskTimeForProject', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();

    return responseData;
  } catch (err) {
    console.error('Error fetching data:', err);
    throw err;
  }
};

export const updateData = async (token: string,payload:any) => {
  try {
    const response = await fetch('https://kronos.tarento.com/api/v1/user/updateTaskTimeForProject', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();

    return responseData;
  } catch (err) {
    console.error('Error fetching data:', err);
    throw err;
  }
};