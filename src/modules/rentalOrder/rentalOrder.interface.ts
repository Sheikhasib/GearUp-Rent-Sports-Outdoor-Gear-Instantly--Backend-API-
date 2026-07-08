export interface ICreateRentalOrderPayload {
  gearItemId: string;
  quantity: number;
  //   startDate: Date;
  //   endDate: Date;
  startDate: string;
  endDate: string;
}
