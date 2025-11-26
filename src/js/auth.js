// เก็บข้อมูล user ลง localStorage
export const login = (userData) => {
  localStorage.setItem('username', JSON.stringify(userData));
    // console.log("userData);
};

// export const login = (userData) => {
//   const safeUser = {
//     id: userData.id,
//     first_name: userData.first_name,
//     last_name: userData.last_name, 
//     role: userData.role,
//   };

//   localStorage.setItem('username', JSON.stringify(safeUser));
//   console.log("✅ User saved safely in localStorage:", safeUser);
// };


// เช็คว่ามี user login อยู่หรือไม่

export const isAuthenticated = () => {
  return !!localStorage.getItem('username');
};

export const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('username'));
  return user?.id || null;
};

export const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('username'));
    return user?.role || null;
  } catch (e) {
    console.error('Invalid user data in localStorage:', e);
    return null;
  }
};

export const getFullName = () => {
  const user = JSON.parse(localStorage.getItem('username'));
  if (!user) return '';
  return `${user.first_name} ${user.last_name}`;
};

export const logout = () => {
    localStorage.clear();
};