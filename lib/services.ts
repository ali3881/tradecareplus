import type { ComponentType } from "react";
import {
  AirVent,
  AlarmSmoke,
  Armchair,
  Bath,
  Blinds,
  BrickWall,
  Brush,
  Bug,
  Building2,
  Construction,
  DoorClosed,
  Drill,
  Droplets,
  Fan,
  Fence,
  Flower2,
  Flame,
  Hammer,
  HardHat,
  Home,
  KeyRound,
  LampCeiling,
  Leaf,
  Lightbulb,
  PaintBucket,
  Paintbrush,
  Pipette,
  PlugZap,
  Router,
  Scissors,
  Shield,
  ShowerHead,
  Shovel,
  Sofa,
  Sparkles,
  Sun,
  ThermometerSun,
  TreePine,
  Truck,
  Waves,
  Wind,
  Wrench,
} from "lucide-react";
import {
  FaBroom,
  FaBucket,
  FaBug,
  FaCouch,
  FaDoorClosed,
  FaFaucet,
  FaFireExtinguisher,
  FaKitchenSet,
  FaPaintRoller,
  FaSeedling,
  FaShower,
  FaSink,
  FaSolarPanel,
  FaToolbox,
  FaToilet,
  FaTruckMoving,
  FaWarehouse,
  FaWindowMaximize,
} from "react-icons/fa6";
import {
  MdCleaningServices,
  MdElectricalServices,
  MdGarage,
  MdGrass,
  MdHeatPump,
  MdHomeRepairService,
  MdMiscellaneousServices,
  MdPestControl,
  MdPlumbing,
  MdRoofing,
  MdRouter,
  MdSecurity,
  MdWaterDamage,
  MdWindow,
  MdYard,
} from "react-icons/md";

type ServiceIcon = ComponentType<any>;

export const defaultServiceIconKey = "Wrench";

const legacyIconKeyMap: Record<string, string> = {
  wrench: "Wrench",
  home: "Home",
  hammer: "Hammer",
  drill: "Drill",
  "hard-hat": "HardHat",
  lightbulb: "Lightbulb",
  droplets: "Droplets",
  paintbrush: "Paintbrush",
  flame: "Flame",
  shield: "Shield",
  truck: "Truck",
};

export const serviceIconOptions: { key: string; label: string; icon: ServiceIcon }[] = [
  { key: "Wrench", label: "General Repairs", icon: Wrench },
  { key: "Droplets", label: "Plumbing", icon: Droplets },
  { key: "MdPlumbing", label: "Plumbing Services", icon: MdPlumbing },
  { key: "Waves", label: "Drainage", icon: Waves },
  { key: "Pipette", label: "Leak Detection", icon: Pipette },
  { key: "MdWaterDamage", label: "Water Damage", icon: MdWaterDamage },
  { key: "FaFaucet", label: "Tap & Faucet Repair", icon: FaFaucet },
  { key: "FaSink", label: "Kitchen Sink", icon: FaSink },
  { key: "FaToilet", label: "Toilet Repair", icon: FaToilet },
  { key: "FaShower", label: "Shower Repair", icon: FaShower },
  { key: "ShowerHead", label: "Bathroom", icon: ShowerHead },
  { key: "Bath", label: "Bath Installation", icon: Bath },
  { key: "FaKitchenSet", label: "Kitchen Services", icon: FaKitchenSet },
  { key: "Flame", label: "Gas & Heating", icon: Flame },
  { key: "ThermometerSun", label: "Hot Water Systems", icon: ThermometerSun },
  { key: "AirVent", label: "Air Conditioning", icon: AirVent },
  { key: "MdHeatPump", label: "Heating & Cooling", icon: MdHeatPump },
  { key: "PlugZap", label: "Electrical", icon: PlugZap },
  { key: "MdElectricalServices", label: "Electrical Services", icon: MdElectricalServices },
  { key: "Lightbulb", label: "Lighting", icon: Lightbulb },
  { key: "LampCeiling", label: "Ceiling Fixtures", icon: LampCeiling },
  { key: "AlarmSmoke", label: "Smoke Alarms", icon: AlarmSmoke },
  { key: "Router", label: "Home Networking", icon: Router },
  { key: "MdRouter", label: "Wi-Fi & Router Setup", icon: MdRouter },
  { key: "Hammer", label: "Handyman", icon: Hammer },
  { key: "MdHomeRepairService", label: "Handyman Services", icon: MdHomeRepairService },
  { key: "Drill", label: "Installation", icon: Drill },
  { key: "Construction", label: "Renovation", icon: Construction },
  { key: "MdMiscellaneousServices", label: "General Trade Services", icon: MdMiscellaneousServices },
  { key: "BrickWall", label: "Masonry", icon: BrickWall },
  { key: "DoorClosed", label: "Doors", icon: DoorClosed },
  { key: "FaDoorClosed", label: "Door Repair", icon: FaDoorClosed },
  { key: "Blinds", label: "Windows & Blinds", icon: Blinds },
  { key: "MdWindow", label: "Window Services", icon: MdWindow },
  { key: "FaWindowMaximize", label: "Glass & Window Fitting", icon: FaWindowMaximize },
  { key: "Fence", label: "Fencing", icon: Fence },
  { key: "MdRoofing", label: "Roofing", icon: MdRoofing },
  { key: "MdGarage", label: "Garage Services", icon: MdGarage },
  { key: "Paintbrush", label: "Painting", icon: Paintbrush },
  { key: "PaintBucket", label: "Decorating", icon: PaintBucket },
  { key: "FaPaintRoller", label: "Paint Roller Work", icon: FaPaintRoller },
  { key: "Scissors", label: "Finishing Work", icon: Scissors },
  { key: "Brush", label: "Cleaning", icon: Brush },
  { key: "MdCleaningServices", label: "Cleaning Services", icon: MdCleaningServices },
  { key: "FaBroom", label: "House Cleaning", icon: FaBroom },
  { key: "FaBucket", label: "Wash & Mop", icon: FaBucket },
  { key: "Sparkles", label: "Deep Cleaning", icon: Sparkles },
  { key: "Bug", label: "Pest Control", icon: Bug },
  { key: "MdPestControl", label: "Pest Control Services", icon: MdPestControl },
  { key: "FaBug", label: "Insect Treatment", icon: FaBug },
  { key: "Shield", label: "Security", icon: Shield },
  { key: "MdSecurity", label: "Security Systems", icon: MdSecurity },
  { key: "KeyRound", label: "Locksmith", icon: KeyRound },
  { key: "Fan", label: "Ventilation", icon: Fan },
  { key: "Wind", label: "HVAC", icon: Wind },
  { key: "Sun", label: "Solar", icon: Sun },
  { key: "FaSolarPanel", label: "Solar Panels", icon: FaSolarPanel },
  { key: "Leaf", label: "Eco Services", icon: Leaf },
  { key: "Flower2", label: "Gardening", icon: Flower2 },
  { key: "FaSeedling", label: "Plant Care", icon: FaSeedling },
  { key: "TreePine", label: "Tree Care", icon: TreePine },
  { key: "Shovel", label: "Landscaping", icon: Shovel },
  { key: "MdYard", label: "Yard Work", icon: MdYard },
  { key: "MdGrass", label: "Lawn Care", icon: MdGrass },
  { key: "Armchair", label: "Upholstery", icon: Armchair },
  { key: "Sofa", label: "Furniture Assembly", icon: Sofa },
  { key: "FaCouch", label: "Furniture Services", icon: FaCouch },
  { key: "FaToolbox", label: "Toolbox Service", icon: FaToolbox },
  { key: "Truck", label: "Delivery & Haul Away", icon: Truck },
  { key: "FaTruckMoving", label: "Moving Help", icon: FaTruckMoving },
  { key: "FaWarehouse", label: "Storage & Removal", icon: FaWarehouse },
  { key: "HardHat", label: "Trade Specialist", icon: HardHat },
  { key: "FaFireExtinguisher", label: "Fire Safety", icon: FaFireExtinguisher },
  { key: "Building2", label: "Property Maintenance", icon: Building2 },
  { key: "MdHomeRepairService", label: "Home Repair Service", icon: MdHomeRepairService },
  { key: "Home", label: "Home Services", icon: Home },
];

const serviceIconMap = new Map<string, ServiceIcon>(serviceIconOptions.map((option) => [option.key, option.icon]));

export function normalizeServiceIconKey(iconKey: string) {
  if (serviceIconMap.has(iconKey)) {
    return iconKey;
  }

  return legacyIconKeyMap[iconKey] || defaultServiceIconKey;
}

export function getServiceIcon(iconKey: string) {
  return serviceIconMap.get(normalizeServiceIconKey(iconKey)) || Wrench;
}

export function slugifyServiceTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function stripServiceHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function serviceExcerpt(description: string, maxLength = 180) {
  const normalized = stripServiceHtml(description);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function sanitizeServiceHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "")
    .replace(/\sstyle='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}
