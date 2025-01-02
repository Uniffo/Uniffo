// Copyright 2023-2025 Maciej Koralewski. All rights reserved. EULA license.

import { classEtcHostsEditor } from '../classes/etc_hosts_editor/etc_hosts_editor.ts';

export const etcHostsManager = new classEtcHostsEditor({ path: '/etc/hosts' });