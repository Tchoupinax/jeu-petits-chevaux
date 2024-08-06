export type BlueHouseCase = "0xx13" | "0xx14" | "1xx13" | "1xx14";

export type GreenHouseCase = "13xx0" | "13xx1" | "14xx0" | "14xx1";

export type RedHouseCase = "13xx13" | "14xx14" | "14xx13" | "13xx14";

export type YellowHouseCase = "0xx0" | "0xx1" | "1xx0" | "1xx1";

export type HouseCase = BlueHouseCase |
  GreenHouseCase |
  RedHouseCase |
  YellowHouseCase;
