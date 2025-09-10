import React, { useContext } from 'react';
import ThemeContext from '../../contexts/themeContext';
import Aside, { AsideBody, AsideFoot, AsideHead } from '../../layout/Aside/Aside';
import Brand from '../../layout/Brand/Brand';
import Navigation, { NavigationLine } from '../../layout/Navigation/Navigation';
import { demoPagesMenu } from '../../menu';
import User from '../../layout/User/User';

const SidebarNavigation = () => {
	const { asideStatus, setAsideStatus } = useContext(ThemeContext);

	return (
		<Aside>
			<AsideHead>
				<Brand asideStatus={asideStatus} setAsideStatus={setAsideStatus} />
			</AsideHead>
			<AsideBody>
				<>
					<Navigation menu={demoPagesMenu} id='aside-pages' />
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
