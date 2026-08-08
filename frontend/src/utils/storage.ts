export const getUserStorageKey = (baseKey: string, userEmail?: string | null): string => {
  if (!userEmail) {
    const savedUser = localStorage.getItem('affordai_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        userEmail = u.email;
      } catch (e) {}
    }
  }
  const cleanEmail = (userEmail || 'default').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${baseKey}_${cleanEmail}`;
};
