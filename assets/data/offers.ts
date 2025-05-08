export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  imageSource: any;
  color: string;
}

export const offers: Offer[] = [
  {
    id: "1",
    title: "50% OFF",
    subtitle: "First orders at selected restaurants",
    imageSource: require("@/assets/data/deal1.jpeg"),
    color: "#E6F2EA",
  },
  {
    id: "2",
    title: "Free Delivery",
    subtitle: "On orders over $15",
    imageSource: require("@/assets/data/deal2.jpeg"),
    color: "#F3EBF5",
  },
  {
    id: "3",
    title: "20% OFF",
    subtitle: "Weekly deals on popular spots",
    imageSource: require("@/assets/data/deal3.jpeg"),
    color: "#FBE8E7",
  },
];
