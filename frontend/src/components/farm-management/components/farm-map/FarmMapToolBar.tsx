import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Map, Pencil, Search, Lock, Unlock, ChevronDown, X, Sun, Moon, LayoutPanelLeft, Trash2 } from 'lucide-react';
import { StandaloneSearchBox } from '@react-google-maps/api';

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
  isDarkMode: boolean;
  isPanelVisible: boolean;
  hasPolygon: boolean;
  onToolbarItemClick: (itemId: string) => void;
  onMapTypeSelect: (value: 'roadmap' | 'satellite' | 'terrain' | 'hybrid') => void;
  onToggleLock: () => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (e: React.FormEvent) => void;
  onToggleMapTypes: () => void;
  onStartDrawing: () => void;
  onSearchBoxLoad: (ref: google.maps.places.SearchBox) => void;
  onPlacesChanged: () => void;
  onToggleTheme: () => void;
  onTogglePanel: () => void;
  onDeletePolygon?: () => void;
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
  isDarkMode,
  isPanelVisible,
  hasPolygon,
  onToolbarItemClick,
  onMapTypeSelect,
  onToggleLock,
  onSearchChange,
  onSearch,
  onToggleMapTypes,
  onStartDrawing,
  onSearchBoxLoad,
  onPlacesChanged,
  onToggleTheme,
  onTogglePanel,
  onDeletePolygon,
}) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const isMapSelected = activeToolbar === "map";
  const isThemeSelected = activeToolbar === "theme";

  const handleMapIconClick = () => {
    onToolbarItemClick("map");
  };
  
  const handleMapTypeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the button's onClick
    onToggleMapTypes();
  };

  const handleDrawingClick = () => {
    if (drawing) {
      onStartDrawing(); 
    } else if (activeToolbar === "draw") {
      onToolbarItemClick("draw"); 
      onStartDrawing(); 
    } else {
      onStartDrawing(); 
      onToolbarItemClick("draw"); 
    }
  };

  const toggleSearchInput = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput && activeToolbar === "search") {
      onToolbarItemClick(activeToolbar);
    } else if (!showSearchInput) {
      onToolbarItemClick("search");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    onSearch(e);
  };

  const handleThemeToggle = () => {
    onToggleTheme();
    onToolbarItemClick("theme");
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

        {/* Draw Button - now disabled when hasPolygon is true */}
        <motion.button
          variants={buttonVariants}
          initial={false}
          animate="animate"
          custom={drawing || activeToolbar === "draw"}
          onClick={handleDrawingClick}
          disabled={hasPolygon && !drawing}
          transition={transition}
          className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
            drawing || activeToolbar === "draw"
              ? "bg-green-600 text-white" 
              : hasPolygon 
                ? "text-gray-400 cursor-not-allowed" // Disabled state
                : "text-gray-600 hover:bg-green-50 hover:text-green-700"
          }`}
          title={hasPolygon ? "Delete existing polygon to draw a new one" : "Draw polygon"}
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

        {/* Add Delete Button when hasPolygon is true */}
        {hasPolygon && onDeletePolygon && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDeletePolygon}
            className="flex items-center justify-center h-10 w-10 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            title="Delete polygon"
          >
            <Trash2 size={16} />
          </motion.button>
        )}

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
                <StandaloneSearchBox
                  onLoad={onSearchBoxLoad}
                  onPlacesChanged={onPlacesChanged}
                >
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
                </StandaloneSearchBox>
              )}
          </motion.div>
        </div>

        {/* Theme Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleThemeToggle}
          className="flex items-center justify-center h-10 w-10 rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
        >
          {isDarkMode ? (
            <Moon 
              size={18} 
              className="text-indigo-700" // Midnight blue for dark mode
            />
          ) : (
            <Sun 
              size={20} 
              className="text-yellow-500" // Yellow for light mode
            />
          )}
        </motion.button>

        {/* Data Panel Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onTogglePanel}
          className={`flex items-center justify-center h-10 w-10 rounded-lg transition-colors ${
            isPanelVisible
              ? "bg-green-100 text-green-700 hover:bg-green-200" 
              : "text-gray-700 hover:bg-gray-50"
          }`}
          aria-label="Toggle data panel"
        >
          <LayoutPanelLeft size={18} />
        </motion.button>

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
          <span className="px-2 text-sm font-medium">{locked ? "Unlock" : "Lock"}</span>
        </motion.button>
      </div>
    </div>
  );
};

export default FarmMapToolbar;