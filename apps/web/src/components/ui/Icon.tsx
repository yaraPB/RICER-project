import * as React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  Compass,
  ExternalLink,
  Flame,
  IdCard,
  KeyRound,
  LogOut,
  Map,
  Megaphone,
  Pin,
  Phone,
  RefreshCw,
  Search,
  Share2,
  Siren,
  Thermometer,
  Truck,
  Wind,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export type IconName =
  | 'search'
  | 'map'
  | 'analytics'
  | 'campaign'
  | 'list'
  | 'truck'
  | 'fire'
  | 'notifications'
  | 'logout'
  | 'close'
  | 'refresh'
  | 'warning'
  | 'thermostat'
  | 'air'
  | 'share'
  | 'open'
  | 'pin'
  | 'clipboard'
  | 'siren'
  | 'compass'
  | 'calendar'
  | 'id'
  | 'phone'
  | 'key';

export type IconProps = {
  name: IconName;
  className?: string;
  size?: number;
  'aria-hidden'?: boolean;
  title?: string;
};

export function Icon({ name, className, size = 20, title, ...props }: IconProps) {
  const IconComponent =
    name === 'search'
      ? Search
      : name === 'map'
        ? Map
        : name === 'analytics'
          ? BarChart3
          : name === 'campaign'
            ? Megaphone
            : name === 'list'
              ? ClipboardList
              : name === 'truck'
                ? Truck
                : name === 'fire'
                  ? Flame
                  : name === 'notifications'
                    ? Bell
                    : name === 'logout'
                      ? LogOut
                      : name === 'close'
                        ? X
                        : name === 'refresh'
                          ? RefreshCw
                          : name === 'warning'
                            ? AlertTriangle
                            : name === 'thermostat'
                              ? Thermometer
                              : name === 'air'
                                ? Wind
                                : name === 'share'
                                  ? Share2
                                  : name === 'open'
                                    ? ExternalLink
                                    : name === 'pin'
                                      ? Pin
                                      : name === 'clipboard'
                                        ? ClipboardList
                                        : name === 'siren'
                                          ? Siren
                                          : name === 'calendar'
                                            ? CalendarDays
                                            : name === 'id'
                                              ? IdCard
                                              : name === 'phone'
                                                ? Phone
                                                : name === 'key'
                                                  ? KeyRound
                                                  : Compass;

  return (
    <IconComponent
      size={size}
      className={cn('shrink-0', className)}
      aria-hidden={props['aria-hidden']}
    >
      {title ? <title>{title}</title> : null}
    </IconComponent>
  );
}
