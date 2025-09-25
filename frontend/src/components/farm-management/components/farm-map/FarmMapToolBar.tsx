import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Map, Pencil, Search, Lock, Unlock, ChevronDown, X } from 'lucide-react';

export interface MapType {
  label: string;
  value: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
}

interface FarmMapToolbarProps {
  mapType: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
  drawing: boolean;
  locked: boolean;
  search: string;
  activeToolbar: string | null;
  showMapTypes: boolean;
  mapTypes: MapType[];
  onToolbarItemClick: (itemId: string) => void;
  onMapTypeSelect: (value: 'roadmap' | 'satellite' | 'terrain' | 'hybrid') => void;
  onToggleLock: () => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (e: React.FormEvent) => void;
  onToggleMapTypes: () => void;
  onStartDrawing: () => void;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const searchBarVariants = {
  closed: { width: "40px", opacity: 1 },
  open: { width: "280px", opacity: 1 },
};

const transition = { 
  type: "spring" as const, 
  bounce: 0, 
  duration: 0.4 
};

const FarmMapToolbar: React.FC<FarmMapToolbarProps> = ({
  mapType,
  drawing,
  locked,
  search,
  activeToolbar,
  showMapTypes,
  mapTypes,
  onToolbarItemClick,
  onMapTypeSelect,
  onToggleLock,
  onSearchChange,
  onSearch,
  onToggleMapTypes,
  onStartDrawing,
}) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const isMapSelected = activeToolbar === "map";
  
  const handleMapIconClick = () => {
    onToolbarItemClick("map");
  };
  
  const handleMapTypeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the button's onClick
    onToggleMapTypes();
  };

  // Drawing tool now directly toggles drawing mode
  const handleDrawingClick = () => {
    // If drawing is already active, cancel it
    if (drawing) {
      onStartDrawing(); // This will toggle drawing off
    } else if (activeToolbar === "draw") {
      // If tool is selected but not drawing, toggle it off and cancel drawing
      onToolbarItemClick("draw"); // This will deselect the toolbar
      onStartDrawing(); // This will ensure drawing is off
    } else {
      // Otherwise, turn on drawing and select the tool
      onStartDrawing(); // This will toggle drawing on
      onToolbarItemClick("draw"); // This will select the toolbar
    }
  };

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    // When toggling the search bar off, clear the toolbar selection if it was "search"
    if (showSearchInput && activeToolbar === "search") {
      onToolbarItemClick(activeToolbar);
    } else if (!showSearchInput) {
      // When opening search, make it the active toolbar
      onToolbarItemClick("search");
    }
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    onSearch(e);
    // Optionally close the search bar after submission
    // setShowSearchInput(false);
  };

  return (
    <div className="flex justify-center w-full">
      <div className="flex items-center gap-3 p-2 bg-white border rounded-xl shadow-md max-w-fit">
        {/* Map Type Button */}
        <motion.button
          variants={buttonVariants}
          initial={false}
          animate="animate"
          custom={isMapSelected}
          onClick={handleMapIconClick}
          transition={transition}
          className={`relative flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
            isMapSelected 
              ? "bg-green-600 text-white" 
              : "text-gray-600 hover:bg-green-50 hover:text-green-700"
          }`}
        >
          <Map size={16} className={isMapSelected ? "text-white" : ""} />
          <AnimatePresence initial={false}>
            {isMapSelected && (
              <div className="flex items-center overflow-hidden" onClick={handleMapTypeClick}>
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden ml-2 cursor-pointer"
                >
                  {mapTypes.find(type => type.value === mapType)?.label}
                </motion.span>
                <ChevronDown 
                  size={14} 
                  className={`ml-1 transition-transform ${showMapTypes ? 'rotate-180' : ''}`} 
                />
              </div>
            )}
          </AnimatePresence>
          
          {/* Map Type Dropdown */}
          <AnimatePresence>
            {isMapSelected && showMapTypes && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border py-1 z-50"
              >
                {mapTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMapTypeSelect(type.value);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-green-100 ${
                      mapType === type.value 
                        ? 'font-medium text-green-700 bg-green-50' 
                        : 'text-gray-800'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Draw Button */}
        <motion.button
          variants={buttonVariants}
          initial={false}
          animate="animate"
          custom={drawing || activeToolbar === "draw"}
          onClick={handleDrawingClick}
          transition={transition}
          className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
            drawing || activeToolbar === "draw"
              ? "bg-green-600 text-white" 
              : "text-gray-600 hover:bg-green-50 hover:text-green-700"
          }`}
        >
          <Pencil size={16} className={(drawing || activeToolbar === "draw") ? "text-white" : ""} />
          <AnimatePresence initial={false}>
            {(activeToolbar === "draw" || drawing) && (
              <motion.span
                variants={spanVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transition}
                className="overflow-hidden ml-2"
              >
                Draw
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        {/* Search Button / Input */}
        <div className="relative">
        <motion.div
            initial="closed"
            animate={showSearchInput ? "open" : "closed"}
            variants={searchBarVariants}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`flex items-center rounded-lg h-10 ${
            showSearchInput 
                ? `border ${activeToolbar === "search" ? "border-green-500 ring-1 ring-green-500" : "border-gray-300"}` 
                : ""
            }`}
        >
            {/* Search Icon Button */}
            <motion.button
            type="button"
            onClick={toggleSearchInput}
            className={`flex items-center justify-center h-10 min-w-[40px] rounded-lg ${
                activeToolbar === "search"
                ? "bg-green-600 text-white" 
                : "text-gray-600 hover:bg-green-50 hover:text-green-700"
            }`}
            >
            <Search size={16} />
            </motion.button>
            
            {showSearchInput && (
            <form 
                onSubmit={handleSearchSubmit} 
                className="flex-grow pr-8"
            >
                <input
                type="text"
                className="w-full h-10 px-2 py-2 text-sm focus:outline-none bg-transparent"
                placeholder="Search address or coordinates"
                value={search}
                onChange={onSearchChange}
                disabled={locked}
                autoFocus
                />
                
                <button
                type="button"
                onClick={toggleSearchInput}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600"
                >
                <X size={14} />
                </button>
            </form>
            )}
        </motion.div>
        </div>

        {/* Lock/Unlock Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleLock}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm transition-colors ${
            locked 
              ? "bg-gray-200 text-gray-700 border-gray-300" 
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          {locked ? <Lock size={16} /> : <Unlock size={16} />}
          <span className="text-sm font-medium">{locked ? "Unlock" : "Lock"}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default FarmMapToolbar;