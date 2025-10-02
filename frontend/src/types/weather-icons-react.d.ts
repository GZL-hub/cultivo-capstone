declare module 'weather-icons-react' {
  import { ComponentType } from 'react';

  interface IconProps {
    size?: number | string;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
  }

  // Day icons
  export const WiDaySunny: ComponentType<IconProps>;
  export const WiDayCloudy: ComponentType<IconProps>;
  export const WiDayCloudyGusts: ComponentType<IconProps>;
  export const WiDayCloudyHigh: ComponentType<IconProps>;
  export const WiDayCloudyWindy: ComponentType<IconProps>;
  export const WiDayFog: ComponentType<IconProps>;
  export const WiDayHail: ComponentType<IconProps>;
  export const WiDayHaze: ComponentType<IconProps>;
  export const WiDayLightning: ComponentType<IconProps>;
  export const WiDayRain: ComponentType<IconProps>;
  export const WiDayRainMix: ComponentType<IconProps>;
  export const WiDayRainWind: ComponentType<IconProps>;
  export const WiDayShowers: ComponentType<IconProps>;
  export const WiDaySleet: ComponentType<IconProps>;
  export const WiDaySnow: ComponentType<IconProps>;
  export const WiDaySprinkle: ComponentType<IconProps>;
  export const WiDayStormShowers: ComponentType<IconProps>;
  export const WiDaySunnyOvercast: ComponentType<IconProps>;
  export const WiDayThunderstorm: ComponentType<IconProps>;
  export const WiDayWindy: ComponentType<IconProps>;
  
  // Night icons
  export const WiNightClear: ComponentType<IconProps>;
  export const WiNightCloudy: ComponentType<IconProps>;
  export const WiNightCloudyGusts: ComponentType<IconProps>;
  export const WiNightCloudyHigh: ComponentType<IconProps>;
  export const WiNightCloudyWindy: ComponentType<IconProps>;
  export const WiNightFog: ComponentType<IconProps>;
  export const WiNightHail: ComponentType<IconProps>;
  export const WiNightLightning: ComponentType<IconProps>;
  export const WiNightPartlyCloudy: ComponentType<IconProps>;
  export const WiNightRain: ComponentType<IconProps>;
  export const WiNightRainMix: ComponentType<IconProps>;
  export const WiNightRainWind: ComponentType<IconProps>;
  export const WiNightShowers: ComponentType<IconProps>;
  export const WiNightSnow: ComponentType<IconProps>;
  export const WiNightSprinkle: ComponentType<IconProps>;
  export const WiNightStormShowers: ComponentType<IconProps>;
  export const WiNightThunderstorm: ComponentType<IconProps>;
  
  // Neutral icons
  export const WiCloud: ComponentType<IconProps>;
  export const WiCloudy: ComponentType<IconProps>;
  export const WiFog: ComponentType<IconProps>;
  export const WiRain: ComponentType<IconProps>;
  export const WiRaindrops: ComponentType<IconProps>;
  export const WiRainMix: ComponentType<IconProps>;
  export const WiRainWind: ComponentType<IconProps>;
  export const WiShowers: ComponentType<IconProps>;
  export const WiSleet: ComponentType<IconProps>;
  export const WiSnow: ComponentType<IconProps>;
  export const WiSnowflakeCold: ComponentType<IconProps>;
  export const WiSnowWind: ComponentType<IconProps>;
  export const WiSprinkle: ComponentType<IconProps>;
  export const WiStormShowers: ComponentType<IconProps>;
  export const WiThunderstorm: ComponentType<IconProps>;
  export const WiDust: ComponentType<IconProps>;
  export const WiSmoke: ComponentType<IconProps>;
  export const WiHurricane: ComponentType<IconProps>;
  export const WiTornado: ComponentType<IconProps>;
  export const WiHail: ComponentType<IconProps>;
  
  // Measurement icons
  export const WiBarometer: ComponentType<IconProps>;
  export const WiHumidity: ComponentType<IconProps>;
  export const WiThermometer: ComponentType<IconProps>;
  export const WiStrongWind: ComponentType<IconProps>;
  export const WiWindy: ComponentType<IconProps>;
}