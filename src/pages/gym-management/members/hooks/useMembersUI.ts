import { useState, useCallback } from 'react';
import { Member } from '../../../../types/member.types';

interface UseMembersUIReturn {
	// Advanced filters state
	showAdvancedFilters: boolean;
	setShowAdvancedFilters: (show: boolean) => void;

	// Member profile side panel state
	showMemberProfile: boolean;
	setShowMemberProfile: (show: boolean) => void;
	selectedMember: Member | null;
	setSelectedMember: (member: Member | null) => void;

	// Actions
	handleViewProfile: (member: Member) => void;
	handleCloseProfile: () => void;
	handleOpenAdvancedFilters: () => void;
	handleCloseAdvancedFilters: () => void;
}

export const useMembersUI = (): UseMembersUIReturn => {
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
	const [showMemberProfile, setShowMemberProfile] = useState(false);
	const [selectedMember, setSelectedMember] = useState<Member | null>(null);

	// Handle opening member profile
	const handleViewProfile = useCallback((member: Member) => {
		setSelectedMember(member);
		setShowMemberProfile(true);
	}, []);

	// Handle closing member profile
	const handleCloseProfile = useCallback(() => {
		setShowMemberProfile(false);
		setSelectedMember(null);
	}, []);

	// Handle opening advanced filters
	const handleOpenAdvancedFilters = useCallback(() => {
		setShowAdvancedFilters(true);
	}, []);

	// Handle closing advanced filters
	const handleCloseAdvancedFilters = useCallback(() => {
		setShowAdvancedFilters(false);
	}, []);

	return {
		showAdvancedFilters,
		setShowAdvancedFilters,
		showMemberProfile,
		setShowMemberProfile,
		selectedMember,
		setSelectedMember,
		handleViewProfile,
		handleCloseProfile,
		handleOpenAdvancedFilters,
		handleCloseAdvancedFilters,
	};
};
