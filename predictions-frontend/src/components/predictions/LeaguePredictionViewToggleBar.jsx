import React, { useContext } from "react";
import ViewToggleButton from "../ui/ViewToggleButton";
import {
  LayoutIcon,
  StackIcon,
  CalendarIcon,
  ClockIcon,
  TableIcon,
  ListBulletIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { ThemeContext } from "../../context/ThemeContext";

const LeaguePredictionViewToggleBar = ({ selectedView, onViewChange }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-primary-800/50 border-primary-700/30"
          : "bg-slate-100 border-slate-200"
      } rounded-lg border p-1 flex gap-1`}
    >
        <ViewToggleButton
          icon={<PersonIcon />}
          active={selectedView === "members"}
          onClick={() => onViewChange("members")}
          tooltip="By Member"
          label="Members"
        />
        <ViewToggleButton
          icon={<ListBulletIcon />}
          active={selectedView === "list"}
          onClick={() => onViewChange("list")}
          tooltip="List View"
          label="List"
        />
        <ViewToggleButton
          icon={<TableIcon />}
          active={selectedView === "table"}
          onClick={() => onViewChange("table")}
          tooltip="Table View"
          label="Table"
        />
        <ViewToggleButton
          icon={<StackIcon />}
          active={selectedView === "stack"}
          onClick={() => onViewChange("stack")}
          tooltip="Stack View"
          label="Stack"
        />
        <ViewToggleButton
          icon={<CalendarIcon />}
          active={selectedView === "calendar"}
          onClick={() => onViewChange("calendar")}
          tooltip="Calendar View"
          label="Calendar"
        />
        <ViewToggleButton
          icon={<ClockIcon />}
          active={selectedView === "timeline"}
          onClick={() => onViewChange("timeline")}
          tooltip="Timeline"
          label="Timeline"
        />
        <ViewToggleButton
          icon={<LayoutIcon />}
          active={selectedView === "carousel"}
          onClick={() => onViewChange("carousel")}
          tooltip="Carousel View"
          label="Carousel"
        />
    </div>
  );
};

export default LeaguePredictionViewToggleBar;
