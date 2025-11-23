export const summaryPageTopMenu = {
	intro: { id: 'intro', text: 'Intro', path: '#intro', icon: 'Vrpano', subMenu: null },
	bootstrap: {
		id: 'bootstrap',
		text: 'Bootstrap Components',
		path: '#bootstrap',
		icon: 'BootstrapFill',
		subMenu: null,
	},
	storybook: {
		id: 'storybook',
		text: 'Storybook',
		path: '#storybook',
		icon: 'CustomStorybook',
		subMenu: null,
	},
	formik: {
		id: 'formik',
		text: 'Formik',
		path: '#formik',
		icon: 'CheckBox',
		subMenu: null,
	},
	apex: {
		id: 'apex',
		text: 'Apex Charts',
		path: '#apex',
		icon: 'AreaChart',
		subMenu: null,
	},
};

export const dashboardPagesMenu = {
	dashboard: {
		id: 'dashboard',
		text: 'Dashboard',
		path: '/',
		icon: 'Dashboard',
		subMenu: null,
	},
	dashboardProject: {
		id: 'dashboardProject',
		text: 'Dashboard Projects',
		path: 'project-management/list',
		icon: 'AutoStories',
		notification: true,
		subMenu: null,
	},
	dashboardBooking: {
		id: 'dashboard-booking',
		text: 'Dashboard Booking',
		path: 'dashboard-booking',
		icon: 'emoji_transportation',
		subMenu: null,
	},
	crmDashboard: {
		id: 'crmDashboard',
		text: 'CRM Dashboard',
		path: 'crm/dashboard',
		icon: 'RecentActors',
	},
	summary: {
		id: 'summary',
		text: 'Summary',
		path: 'summary',
		icon: 'sticky_note_2',
		subMenu: null,
	},
};

export const demoPagesMenu = {
	gymManagement: {
		id: 'gymManagement',
		text: 'Gym Management',
		icon: 'FitnessCenter',
	},
	gymDashboard: {
		id: 'gymDashboard',
		text: 'Dashboard',
		path: 'gym-management/dashboard',
		icon: 'Dashboard',
	},
	gymMembers: {
		id: 'gymMembers',
		text: 'Members',
		path: 'gym-management/members',
		icon: 'Group',
		subMenu: {
			membersList: {
				id: 'membersList',
				text: 'All Members',
				path: 'gym-management/members/list',
				icon: 'PersonSearch',
			},
			// addMember: {
			// 	id: 'addMember',
			// 	text: 'Add Member',
			// 	path: 'gym-management/members/add',
			// 	icon: 'PersonAdd',
			// },
		},
	},
	gymMemberships: {
		id: 'gymMemberships',
		text: 'Memberships',
		path: 'gym-management/memberships',
		icon: 'CardMembership',
		subMenu: {
			membershipPlans: {
				id: 'membershipPlans',
				text: 'Plans',
				path: 'gym-management/memberships/plans',
				icon: 'Assignment',
			},
			payments: {
				id: 'payments',
				text: 'Payments',
				path: 'gym-management/memberships/payments',
				icon: 'Payment',
			},
			renewals: {
				id: 'renewals',
				text: 'Renewals',
				path: 'gym-management/memberships/renewals',
				icon: 'Autorenew',
			},
		},
	},
	gymStore: {
		id: 'gymStore',
		text: 'Store',
		path: 'gym-management/store',
		icon: 'Store',
		subMenu: {
			products: {
				id: 'products',
				text: 'Products',
				path: 'gym-management/store/products',
				icon: 'Inventory',
			},
			sales: {
				id: 'sales',
				text: 'Sales',
				path: 'gym-management/store/sales',
				icon: 'PointOfSale',
			},
			// inventory: {
			// 	id: 'inventory',
			// 	text: 'Inventory',
			// 	path: 'gym-management/store/inventory',
			// 	icon: 'Warehouse',
			// },
		},
	},
	gymUsers: {
		id: 'gymUsers',
		text: 'User Management',
		path: 'gym-management/users',
		icon: 'SupervisorAccount',
	},
	/* 	gymSettings: {
		id: 'gymSettings',
		text: 'Settings',
		path: 'gym-management/settings',
		icon: 'Settings',
	},
	gymQRScanner: {
		id: 'gymQRScanner',
		text: 'QR Scanner',
		path: 'gym-management/qr-scanner',
		icon: 'QrCode',
	}, */
};

export const pageLayoutTypesPagesMenu = {
	layoutTypes: {
		id: 'layoutTypes',
		text: 'Page Layout Types',
	},
	blank: {
		id: 'blank',
		text: 'Blank',
		path: 'page-layouts/blank',
		icon: 'check_box_outline_blank ',
	},
	pageLayout: {
		id: 'pageLayout',
		text: 'Page Layout',
		path: 'page-layouts',
		icon: 'BackupTable',
		subMenu: {
			headerAndSubheader: {
				id: 'headerAndSubheader',
				text: 'Header & Subheader',
				path: 'page-layouts/header-and-subheader',
				icon: 'ViewAgenda',
			},
			onlyHeader: {
				id: 'onlyHeader',
				text: 'Only Header',
				path: 'page-layouts/only-header',
				icon: 'ViewStream',
			},
			onlySubheader: {
				id: 'onlySubheader',
				text: 'Only Subheader',
				path: 'page-layouts/only-subheader',
				icon: 'ViewStream',
			},
			onlyContent: {
				id: 'onlyContent',
				text: 'Only Content',
				path: 'page-layouts/only-content',
				icon: 'WebAsset',
			},
		},
	},
	asideTypes: {
		id: 'asideTypes',
		text: 'Aside Types',
		path: 'aside-types',
		icon: 'Vertical Split',
		subMenu: {
			defaultAside: {
				id: 'defaultAside',
				text: 'Default Aside',
				path: 'aside-types/default-aside',
				icon: 'ViewQuilt',
			},
			minimizeAside: {
				id: 'minimizeAside',
				text: 'Minimize Aside',
				path: 'aside-types/minimize-aside',
				icon: 'View Compact',
			},
		},
	},
};

export const gettingStartedPagesMenu = {
	gettingStarted: {
		id: 'gettingStarted',
		text: 'Getting Started',
		path: 'getting-started',
		icon: 'Book',
		subMenu: {
			installation: {
				id: 'installation',
				text: 'Installation',
				path: 'getting-started/installation',
				icon: 'BuildCircle',
			},
			dev: {
				id: 'dev',
				text: 'Development',
				path: 'getting-started/development',
				icon: 'DirectionsRun',
			},
			folderStructure: {
				id: 'folderStructure',
				text: 'Folder Structure',
				path: 'getting-started/folder-structure',
				icon: 'SnippetFolder',
			},
			bootstrapVariables: {
				id: 'bootstrapVariables',
				text: 'Bootstrap Variables',
				path: 'getting-started/bootstrap-variables',
				icon: 'SnippetFolder',
			},
			projectStructure: {
				id: 'projectStructure',
				text: 'Project Structure',
				path: 'getting-started/project-structure',
				icon: 'SnippetFolder',
			},
		},
	},
	routes: {
		id: 'routes',
		text: 'Routes & Pages',
		path: 'routes',
		icon: 'AltRoute',
		subMenu: {
			router: {
				id: 'router',
				text: 'Router',
				path: 'routes/router',
				icon: 'Router',
			},
		},
	},
};

export const componentPagesMenu = {
	bootstrap: {
		id: 'bootstrap',
		text: 'Bootstrap',
		icon: 'Extension',
	},
	components: {
		id: 'components',
		text: 'Component',
		path: 'components',
		icon: 'Extension',
		notification: 'success',
		subMenu: {
			accordion: {
				id: 'accordion',
				text: 'Accordion',
				path: 'components/accordion',
				icon: 'ViewDay',
			},
			alert: {
				id: 'alert',
				text: 'Alert',
				path: 'components/alert',
				icon: 'Announcement',
			},
			badge: {
				id: 'badge',
				text: 'Badge',
				path: 'components/badge',
				icon: 'Vibration',
			},
			breadcrumb: {
				id: 'breadcrumb',
				text: 'Breadcrumb',
				path: 'components/breadcrumb',
				icon: 'AddRoad',
			},
			button: {
				id: 'button',
				text: 'Button',
				path: 'components/button',
				icon: 'SmartButton',
			},
			buttonGroup: {
				id: 'buttonGroup',
				text: 'Button Group',
				path: 'components/button-group',
				icon: 'Splitscreen',
			},
			card: {
				id: 'card',
				text: 'Card',
				path: 'components/card',
				icon: 'Crop32',
			},
			carousel: {
				id: 'carousel',
				text: 'Carousel',
				path: 'components/carousel',
				icon: 'RecentActors',
			},
			// Close
			collapse: {
				id: 'collapse',
				text: 'Collapse',
				path: 'components/collapse',
				icon: 'UnfoldLess',
			},
			dropdowns: {
				id: 'dropdowns',
				text: 'Dropdowns',
				path: 'components/dropdowns',
				icon: 'Inventory',
			},
			listGroup: {
				id: 'listGroup',
				text: 'List Group',
				path: 'components/list-group',
				icon: 'ListAlt',
			},
			modal: {
				id: 'modal',
				text: 'Modal',
				path: 'components/modal',
				icon: 'PictureInPicture',
			},
			navsTabs: {
				id: 'navsTabs',
				text: 'Navs & Tabs',
				path: 'components/navs-and-tabs',
				icon: 'PivotTableChart',
			},
			// Navbar
			offcanvas: {
				id: 'offcanvas',
				text: 'Offcanvas',
				path: 'components/offcanvas',
				icon: 'VerticalSplit',
			},
			pagination: {
				id: 'pagination',
				text: 'Pagination',
				path: 'components/pagination',
				icon: 'Money',
			},
			popovers: {
				id: 'popovers',
				text: 'Popovers',
				path: 'components/popovers',
				icon: 'Assistant',
			},
			progress: {
				id: 'progress',
				text: 'Progress',
				path: 'components/progress',
				icon: 'HourglassTop',
			},
			scrollspy: {
				id: 'scrollspy',
				text: 'Scrollspy',
				path: 'components/scrollspy',
				icon: 'KeyboardHide',
			},
			spinners: {
				id: 'spinners',
				text: 'Spinners',
				path: 'components/spinners',
				icon: 'RotateRight',
			},
			table: {
				id: 'table',
				text: 'Table',
				path: 'components/table',
				icon: 'TableChart',
			},
			toasts: {
				id: 'toasts',
				text: 'Toasts',
				path: 'components/toasts',
				icon: 'RotateRight',
			},
			tooltip: {
				id: 'tooltip',
				text: 'Tooltip',
				path: 'components/tooltip',
				icon: 'Assistant',
			},
		},
	},
	forms: {
		id: 'forms',
		text: 'Forms',
		path: 'forms',
		icon: 'CheckBox',
		notification: 'success',
		subMenu: {
			formGroup: {
				id: 'formGroup',
				text: 'Form Group',
				path: 'forms/form-group',
				icon: 'Source',
			},
			formControl: {
				id: 'formControl',
				text: 'Form Controls',
				path: 'forms/form-controls',
				icon: 'Create',
			},
			select: {
				id: 'select',
				text: 'Select',
				path: 'forms/select',
				icon: 'Checklist',
			},
			checksAndRadio: {
				id: 'checksAndRadio',
				text: 'Checks & Radio',
				path: 'forms/checks-and-radio',
				icon: 'CheckBox',
			},
			range: {
				id: 'range',
				text: 'Range',
				path: 'forms/range',
				icon: 'HdrStrong',
			},
			inputGroup: {
				id: 'inputGroup',
				text: 'Input Group',
				path: 'forms/input-group',
				icon: 'PowerInput',
			},
			validation: {
				id: 'validation',
				text: 'Validation',
				path: 'forms/validation',
				icon: 'VerifiedUser',
			},
			wizard: {
				id: 'wizard',
				text: 'Wizard',
				path: 'forms/wizard',
				icon: 'LinearScale',
			},
		},
	},
	content: {
		id: 'content',
		text: 'Content',
		path: 'content',
		icon: 'format_size',
		subMenu: {
			typography: {
				id: 'typography',
				text: 'Typography',
				path: 'content/typography',
				icon: 'text_fields',
			},
			images: {
				id: 'images',
				text: 'Images',
				path: 'content/images',
				icon: 'Image ',
			},
			tables: {
				id: 'tables',
				text: 'Tables',
				path: 'content/tables',
				icon: 'table_chart',
			},
			figures: {
				id: 'figures',
				text: 'Figures',
				path: 'content/figures',
				icon: 'Photo Library ',
			},
		},
	},
	utilities: {
		id: 'utilities',
		text: 'Utilities',
		path: 'utilities',
		icon: 'Support',
		subMenu: {
			api: {
				id: 'api',
				text: 'API',
				path: 'utilities/api',
				icon: 'Api',
			},
			background: {
				id: 'background',
				text: 'Background',
				path: 'utilities/background',
				icon: 'FormatColorFill',
			},
			borders: {
				id: 'borders',
				text: 'Borders',
				path: 'utilities/borders',
				icon: 'BorderStyle',
			},
			colors: {
				id: 'colors',
				text: 'Colors',
				path: 'utilities/colors',
				icon: 'InvertColors',
			},
			display: {
				id: 'display',
				text: 'Display',
				path: 'utilities/display',
				icon: 'LaptopMac',
			},
			flex: {
				id: 'flex',
				text: 'Flex',
				path: 'utilities/flex',
				icon: 'SettingsOverscan',
			},
			float: {
				id: 'float',
				text: 'Float',
				path: 'utilities/float',
				icon: 'ViewArray',
			},
			interactions: {
				id: 'interactions',
				text: 'Interactions',
				path: 'utilities/interactions',
				icon: 'Mouse',
			},
			overflow: {
				id: 'overflow',
				text: 'Overflow',
				path: 'utilities/overflow',
				icon: 'TableRows',
			},
			position: {
				id: 'position',
				text: 'Position',
				path: 'utilities/position',
				icon: 'Adjust',
			},
			shadows: {
				id: 'shadows',
				text: 'Shadows',
				path: 'utilities/shadows',
				icon: 'ContentCopy',
			},
			sizing: {
				id: 'sizing',
				text: 'Sizing',
				path: 'utilities/sizing',
				icon: 'Straighten',
			},
			spacing: {
				id: 'spacing',
				text: 'Spacing',
				path: 'utilities/spacing',
				icon: 'SpaceBar',
			},
			text: {
				id: 'text',
				text: 'Text',
				path: 'utilities/text',
				icon: 'TextFields',
			},
			verticalAlign: {
				id: 'vertical-align',
				text: 'Vertical Align',
				path: 'utilities/vertical-align',
				icon: 'VerticalAlignCenter',
			},
			visibility: {
				id: 'visibility',
				text: 'Visibility',
				path: 'utilities/visibility',
				icon: 'Visibility',
			},
		},
	},
	extra: {
		id: 'extra',
		text: 'Extra Library',
		icon: 'Extension',
		path: undefined,
	},
	icons: {
		id: 'icons',
		text: 'Icons',
		path: 'icons',
		icon: 'Grain',
		notification: 'success',
		subMenu: {
			icon: {
				id: 'icon',
				text: 'Icon',
				path: 'icons/icon',
				icon: 'Lightbulb',
			},
			material: {
				id: 'material',
				text: 'Material',
				path: 'icons/material',
				icon: 'Verified',
			},
		},
	},
	charts: {
		id: 'charts',
		text: 'Charts',
		path: 'charts',
		icon: 'AreaChart',
		notification: 'success',
		subMenu: {
			chartsUsage: {
				id: 'chartsUsage',
				text: 'General Usage',
				path: 'charts/general-usage',
				icon: 'Description',
			},
			chartsSparkline: {
				id: 'chartsSparkline',
				text: 'Sparkline',
				path: 'charts/sparkline',
				icon: 'AddChart',
			},
			chartsLine: {
				id: 'chartsLine',
				text: 'Line',
				path: 'charts/line',
				icon: 'ShowChart',
			},
			chartsArea: {
				id: 'chartsArea',
				text: 'Area',
				path: 'charts/area',
				icon: 'AreaChart',
			},
			chartsColumn: {
				id: 'chartsColumn',
				text: 'Column',
				path: 'charts/column',
				icon: 'BarChart',
			},
			chartsBar: {
				id: 'chartsBar',
				text: 'Bar',
				path: 'charts/bar',
				icon: 'StackedBarChart',
			},
			chartsMixed: {
				id: 'chartsMixed',
				text: 'Mixed',
				path: 'charts/mixed',
				icon: 'MultilineChart',
			},
			chartsTimeline: {
				id: 'chartsTimeline',
				text: 'Timeline',
				path: 'charts/timeline',
				icon: 'WaterfallChart',
			},
			chartsCandleStick: {
				id: 'chartsCandleStick',
				text: 'Candlestick',
				path: 'charts/candlestick',
				icon: 'Cake',
			},
			chartsBoxWhisker: {
				id: 'chartsBoxWhisker',
				text: 'Box Whisker',
				path: 'charts/box-whisker',
				icon: 'SportsMma',
			},
			chartsPieDonut: {
				id: 'chartsPieDonut',
				text: 'Pie & Donut',
				path: 'charts/pie-donut',
				icon: 'PieChart',
			},
			chartsRadar: {
				id: 'chartsRadar',
				text: 'Radar',
				path: 'charts/radar',
				icon: 'BrightnessLow',
			},
			chartsPolar: {
				id: 'chartsPolar',
				text: 'Polar',
				path: 'charts/polar',
				icon: 'TrackChanges',
			},
			chartsRadialBar: {
				id: 'chartsRadialBar',
				text: 'Radial Bar',
				path: 'charts/radial-bar',
				icon: 'DonutLarge',
			},
			chartsBubble: {
				id: 'chartsBubble',
				text: 'Bubble',
				path: 'charts/bubble',
				icon: 'BubbleChart',
			},
			chartsScatter: {
				id: 'chartsScatter',
				text: 'Scatter',
				path: 'charts/scatter',
				icon: 'ScatterPlot',
			},
			chartsHeatMap: {
				id: 'chartsHeatMap',
				text: 'Heat Map',
				path: 'charts/heat-map',
				icon: 'GridOn',
			},
			chartsTreeMap: {
				id: 'chartsTreeMap',
				text: 'Tree Map',
				path: 'charts/tree-map',
				icon: 'AccountTree',
			},
		},
	},
	notification: {
		id: 'notification',
		text: 'Notification',
		path: 'notifications',
		icon: 'NotificationsNone',
	},
	hooks: {
		id: 'hooks',
		text: 'Hooks',
		path: 'hooks',
		icon: 'Anchor',
	},
};

export const productsExampleMenu = {
	companyA: { id: 'companyA', text: 'Company A', path: 'grid-pages/products', subMenu: null },
	companyB: { id: 'companyB', text: 'Company B', path: '/', subMenu: null },
	companyC: { id: 'companyC', text: 'Company C', path: '/', subMenu: null },
	companyD: { id: 'companyD', text: 'Company D', path: '/', subMenu: null },
};

// Menu permission mapping
const menuPermissions: Record<string, { roles: string[]; permissions: string[] }> = {
	gymDashboard: { roles: ['admin', 'staff'], permissions: [] },
	gymMembers: { roles: ['admin', 'staff'], permissions: [] },
	membersList: { roles: ['admin', 'staff'], permissions: [] },
	addMember: { roles: ['admin', 'staff'], permissions: ['members.create'] },
	gymMemberships: { roles: ['admin', 'staff'], permissions: [] },
	membershipPlans: { roles: ['admin'], permissions: [] },
	payments: { roles: ['admin', 'staff'], permissions: ['payments.create'] },
	renewals: { roles: ['admin', 'staff'], permissions: ['renewals.create'] },
	gymStore: { roles: ['admin', 'staff'], permissions: [] },
	products: { roles: ['admin', 'staff'], permissions: ['store.create'] },
	sales: { roles: ['admin', 'staff'], permissions: ['store.create'] },
	inventory: { roles: ['admin'], permissions: ['store.edit'] },
	gymUsers: { roles: ['admin'], permissions: [] },
	gymSettings: { roles: ['admin', 'staff'], permissions: ['settings.view'] },
	gymQRScanner: { roles: ['admin', 'staff'], permissions: [] },
};

// Function to check if user has access to a menu item
const hasMenuAccess = (menuId: string, userRole: string, userPermissions: string[]): boolean => {
	const permission = menuPermissions[menuId];
	if (!permission) return true; // If no permission defined, allow access

	// Check role requirement
	if (permission.roles.length > 0 && !permission.roles.includes(userRole)) {
		return false;
	}

	// Check specific permissions
	if (permission.permissions.length > 0) {
		return permission.permissions.some(
			(perm) => userPermissions.includes(perm) || userPermissions.includes('all'),
		);
	}

	return true;
};

// Function to filter menu items based on user permissions
const filterMenuItems = (menuItems: any, userRole: string, userPermissions: string[]): any => {
	const filtered: any = {};

	Object.keys(menuItems).forEach((key) => {
		const item = menuItems[key];

		// Check if main menu item has access
		if (hasMenuAccess(key, userRole, userPermissions)) {
			// If item has subMenu, filter submenu items
			if (item.subMenu) {
				const filteredSubMenu: any = {};
				Object.keys(item.subMenu).forEach((subKey) => {
					if (hasMenuAccess(subKey, userRole, userPermissions)) {
						filteredSubMenu[subKey] = item.subMenu[subKey];
					}
				});

				// Only include main item if it has accessible submenu items or no submenu requirement
				if (Object.keys(filteredSubMenu).length > 0) {
					filtered[key] = {
						...item,
						subMenu: filteredSubMenu,
					};
				}
			} else {
				// No submenu, include if main item has access
				filtered[key] = item;
			}
		}
	});

	return filtered;
};

// Function to generate gym menu based on user permissions
export const generateGymMenu = (userRole: string, userPermissions: string[] = []) => {
	return filterMenuItems(demoPagesMenu, userRole, userPermissions);
};
