import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface ParkingZone {
    id: number;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    is_paid: boolean;
    payment_url: string | null;
    total_spots: number;
    used_spots: number;
    available_spots: number;
    last_reported_at: string | null;
    devices?: Device[];
}

export interface Device {
    id: number;
    title: string;
    total_parking_spots: number;
    used_parking_spots: number;
    available_parking_spots: number;
    parking_spots_count: number | null;
    battery_voltage: number;
    status: 'online' | 'warning' | 'offline';
    hash: string;
    parking_zone_id: number;
    parking_zone?: ParkingZone;
    location?: {
        type: string;
        coordinates: [number, number];
    };
    latitude?: number;
    longitude?: number;
    image_recognition_enabled?: boolean;
    last_reported_at: string | null;
    last_image_path: string | null;
    last_image_url: string | null;
    last_processed_image_path: string | null;
    last_processed_image_url: string | null;
    child_devices?: ChildDevice[];
    zone_point_1_x: number | null;
    zone_point_1_y: number | null;
    zone_point_2_x: number | null;
    zone_point_2_y: number | null;
    zone_point_3_x: number | null;
    zone_point_3_y: number | null;
    zone_point_4_x: number | null;
    zone_point_4_y: number | null;
}

export interface ChildDevice {
    id: number;
    device_id: number;
    device?: Device;
    battery_voltage: number;
    is_spot_used: boolean;
    status: 'online' | 'warning' | 'offline';
    hash: string;
    last_reported_at: string | null;
    position_x: number | null;
    position_y: number | null;
}
