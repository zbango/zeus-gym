export interface ILang {
	[key: string]: {
		text: string;
		lng: 'en' | 'es';
		icon: string;
	};
}

const LANG: ILang = {
	ES: {
		text: 'Español',
		lng: 'es',
		icon: 'CustomSpain',
	},
	EN: {
		text: 'English',
		lng: 'en',
		icon: 'CustomUsa',
	},
};

export const getLangWithKey = (key: ILang['key']['lng']): ILang['key'] => {
	// @ts-ignore
	return LANG[Object.keys(LANG).filter((f) => key.includes(LANG[f].lng))];
};

export default LANG;
