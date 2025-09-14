// Create this file at: src/types/weather-icons-react.d.ts
declare module 'weather-icons-react' {
  import { ComponentType } from 'react';

  interface IconProps {
    size?: number | string;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
  }

  // Declare each icon as a React component that accepts IconProps
  export const WiDaySunny: ComponentType<IconProps>;
  export const WiCloudy: ComponentType<IconProps>;
  export const WiDayCloudy: ComponentType<IconProps>;
  export const WiRain: ComponentType<IconProps>;
  export const WiThunderstorm: ComponentType<IconProps>;
  
  // Add any other icons you might use
  export const WiDayRain: ComponentType<IconProps>;
  export const WiDayThunderstorm: ComponentType<IconProps>;
  export const WiNightClear: ComponentType<IconProps>;
  export const WiNightCloudy: ComponentType<IconProps>;
  export const WiNightRain: ComponentType<IconProps>;
  export const WiNightThunderstorm: ComponentType<IconProps>;
  export const WiHumidity: ComponentType<IconProps>;
  export const WiStrongWind: ComponentType<IconProps>;
  export const WiBarometer: ComponentType<IconProps>;
  export const WiThermometer: ComponentType<IconProps>;
}