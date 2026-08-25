import {
  faPhoneSlash,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons';
import {
  Al,
  Al2,
  Ch,
  Ch2,
  Help,
  Help2,
  La,
  La2,
} from '../assets';

export const dashboardMenuItems = [
  {
    name: 'Dashboard',
    route: '/dashboard',
    dashboardState: 'Dashboard',
    icon: La,
    activeIcon: La2,
  },
  {
    name: 'Emergencies',
    route: '/dashboard',
    dashboardState: 'Emergencies',
    icon: Al,
    activeIcon: Al2,
  },
  {
    name: 'Missed Cases',
    route: '/missed-cases',
    dashboardState: 'Missed Cases',
    iconComponent: faPhoneSlash,
    activeIconComponent: faPhoneSlash,
    allowedUserTypes: ['responder_company'],
  },
  {
    name: 'Reports & Analysis',
    route: '/dashboard',
    dashboardState: 'Reports & Analysis',
    icon: Ch,
    activeIcon: Ch2,
  },
  {
    name: 'Responders',
    route: '/dashboard',
    dashboardState: 'Responders',
    iconComponent: faUserShield,
    activeIconComponent: faUserShield,
  },
];

export const helpCenterItem = {
  name: 'Help Center',
  route: '/dashboard',
  dashboardState: 'Help Center',
  icon: Help2,
  activeIcon: Help,
};

export const getDashboardMenuNameFromLocation = (location) => {
  if (location?.pathname === '/missed-cases') {
    return 'Missed Cases';
  }

  return location?.state?.activeMenu || 'Dashboard';
};

export const getDashboardMenuNavigationTarget = (menuName) => {
  const selectedMenuItem =
    dashboardMenuItems.find((item) => item.name === menuName) ||
    (helpCenterItem.name === menuName ? helpCenterItem : null);

  if (!selectedMenuItem) {
    return {
      pathname: '/dashboard',
      state: { activeMenu: 'Dashboard' },
    };
  }

  if (selectedMenuItem.route === '/missed-cases') {
    return {
      pathname: selectedMenuItem.route,
    };
  }

  return {
    pathname: selectedMenuItem.route,
    state: { activeMenu: selectedMenuItem.dashboardState || selectedMenuItem.name },
  };
};
