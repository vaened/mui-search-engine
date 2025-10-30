import type { IconSet } from "@/types";
import { IconEraser, IconFilter, IconFilterOff, IconPrompt, IconRestore, IconSearch } from "@tabler/icons-react";

export default {
  searchBarSearchIcon: <IconSearch />,
  indexSelectMobileIcon: <IconPrompt />,
  flagsFilterActiveIcon: <IconFilter />,
  flagsFilterInactiveIcon: <IconFilterOff />,
  flagsRestartIcon: <IconEraser size={13} />,
  activeFiltersClearAllIcon: <IconRestore size={16} />,
} satisfies IconSet;
