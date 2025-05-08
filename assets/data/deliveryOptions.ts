export interface DeliveryOption {
  id: string;
  title: string;
  icon: string;
}

export const deliveryOptions: DeliveryOption[] = [
  { id: "1", title: "Delivery", icon: "bicycle-outline" },
  { id: "2", title: "Pickup", icon: "bag-handle-outline" },
];
