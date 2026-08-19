export const rolePermissions = {
  'Fabrika Müdürü': ['dashboard', 'map', 'production', 'machines', 'analytics', 'stops', 'molds', 'quality', 'users'],
  'Kalite Mühendisi': ['dashboard', 'quality', 'stops', 'analytics', 'molds'],
  'Operatör': ['production', 'machines', 'stops', 'quality'],
  'Yazılım Stajyeri': ['dashboard', 'map', 'production', 'machines', 'analytics', 'stops', 'molds', 'quality', 'users'],
  'Süpervizör': ['dashboard', 'map', 'production', 'machines', 'analytics', 'stops', 'molds', 'quality', 'users'],
};

export const canEdit = (role) => {
  return ['Fabrika Müdürü', 'Yazılım Stajyeri', 'Kalite Mühendisi', 'Süpervizör'].includes(role);
};
