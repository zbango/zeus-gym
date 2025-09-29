import React, { useContext, useMemo } from 'react';
import ThemeContext from '../../contexts/themeContext';
import AuthContext from '../../contexts/authContext';
import Aside, { AsideBody, AsideFoot, AsideHead } from '../../layout/Aside/Aside';
import Brand from '../../layout/Brand/Brand';
import Navigation, { NavigationLine } from '../../layout/Navigation/Navigation';
import { generateGymMenu } from '../../menu';
import User from '../../layout/User/User';

const SidebarNavigation = () => {
	const { asideStatus, setAsideStatus } = useContext(ThemeContext);
	const { gymUser, isGymAuthenticated } = useContext(AuthContext);

	// Generate menu based on user permissions
	const gymMenu = useMemo(() => {
		if (!isGymAuthenticated || !gymUser) {
			return {};
		}

		return generateGymMenu(gymUser.role, gymUser.permissions);
	}, [isGymAuthenticated, gymUser]);

	return (
		<Aside>
			<AsideHead>
				<Brand asideStatus={asideStatus} setAsideStatus={setAsideStatus} />
			</AsideHead>
			<AsideBody>
				<>
					<Navigation menu={gymMenu} id='aside-pages' />
					<NavigationLine />
				</>
			</AsideBody>
			<AsideFoot>
				<User />
			</AsideFoot>
		</Aside>
	);
};

export default SidebarNavigation;
