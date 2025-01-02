// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { NON_PREMIUM_USER_RESTRICTIONS } from '../../constants/NON_PREMIUM_USER_RESTRICTIONS.ts';
import { logger } from '../../global/logger.ts';
import { DOCKER_CONTAINERS_DICTIONARY } from '../../pre_compiled/__docker_containers_definitions.ts';
import { isPremiumUser } from '../../utils/is_premium_user/is_premium_user.ts';

export class classNonPremiumUserRestrictions {
	private static restrictions = NON_PREMIUM_USER_RESTRICTIONS;
	public static isPremiumUser = isPremiumUser();

	public static getMaxNumberOfRunningProjects() {
		logger.debugFn(arguments);

		const maxNumberOfRunningProjects = this.restrictions.MAX_NUMBER_OF_RUNNING_PROJECTS;
		logger.debugVar('maxNumberOfRunningProjects', maxNumberOfRunningProjects);

		return maxNumberOfRunningProjects;
	}

	public static getMaxNumberOfProjectEnvironments() {
		logger.debugFn(arguments);

		const maxProjectEnvironments = this.restrictions.MAX_PROJECT_ENVIRONMENTS;
		logger.debugVar('maxProjectEnvironments', maxProjectEnvironments);

		return maxProjectEnvironments;
	}

	public static getMaxNumberOfProjectContainers() {
		logger.debugFn(arguments);

		const maxProjectContainers = this.restrictions.ALLOWED_NUMBER_OF_CONTAINERS;
		logger.debugVar('maxProjectContainers', maxProjectContainers);

		return maxProjectContainers;
	}

	public static isContainerTypeAllowedForNonPremiumUsers(
		container: typeof DOCKER_CONTAINERS_DICTIONARY[number],
	) {
		logger.debugFn(arguments);

		if (this.isPremiumUser) {
			logger.debug('User is premium, all containers are allowed');
			return true;
		}

		const allowedTypesOfContainersForNonPremiumUser =
			this.restrictions.ALLOWED_TYPES_OF_CONTAINERS;
		logger.debugVar(
			'allowedTypesOfContainersForNonPremiumUser',
			allowedTypesOfContainersForNonPremiumUser,
		);

		const isContainerAllowed = allowedTypesOfContainersForNonPremiumUser.includes(container);
		logger.debugVar('isContainerAllowed', isContainerAllowed);

		return isContainerAllowed;
	}

	public static isContainersCountAllowedForNonPremiumUsers(containersCount: number) {
		logger.debugFn(arguments);

		if (this.isPremiumUser) {
			logger.debug('User is premium, containers count is unlimited');
			return true;
		}

		const allowedNumberOfContainersForNonPremiumUser =
			this.restrictions.ALLOWED_NUMBER_OF_CONTAINERS;
		logger.debugVar(
			'allowedNumberOfContainersForNonPremiumUser',
			allowedNumberOfContainersForNonPremiumUser,
		);

		const isContainersCountAllowed =
			containersCount <= allowedNumberOfContainersForNonPremiumUser;
		logger.debugVar('isContainersCountAllowed', isContainersCountAllowed);

		return isContainersCountAllowed;
	}

	public static isEnvironmentsCountAllowedForNonPremiumUsers(environmentsCount: number) {
		logger.debugFn(arguments);

		if (this.isPremiumUser) {
			logger.debug('User is premium, environments count is unlimited');
			return true;
		}

		const allowedNumberOfEnvironmentsForNonPremiumUser =
			this.restrictions.MAX_PROJECT_ENVIRONMENTS;
		logger.debugVar(
			'allowedNumberOfEnvironmentsForNonPremiumUser',
			allowedNumberOfEnvironmentsForNonPremiumUser,
		);

		const isEnvironmentsCountAllowed =
			environmentsCount <= allowedNumberOfEnvironmentsForNonPremiumUser;
		logger.debugVar('isEnvironmentsCountAllowed', isEnvironmentsCountAllowed);

		return isEnvironmentsCountAllowed;
	}
}
